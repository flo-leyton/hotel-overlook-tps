# Backend TPS Hotel Overlook

API REST académica para el módulo de recepción del Hotel Overlook.

## Tecnología

- Node.js
- Express
- SQLite
- `better-sqlite3`
- CORS

No utiliza PHP, MySQL, pagos, facturación electrónica ni integraciones con plataformas externas.

## Requisitos

- Node.js 22 o superior.
- Base inicializada en `../database/hotel_overlook_tps.sqlite`.

## Instalación

Puede instalarse desde la raíz del proyecto:

```bash
npm install
```

También puede instalarse directamente dentro de `backend/`:

```bash
cd backend
npm install
```

## Ejecución

Desde la raíz:

```bash
npm run dev
npm start
```

Desde `backend/`:

```bash
npm run dev
npm start
```

El servidor usa por defecto:

```text
http://localhost:3000
```

Puede cambiarse con la variable de entorno `PORT`.

## Prueba de salud

```http
GET http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "message": "Backend TPS Hotel Overlook funcionando",
  "database": "SQLite"
}
```

## Base de datos

La conexión se configura en `db.js` y abre:

```text
database/hotel_overlook_tps.sqlite
```

Se habilitan:

- claves foráneas;
- modo WAL;
- espera breve ante bloqueos.

Para pruebas puede utilizarse otra copia de la base:

```powershell
$env:DB_PATH="C:\ruta\base-prueba.sqlite"
npm start
```

Esto permite verificar transacciones sin modificar la base principal.

## Endpoints

### Dashboard

- `GET /api/dashboard/resumen`

### Habitaciones

- `GET /api/habitaciones`
- `GET /api/habitaciones/:id`
- `POST /api/habitaciones`
- `PATCH /api/habitaciones/:id/estado`

### Huéspedes

- `GET /api/huespedes`
- `GET /api/huespedes/:id`
- `POST /api/huespedes`
- `PUT /api/huespedes/:id`

### Reservaciones

- `GET /api/reservaciones`
- `GET /api/reservaciones/:id`
- `POST /api/reservaciones`
- `POST /api/reservaciones/publica`
- `PATCH /api/reservaciones/:id/confirmar`
- `PATCH /api/reservaciones/:id/cancelar`

La reserva pública crea o reutiliza al huésped por documento y siempre registra:

```text
origen_reserva = landing
estado_reserva = pendiente
```

### Check-in

- `POST /api/checkin`

La transacción:

1. valida reserva, huésped y habitación;
2. inserta el check-in;
3. cambia la reserva a `checkin`;
4. cambia la habitación a `ocupada`;
5. registra la operación.

### Check-out

- `POST /api/checkout`

La transacción:

1. valida la estadía activa;
2. calcula subtotal y total estimado;
3. inserta el check-out;
4. cambia la reserva a `checkout`;
5. cambia la habitación a `limpieza`;
6. registra la operación.

El cálculo es operativo. No representa facturación ni cobro.

### Solicitudes

- `GET /api/solicitudes`
- `POST /api/solicitudes`
- `PATCH /api/solicitudes/:id/asignar`
- `PATCH /api/solicitudes/:id/estado`

### Operaciones

- `GET /api/operaciones`
- `GET /api/operaciones/:id`

### Usuarios

- `GET /api/usuarios`
- `GET /api/usuarios/:id`
- `POST /api/usuarios`
- `PATCH /api/usuarios/:id/estado`

La autenticación real queda pendiente para una fase posterior.

### Tarifas

- `GET /api/tarifas`
- `POST /api/tarifas`
- `PATCH /api/tarifas/:id/estado`

## Respuestas y validación

La API devuelve JSON y usa:

- `200`: consulta o actualización exitosa;
- `201`: creación exitosa;
- `400`: datos inválidos;
- `404`: registro inexistente;
- `409`: conflicto de estado o dato único;
- `500`: error interno.

Las consultas usan sentencias preparadas. Las operaciones que afectan varias tablas utilizan transacciones SQLite para evitar estados parciales.

## Próxima fase

El frontend HopeUI consumirá estos endpoints mediante `fetch()`. La siguiente integración reemplazará gradualmente los datos de ejemplo por respuestas reales, sin reconstruir la interfaz existente.
# Autenticación y autorización

Endpoints incorporados:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/roles`
- gestión de usuarios mediante `/api/usuarios`

Las rutas internas protegidas esperan el header académico `x-user-id`. La
contraseña nunca viaja fuera del login y se compara con `bcryptjs`.

Para inicializar las cuentas:

```bash
npm install
npm run seed:users
npm start
```

La landing pública y `POST /api/reservaciones/publica` continúan siendo
públicos. El mecanismo actual es apropiado para el prototipo académico, no para
un despliegue productivo.
