# Casos de uso para pruebas E2E (manuales)

Este documento describe **qué probar** y **cómo** (paso a paso en el navegador: qué botón pulsar, qué dato introducir, qué comprobar) para el "Gestor de Solicitudes". No incluye código, solo acciones.

**Credenciales demo:** usuario `alumno`, contraseña `Playwright123`. 
**IDs de semillas:** `req-001` … `req-005` (se restauran con "Restablecer datos de prueba").
**Notas:** La app guarda todo en `localStorage` (clave `procesosimple.solicitudes`). La sesión se guarda en `sessionStorage` (clave `procesosimple.sesion`). No hay registro/recuperación.

---

## 1. Autenticación y acceso

### CU-01. Acceso con credenciales correctas
**Objetivo:** Verificar login exitoso y redirección al listado.

**Precondiciones:** Sin sesión activa (`sessionStorage` sin `procesosimple.sesion`). Preferible partir sin datos extra.

**Pasos:**
1. Abrir `http://localhost:5173/` (o la URL donde esté corriendo la app).
2. Comprobar que se muestra la pantalla de login (`data-testid="login-form"`). Título "Gestor de Solicitudes".
3. En campo "Usuario" (`data-testid="login-username"`) escribir: `alumno`
4. En campo "Contraseña" (`data-testid="login-password"`) escribir: `Playwright123`
5. Pulsar botón "Iniciar sesión" (`data-testid="login-button"`).
6. **Comprobar:** Se redirige a `/` (Dashboard). Se muestra `data-testid="dashboard"`. Hay cabecera "Listado de solicitudes". Botón "Nueva solicitud" (`data-testid="new-request-button"`) visible.

### CU-02. Redirección si ya hay sesión activa
**Objetivo:** Si ya hay sesión, `/login` redirige al dashboard.

**Precondiciones:** Haber iniciado sesión (CU-01).

**Pasos:**
1. Navegar manualmente a `/login`.
2. **Comprobar:** No se muestra el formulario de login. Se redirige automáticamente a `/` (Dashboard). Sigue visible el listado.

### CU-03. Login con campos vacíos (validación)
**Objetivo:** Validación de obligatorios.

**Precondiciones:** Sin sesión.

**Pasos:**
1. Ir a `/login`. Dejar "Usuario" y "Contraseña" vacíos.
2. Pulsar "Iniciar sesión" (`data-testid="login-button"`).
3. **Comprobar:** Aparece error bajo "Usuario": `El usuario es obligatorio.` con `data-testid="username-error"` y `role="alert"`.
4. **Comprobar:** Aparece error bajo "Contraseña": `La contraseña es obligatoria.` con `data-testid="password-error"` y `role="alert"`.
5. **Comprobar:** No se redirige; sigue en `/login`.

### CU-04. Login con credenciales incorrectas
**Objetivo:** Mensaje de error genérico.

**Precondiciones:** Sin sesión.

**Pasos:**
1. Ir a `/login`.
2. Escribir "Usuario": `otro`
3. Escribir "Contraseña": `incorrecta`
4. Pulsar "Iniciar sesión".
5. **Comprobar:** Aparece alerta con mensaje `Usuario o contraseña incorrectos.` con `data-testid="login-error"` y `role="alert"`.
6. **Comprobar:** No se crea sesión, permanece en login.

---

## 2. Listado / Dashboard

### CU-05. Visualización inicial con semillas
**Objetivo:** Al primer acceso con datos válidos/ausentes, `getRequests()` repuebla con semillas.

**Precondiciones:** Sin solicitudes en `localStorage` (o datos inválidos). Sesión activa.

**Pasos:**
1. Asegurarse de que no hay solicitudes guardadas (o usar modo incógnito). Iniciar sesión.
2. Ir a `/`.
3. **Comprobar:** Se muestra tabla `data-testid="requests-table"`. Hay 5 filas con `data-testid="request-row"`.
4. **Comprobar:** IDs presentes: `req-001`, `req-002`, `req-003`, `req-004`, `req-005` (atributo `data-id`).
5. **Comprobar:** Para cada fila hay botón "Ver" (`view-{id}`), "Editar" (`edit-{id}`), "Eliminar" (`delete-{id}`).
6. **Comprobar:** Columna "Fecha de creación" muestra fecha en formato español (dd/mm/aaaa).

