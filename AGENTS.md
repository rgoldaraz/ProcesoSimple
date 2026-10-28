# AGENTS.md

## Project

"Gestor de Solicitudes": SPA de demostración (React 18 + Vite 5 + react-router-dom 6) para gestionar solicitudes internas. Sin backend: toda la persistencia es local al navegador. Interfaz y mensajes en español. Pensada como entorno de práctica para automatización E2E (Playwright).

## Commands

```bash
npm install
npm run dev      # Vite dev server en http://localhost:5173
npm run build    # build de producción en dist/
```

No hay scripts de lint, test, typecheck ni CI en este repositorio. No inventar comandos de verificación que no existen.

## Login

Credenciales hardcodeadas a propósito (en `src/constants.js`): usuario `alumno`, contraseña `Playwright123`. La sesión es un flag en `sessionStorage` (clave `procesosimple.sesion`); no hay registro ni recuperación.

## Architecture quirks

- Sin backend ni API: `src/storage.js` es el único módulo que toca `localStorage` (clave `procesosimple.solicitudes`). Nunca leer/escribir `localStorage` directamente desde componentes; usar las funciones de `storage.js`.
- Si los datos almacenados son inválidos o ausentes, `getRequests()` repuebla automáticamente con las semillas de `src/seedData.js` (5 solicitudes con IDs y fechas fijos, deterministas).
- Opciones de UI (categorías, prioridades, estados, credenciales, claves de almacenamiento) están centralizadas en `src/constants.js`; no duplicar literales.
- `src/validation.js` valida título (5-80), descripción (10-500), categoría y prioridad. El estado solo se valida si se pasa `includeStatus: true` (solo en edición).
- `src/components/RequestForm.jsx` es el formulario compartido de crear y editar; la página de edición le pasa `includeStatus`.

## Testing conventions (important)

- Los elementos interactivos llevan `data-testid` estables y nombres accesibles (`aria-*`, `role`, `html-label` asociados). Estos son contrato para tests E2E externos: **no renombrar, eliminar ni renombrar** sin revisar el impacto.
- IDs de solicitudes semilla: `req-001` … `req-005`. Al restablecer datos se recuperan exactamente esos.
- El botón "Restablecer datos de prueba" (testid `reset-data-button`) restaura las semillas de forma idempotente sin cerrar la sesión.

## Code style

- JSX sin TypeScript, sin ESLint/Prettier configurados. Seguir el estilo existente: componentes de función, `export default`, comentarios en español explicando decisiones.
- Mensajes de UI en español con etiquetas HTML semánticas.
