# TP 09 - Actualización y eliminación de reservas de salas

## 1. Origen y Mantenimiento
- **Origen:** Copia funcional individual del TP 08 (`tp-08-salas-http-mongodb`).
- **Versiones de entorno:** Node.js v22.x, Express v5.0, Mongoose v8.x.
- **Transición a CRUD completo:** Se añadieron operaciones de reemplazo total (PUT), modificación parcial (PATCH) y eliminación física (DELETE), integrando los nuevos métodos HTTP a la API JSON, interactuando asíncronamente con MongoDB Atlas y manteniendo el sitio web.

## 2. Configuración y Base de Datos
- **Entorno Atlas:** Clúster Gratuito MongoDB Atlas Free (M0).
- **Base de datos:** `reservas_salas_u9`
- **Colección:** `reservas`

### Plantilla de entorno (`.env.example`)
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u9?retryWrites=true&w=majority

### Comando de inicio
node --env-file=.env src/index.js

## 3. Diagnóstico DNS y Cierre Ordenado (*Graceful Shutdown*)
- **Ajuste DNS:** Se mantiene la resolución DNS mediante `dns.setServers(["8.8.8.8", "1.1.1.1"])` en `src/config/base-datos.js` para asegurar la conectividad con los registros SRV de MongoDB Atlas.
- **Conexión previa:** El servidor espera a establecer la conexión con MongoDB Atlas antes de escuchar peticiones en el puerto.
- **Cierre ordenado:** El proceso escucha las señales `SIGINT` y `SIGTERM` para finalizar el servidor HTTP y desconectar Mongoose de forma limpia antes de salir.

## 4. Arquitectura y Estructura por Capas

tp-09-salas-crud-mongodb/
├── src/
│   ├── config/
│   │   ├── entorno.js         # Lectura de variables de entorno
│   │   └── base-datos.js      # Conexión asíncrona a Atlas y DNS
│   ├── modelos/
│   │   └── reserva.js         # Esquema Mongoose con 6 campos + estado (default pendiente)
│   ├── servicios/
│   │   └── reservas.js        # Operaciones asíncronas Mongoose (CRUD Completo)
│   ├── controladores/
│   │   ├── reservas.js        # Renderizado de vistas HTML (EJS)
│   │   └── api-reservas.js    # Respuestas REST JSON (Validaciones PUT/PATCH)
│   ├── rutas/
│   │   ├── reservas.js        # Router para el sitio web
│   │   └── api-reservas.js    # Router para la API REST JSON (GET, POST, PUT, PATCH, DELETE)
│   ├── utils/
│   │   └── formatear.js       # Formateador de _id a id textual
│   ├── middleware/
│   │   ├── reservas.js        # Validaciones
│   │   └── solicitudes.js     # Logger de peticiones
│   ├── app.js                 # Integración Express y middleware global de errores
│   └── index.js               # Conexión asíncrona, listen y Graceful Shutdown
├── views/                     # Plantillas EJS del sitio web
├── public/                    # Archivos estáticos (CSS)
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md

## 5. Esquema y Modelo de Datos

El modelo de Mongoose exige que todos los campos del cliente sean **obligatorios** (requeridos) al crear (POST) o reemplazar (PUT). Las reglas aplicadas son:

- **`estudiante`** (`String`): Se aplica limpieza de espacios en los extremos (`trim`).
- **`email`** (`String`): Se aplica `trim` y se exige la presencia obligatoria del carácter `@`.
- **`sala`** (`String`): Limitado mediante `enum` estrictamente a: `"Sala Norte"`, `"Sala Sur"`, `"Sala Multimedia"`.
- **`fecha`** (`String`): Se aplica limpieza de espacios (`trim`).
- **`turno`** (`String`): Limitado mediante `enum` estrictamente a: `"Mañana"`, `"Tarde"`, `"Noche"`.
- **`personas`** (`Number`): Validado internamente como entero puro (`Number.isInteger`) y delimitado a un rango permitido (Mínimo `1`, Máximo `6`).
- **`estado`** (`String`): Valor por defecto: `"pendiente"`. Limitado mediante `enum` a `"pendiente"` o `"confirmada"`.