### CU-06. Búsqueda por título
**Objetivo:** Filtrar por texto (insensible a mayúsculas) contenido en el título.

**Precondiciones:** Hay al menos las 5 semillas. Sesión activa en Dashboard.

**Pasos:**
1. En campo "Buscar por título" (`data-testid="search-input"`) escribir `VPN` (parte del título de alguna semilla).
2. **Comprobar:** La tabla se filtra. Solo aparecen filas cuyo título contenga "vpn" (ignora mayúsculas/minúsculas).
3. Borrar el texto del buscador (dejar vacío).
4. **Comprobar:** Vuelven a mostrarse todas las filas que cumplan filtro de estado.

### CU-07. Filtro por estado
**Objetivo:** Filtrar listado por estado.

**Precondiciones:** Hay semillas con distintos estados. Sesión activa en Dashboard.

**Pasos:**
1. En selector "Filtrar por estado" (`data-testid="status-filter"`) seleccionar `Pendiente`.
2. **Comprobar:** Solo se muestran solicitudes con estado "Pendiente".
3. Cambiar a `En progreso` → solo "En progreso".
4. Cambiar a `Completada` → solo "Completada".
5. Cambiar a `Todos` → se muestran todas.

### CU-08. Búsqueda + filtro combinados
**Objetivo:** Ambos filtros se aplican simultáneamente.

**Precondiciones:** Sesión activa en Dashboard con semillas.

**Pasos:**
1. Poner filtro estado `Pendiente`.
2. Escribir en buscador un fragmento de título que solo exista en una solicitud "Pendiente" (o viceversa).
3. **Comprobar:** Solo se muestra la intersección (debe cumplir ambos criterios).
4. Si no hay coincidencias, aparece `data-testid="empty-message"` con el texto: *"No hay solicitudes que coincidan con la búsqueda o el filtro actual. Puedes crear una nueva solicitud con el botón 'Nueva solicitud'."*

### CU-09. Mensaje flash tras operaciones
**Objetivo:** Se muestra mensaje de éxito al volver desde otras pantallas.

**Precondiciones:** Sesión activa.

**Pasos:**
1. Crear una solicitud (ver CU-10) → al volver a `/` debe aparecer `data-testid="success-message"` con texto `Solicitud "..." creada correctamente.` 
2. Editar una solicitud (CU-14) → volver a detalle o listado según navegación; en detalle aparece mensaje `Solicitud "..." actualizada correctamente.`
3. Eliminar desde listado (CU-16) → aparece `Solicitud "..." eliminada.` en dashboard.
4. Eliminar desde detalle (CU-17) → aparece `Solicitud "..." eliminada.` en dashboard tras redirección.

### CU-10. Restablecer datos de prueba
**Objetivo:** Restaurar semillas sin cerrar sesión.

**Precondiciones:** Sesión activa en Dashboard. Haber modificado/añadido/eliminado solicitudes.

**Pasos:**
1. Pulsar botón "Restablecer datos de prueba" (`data-testid="reset-data-button"`).
2. Aparece diálogo de confirmación (ConfirmDialog). Título "Restablecer datos de prueba". Mensaje indica que se reemplazarán por datos de ejemplo iniciales y que la sesión no se cerrará.
3. Pulsar "Restablecer" para confirmar.
4. **Comprobar:** Aparece mensaje flash `Los datos de prueba han sido restablecidos.` en dashboard.
5. **Comprobar:** Se restauran exactamente las 5 solicitudes con IDs `req-001`…`req-005`. Sigue la sesión activa (no redirige a login).

### CU-11. Cancelar restablecer datos
**Objetivo:** No se restablecen si se cancela.

**Precondiciones:** Sesión activa en Dashboard.

**Pasos:**
1. Pulsar "Restablecer datos de prueba".
2. En el diálogo, pulsar "Cancelar".
3. **Comprobar:** Diálogo se cierra. No cambia el listado. No aparece mensaje de restablecimiento.

---

## 3. Crear solicitud (Nueva solicitud)

### CU-12. Navegación a crear solicitud
**Objetivo:** Acceder al formulario de creación.

**Precondiciones:** Sesión activa en Dashboard.

**Pasos:**
1. Pulsar "Nueva solicitud" (`data-testid="new-request-button"`) (enlace/botón).
2. **Comprobar:** Se navega a `/solicitudes/nueva`. Pantalla con `data-testid="new-request-page"`. Título "Crear solicitud". Texto hint: *"El estado inicial de una nueva solicitud siempre es 'Pendiente'."*

