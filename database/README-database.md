# Base de datos del TPS Hotel Overlook

## Motor utilizado

El proyecto utiliza **SQLite**. El archivo previsto para la base de datos es:

```text
database/hotel_overlook_tps.sqlite
```

SQLite permite persistencia real sin depender del caché ni del almacenamiento del navegador. No necesita un servidor de base de datos separado, es suficiente para este prototipo académico y permite migrar posteriormente a PostgreSQL o MySQL si el sistema crece.

`localStorage` no será el almacenamiento principal del sistema.

## Archivos

- `schema.sql`: crea las tablas, restricciones, claves foráneas e índices.
- `seed.sql`: inserta datos realistas para probar el TPS.
- `hotel_overlook_tps.sqlite`: base SQLite inicializada con el esquema y los datos semilla.

## Inicialización con SQLite CLI

Desde la carpeta `database/`:

```bash
sqlite3 hotel_overlook_tps.sqlite < schema.sql
sqlite3 hotel_overlook_tps.sqlite < seed.sql
```

También puede ejecutarse en una sola sesión:

```bash
sqlite3 hotel_overlook_tps.sqlite
.read schema.sql
.read seed.sql
.quit
```

El archivo `schema.sql` elimina las tablas existentes antes de recrearlas. Debe utilizarse con cuidado cuando ya existan datos reales.

## Organización

### Seguridad y configuración

- `roles`
- `usuarios`
- `configuracion_hotel`

### Catálogos operativos

- `tipos_habitacion`
- `habitaciones`
- `tarifas_habitacion`
- `huespedes`

### Tablas transaccionales

- `reservaciones`
- `checkins`
- `checkouts`
- `solicitudes_huesped`
- `operaciones_recepcion`

Las reservaciones relacionan al huésped con el tipo de habitación y, cuando corresponde, con una habitación específica. Los check-ins y check-outs registran quién realizó la operación y preservan sus valores operativos. Las solicitudes representan requerimientos del huésped. `operaciones_recepcion` funciona como historial y trazabilidad de cambios relevantes.

## Soporte al flujo TPS

La estructura permite representar las principales transiciones:

- Reserva: `pendiente` → `confirmada` → `checkin` → `checkout`.
- Reserva cancelada: `pendiente` o `confirmada` → `cancelada`.
- Habitación en check-in: `disponible` o `reservada` → `ocupada`.
- Habitación en check-out: `ocupada` → `limpieza`.
- Solicitud: `pendiente` → `en_atencion` → `resuelta`.

Las reglas de negocio que coordinan varias tablas se implementarán en la capa de servicios del backend mediante transacciones SQLite. Por ejemplo, confirmar un check-in deberá actualizar la reservación, cambiar el estado de la habitación, insertar el check-in y registrar la operación de recepción dentro de una única transacción.

## Integración futura con Node.js y Express

El backend de la siguiente fase abrirá `database/hotel_overlook_tps.sqlite` mediante un controlador SQLite para Node.js. Express expondrá endpoints REST para consultar y actualizar:

- habitaciones;
- huéspedes;
- reservaciones;
- check-ins;
- check-outs;
- solicitudes;
- usuarios;
- tarifas;
- historial de operaciones.

El formulario público de la landing utilizará:

```http
POST /api/reservaciones/publica
```

El backend deberá crear o reutilizar el huésped y registrar la reservación con:

```text
origen_reserva = landing
estado_reserva = pendiente
```

## Consideraciones

- Las claves foráneas se activan mediante `PRAGMA foreign_keys = ON`.
- Las fechas se guardan como texto ISO 8601.
- Los montos usan `REAL` y la moneda configurada es `BOB`.
- Los hashes incluidos en `seed.sql` son marcadores de ejemplo y no contraseñas reales.
- En producción, el backend deberá generar hashes seguros y validar todos los datos recibidos.
- No se utiliza PHP ni sintaxis exclusiva de MySQL.
# Roles y usuarios de prueba

La autenticación del prototipo utiliza las tablas `roles` y `usuarios`. Las
contraseñas se almacenan exclusivamente como hashes bcrypt.

Después de crear o restaurar la base de datos, ejecute:

```bash
npm run seed:users
```

Credenciales académicas:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@hoteloverlook.bo | Admin123 |
| Supervisor de recepción | supervisor@hoteloverlook.bo | Supervisor123 |
| Recepcionista | recepcion@hoteloverlook.bo | Recepcion123 |

El administrador gestiona usuarios y tarifas críticas. El supervisor opera los
módulos de recepción y puede cancelar reservas. El recepcionista ejecuta las
transacciones diarias, no administra usuarios ni tarifas y consulta únicamente
sus propias operaciones.

## Limitación de seguridad

Esta versión usa `sessionStorage` para conservar visualmente el usuario y envía
su identificador mediante el header `x-user-id`. El backend valida que el
usuario exista, esté activo y posea el rol requerido. Es un mecanismo académico
que debe reemplazarse por JWT o sesiones seguras antes de producción.
