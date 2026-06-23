PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

DROP TABLE IF EXISTS operaciones_recepcion;
DROP TABLE IF EXISTS solicitudes_huesped;
DROP TABLE IF EXISTS checkouts;
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS reservaciones;
DROP TABLE IF EXISTS tarifas_habitacion;
DROP TABLE IF EXISTS habitaciones;
DROP TABLE IF EXISTS huespedes;
DROP TABLE IF EXISTS tipos_habitacion;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS configuracion_hotel;

CREATE TABLE roles (
    id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    id_rol INTEGER NOT NULL,
    nombre_completo TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo', 'inactivo', 'bloqueado')),
    ultimo_acceso TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE tipos_habitacion (
    id_tipo_habitacion INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    tarifa_base REAL NOT NULL CHECK (tarifa_base >= 0),
    estado TEXT NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo', 'inactivo')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habitaciones (
    id_habitacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_tipo_habitacion INTEGER NOT NULL,
    numero TEXT NOT NULL UNIQUE,
    piso INTEGER NOT NULL CHECK (piso > 0),
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    tarifa_noche REAL NOT NULL CHECK (tarifa_noche >= 0),
    estado TEXT NOT NULL DEFAULT 'disponible'
        CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'limpieza', 'mantenimiento')),
    observaciones TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_habitacion) REFERENCES tipos_habitacion(id_tipo_habitacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE huespedes (
    id_huesped INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    documento TEXT NOT NULL UNIQUE,
    nacionalidad TEXT,
    telefono TEXT,
    correo TEXT,
    ciudad_origen TEXT,
    fecha_nacimiento TEXT,
    observaciones TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservaciones (
    id_reservacion INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_reserva TEXT NOT NULL UNIQUE,
    id_huesped INTEGER NOT NULL,
    id_habitacion INTEGER,
    id_tipo_habitacion INTEGER,
    fecha_entrada TEXT NOT NULL,
    fecha_salida TEXT NOT NULL,
    adultos INTEGER NOT NULL DEFAULT 1 CHECK (adultos > 0),
    ninos INTEGER NOT NULL DEFAULT 0 CHECK (ninos >= 0),
    origen_reserva TEXT NOT NULL DEFAULT 'recepcion'
        CHECK (origen_reserva IN ('recepcion', 'landing', 'whatsapp', 'telefono', 'agencia')),
    estado_reserva TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado_reserva IN ('pendiente', 'confirmada', 'checkin', 'checkout', 'cancelada')),
    solicitudes_especiales TEXT,
    total_estimado REAL NOT NULL DEFAULT 0 CHECK (total_estimado >= 0),
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    CHECK (fecha_salida > fecha_entrada),
    FOREIGN KEY (id_huesped) REFERENCES huespedes(id_huesped)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (id_tipo_habitacion) REFERENCES tipos_habitacion(id_tipo_habitacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE checkins (
    id_checkin INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reservacion INTEGER NOT NULL UNIQUE,
    id_habitacion INTEGER NOT NULL,
    id_huesped INTEGER NOT NULL,
    fecha_hora_checkin TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_responsable INTEGER,
    observaciones TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_huesped) REFERENCES huespedes(id_huesped)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (usuario_responsable) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE checkouts (
    id_checkout INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reservacion INTEGER NOT NULL UNIQUE,
    id_habitacion INTEGER NOT NULL,
    id_huesped INTEGER NOT NULL,
    fecha_hora_checkout TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    noches INTEGER NOT NULL CHECK (noches > 0),
    tarifa_noche REAL NOT NULL CHECK (tarifa_noche >= 0),
    subtotal_hospedaje REAL NOT NULL CHECK (subtotal_hospedaje >= 0),
    servicios_adicionales REAL NOT NULL DEFAULT 0 CHECK (servicios_adicionales >= 0),
    descuentos REAL NOT NULL DEFAULT 0 CHECK (descuentos >= 0),
    total_estimado REAL NOT NULL CHECK (total_estimado >= 0),
    usuario_responsable INTEGER,
    observaciones TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reservacion) REFERENCES reservaciones(id_reservacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (id_huesped) REFERENCES huespedes(id_huesped)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (usuario_responsable) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE solicitudes_huesped (
    id_solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_solicitud TEXT NOT NULL UNIQUE,
    id_huesped INTEGER,
    id_habitacion INTEGER,
    tipo_solicitud TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    canal TEXT NOT NULL DEFAULT 'recepcion'
        CHECK (canal IN ('recepcion', 'whatsapp', 'telefono', 'landing', 'sistema')),
    prioridad TEXT NOT NULL DEFAULT 'media'
        CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_atencion', 'resuelta', 'cancelada')),
    responsable INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    closed_at TEXT,
    FOREIGN KEY (id_huesped) REFERENCES huespedes(id_huesped)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (responsable) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE operaciones_recepcion (
    id_operacion INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_operacion TEXT NOT NULL UNIQUE,
    tipo_operacion TEXT NOT NULL
        CHECK (tipo_operacion IN (
            'reserva_creada',
            'reserva_confirmada',
            'reserva_cancelada',
            'checkin_realizado',
            'checkout_realizado',
            'habitacion_actualizada',
            'huesped_registrado',
            'solicitud_registrada',
            'solicitud_resuelta',
            'usuario_actualizado'
        )),
    modulo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    usuario_responsable INTEGER,
    rol_usuario TEXT,
    registro_afectado TEXT,
    estado_anterior TEXT,
    estado_nuevo TEXT,
    estado_operacion TEXT NOT NULL DEFAULT 'completada'
        CHECK (estado_operacion IN ('completada', 'fallida', 'revertida')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_responsable) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE tarifas_habitacion (
    id_tarifa INTEGER PRIMARY KEY AUTOINCREMENT,
    id_tipo_habitacion INTEGER NOT NULL,
    nombre_tarifa TEXT NOT NULL,
    precio REAL NOT NULL CHECK (precio >= 0),
    descripcion TEXT,
    estado TEXT NOT NULL DEFAULT 'activa'
        CHECK (estado IN ('activa', 'inactiva')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_tipo_habitacion, nombre_tarifa),
    FOREIGN KEY (id_tipo_habitacion) REFERENCES tipos_habitacion(id_tipo_habitacion)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE configuracion_hotel (
    id_configuracion INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_hotel TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    pais TEXT NOT NULL,
    direccion TEXT,
    telefono TEXT,
    whatsapp TEXT,
    correo TEXT,
    checkin_hora TEXT NOT NULL DEFAULT '14:00',
    checkout_hora TEXT NOT NULL DEFAULT '12:00',
    moneda TEXT NOT NULL DEFAULT 'BOB',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservaciones_codigo_reserva
    ON reservaciones(codigo_reserva);
CREATE INDEX idx_reservaciones_estado_reserva
    ON reservaciones(estado_reserva);
CREATE INDEX idx_reservaciones_fechas
    ON reservaciones(fecha_entrada, fecha_salida);
CREATE INDEX idx_reservaciones_huesped
    ON reservaciones(id_huesped);
CREATE INDEX idx_habitaciones_estado
    ON habitaciones(estado);
CREATE INDEX idx_huespedes_documento
    ON huespedes(documento);
CREATE INDEX idx_solicitudes_huesped_estado
    ON solicitudes_huesped(estado);
CREATE INDEX idx_solicitudes_habitacion
    ON solicitudes_huesped(id_habitacion);
CREATE INDEX idx_operaciones_recepcion_created_at
    ON operaciones_recepcion(created_at);
CREATE INDEX idx_operaciones_recepcion_tipo
    ON operaciones_recepcion(tipo_operacion);

COMMIT;