### CU-13. Crear solicitud válida
**Objetivo:** Creación exitosa con valores correctos.

**Precondiciones:** En `/solicitudes/nueva`.

**Pasos:**
1. En "Título" (`data-testid="field-title"`) escribir: `Solicitud de prueba E2E` (longitud >=5 y <=80)
2. En "Descripción" (`data-testid="field-description"`) escribir: `Esta es una descripción de prueba con más de diez caracteres.` (>=10 y <=500)
3. En "Categoría" (`data-testid="field-category"`) seleccionar: `Técnico` (o `General`, `Acceso`, `Facturación`)
4. En "Prioridad" (`data-testid="field-priority"`) seleccionar: `Alta` (o `Media`, `Baja`)
5. **Comprobar:** En formulario de creación NO aparece campo "Estado" (solo en edición).
6. Pulsar "Crear solicitud" (`data-testid="save-button"`).
7. **Comprobar:** Redirige a `/`. Aparece mensaje `Solicitud "Solicitud de prueba E2E" creada correctamente.`. En listado aparece la nueva solicitud con estado `Pendiente`.

### CU-14. Validación de formulario al crear (campos vacíos/inválidos)
**Objetivo:** Se muestran errores por campo sin guardar.

**Precondiciones:** En `/solicitudes/nueva`.

**Pasos:**
1. Dejar todos los campos vacíos.
2. Pulsar "Crear solicitud".
3. **Comprobar:** Errores mostrados con `role="alert"`:
   - Título: error (obligatorio / longitud según validación). 
   - Descripción: error.
   - Categoría: error.
   - Prioridad: error.
4. **Comprobar:** No se crea solicitud, sigue en `/solicitudes/nueva`.

**Casos específicos (comprobar límites):**
- Título con 4 caracteres → debe mostrar error (mínimo 5).
- Título con 81 caracteres → debe mostrar error (máximo 80).
- Descripción con 9 caracteres → debe mostrar error (mínimo 10).
- Descripción con 501 caracteres → debe mostrar error (máximo 500).
- Categoría no seleccionada → error.
- Prioridad no seleccionada → error.

### CU-15. Cancelar creación
**Objetivo:** Volver al listado sin guardar.

**Precondiciones:** En `/solicitudes/nueva` con datos escritos.

**Pasos:**
1. Rellenar algunos campos (opcional).
2. Pulsar "Cancelar" (`data-testid="cancel-button"`).
3. **Comprobar:** Redirige a `/` sin crear solicitud. No aparece mensaje de éxito.

---

## 4. Ver detalle, editar, eliminar

### CU-16. Ver detalle de una solicitud
**Objetivo:** Acceder a la vista de detalle.

**Precondiciones:** Hay solicitudes en listado. Sesión activa.

**Pasos:**
1. Desde Dashboard, pulsar "Ver" (`view-{id}`) de cualquier solicitud (ej. `req-001`).
2. **Comprobar:** Navega a `/solicitudes/{id}`. Pantalla con `data-testid="request-detail"`. Título "Detalle de solicitud".
3. **Comprobar:** Se muestran todos los campos con sus `data-testid`:
   - `detail-id`, `detail-title`, `detail-description`, `detail-category`, `detail-priority`, `detail-status` (con `StatusBadge`), `detail-created-at`, `detail-updated-at`.
4. **Comprobar:** Fechas formateadas con `toLocaleString('es-ES')`.
5. **Comprobar:** Botones/links: "Volver al listado" (`back-to-list`), "Editar" (`edit-request-button`), "Eliminar" (`delete-request-button`).

### CU-17. Editar solicitud
**Objetivo:** Modificar campos y guardar.

**Precondiciones:** Desde detalle o desde listado, acceso a edición.

