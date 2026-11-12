# Módulos de negocio

Cada carpeta de `modules` reúne una capacidad del negocio. La intención es
evitar que una funcionalidad quede repartida entre las carpetas globales
`components`, `hooks`, `services` y `types`.

## Estructura

```text
modules/<nombre>/
├── api/       # HTTP, IPC y adaptadores de persistencia
├── hooks/     # Orquestación y estado de React
├── model/     # Tipos, contexto y reglas del dominio
├── pages/     # Entradas asociadas a rutas
├── ui/        # Componentes propios del módulo
└── index.ts   # API pública
```

No todos los módulos necesitan todas las carpetas. Se crean únicamente cuando
existe código que les pertenece. Una carpeta puede tener subdivisiones
específicas, como `ui/admin`, cuando ayudan a separar contextos de uso sin
crear otro dominio artificial.

## Reglas de dependencia

1. El código externo importa desde `modules/<nombre>`, usando su `index.ts`.
2. Los archivos internos usan rutas relativas y no importan desde su propio
   `index.ts`, para evitar dependencias circulares.
3. El router puede importar directamente una página para conservar la carga
   diferida por ruta.
4. Un módulo no debe importar detalles internos de otro módulo.
5. Lo que no contiene reglas de negocio y puede reutilizarse en varios módulos
   debe migrarse gradualmente a `shared`.
6. Las pruebas se colocan junto al archivo que validan, con el sufijo
   `.test.ts` o `.test.tsx`.

## Migración de un módulo

1. Identificar páginas, componentes, hooks, tipos y acceso a datos del dominio.
2. Mover los archivos sin modificar su comportamiento.
3. Crear una API pública pequeña en `index.ts`.
4. Actualizar los consumidores para usar esa API.
5. Verificar TypeScript, ESLint y el build.
6. Refactorizar la lógica solamente en un cambio posterior.

`auth` sirve como referencia para contexto, sesión y pantallas públicas.
`promotions` sirve como referencia para un módulo con API, reglas, flujos de
administración e integración con otros dominios.
`customers` sirve como referencia para un repositorio inyectable, componentes
reutilizables y consumidores externos en checkout y delivery.
`accounts` sirve como referencia para separar una entidad administrable y el
perfil personal de la sesión y los permisos que pertenecen a `auth`.
`checkout` sirve como referencia para un flujo transaccional que reúne reglas
de cálculo, carrito en edición, acceso a datos, orquestación, diálogos y su
entrada de ruta.
`invoices` sirve como referencia para separar la consulta y administración de
entidades ya emitidas del flujo transaccional que las genera.
`orders` sirve como referencia para un dominio central con contexto global,
modelo de líneas de pedido, comandos, sincronización, persistencia y varios
módulos consumidores.
`tables` sirve como referencia para una capacidad operativa con estado de
disponibilidad y reservas, integración con órdenes y una pantalla de
configuración administrativa dentro del mismo dominio.
`catalog` sirve como referencia para separar el catálogo disponible para la
venta —productos, categorías y extras— de la selección transaccional que
pertenece a `checkout`.

`kitchens` concentra la configuración de cocinas y la asignación de cocineros.
Los módulos que necesitan cocinas consumen solamente su API pública.

`cash-register` reúne la apertura y cierre de caja, el historial de turnos y
la configuración administrativa de cajas.

`settings` administra la configuración general, la identidad de la empresa y
los impuestos. `fiscal` mantiene separadas las reglas y secuencias fiscales.

`delivery` contiene el flujo operativo de entregas, sus tarifas, precios
rápidos y estadísticas.

`reports` concentra consultas y visualizaciones de reportes. `audit` es el
único propietario del registro de actividad y expone el servicio de bitácora
que utilizan los demás dominios.

`notifications`, `devices` y `backups` encapsulan, respectivamente, las
notificaciones, la configuración de periféricos y las operaciones de respaldo.

## Capas de aplicación

`app` contiene la composición de alto nivel: páginas principales, navegación,
router, providers y componentes usados exclusivamente por el shell de la
aplicación.

`shared` contiene infraestructura y utilidades sin reglas de negocio:
comunicación HTTP, almacenamiento, preferencias, impresión, formato,
validaciones, tema, helpers de formularios y componentes visuales genéricos.

La dirección de dependencias es:

```text
app -> modules -> shared
```

`shared` no importa módulos. Un módulo puede consumir la API pública de otro
módulo cuando existe una integración de negocio explícita, pero nunca sus
archivos internos. Las integraciones deben conservar una dirección única y no
crear ciclos entre módulos; cuando dos dominios se necesitan mutuamente, la
composición se resuelve desde `app`.
