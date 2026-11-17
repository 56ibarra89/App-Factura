import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const modulesRoot = path.join(projectRoot, "src", "modules");
const sharedRoot = path.join(projectRoot, "src", "shared");

test("la respuesta HTTP y el rollback no pisan eventos o comandos posteriores", async () => {
  const ts = await import("typescript");
  const source = fs.readFileSync(
    path.join(modulesRoot, "orders", "model", "orderCommandReconciliation.ts"),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  new Function("exports", compiled)(exports);

  const optimistic = { updatedAt: new Date("2026-11-11T12:00:00Z") };
  const socketUpdate = { updatedAt: new Date("2026-11-11T12:00:02Z") };
  const secondCommand = { updatedAt: optimistic.updatedAt };
  const response = { updatedAt: new Date("2026-11-11T12:00:01Z") };

  assert.equal(exports.shouldApplyOrderUpdateResponse(optimistic, optimistic, response), true);
  assert.equal(exports.shouldApplyOrderUpdateResponse(socketUpdate, optimistic, response), false);
  assert.equal(exports.shouldApplyOrderUpdateResponse(secondCommand, optimistic, response), false);
  assert.equal(
    exports.shouldApplyOrderUpdateResponse(
      optimistic,
      optimistic,
      { updatedAt: new Date("2026-11-11T11:59:59Z") },
    ),
    false,
  );
  assert.equal(exports.shouldRollbackOrderUpdate(optimistic, optimistic), true);
  assert.equal(exports.shouldRollbackOrderUpdate(socketUpdate, optimistic), false);
});

test('la rotación de tokens conserva la sesión y logout invalida su identidad', async () => {
  const ts = await import('typescript');
  const source = fs.readFileSync(path.join(sharedRoot, 'api/accessTokenStore.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function('require', 'exports', compiled)(() => ({ localStore: { removeItem() {} } }), exports);
  const store = exports.accessTokenStore;
  store.set('login-a');
  const session = store.getSessionRevision();
  const revision = store.getRevision();
  store.rotate('renewed-a');
  store.setRefreshToken('refresh-a');
  assert.equal(store.getSessionRevision(), session);
  assert.ok(store.getRevision() > revision);
  store.clear();
  assert.notEqual(store.getSessionRevision(), session);
  const loggedOut = store.getSessionRevision();
  store.set('login-b');
  assert.notEqual(store.getSessionRevision(), loggedOut);
});

function walkCodeFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkCodeFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

test("H20: ningún módulo importa archivos internos de otro módulo fuera de su API pública", () => {
  const violations = [];
  const files = walkCodeFiles(modulesRoot);
  const importRegex = /from\s+["'](\.[^"']+)["']/g;

  for (const file of files) {
    const relFromModules = path
      .relative(modulesRoot, file)
      .replace(/\\/g, "/");
    const sourceModule = relFromModules.split("/")[0];
    const content = fs.readFileSync(file, "utf8");

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const specifier = match[1];
      const resolved = path.resolve(path.dirname(file), specifier);

      if (resolved.startsWith(modulesRoot)) {
        const targetRel = path
          .relative(modulesRoot, resolved)
          .replace(/\\/g, "/");
        const parts = targetRel.split("/");
        const targetModule = parts[0];
        if (
          targetModule !== sourceModule &&
          parts.length > 1 &&
          parts[1] !== "index" &&
          parts[1] !== "index.ts"
        ) {
          violations.push(`${relFromModules} -> ${specifier}`);
        }
      } else if (resolved.startsWith(sharedRoot)) {
        const targetSharedRel = path
          .relative(sharedRoot, resolved)
          .replace(/\\/g, "/");
        const parts = targetSharedRel.split("/");
        if (parts[0] === "api" && parts.length > 1 && parts[1] !== "index") {
          violations.push(`${relFromModules} -> ${specifier}`);
        }
      }
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Violaciones de frontera modular detectadas:\n${violations.join("\n")}`,
  );
});

test("H09, H17 y H21: apiClient separa actividad humana de sondeos, envía refresh_token y soporta validateResponse", () => {
  const apiClientContent = fs.readFileSync(
    path.join(sharedRoot, "api", "apiClient.ts"),
    "utf8",
  );

  assert.match(apiClientContent, /trackUserActivity\s*=\s*false/);
  assert.match(apiClientContent, /if\s*\(trackUserActivity\)/);
  assert.match(apiClientContent, /validateResponse\?:\s*ResponseValidator<T>/);
  assert.match(apiClientContent, /refresh_token:\s*currentRefreshToken/);
});

test("H11: AuthProvider, PrivateRoute y AdminRoute aplican semántica compatible con los guards del backend", () => {
  const authProviderContent = fs.readFileSync(
    path.join(modulesRoot, "auth", "model", "AuthProvider.tsx"),
    "utf8",
  );
  const privateRouteContent = fs.readFileSync(
    path.join(projectRoot, "src", "app", "router", "PrivateRoute.tsx"),
    "utf8",
  );
  const adminRouteContent = fs.readFileSync(
    path.join(projectRoot, "src", "app", "router", "AdminRoute.tsx"),
    "utf8",
  );

  assert.match(authProviderContent, /required\.every/);
  assert.match(privateRouteContent, /!hasPermission\(\.\.\.requiredPermissions\)/);
  assert.match(adminRouteContent, /hasPermission\(\.\.\.requiredPermissions\)/);
});

test("H12, H13, H14 y H15: invariantes de sincronización de órdenes, pagos e impresión", () => {
  const syncContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "hooks", "useOrderSynchronization.ts"),
    "utf8",
  );
  const finalizationContent = fs.readFileSync(
    path.join(
      modulesRoot,
      "orders",
      "hooks",
      "commands",
      "useOrderFinalizationCommand.ts",
    ),
    "utf8",
  );
  const printerContent = fs.readFileSync(
    path.join(
      modulesRoot,
      "devices",
      "services",
      "printerDispatcherService.ts",
    ),
    "utf8",
  );

  assert.match(syncContent, /incomingOrder\.linkedTables\.length === 0/);
  assert.match(syncContent, /realtimeEntriesByOrderId/);
  assert.match(finalizationContent, /MAX_PAYMENT_ROUNDING_ADJUSTMENT = 0\.01/);
  assert.match(printerContent, /printedJobIds = new Set<string>\(\)/);
  assert.match(printerContent, /pendingJobs = new Map<string, KitchenComandaData>\(\)/);
});

test("F46, F47 y F48: cierre local sin doble revocación, rehidratación de token y flujo seguro ante fallo de impresión", () => {
  const authOpsContent = fs.readFileSync(
    path.join(modulesRoot, "auth", "hooks", "useAuthOperations.ts"),
    "utf8",
  );
  const accountSettingsContent = fs.readFileSync(
    path.join(modulesRoot, "accounts", "hooks", "useAccountSettings.ts"),
    "utf8",
  );
  const apiClientContent = fs.readFileSync(
    path.join(sharedRoot, "api", "apiClient.ts"),
    "utf8",
  );
  const authProviderContent = fs.readFileSync(
    path.join(modulesRoot, "auth", "model", "AuthProvider.tsx"),
    "utf8",
  );
  const realtimeContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "api", "ordersRealtimeGateway.ts"),
    "utf8",
  );
  const billingFlowContent = fs.readFileSync(
    path.join(modulesRoot, "checkout", "hooks", "useBillingFlow.ts"),
    "utf8",
  );
  const checkoutDialogContent = fs.readFileSync(
    path.join(modulesRoot, "checkout", "hooks", "useCheckoutDialog.ts"),
    "utf8",
  );

  assert.match(authOpsContent, /options\?\.localOnly/);
  assert.match(accountSettingsContent, /logout\(\{\s*localOnly:\s*true\s*\}\)/);
  assert.match(apiClientContent, /appfactura:auth-session-changed/);
  assert.match(authProviderContent, /attemptTokenRefresh\(\)/);
  assert.match(realtimeContent, /socket\.connect\(\)/);
  assert.match(billingFlowContent, /pending\.sendToKitchen\s*=\s*false/);
  assert.match(checkoutDialogContent, /if\s*\(isPrintRetry\)/);
});

test("F49 y B39: historial oculto persistido con rollback, permisos y bandeja propia de motorizado", () => {
  const orderPrefsContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "api", "orderPreferencesGateway.ts"),
    "utf8",
  );
  const collectionCommandsContent = fs.readFileSync(
    path.join(
      modulesRoot,
      "orders",
      "hooks",
      "commands",
      "useOrderCollectionCommands.ts",
    ),
    "utf8",
  );
  const orderManagementContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "hooks", "useOrderManagement.ts"),
    "utf8",
  );
  const syncContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "hooks", "useOrderSynchronization.ts"),
    "utf8",
  );
  const ordersPageContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "pages", "OrdersPage.tsx"),
    "utf8",
  );
  const deliveryGatewayContent = fs.readFileSync(
    path.join(modulesRoot, "delivery", "api", "deliveryGateway.ts"),
    "utf8",
  );
  const driverPageContent = fs.readFileSync(
    path.join(modulesRoot, "delivery", "pages", "DriverDeliveriesPage.tsx"),
    "utf8",
  );

  assert.match(orderPrefsContent, /"\/orders\/hidden-orders"/);
  assert.match(orderPrefsContent, /JSON\.stringify\(\{\s*orderIds\s*\}\)/);
  assert.match(collectionCommandsContent, /await preferencesGateway\.hideOrderIds/);
  assert.match(collectionCommandsContent, /throw error/);
  assert.match(orderManagementContent, /hasPermission\("orders\.read", "kitchen\.read"\)/);
  assert.match(orderManagementContent, /hasPermission\("orders\.read", "kitchen\.update"\)/);
  assert.match(orderManagementContent, /await preferencesGateway\.hideTicketIds/);
  assert.match(syncContent, /canReadHiddenOrders\s*=\s*true/);
  assert.match(ordersPageContent, /await clearHistory\(\)/);
  assert.match(ordersPageContent, /setClearError/);
  assert.match(deliveryGatewayContent, /getMyDeliveries\(\)/);
  assert.match(deliveryGatewayContent, /"\/orders\/my-deliveries"/);
  assert.match(driverPageContent, /deliveryGateway\.getMyDeliveries\(\)/);
  assert.match(driverPageContent, /&&\s*!isMotorizado/);
});

test("F50 y F51: reservas con rollback seguro, errores visibles y efectivo USD en cobro mixto", () => {
  const reservationDialogContent = fs.readFileSync(
    path.join(modulesRoot, "tables", "ui", "ReservationDialog.tsx"),
    "utf8",
  );
  const tableReservationsContent = fs.readFileSync(
    path.join(modulesRoot, "tables", "hooks", "useTableReservations.ts"),
    "utf8",
  );
  const mesaReservationActionsContent = fs.readFileSync(
    path.join(modulesRoot, "tables", "hooks", "useMesaReservationActions.ts"),
    "utf8",
  );
  const mesaOrderActionsContent = fs.readFileSync(
    path.join(modulesRoot, "tables", "hooks", "useMesaOrderActions.ts"),
    "utf8",
  );
  const deliveriesModalContent = fs.readFileSync(
    path.join(modulesRoot, "delivery", "ui", "DriverDeliveriesModal.tsx"),
    "utf8",
  );
  const paymentDialogContent = fs.readFileSync(
    path.join(modulesRoot, "delivery", "ui", "PaymentConfirmationDialog.tsx"),
    "utf8",
  );

  assert.doesNotMatch(reservationDialogContent, /resDate \? resDate\.toISOString\(\) : ""/);
  assert.match(reservationDialogContent, /resDate \? resDate\.toISOString\(\) : undefined/);
  assert.match(reservationDialogContent, /await onConfirm\(/);
  assert.equal((tableReservationsContent.match(/throw err;/g) ?? []).length, 3);
  assert.match(mesaReservationActionsContent, /await releaseTable\(selectedMesaId\)/);
  assert.match(mesaReservationActionsContent, /await reserveTable\(selectedMesaId/);
  assert.match(mesaOrderActionsContent, /releaseTable\(selectedMesaId\)\.catch/);
  assert.match(deliveriesModalContent, /throw err instanceof Error \? err : new Error/);
  assert.match(paymentDialogContent, /cashMethods/);
  assert.match(paymentDialogContent, /cash\.currency === "USD"/);
});

test("F52: configuración dinámica de URL del backend y CSP adaptable en Electron", async () => {
  const ts = await import("typescript");

  const apiBaseSource = fs
    .readFileSync(path.join(sharedRoot, "api", "apiBaseUrl.ts"), "utf8")
    .replace(/import\.meta\.env\.VITE_API_BASE_URL/g, '"http://built-in.local:3000/"');
  const apiBaseCompiled = ts.transpileModule(apiBaseSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const apiBaseExports = {};
  const previousWindow = globalThis.window;
  try {
    globalThis.window = {
      runtimeConfig: {
        getApiBaseUrlSync: () => "https://pos.lan.local:3443/",
      },
    };
    new Function("exports", apiBaseCompiled)(apiBaseExports);
    assert.equal(apiBaseExports.getApiBaseUrl(), "https://pos.lan.local:3443");

    globalThis.window = {};
    assert.equal(apiBaseExports.getApiBaseUrl(), "http://built-in.local:3000");
  } finally {
    globalThis.window = previousWindow;
  }

  const ipcSecSource = fs.readFileSync(
    path.join(projectRoot, "electron", "ipcSecurity.ts"),
    "utf8",
  );
  const ipcSecCompiled = ts.transpileModule(ipcSecSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const ipcSecExports = {};
  new Function("require", "exports", ipcSecCompiled)(
    (mod) => (mod === "node:net" ? { isIP: () => 0 } : {}),
    ipcSecExports,
  );

  assert.equal(
    ipcSecExports.resolveRuntimeApiBaseUrl({
      env: { POS_API_BASE_URL: "https://192.168.10.20:3001/" },
      configFileContent: JSON.stringify({ apiBaseUrl: "http://192.168.1.99:3000" }),
      builtInUrl: "http://localhost:3000",
    }),
    "https://192.168.10.20:3001",
  );
  assert.equal(
    ipcSecExports.resolveRuntimeApiBaseUrl({
      env: {},
      configFileContent: JSON.stringify({ apiBaseUrl: "http://192.168.1.99:3000/" }),
      builtInUrl: "http://localhost:3000",
    }),
    "http://192.168.1.99:3000",
  );

  const cspHeader = ipcSecExports.buildElectronCspHeader("https://api.pizzatogo.ni");
  assert.match(cspHeader, /https:\/\/api\.pizzatogo\.ni/);
  assert.match(cspHeader, /wss:\/\/api\.pizzatogo\.ni/);

  const mainTsContent = fs.readFileSync(
    path.join(projectRoot, "electron", "main.ts"),
    "utf8",
  );
  const indexHtmlContent = fs.readFileSync(
    path.join(projectRoot, "index.html"),
    "utf8",
  );
  assert.match(mainTsContent, /config:get-api-base-url-sync/);
  assert.match(mainTsContent, /onHeadersReceived/);
  assert.match(indexHtmlContent, /connect-src 'self' http: https: ws: wss:;/);
});

test("F53: impresión USB aislada, pulso de gaveta Windows RAW y timeouts en IPC de impresión", async () => {
  const ts = await import("typescript");
  const rawHelperSource = fs.readFileSync(
    path.join(projectRoot, "electron", "printerWindowsRaw.ts"),
    "utf8",
  );
  const compiled = ts.transpileModule(rawHelperSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const rawExports = {};
  new Function("require", "exports", compiled)(
    (mod) => {
      if (mod === "node:child_process") return { execFile: () => {} };
      if (mod === "node:crypto") return { createHash: () => ({ update: () => ({ digest: () => "test-helper" }) }) };
      if (mod === "node:os") return { tmpdir: () => "C:/Temp" };
      if (mod === "node:path") return path;
      if (mod === "node:fs") return { existsSync: () => false };
      if (mod === "./printerNetwork") {
        return { ESCPOS_DRAWER_KICK: Buffer.from([0x1b, 0x70]) };
      }
      return {};
    },
    rawExports,
  );

  assert.deepEqual(
    rawExports.parsePrintHtmlRequest({
      html: "<div>Ticket de prueba</div>",
      deviceName: "EPSON-TM-T20",
    }),
    { html: "<div>Ticket de prueba</div>", deviceName: "EPSON-TM-T20" },
  );
  assert.equal(rawExports.parsePrintHtmlRequest({ html: "" }), null);
  assert.equal(
    rawExports.parsePrintHtmlRequest({
      html: "<p>ok</p>",
      deviceName: "EPSON\nBAD",
    }),
    null,
  );
  assert.deepEqual(
    rawExports.parseUsbPrinterRequest({ deviceName: "POS-80", timeoutMs: 999999 }),
    { deviceName: "POS-80", timeoutMs: 15000 },
  );
  assert.equal(rawExports.parseUsbPrinterRequest({ deviceName: "" }), null);

  const mainTsContent = fs.readFileSync(
    path.join(projectRoot, "electron", "main.ts"),
    "utf8",
  );
  const preloadContent = fs.readFileSync(
    path.join(projectRoot, "electron", "preload.ts"),
    "utf8",
  );
  const dispatcherContent = fs.readFileSync(
    path.join(modulesRoot, "devices", "services", "printerDispatcherService.ts"),
    "utf8",
  );

  assert.match(mainTsContent, /event\.sender\.isDestroyed\(\)/);
  assert.match(mainTsContent, /PRINT_TIMEOUT_MS = 15000/);
  assert.match(mainTsContent, /'printer:print-html'/);
  assert.match(mainTsContent, /'printer:open-usb-cash-drawer'/);
  assert.match(mainTsContent, /partition:\s*'ephemeral-print'/);
  assert.match(mainTsContent, /printWin\.webContents\.setWindowOpenHandler/);
  assert.match(mainTsContent, /printWin\.webContents\.session\.webRequest\.onBeforeRequest/);
  assert.match(preloadContent, /printHtml:/);
  assert.match(preloadContent, /openUsbCashDrawer:/);
  assert.match(dispatcherContent, /buildTestTicketHtml/);
  assert.match(dispatcherContent, /printHtmlViaIframe/);
  assert.match(dispatcherContent, /openUsbCashDrawer/);
  assert.doesNotMatch(dispatcherContent, /printSilent\(/);
});

test("F54 y F55: SplitBill conserva borrador/personas pendientes y PaymentMethodSelector protege USD en Mixto", async () => {
  const ts = await import("typescript");
  const splitBillDomainSource = fs.readFileSync(
    path.join(modulesRoot, "checkout", "model", "splitBillDomain.ts"),
    "utf8",
  );
  const splitBillDomainExports = {};
  new Function("require", "exports", ts.transpileModule(splitBillDomainSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText)(() => ({}), splitBillDomainExports);

  const useSplitBillSource = fs.readFileSync(
    path.join(modulesRoot, "checkout", "hooks", "useSplitBill.ts"),
    "utf8",
  );
  const useSplitBillExports = {};
  new Function("require", "exports", ts.transpileModule(useSplitBillSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText)(
    (mod) => {
      if (mod === "react") {
        return {
          useCallback: (fn) => fn,
          useEffect: () => {},
          useMemo: (fn) => fn(),
          useRef: (initial) => ({ current: initial }),
          useState: (initial) => [
            typeof initial === "function" ? initial() : initial,
            () => {},
          ],
        };
      }
      if (mod === "../../orders") {
        return {
          isSplitBillCreditOrderItem: (item) =>
            Boolean(item?.name?.startsWith("División de cuenta -")),
          isSplitBillOrderItem: (item) =>
            Boolean(item?.name?.startsWith("División de cuenta -")),
        };
      }
      if (mod === "../model/splitBillDomain") {
        return splitBillDomainExports;
      }
      return {};
    },
    useSplitBillExports,
  );

  // Escenario: mesa dividida en 3 personas (C$100 c/u); se cobra primero Persona 3, quedando 1 y 2.
  const hookResult = useSplitBillExports.useSplitBill({
    items: [
      { id: 1, name: "Pizza Familiar", price: 300, quantity: 1 },
      {
        id: 2,
        name: "División de cuenta - Pago parcial (Persona 3)",
        price: -100,
        quantity: 1,
      },
    ],
    totalAmount: 200,
    subTotalAmount: 200,
    discountAmount: 0,
    taxAmount: 0,
  });
  assert.deepEqual(
    hookResult.equalAccounts.map((a) => a.name),
    ["Persona 1", "Persona 2"],
  );

  const splitDialogContent = fs.readFileSync(
    path.join(modulesRoot, "checkout", "ui", "split-bill", "SplitBillDialog.tsx"),
    "utf8",
  );
  const selectorContent = fs.readFileSync(
    path.join(modulesRoot, "checkout", "ui", "PaymentMethodSelector.tsx"),
    "utf8",
  );

  assert.doesNotMatch(splitDialogContent, /openSession/);
  assert.match(splitDialogContent, /key=\{order\.id\}/);
  assert.match(selectorContent, /mixedDraft/);
  assert.match(selectorContent, /setSecondAmount/);
});

test("F56, F58 y F59: impresora de caja en caja/gastos, error al eliminar talonario, rollback cocina y notificaciones", () => {
  const cashExpensesPageContent = fs.readFileSync(
    path.join(modulesRoot, "cash-register", "pages", "CashExpensesPage.tsx"),
    "utf8",
  );
  const cashExpenseDialogContent = fs.readFileSync(
    path.join(modulesRoot, "cash-register", "ui", "CashExpenseDialog.tsx"),
    "utf8",
  );
  const shiftHistoryPageContent = fs.readFileSync(
    path.join(modulesRoot, "cash-register", "pages", "ShiftHistoryPage.tsx"),
    "utf8",
  );
  const correlativosHookContent = fs.readFileSync(
    path.join(modulesRoot, "fiscal", "hooks", "useCorrelativos.ts"),
    "utf8",
  );
  const fiscalPageContent = fs.readFileSync(
    path.join(modulesRoot, "fiscal", "pages", "FiscalSequencesPage.tsx"),
    "utf8",
  );
  const orderStatusCommandsContent = fs.readFileSync(
    path.join(
      modulesRoot,
      "orders",
      "hooks",
      "commands",
      "useOrderStatusCommands.ts",
    ),
    "utf8",
  );
  const notificationsHookContent = fs.readFileSync(
    path.join(modulesRoot, "notifications", "hooks", "useNotifications.ts"),
    "utf8",
  );

  for (const content of [
    cashExpensesPageContent,
    cashExpenseDialogContent,
    shiftHistoryPageContent,
  ]) {
    assert.match(content, /printerDispatcherService\.getCashierPrinter\(\)/);
    assert.match(content, /deviceName:\s*cashierPrinter\?\.windowsDeviceName/);
    assert.doesNotMatch(content, /window\.print\(\)/);
  }
  assert.match(cashExpenseDialogContent, /isMountedRef/);

  assert.match(
    correlativosHookContent,
    /deleteCorrelativo[\s\S]*throw error;/,
  );
  assert.match(fiscalPageContent, /await deleteCorrelativo\(deleteId\)/);
  assert.match(fiscalPageContent, /setDeleteError/);

  assert.match(
    orderStatusCommandsContent,
    /markAsSentToKitchenByTable[\s\S]*previousOrder[\s\S]*throw error;/,
  );

  assert.match(
    notificationsHookContent,
    /useMemo\([\s\S]*notifications\.filter\(\(n\) => !n\.isRead\)\.length/,
  );
  assert.match(
    notificationsHookContent,
    /prev\.some\(\(item\) => item\.id === notification\.id\)/,
  );
});

test("F57: estandarización de fechas y rangos comerciales a America/Managua (UTC-06:00)", async () => {
  const ts = await import("typescript");
  const businessTimeSource = fs.readFileSync(
    path.join(sharedRoot, "format", "businessTime.ts"),
    "utf8",
  );
  const btExports = {};
  new Function("exports", ts.transpileModule(businessTimeSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText)(btExports);

  // 2026-11-14T02:30:00Z es viernes 2026-11-13 20:30 en Managua (UTC-6), sábado en UTC.
  const crossMidnightUtc = new Date("2026-11-14T02:30:00.000Z");
  assert.equal(btExports.BUSINESS_TIME_ZONE, "America/Managua");
  assert.equal(btExports.BUSINESS_TIMEZONE_OFFSET_MINUTES, 360);
  assert.equal(btExports.getBusinessDateString(crossMidnightUtc), "2026-11-13");
  assert.equal(
    btExports.getBusinessMonthStartString(crossMidnightUtc),
    "2026-11-01",
  );
  assert.equal(
    btExports.getPreviousBusinessMonthDateString(new Date("2026-03-31T18:00:00.000Z")),
    "2026-02-28",
  );
  assert.equal(
    btExports.shiftBusinessDateString("2026-11-13", -1),
    "2026-11-12",
  );
  assert.equal(
    btExports.getBusinessDateTimeParts(crossMidnightUtc).weekday,
    "FRIDAY",
  );
  assert.equal(
    btExports.parseBusinessDayStart("2026-11-13").toISOString(),
    "2026-11-13T06:00:00.000Z",
  );
  assert.equal(
    btExports.parseBusinessDayEnd("2026-11-13").toISOString(),
    "2026-11-14T05:59:59.999Z",
  );

  const reportsGatewayContent = fs.readFileSync(
    path.join(modulesRoot, "reports", "api", "salesReportsGateway.ts"),
    "utf8",
  );
  const kitchensHookContent = fs.readFileSync(
    path.join(modulesRoot, "kitchens", "hooks", "useAccessibleKitchens.ts"),
    "utf8",
  );
  const auditHookContent = fs.readFileSync(
    path.join(modulesRoot, "audit", "hooks", "useAuditLog.ts"),
    "utf8",
  );

  assert.match(reportsGatewayContent, /BUSINESS_TIMEZONE_OFFSET_MINUTES/);
  assert.doesNotMatch(reportsGatewayContent, /getTimezoneOffset\(\)/);
  assert.match(kitchensHookContent, /getBusinessDateTimeParts/);
  assert.doesNotMatch(kitchensHookContent, /\.getDay\(\)/);
  assert.match(auditHookContent, /parseBusinessDayStart/);
  assert.match(auditHookContent, /formatBusinessCsvTimestamp/);
});

test("endurecimiento residual: /producto solo admin, permisos admin, entregas y expectedUpdatedAt", () => {
  const menuItemsContent = fs.readFileSync(
    path.join(projectRoot, "src", "app", "navigation", "menuItems.tsx"),
    "utf8",
  );
  const routerContent = fs.readFileSync(
    path.join(projectRoot, "src", "app", "router", "index.tsx"),
    "utf8",
  );
  const rolesPageContent = fs.readFileSync(
    path.join(modulesRoot, "access-control", "pages", "RolesPermissionsPage.tsx"),
    "utf8",
  );
  const deliveryPageContent = fs.readFileSync(
    path.join(modulesRoot, "delivery", "pages", "DriverDeliveriesPage.tsx"),
    "utf8",
  );
  const deliveryModalContent = fs.readFileSync(
    path.join(modulesRoot, "delivery", "ui", "DriverDeliveriesModal.tsx"),
    "utf8",
  );
  const ordersPageContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "pages", "OrdersPage.tsx"),
    "utf8",
  );
  const backendSyncContent = fs.readFileSync(
    path.join(modulesRoot, "orders", "api", "backendSync.ts"),
    "utf8",
  );

  assert.match(
    menuItemsContent,
    /route:\s*"\/producto"[\s\S]*?allowedRoles:\s*\["admin"\]/,
  );
  assert.match(
    routerContent,
    /path="\/producto"[\s\S]*?allowedRoles=\{\["admin"\]\}/,
  );
  assert.match(rolesPageContent, /ADMIN_ONLY_PERMISSIONS/);
  assert.match(rolesPageContent, /\(Solo Administrador\)/);
  assert.match(deliveryPageContent, /Entregado · Pendiente de Liquidar/);
  assert.match(
    deliveryModalContent,
    /setErrorMessage\("No se pudieron cargar las entregas del motorizado\."\)/,
  );
  assert.match(
    ordersPageContent,
    /orderToDelete\.updatedAt\?\.toISOString\(\)/,
  );
  assert.match(backendSyncContent, /expectedUpdatedAt/);
});

test("Sexta auditoría (F70-F80): concurrencia optimista, permisos, SplitBill, pago mixto y validación de impresora USB", () => {
  const mesaCheckoutContent = fs.readFileSync(
    path.join(modulesRoot, "tables", "hooks", "useMesaCheckout.ts"),
    "utf8",
  );
  const mesaOrderActionsContent = fs.readFileSync(
    path.join(modulesRoot, "tables", "hooks", "useMesaOrderActions.ts"),
    "utf8",
  );
  const useCheckoutDialogContent = fs.readFileSync(
    path.join(modulesRoot, "checkout", "hooks", "useCheckoutDialog.ts"),
    "utf8",
  );
  const checkoutGatewayContent = fs.readFileSync(
    path.join(modulesRoot, "checkout", "api", "checkoutGateway.ts"),
    "utf8",
  );
  const splitBillContent = fs.readFileSync(
    path.join(modulesRoot, "checkout", "hooks", "useSplitBill.ts"),
    "utf8",
  );
  const userDirectoryContent = fs.readFileSync(
    path.join(modulesRoot, "accounts", "model", "UserDirectoryProvider.tsx"),
    "utf8",
  );
  const hardwareSettingsContent = fs.readFileSync(
    path.join(modulesRoot, "devices", "ui", "admin", "HardwareSettingsPanel.tsx"),
    "utf8",
  );
  const electronMainContent = fs.readFileSync(
    path.join(projectRoot, "electron", "main.ts"),
    "utf8",
  );

  assert.match(mesaCheckoutContent, /expectedUpdatedAt/);
  assert.match(mesaOrderActionsContent, /"error-comanda-mesero"/);
  assert.match(useCheckoutDialogContent, /canManageCustomers/);
  assert.match(checkoutGatewayContent, /\.catch\(\(\)\s*=>\s*\[\]/);
  assert.match(splitBillContent, /clampAccountsToSourceItems/);
  assert.match(userDirectoryContent, /hasPermission\("users\.read"\)/);
  assert.match(hardwareSettingsContent, /PERMISSIONS\.SETTINGS_MANAGE/);
  assert.match(
    electronMainContent,
    /La impresora USB indicada no está instalada\./,
  );
});