## 6. Tabla de Endpoints API

### Operaciones de Lectura (GET)
- **`GET /api/reservas`**
  Obtiene el listado completo de reservas directamente desde MongoDB Atlas. *(Respuesta esperada: 200 OK)*
- **`GET /api/reservas?sala=Nombre%20De%20Sala`**
  Filtra la colección y devuelve un arreglo con las reservas que coincidan de forma exacta con la sala. *(Respuesta esperada: 200 OK)*
- **`GET /api/reservas/:id`**
  Busca un documento específico por su ID. *(Respuestas posibles: 200 OK, 400 Bad Request para formato inválido, 404 Not Found si no existe)*
- **`GET /estado`**
  Ruta de diagnóstico (*health check*) que realiza un conteo asíncrono real en la colección y devuelve el total de documentos. *(Respuesta esperada: 200 OK)*

### Operaciones de Creación (POST)
- **`POST /api/reservas`**
  Crea una nueva reserva. Recibe el payload en JSON, valida las reglas del esquema, asigna un estado, y guarda el registro de manera persistente. El cliente no puede asignar `estado` ni `_id`. Devuelve la ruta del nuevo recurso. *(Respuesta esperada: 201 Created y cabecera Location)*

### Operaciones de Actualización (PUT y PATCH)
- **`PUT /api/reservas/:id`**
  Reemplazo completo. Exige el envío de los **7 campos** editables (incluyendo `estado`) y ningún campo extra. La actualización persiste en Atlas. *(Respuesta esperada: 200 OK, 400 Bad Request si faltan/sobran campos o 404 Not Found)*
- **`PATCH /api/reservas/:id`**
  Modificación parcial. Admite únicamente los campos **`personas`** y/o **`estado`**. Los demás campos se conservan intactos. *(Respuesta esperada: 200 OK, 400 Bad Request si el cuerpo está vacío o incluye campos no admitidos o 404 Not Found)*

### Operaciones de Eliminación (DELETE)
- **`DELETE /api/reservas/:id`**
  Borrado físico. Elimina el documento permanentemente de MongoDB Atlas utilizando `findByIdAndDelete`. *(Respuesta esperada: 204 No Content sin cuerpo, 400 Bad Request para formato inválido, 404 Not Found)*

## 7. Ejemplo de Solicitud y Respuesta JSON

### Solicitud PUT (`/api/reservas/:id`)
- **Headers:** `Content-Type: application/json`
- **Cuerpo:**
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-28",
  "turno": "Mañana",
  "personas": 2,
  "estado": "confirmada"
}

### Respuesta PUT (`200 OK`)
- **Headers de respuesta:** `Content-Type: application/json`
- **Cuerpo:**
{
  "id": "671e8a2b3f123456789abcde",
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-28",
  "turno": "Mañana",
  "personas": 2,
  "estado": "confirmada"
}

## 8. Instrucciones para Reproducir en Postman

1. **Crear una identidad:** `POST http://localhost:3000/api/reservas` con datos ficticios. Registrar `201 Created`, ID y Location en Headers.
2. **Reemplazar completo:** `PUT http://localhost:3000/api/reservas/ID_RECIBIDO`, enviando los seis campos originales y `estado: confirmada`. Esperar `200 OK` con los siete valores. Omitir un campo debe dar `400 Bad Request`.
3. **Modificar parcial:** `PATCH http://localhost:3000/api/reservas/ID_RECIBIDO` enviando solo `{"personas": 3}` o `{"estado": "pendiente"}`. Esperar `200 OK` con el campo actualizado y los demás conservados.
4. **Eliminar objetivo:** `DELETE http://localhost:3000/api/reservas/ID_RECIBIDO`. Esperar `204 No Content` con cuerpo vacío.
5. **Verificar eliminación:** Consultar `GET http://localhost:3000/api/reservas/ID_RECIBIDO` y esperar `404 Not Found`. Verificar que el arreglo de listado tenga una reserva menos.
6. **Prueba de persistencia tras reinicio:** 
   - Actualizar una reserva.
   - Eliminar otro documento.
   - Detener el servidor con `Ctrl + C`.
   - Iniciar con `node --env-file=.env src/index.js`.
   - Consultar ID actualizado (conserva estado posterior) e ID eliminado (sigue ausente).