**Pasos:**
1. Desde Dashboard pulsar "Editar" (`edit-{id}`) O desde detalle pulsar "Editar" (`edit-request-button`).
2. **Comprobar:** Navega a `/solicitudes/{id}/editar`. Pantalla `data-testid="edit-request-page"`. Título "Editar solicitud".
3. **Comprobar:** El formulario viene precargado con valores actuales (`RequestForm` recibe `initial`).
4. **Comprobar:** En edición SÍ aparece el campo "Estado" (`data-testid="field-status"`) con opciones `Pendiente`, `En progreso`, `Completada` (requerido para validación con `includeStatus: true`).
5. Modificar: cambiar título a `Título editado E2E`, cambiar descripción, cambiar categoría/prioridad/estado (ej. a `En progreso`).
6. Pulsar "Guardar cambios" (`data-testid="save-button"`).
7. **Comprobar:** Redirige a `/solicitudes/{id}` (detalle). Aparece mensaje `Solicitud "Título editado E2E" actualizada correctamente.` 
8. **Comprobar:** En detalle se ven los valores actualizados. `updatedAt` debe haberse actualizado respecto a `createdAt` (o ser posterior).

### CU-18. Validación al editar
**Objetivo:** Validación con `includeStatus: true` en edición.

**Precondiciones:** En `/solicitudes/{id}/editar`.

**Pasos:**
1. Borrar título (dejar vacío) o poner título de 4 caracteres.
2. Borrar descripción o poner < 10 caracteres.
3. Poner categoría vacía / prioridad vacía / estado vacío (si es posible manipular).
4. Pulsar "Guardar cambios".
5. **Comprobar:** Se muestran errores por campo correspondientes con `role="alert"`. No se guarda. No hay navegación.

### CU-19. Cancelar edición
**Objetivo:** Volver sin guardar cambios.

**Precondiciones:** En formulario de edición con cambios realizados.

**Pasos:**
1. Modificar algún campo.
2. Pulsar "Cancelar" (`data-testid="cancel-button"`).
3. **Comprobar:** Redirige a `/` (listado). Los cambios NO se guardan.

### CU-20. Eliminar desde listado (con confirmación)
**Objetivo:** Eliminar solicitud desde Dashboard.

**Precondiciones:** Hay al menos una solicitud. Sesión activa en Dashboard.

**Pasos:**
1. Pulsar "Eliminar" (`delete-{id}`) de la solicitud a borrar.
2. Aparece ConfirmDialog. Título "Eliminar solicitud". Mensaje: *"¿Seguro que deseas eliminar la solicitud \"{título}\"? Esta acción no se puede deshacer."*
3. Pulsar "Confirmar" (acción de confirmación del diálogo).
4. **Comprobar:** Se cierra diálogo. Solicitud desaparece del listado. Aparece mensaje flash `Solicitud "{título}" eliminada.` 
5. **Comprobar:** Si era la última que coincidía con filtros, puede aparecer `data-testid="empty-message"`.

### CU-21. Cancelar eliminación desde listado
**Objetivo:** No eliminar si se cancela.

**Precondiciones:** En Dashboard.

**Pasos:**
1. Pulsar "Eliminar" en alguna fila.
2. En ConfirmDialog pulsar "Cancelar".
3. **Comprobar:** Diálogo se cierra. La solicitud sigue en el listado.

### CU-22. Eliminar desde detalle (con confirmación)
**Objetivo:** Eliminar desde vista de detalle.

**Precondiciones:** En `/solicitudes/{id}` con solicitud existente.

**Pasos:**
1. Pulsar "Eliminar" (`data-testid="delete-request-button"`).
2. Confirmar en diálogo.
3. **Comprobar:** Redirige a `/` (Dashboard). Aparece mensaje `Solicitud "{título}" eliminada.` La solicitud ya no existe en el listado.

### CU-23. Solicitud no encontrada (detalle/edición)
**Objetivo:** Gestión de IDs inexistentes.

**Precondiciones:** Sesión activa.

**Pasos:**
1. Navegar directamente a `/solicitudes/NOEXISTE123`.
2. **Comprobar:** Pantalla con `data-testid="request-not-found"`. Título "Solicitud no encontrada". Texto indica que no existe solicitud con ese identificador.
3. **Comprobar:** Hay botón/enlace "Volver al listado" (`data-testid="back-to-list"`) que lleva a `/`.
4. Navegar a `/solicitudes/NOEXISTE123/editar`.
5. **Comprobar:** Mismo estado "Solicitud no encontrada" con botón "Volver al listado". **No** se crea nada.

---

## 5. Persistencia y comportamiento

### CU-24. Persistencia en localStorage
**Objetivo:** Los cambios sobreviven a recarga de página.

**Precondiciones:** Sesión activa.

