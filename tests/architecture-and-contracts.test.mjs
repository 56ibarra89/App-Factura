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
