# App Factura

Frontend de escritorio para la operación y administración de Pizza To Go.
Está construido con React, TypeScript, Vite y Electron.

## Requisitos

- Node.js compatible con las dependencias declaradas en `package.json`.
- Backend configurado mediante `VITE_API_BASE_URL`.

Para crear la configuración local:

```bash
cp .env.example .env
```

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build:web
```

`npm run build` también genera el instalador de Electron.

## Arquitectura

El código del renderer se organiza en tres capas:

```text
app -> modules -> shared
```

- `src/app`: composición, navegación, providers y páginas que integran varios
  dominios.
- `src/modules`: reglas, acceso a datos, hooks, páginas y componentes de cada
  dominio.
- `src/shared`: infraestructura y componentes reutilizables sin reglas de
  negocio.
- `electron`: proceso principal, preload y puentes seguros hacia el renderer.

Cada módulo expone su API pública desde `src/modules/<modulo>/index.ts`.
Los consumidores no deben importar los detalles internos de otro módulo.

La guía detallada está en
[`src/modules/README.md`](src/modules/README.md).

## Pruebas

La incorporación de la estrategia de pruebas se realizará cuando los flujos
funcionales pendientes del producto estén terminados.