**Pasos:**
1. Crear una solicitud nueva (CU-13).
2. Recargar la página (`F5` / recarga).
3. **Comprobar:** La nueva solicitud sigue visible en el listado (se guarda en `localStorage` clave `procesosimple.solicitudes`).
4. Editar una solicitud y guardar (CU-17).
5. Recargar página.
6. **Comprobar:** Los cambios persisten.
7. Eliminar una solicitud (CU-20).
8. Recargar página.
9. **Comprobar:** Ya no aparece.

### CU-25. Sesión persistente en sessionStorage
**Objetivo:** La sesión se mantiene mientras la pestaña/ventana esté abierta según `sessionStorage`.

**Precondiciones:** Haber iniciado sesión.

**Pasos:**
1. Iniciar sesión correctamente.
2. Navegar por distintas rutas (`/`, `/solicitudes/nueva`, `/solicitudes/req-001`, etc.).
3. Recargar la página en cualquier ruta protegida.
4. **Comprobar:** No se redirige a login; sigue autenticado.
5. Abrir una nueva pestaña con la misma URL (si se comparte `sessionStorage` según configuración del navegador) - **comprobar comportamiento esperado:** `sessionStorage` es por pestaña; en nueva pestaña sin iniciar sesión debe redirigir a login. 
6. Cerrar sesión implícitamente: cerrar pestaña/ventana → al abrir de nuevo sin sesión debe pedir login (según `sessionStorage`).

### CU-26. IDs únicos al crear
**Objetivo:** Cada nueva solicitud tiene ID único generado.

**Precondiciones:** En formulario de creación.

**Pasos:**
1. Crear solicitud A (CU-13).
2. Crear solicitud B (repetir CU-13 con datos distintos).
3. **Comprobar:** Ambas aparecen en listado con IDs diferentes (generados por `generateId()`).
4. **Comprobar:** Ambos son editables/eliminables por su propio ID.

### CU-27. Estado inicial siempre Pendiente al crear
**Objetivo:** No se puede establecer otro estado en creación.

**Precondiciones:** En `/solicitudes/nueva`.

**Pasos:**
1. Observar el formulario - **no existe** selector de estado.
2. Crear solicitud válida.
3. Ir a detalle de esa solicitud.
4. **Comprobar:** Estado es `Pendiente` (con `StatusBadge`).
5. Solo se puede cambiar estado desde edición (`includeStatus: true`).

---

## 6. Verificación rápida de elementos clave (contrato para tests)

Usar estos `data-testid` como referencia para validar presencia:

**Login:** `login-form`, `login-username`, `login-password`, `login-button`, `username-error`, `password-error`, `login-error`

**Dashboard:** `dashboard`, `new-request-button`, `reset-data-button`, `search-input`, `status-filter`, `success-message`, `requests-table`, `request-row`, `request-title`, `view-{id}`, `edit-{id}`, `delete-{id}`, `empty-message`

**Crear/Editar:** `new-request-page`, `edit-request-page`, `request-form`, `field-title`, `field-description`, `field-category`, `field-priority`, `field-status` (solo edición), `title-error`, `description-error`, `category-error`, `priority-error`, `status-error`, `save-button`, `cancel-button`

**Detalle:** `request-detail`, `request-not-found`, `detail-id`, `detail-title`, `detail-description`, `detail-category`, `detail-priority`, `detail-status`, `detail-created-at`, `detail-updated-at`, `back-to-list`, `edit-request-button`, `delete-request-button`

**Diálogos:** (ConfirmDialog) usados para eliminar/restablecer - verificar aparición/cancelación/confirmación

---

## Checklist de ejecución (orden sugerido)

1. [ ] CU-01 Login correcto
2. [ ] CU-03/CU-04 Validaciones login
3. [ ] CU-05 Semillas visibles
4. [ ] CU-06/CU-07/CU-08 Filtros/búsqueda
5. [ ] CU-12/CU-13 Crear solicitud válida
6. [ ] CU-14 Validaciones creación
7. [ ] CU-16 Ver detalle
8. [ ] CU-17/CU-18 Editar + validación
9. [ ] CU-20/CU-22 Eliminar con confirmación
10. [ ] CU-10 Restablecer datos
11. [ ] CU-23 IDs inexistentes
12. [ ] CU-24 Persistencia tras recarga
13. [ ] CU-02 Redirección con sesión activa

**Fin del documento.**
