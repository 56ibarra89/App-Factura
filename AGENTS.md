# Reglas de Arquitectura del Proyecto App-Factura

## Arquitectura Domain-Driven Modular (DDM)

Toda nueva funcionalidad, refactorización o cambio de UI debe seguir estrictamente la arquitectura modular por dominios de negocio establecida en `src/modules/README.md`.

### Dirección de Dependencias Estricta

$$\text{app} \longrightarrow \text{modules} \longrightarrow \text{shared}$$

1. **`app`**: Composición global (Router, Shell, Providers globales, Navegación principal).
2. **`modules/<dominio>`**: Dominios de negocio independientes (`checkout`, `orders`, `tables`, `audit`, `accounts`, `auth`, `catalog`, etc.).
   - Estructura estándar dentro de cada módulo:
     - `api/`: Comunicación HTTP, IPC (Electron) y persistencia.
     - `hooks/`: Estado y orquestación con React hooks.
     - `model/`: Definiciones de tipos TypeScript y reglas de dominio.
     - `pages/`: Vistas vinculadas a rutas.
     - `ui/`: Componentes visuales específicos del dominio.
     - `utils/`: Utilidades exclusivas del módulo.
     - `index.ts`: API pública del módulo.
   - **Regra de Encapsulamiento**: El código externo al módulo sólo debe importar desde `modules/<dominio>`, utilizando su `index.ts`. Los archivos internos dentro de un módulo deben usar rutas relativas sin importar desde su propio `index.ts` (para evitar ciclos).
3. **`shared`**: Infraestructura agnóstica y Sistema de Diseño sin reglas de negocio (`format`, `theme`, `storage`, `ui` reutilizable).
   - `shared` **NUNCA** debe importar de `modules` ni de `app`.

### Sistema de Diseño y UI
- Las constantes de diseño (colores, gradientes, sombras) se definen en `src/shared/theme/themeTokens.ts`.
- La paleta y overrides globales de MUI residen en `src/shared/theme/appTheme.ts`.
- Componentes visuales 100% genéricos (sin lógica de negocio) van en `src/shared/ui/`.
- Componentes visuales con lógica de dominio van en `src/modules/<dominio>/ui/`.
- No colocar estilos inline o colores HEX duros; utilizar los tokens de `theme` y props de MUI (`sx`, `styled`).
