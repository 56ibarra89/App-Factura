# Pizza To Go POS — App-Factura (Frontend & Electron)

> **Idioma / Language**: [🇪🇸 Español](#-español) | [🇺🇸 English](#-english)

---

## 🇪🇸 Español

Aplicación de Punto de Venta (POS), Facturación, Cocina (KDS), Despacho y Administración para **Pizza To Go**, construida con **React 18**, **TypeScript**, **Vite**, **Material UI (MUI v7)** y **Electron**.

### ✨ Características Principales

- **Arquitectura Domain-Driven Modular (`DDM`)**: Separación estricta en tres capas (`app -> modules -> shared`) con 18 dominios de negocio encapsulados mediante APIs públicas (`index.ts`).
- **Sincronización Híbrida en Tiempo Real (`HTTP + Socket.IO + SSE`)**:
  -Separación de Comandos y Consultas (`CQS`) en el dominio de órdenes y cobro.
  -Reconciliación por marcas de tiempo (`updatedAt`) y control de comandos en vuelo para impedir que respuestas HTTP tardías sobrescriban eventos más recientes de WebSockets.
  -Concurrencia optimista (`expectedUpdatedAt`) en mutaciones comerciales (`updateItems`, `finalize`, `splitCheckout`, `cancelled`) sin bloquear actualizaciones operativas de cocina (`KDS`).
- **Control de Acceso Basado en Roles y Permisos (`RBAC`)**:
  -Alineación estricta con el backend mediante evaluación lógica `AND` (`.every()`) tanto en rutas protegidas (`PrivateRoute`) como en acciones de interfaz (`hasPermission`).
  -Renovación silenciosa de JWT (`single-flight refresh`) y cierre automático de sesión por inactividad basado únicamente en interacción humana real (`trackUserActivity`).
- **Integración de Hardware en Electron (`electron/main.ts` y `electron/preload.ts`)**:
  -Despachador de impresión térmica (`printerDispatcherService`) con soporte para cola de Windows (Spooler) y sockets TCP RAW (`puerto 9100`), failover automático a impresora de respaldo y reintentos granulares (`pendingJobs` / `printedJobIds`).
  -Apertura de gaveta de dinero RJ11 mediante comandos ESC/POS RAW (`Winspool` vía helper nativo o TCP).

---

### 🏗️ Estructura del Proyecto

```text
App-Factura/
├── electron/
│   ├── main.ts        # Proceso principal: ventana, CSP, impresión térmica (Spooler/TCP) y gaveta RJ11
│   └── preload.ts     # Puente seguro (contextBridge -> window.electronAPI / window.authAPI)
├── src/
│   ├── app/           # Composición global: AppProviders, Router, Shell y navegación
│   ├── modules/       # 18 dominios de negocio independientes (exportados sólo vía index.ts):
│   │                  # accounts, audit, auth, backups, cash-register, catalog, checkout,
│   │                  # customers, delivery, devices, health, invoices, kitchens,
│   │                  # notifications, orders, promotions, reports, settings, tables
│   └── shared/        # Infraestructura agnóstica: apiClient (apiFetch), tema MUI,
│                      # formateo de moneda/fechas (America/Managua) y cola de impresión
├── tests/
│   └── architecture-and-contracts.test.mjs # Suite automática de fronteras modulares e invariantes
├── Dockerfile         # Construcción multi-etapa (Vite Web -> Nginx en puerto 5173)
└── package.json
```

La guía detallada de convenciones modulares se encuentra en [`src/modules/README.md`](src/modules/README.md) y [`AGENTS.md`](AGENTS.md).

---

### 🚀 Requisitos e Instalación Local

1. **Requisitos**:
   - **Node.js** `20.x` o superior.
   - Backend (`pizza-app-backend-nest`) en ejecución y accesible mediante `VITE_API_BASE_URL`.

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Contenido por defecto de `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Instalar dependencias y ejecutar**:
   ```bash
   npm install
   npm run dev
   ```

---

### 📜 Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia Vite + Electron en modo desarrollo con recarga en caliente. |
| `npm run build:web` | Compila únicamente el bundle Web de producción en `dist/`. |
| `npm run build` | Verifica tipos (`tsc`), compila el proyecto y genera el instalador de Windows (`electron-builder`). |
| `npm test` | Ejecuta la suite de pruebas de arquitectura, fronteras modulares y contratos (`tests/architecture-and-contracts.test.mjs`). |
| `npm run lint` | Ejecuta ESLint con tolerancia cero a advertencias (`--max-warnings 0`). |
| `npm run preview` | Sirve localmente la compilación web generada en `dist/`. |

---

### 🐳 Ejecución con Docker

Puedes construir y ejecutar la versión Web del POS de forma aislada o levantar todo el ecosistema (`PostgreSQL + Backend + Frontend`) desde la raíz del repositorio:

```bash
# Opción A: Levantar todo el ecosistema desde la raíz (c:\DEV\Electron)
docker compose up --build

# Opción B: Construir y correr sólo el contenedor del Frontend
docker build --build-arg VITE_API_BASE_URL=http://localhost:3000 -t pizza-frontend .
docker run -p 5173:5173 pizza-frontend
```

Una vez iniciado, accede a `http://localhost:5173`.

---
---

## 🇺🇸 English

Point of Sale (POS), Invoicing, Kitchen Display System (KDS), Delivery Dispatch, and Administration desktop/web application for **Pizza To Go**, built with **React 18**, **TypeScript**, **Vite**, **Material UI (MUI v7)**, and **Electron**.

### ✨ Key Features

- **Domain-Driven Modular (`DDM`) Architecture**: Strict unidirectional three-layer dependency flow (`app -> modules -> shared`) across 18 encapsulated business domains exposed exclusively through their public `index.ts` barrel files.
- **Hybrid Real-Time Synchronization (`HTTP + Socket.IO + SSE`)**:
  -Command Query Separation (`CQS`) for transactional order and checkout flows.
  -Timestamp reconciliation (`updatedAt`) and in-flight command tracking so delayed HTTP responses never overwrite newer WebSocket state updates.
  -Optimistic concurrency control (`expectedUpdatedAt`) on commercial mutations (`updateItems`, `finalize`, `splitCheckout`, `cancelled`) while keeping kitchen operational updates (`KDS`) friction-free.
- **Role & Permission-Based Access Control (`RBAC`)**:
  -Strict alignment with backend authorization using logical `AND` (`.every()`) evaluation on both protected routes (`PrivateRoute`) and UI actions (`hasPermission`).
  -Single-flight silent JWT refresh and automatic inactivity logout driven strictly by genuine human interaction (`trackUserActivity`), ignoring background polling/WebSocket traffic.
- **Electron Hardware Integration (`electron/main.ts` & `electron/preload.ts`)**:
  -Thermal printing dispatcher (`printerDispatcherService`) supporting Windows Spooler and RAW TCP sockets (`port 9100`), automatic backup printer failover, and granular retry tracking (`pendingJobs` / `printedJobIds`).
  -RJ11 cash drawer kick via RAW ESC/POS bytes (`Winspool` native helper or TCP).

---

### 🏗️ Project Structure

```text
App-Factura/
├── electron/
│   ├── main.ts        # Main process: window management, CSP, thermal printing & RJ11 cash drawer
│   └── preload.ts     # Secure IPC bridge (contextBridge -> window.electronAPI / window.authAPI)
├── src/
│   ├── app/           # Global composition: AppProviders, Router, Shell & navigation
│   ├── modules/       # 18 independent business domains (imported only via index.ts):
│   │                  # accounts, audit, auth, backups, cash-register, catalog, checkout,
│   │                  # customers, delivery, devices, health, invoices, kitchens,
│   │                  # notifications, orders, promotions, reports, settings, tables
│   └── shared/        # Domain-agnostic infrastructure: apiClient (apiFetch), MUI theme,
│                      # currency/date formatting (America/Managua) & print queue utilities
├── tests/
│   └── architecture-and-contracts.test.mjs # Automated module-boundary and contract test suite
├── Dockerfile         # Multi-stage build (Vite Web -> Nginx on port 5173)
└── package.json
```

See [`src/modules/README.md`](src/modules/README.md) and [`AGENTS.md`](AGENTS.md) for detailed architectural guidelines.

---

### 🚀 Requirements & Local Setup

1. **Prerequisites**:
   - **Node.js** `20.x` or higher.
   - Backend (`pizza-app-backend-nest`) running and reachable at `VITE_API_BASE_URL`.

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   Default `.env` content:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Install Dependencies & Run**:
   ```bash
   npm install
   npm run dev
   ```

---

### 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite + Electron in development mode with Hot Module Replacement (HMR). |
| `npm run build:web` | Builds the production Web bundle into `dist/`. |
| `npm run build` | Runs TypeScript type-checking (`tsc`), builds the app, and packages the Windows installer (`electron-builder`). |
| `npm test` | Runs the automated architecture, module-boundary, and contract test suite (`tests/architecture-and-contracts.test.mjs`). |
| `npm run lint` | Runs ESLint with zero-warning tolerance (`--max-warnings 0`). |
| `npm run preview` | Locally previews the production web build in `dist/`. |

---

### 🐳 Running with Docker

You can build and run the Web version of the POS standalone, or spin up the full stack (`PostgreSQL + Backend + Frontend`) from the workspace root:

```bash
# Option A: Start the full stack from the workspace root (c:\DEV\Electron)
docker compose up --build

# Option B: Build and run only the Frontend container
docker build --build-arg VITE_API_BASE_URL=http://localhost:3000 -t pizza-frontend .
docker run -p 5173:5173 pizza-frontend
```

Once running, open `http://localhost:5173` in your browser.