## 9. Matriz Mínima de Resultados

### Pruebas de Éxito y Persistencia (Happy Path)
- **POST válido:** Se esperaba `201 Created`, Location y estado pendiente. **Resultado:** `201 Created`, Location asignada correctamente y estado inicial `"pendiente"`.
- **PUT completo:** Se esperaba `200 OK`, mismo ID y los siete campos actualizados. **Resultado:** `200 OK`, devuelve la reserva con los datos sustituidos al 100%.
- **PATCH válido (`personas` o `estado`):** Se esperaba `200 OK` y campos omitidos conservados. **Resultado:** `200 OK`, actualiza únicamente el campo indicado sin alterar el resto.
- **DELETE existente:** Se esperaba `204 No Content` sin cuerpo y un documento menos. **Resultado:** `204 No Content` (cuerpo vacío) y el listado de `/api/reservas` refleja una reserva menos.
- **Prueba tras reiniciar servidor:** Se esperaba que los cambios y borrados persistan. **Resultado:** Los documentos actualizados conservan sus valores y los eliminados siguen ausentes (lectura real desde Atlas).
- **Sitio, formulario y `/estado`:** Se esperaba mantener los contratos. **Resultado:** Vistas EJS operativas y la ruta `/estado` sigue reflejando el total real de MongoDB.

### Pruebas de Rechazo y Errores (400 / 404 / 500)
- **ID mal formado:** Se esperaba `400 Bad Request`. **Resultado:** `400 Bad Request`.
- **ID válido ausente en PUT/PATCH:** Se esperaba `404 Not Found` sin creación accidental (`upsert: false`). **Resultado:** `404 Not Found`.
- **PUT incompleto (faltan campos):** Se esperaba `400 Bad Request` y recurso intacto. **Resultado:** `400 Bad Request`, sin escrituras en BD.
- **PATCH vacío, campo extra, `_id` o `$set`:** Se esperaba `400 Bad Request` sin modificación. **Resultado:** `400 Bad Request`.
- **Campo `personas` inválido (0, 7, 2.5, true, arreglo, objeto):** Se esperaba `400 Bad Request` sin modificación. **Resultado:** `400 Bad Request`.
- **Campo `estado` o enum inválido:** Se esperaba `400 Bad Request` sin modificación. **Resultado:** `400 Bad Request`.
- **JSON mal formado o cuerpo ausente:** Se esperaba `400 Bad Request`. **Resultado:** `400 Bad Request`.
- **Repetir DELETE / GET posterior a un borrado:** Se esperaba `404 Not Found`. **Resultado:** `404 Not Found`.
- **Fallo inesperado simulado:** Se esperaba `500 Internal Server Error` sin exponer secretos. **Resultado:** `500 Internal Server Error` con JSON seguro.

## 10. Comparación con el TP 08
- **CRUD Completo:** El TP 08 establecía la persistencia en Atlas limitándose a operaciones de creación y lectura. El TP 09 incorpora operaciones completas de actualización (reemplazo estricto en PUT y modificación parcial restrictiva en PATCH) y borrado físico permanente.
- **Operadores y Validaciones Mongoose:** Se configuraron validaciones rigurosas en la actualización activando `runValidators:true` y gestionando manualmente el operador `$set` en el PATCH. Se incorporó `findByIdAndDelete` para asegurar la eliminación definitiva de los documentos, abandonando la respuesta al cliente sin persistencia.
- **Desuso de `new:true` y adopción de estándares modernos:** Se corrigieron advertencias de Mongoose reemplazando opciones de retorno obsoletas para garantizar compatibilidad con versiones superiores de MongoDB y su driver nativo.