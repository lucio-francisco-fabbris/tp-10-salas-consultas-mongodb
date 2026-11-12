# TP 10 - Consultas de Reservas Paso a Paso (MongoDB + Express)

API REST y aplicación web con vistas EJS para la gestión de reservas de salas de estudio, incorporando filtrado exacto, ordenamiento con desempate, paginación y proyección de campos sobre MongoDB Atlas.

---

## 1. Instalación y Ejecución

1. Clonar el repositorio e instalar dependencias exactas desde el lockfile:
   ```bash
   npm ci
   ```
2. Configurar las variables de entorno tomando como base `.env.example` y crear un archivo `.env` privado con la URI de MongoDB Atlas.
3. Verificar sintaxis y conexión antes de iniciar el servidor:
   ```bash
   npm run check
   node --env-file=.env scripts/comprobar-conexion.js
   ```
4. Iniciar la aplicación:
   ```bash
   node --env-file=.env src/index.js
   ```

---

## 2. Variables de Entorno (`.env.example`)

El proyecto utiliza las siguientes variables configuradas en `.env` (sin incluir credenciales ni secretos en el repositorio):

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/reservas_salas_u10?retryWrites=true&w=majority
```

---

## 3. Contrato Final de la API

### Listado con Consultas: `GET /api/reservas`
Devuelve un objeto paginado sin modificar los documentos almacenados en la base de datos.

**Parámetros de consulta (`Query Params`) aceptados:**
* `sala` *(opcional)*: Texto exacto tras aplicar `.trim()` (ej. `Sala Norte`). Si no hay coincidencias, devuelve `200 OK` con `datos: []`.
* `orden` *(opcional)*: Criterio de ordenamiento. Valores permitidos:
  * `estudiante` *(predeterminado)*: Alfabético ascendente + desempate por `_id` ascendente.
  * `personas-asc`: Cantidad de personas ascendente + desempate por `_id` ascendente.
  * `personas-desc`: Cantidad de personas descendente + desempate por `_id` ascendente.
* `pagina` *(opcional)*: Número entero entre `1` y `1000` (predeterminado: `1`).
* `limite` *(opcional)*: Número entero entre `1` y `20` (predeterminado: `2`).

**Proyección de campos:** La consulta selecciona explícitamente los campos públicos (`estudiante`, `email`, `sala`, `fecha`, `turno`, `personas`, `estado`) y conserva `_id` internamente para construir `id`, sin exponer `_id` ni `__v`.

**Respuesta Exitosa (`200 OK`):**
```json
{
  "datos": [
    {
      "id": "6af294aac22bd40b7d8170f6",
      "estudiante": "Ana Ejemplo",
      "email": "ana@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-10-28",
      "turno": "Mañana",
      "personas": 2,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 4,
  "paginas": 2
}
```

**Respuestas de Error (`400 Bad Request`):**
Se rechaza con `400` cualquier parámetro desconocido en la URL (ej. `select`, `otro`), parámetros repetidos (ej. `pagina=1&pagina=2`), `sala` vacía, `orden` fuera de los 3 valores permitidos, o `pagina`/`limite` no enteros o fuera de rango.

### Endpoints Heredados (CRUD y Vistas Web)
* `GET /api/reservas/:id` — Devuelve el detalle público de una reserva (`200 OK`), formato de ID inválido (`400`) o no encontrada (`404`).
* `POST /api/reservas` — Crea una reserva (`201 Created` + cabecera `Location`).
* `PUT /api/reservas/:id` — Reemplazo completo de los 7 campos editables (`200 OK`).
* `PATCH /api/reservas/:id` — Modificación parcial de `personas` o `estado` (`200 OK`).
* `DELETE /api/reservas/:id` — Eliminación de reserva (`204 No Content`).
* **Vistas HTML y Monitoreo:** `GET /reservas`, `GET /reservas/nueva`, `POST /reservas`, `GET /reservas/:id` y `GET /estado` mantienen su comportamiento original sin cambios de interfaz.

---

## 4. Solicitudes Reproducibles en Postman y Matriz de Resultados

La colección exportada se encuentra adjunta en el repositorio (`TP 10 - Reservas.postman_collection.json`).

### Carga Inicial (6 documentos en `reservas_salas_u10`, colección `reservas`)
Se crearon 6 reservas mediante solicitudes `POST /api/reservas` individuales (todas con fecha `2026-10-28`, turno `Mañana` y estado inicial `pendiente`):
1. **Ana Ejemplo** (`ana@example.com` | `Sala Norte` | 2 personas) — ID: `6af294aac22bd40b7d8170f6`
2. **Bruno Ejemplo** (`bruno@example.com` | `Sala Norte` | 1 persona) — ID: `6af294bfc22bd40b7d8170f7`
3. **Carla Ejemplo** (`carla@example.com` | `Sala Norte` | 2 personas) — ID: `6af294d0c22bd40b7d8170f8`
4. **Diego Ejemplo** (`diego@example.com` | `Sala Norte` | 3 personas) — ID: `6af294e5c22bd40b7d8170f9`
5. **Elena Ejemplo** (`elena@example.com` | `Sala Sur` | 1 persona) — ID: `6af294f1c22bd40b7d8170fa`
6. **Fabian Ejemplo** (`fabian@example.com` | `Sala Multimedia` | 4 personas) — ID: `6af29504c22bd40b7d8170fb`

### Matriz de Pruebas (`GET /api/reservas`)
* **Sin parámetros (`GET /api/reservas`):** `200 OK` — Devuelve 2 reservas (Ana `6af294aac22bd40b7d8170f6` y Bruno `6af294bfc22bd40b7d8170f7`), `pagina: 1`, `limite: 2`, `total: 6`, `paginas: 3`.
* **Filtro + Orden + Página 1 (`?sala=Sala Norte&orden=personas-asc&pagina=1&limite=2`):** `200 OK` — Devuelve 2 reservas ordenadas ascendentemente: Bruno (`6af294bfc22bd40b7d8170f7`, 1 persona) y Ana (`6af294aac22bd40b7d8170f6`, 2 personas), `total: 4`, `paginas: 2`.
* **Cambio a Página 2 (`?sala=Sala Norte&orden=personas-asc&pagina=2&limite=2`):** `200 OK` — Devuelve las 2 reservas restantes: Carla (`6af294d0c22bd40b7d8170f8`, 2 personas, desempatada por `_id` tras Ana) y Diego (`6af294e5c22bd40b7d8170f9`, 3 personas), manteniendo `total: 4` y `paginas: 2`.
* **Orden descendente (`?sala=Sala Norte&orden=personas-desc&pagina=1&limite=2`):** `200 OK` — Devuelve Diego (`6af294e5c22bd40b7d8170f9`, 3 personas) y Ana (`6af294aac22bd40b7d8170f6`, 2 personas), conservando exactamente los mismos IDs.
* **Página fuera de rango (`?sala=Sala Norte&pagina=3&limite=2`):** `200 OK` — Devuelve `datos: []`, `pagina: 3`, `limite: 2`, `total: 4`, `paginas: 2` (sin error 404).
* **Sala inexistente (`?sala=Sala Inexistente`):** `200 OK` — Devuelve `datos: []`, `pagina: 1`, `limite: 2`, `total: 0`, `paginas: 0`.
* **Rechazos de validación (`400 Bad Request`):** Comprobado individualmente con `pagina=0`, `pagina=1.5`, `limite=21`, `pagina=1&pagina=2`, `sala=`, `sala=Sala Norte&sala=Sala Sur`, `orden=otro` y `select=email`. Ningún rechazo generó escrituras en Atlas (se conservaron los 6 documentos).
* **Continuidad y reinicio:** Tras detener el servidor (`Ctrl + C`) y volver a iniciarlo, `GET /api/reservas/6af294aac22bd40b7d8170f6` respondió `200 OK` con los datos de Ana Ejemplo intactos y `/estado` reflejó el total real de 6 documentos.

---

## 5. Decisión de Diseño: Modelado de Salas y Reservas

Si incorporáramos información propia de las salas al sistema, **una sala** se describiría con atributos estructurales y relativamente estables: `nombre` (único), `capacidadMaxima`, `ubicacion` (piso o sector), `equipamiento` (ej. proyector, pizarra, sistema de audio) y `habilitada` (booleano para disponibilidad o mantenimiento). En cambio, **una reserva** describiría los datos transaccionales del evento puntual: `estudiante`, `email`, `fecha`, `turno`, `personas`, `estado` y la vinculación con la sala elegida.

Para relacionar ambas entidades, **utilizar una referencia (`ObjectId` de la sala dentro de la reserva)** tendría sentido para evitar la duplicación de datos y mantener la integridad: si cambia la capacidad máxima o el equipamiento de "Sala Norte", se actualiza en un único documento de la colección `salas` sin alterar las reservas existentes. Por otro lado, **embeber ciertos datos resumidos** (como el `nombre` de la sala) evitaría realizar consultas cruzadas (`populate` o `$lookup`) en cada listado paginado y conservaría una foto histórica del nombre con el que el estudiante realizó la reserva.