PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

INSERT INTO roles (id_rol, nombre, descripcion) VALUES
    (1, 'Administrador', 'Administración general del TPS y gestión de usuarios.'),
    (2, 'Supervisor', 'Supervisión de recepción, operaciones y estados del hotel.'),
    (3, 'Recepcionista', 'Ejecución de transacciones diarias del área de recepción.');

INSERT INTO usuarios (
    id_usuario, id_rol, nombre_completo, correo, password_hash, estado, ultimo_acceso
) VALUES
    (1, 1, 'Admin Hotel Overlook', 'admin@hoteloverlook.bo', '$2b$12$HASH_DE_EJEMPLO_ADMIN_NO_REAL', 'activo', '2026-06-22 07:30:00'),
    (2, 2, 'Miguel Arias', 'miguel.arias@hoteloverlook.bo', '$2b$12$HASH_DE_EJEMPLO_SUPERVISOR_NO_REAL', 'activo', '2026-06-22 08:45:00'),
    (3, 3, 'Carla Mendoza', 'carla.mendoza@hoteloverlook.bo', '$2b$12$HASH_DE_EJEMPLO_RECEPCION_NO_REAL', 'activo', '2026-06-22 09:15:00');

INSERT INTO tipos_habitacion (
    id_tipo_habitacion, nombre, descripcion, capacidad, tarifa_base
) VALUES
    (1, 'Simple', 'Habitación para una persona, adecuada para viajes cortos o laborales.', 1, 280),
    (2, 'Doble', 'Habitación para dos personas con dos plazas.', 2, 380),
    (3, 'Matrimonial', 'Habitación para dos personas con mayor privacidad y comodidad.', 2, 450),
    (4, 'Familiar', 'Habitación amplia para familias de hasta cuatro integrantes.', 4, 620),
    (5, 'Suite', 'Habitación amplia con servicios preferenciales.', 2, 850);

INSERT INTO habitaciones (
    id_habitacion, id_tipo_habitacion, numero, piso, capacidad, tarifa_noche, estado, observaciones
) VALUES
    (1, 1, '101', 1, 1, 280, 'disponible', 'Lista para asignación.'),
    (2, 2, '102', 1, 2, 380, 'ocupada', 'Estadía activa.'),
    (3, 3, '103', 1, 2, 450, 'limpieza', 'Limpieza posterior a salida.'),
    (4, 2, '104', 1, 2, 380, 'reservada', 'Reservada para llegada del día.'),
    (5, 2, '110', 1, 2, 380, 'limpieza', 'Check-out realizado a las 10:15.'),
    (6, 1, '115', 1, 1, 280, 'reservada', 'Pendiente de confirmación final.'),
    (7, 1, '118', 1, 1, 280, 'ocupada', 'Late check-out solicitado.'),
    (8, 4, '201', 2, 4, 620, 'disponible', 'Lista para familias.'),
    (9, 2, '202', 2, 2, 380, 'ocupada', 'Salida prevista para hoy.'),
    (10, 1, '203', 2, 1, 280, 'ocupada', 'Check-in realizado en turno mañana.'),
    (11, 2, '204', 2, 2, 380, 'reservada', 'Asignada a RSV-1024.'),
    (12, 2, '205', 2, 2, 380, 'disponible', 'Lista para asignación.'),
    (13, 2, '208', 2, 2, 380, 'limpieza', 'Check-out realizado a las 11:00.'),
    (14, 2, '210', 2, 2, 380, 'ocupada', 'Solicitud de limpieza urgente abierta.'),
    (15, 5, '301', 3, 2, 850, 'reservada', 'Asignada a RSV-1025.'),
    (16, 3, '302', 3, 2, 450, 'limpieza', 'Pendiente de liberación por limpieza.'),
    (17, 3, '305', 3, 2, 450, 'ocupada', 'Salida prevista para hoy.'),
    (18, 4, '410', 4, 4, 620, 'reservada', 'Asignada a RSV-1027.'),
    (19, 5, '401', 4, 2, 850, 'mantenimiento', 'Fuera de servicio por revisión preventiva.');

INSERT INTO huespedes (
    id_huesped, nombre_completo, documento, nacionalidad, telefono, correo,
    ciudad_origen, fecha_nacimiento, observaciones
) VALUES
    (1, 'Sergio Molina', '7894561', 'Bolivia', '+591 71234567', 'sergio@mail.com', 'La Paz', '1988-04-14', 'Prefiere habitaciones alejadas del ascensor.'),
    (2, 'Mariana Rojas', 'P458899', 'Chile', '+56 99887766', 'mariana@mail.com', 'Santiago', '1992-09-08', 'Solicita habitación silenciosa.'),
    (3, 'Carlos Méndez', '6541237', 'Bolivia', '+591 76543210', 'carlos@mail.com', 'Cochabamba', '1985-01-22', NULL),
    (4, 'Lucía Paredes', 'AR99213', 'Argentina', '+54 911456789', 'lucia@mail.com', 'Buenos Aires', '1990-06-17', 'Viaje de negocios.'),
    (5, 'Pablo Heredia', '8821456', 'Bolivia', '+591 73445566', 'pablo@mail.com', 'Santa Cruz', '1987-11-03', NULL),
    (6, 'Ana Salvatierra', '7123098', 'Bolivia', '+591 70112233', 'ana@mail.com', 'Sucre', '1996-03-25', NULL),
    (7, 'Diego Flores', '6677889', 'Bolivia', '+591 77665544', 'diego@mail.com', 'Tarija', '1984-08-19', 'Viaja con dos niños.'),
    (8, 'Carla Ríos', '5533442', 'Bolivia', '+591 70119922', 'carla.rios@mail.com', 'Potosí', '1993-12-02', 'Solicitud recibida desde la landing.'),
    (9, 'Rodrigo Salinas', '4455667', 'Bolivia', '+591 72223344', 'rodrigo@mail.com', 'La Paz', '1982-05-10', NULL),
    (10, 'Elena Ponce', 'CH77881', 'Chile', '+56 98776655', 'elena@mail.com', 'Iquique', '1989-10-28', NULL);

INSERT INTO reservaciones (
    id_reservacion, codigo_reserva, id_huesped, id_habitacion, id_tipo_habitacion,
    fecha_entrada, fecha_salida, adultos, ninos, origen_reserva, estado_reserva,
    solicitudes_especiales, total_estimado, created_by, created_at
) VALUES
    (1, 'RSV-1019', 1, 10, 1, '2026-06-22', '2026-06-24', 1, 0, 'recepcion', 'checkin', 'Habitación silenciosa.', 560, 3, '2026-06-20 10:15:00'),
    (2, 'RSV-1024', 2, 11, 2, '2026-06-22', '2026-06-24', 2, 0, 'landing', 'confirmada', 'Llegada estimada 09:30.', 760, 3, '2026-06-21 14:20:00'),
    (3, 'RSV-1008', 3, 9, 2, '2026-06-20', '2026-06-22', 1, 0, 'recepcion', 'checkin', NULL, 840, 3, '2026-06-18 09:00:00'),
    (4, 'RSV-1015', 4, 17, 3, '2026-06-19', '2026-06-22', 2, 0, 'telefono', 'checkin', 'Salida prevista a las 12:00.', 1350, 2, '2026-06-18 16:40:00'),
    (5, 'RSV-1025', 5, 15, 5, '2026-06-22', '2026-06-25', 1, 0, 'whatsapp', 'confirmada', NULL, 2550, 3, '2026-06-21 15:10:00'),
    (6, 'RSV-1026', 6, 6, 1, '2026-06-22', '2026-06-23', 1, 0, 'recepcion', 'pendiente', NULL, 280, 3, '2026-06-22 07:50:00'),
    (7, 'RSV-1027', 7, 18, 4, '2026-06-22', '2026-06-26', 2, 2, 'agencia', 'confirmada', 'Solicita cuna adicional.', 2480, 2, '2026-06-21 17:30:00'),
    (8, 'RSV-1028', 8, NULL, 2, '2026-06-23', '2026-06-24', 2, 0, 'landing', 'pendiente', 'Preferencia por piso alto.', 380, NULL, '2026-06-22 08:10:00'),
    (9, 'RSV-1004', 9, 5, 2, '2026-06-20', '2026-06-22', 2, 0, 'recepcion', 'checkout', NULL, 560, 3, '2026-06-17 11:25:00'),
    (10, 'RSV-1005', 10, 13, 2, '2026-06-19', '2026-06-22', 2, 0, 'agencia', 'checkout', 'Incluye desayuno adicional.', 920, 2, '2026-06-16 13:45:00'),
    (11, 'RSV-1022', 6, NULL, 3, '2026-06-25', '2026-06-27', 2, 0, 'landing', 'cancelada', 'Cancelada por cambio de fechas.', 900, NULL, '2026-06-20 18:20:00');

INSERT INTO checkins (
    id_checkin, id_reservacion, id_habitacion, id_huesped,
    fecha_hora_checkin, usuario_responsable, observaciones
) VALUES
    (1, 1, 10, 1, '2026-06-22 08:05:00', 3, 'Documento verificado; habitación 203 asignada.'),
    (2, 3, 9, 3, '2026-06-20 14:10:00', 3, 'Ingreso sin observaciones.'),
    (3, 4, 17, 4, '2026-06-19 15:20:00', 2, 'Huésped informó viaje de negocios.'),
    (4, 9, 5, 9, '2026-06-20 13:50:00', 3, 'Check-in histórico para estadía cerrada.'),
    (5, 10, 13, 10, '2026-06-19 14:30:00', 2, 'Check-in histórico para estadía cerrada.');

INSERT INTO checkouts (
    id_checkout, id_reservacion, id_habitacion, id_huesped, fecha_hora_checkout,
    noches, tarifa_noche, subtotal_hospedaje, servicios_adicionales, descuentos,
    total_estimado, usuario_responsable, observaciones
) VALUES
    (1, 9, 5, 9, '2026-06-22 10:15:00', 2, 280, 560, 0, 0, 560, 3, 'Cierre operativo completado; habitación enviada a limpieza.'),
    (2, 10, 13, 10, '2026-06-22 11:00:00', 3, 280, 840, 80, 0, 920, 2, 'Incluye desayuno adicional y lavandería.');

INSERT INTO solicitudes_huesped (
    id_solicitud, codigo_solicitud, id_huesped, id_habitacion, tipo_solicitud,
    descripcion, canal, prioridad, estado, responsable, created_at, updated_at, closed_at
) VALUES
    (1, 'SOL-2001', 2, 16, 'amenidades', 'Toallas adicionales para la habitación.', 'whatsapp', 'media', 'pendiente', 3, '2026-06-22 08:15:00', '2026-06-22 08:15:00', NULL),
    (2, 'SOL-2002', NULL, 14, 'limpieza', 'Limpieza urgente solicitada desde recepción.', 'recepcion', 'alta', 'en_atencion', 2, '2026-06-22 08:40:00', '2026-06-22 08:55:00', NULL),
    (3, 'SOL-2003', 4, 17, 'transporte', 'Solicita taxi al centro de Oruro.', 'telefono', 'media', 'pendiente', 3, '2026-06-22 09:10:00', '2026-06-22 09:10:00', NULL),
    (4, 'SOL-2004', 1, 10, 'informacion', 'Solicita información turística local.', 'recepcion', 'baja', 'resuelta', 3, '2026-06-22 08:20:00', '2026-06-22 08:45:00', '2026-06-22 08:45:00'),
    (5, 'SOL-2005', 3, 9, 'mantenimiento', 'Reporta luz intermitente en lámpara de mesa.', 'whatsapp', 'alta', 'en_atencion', 2, '2026-06-22 09:00:00', '2026-06-22 09:12:00', NULL),
    (6, 'SOL-2006', 7, 18, 'cuna', 'Solicita cuna adicional antes de su llegada.', 'landing', 'media', 'pendiente', 3, '2026-06-21 17:32:00', '2026-06-21 17:32:00', NULL),
    (7, 'SOL-2007', 10, 13, 'lavanderia', 'Servicio de lavandería completado.', 'sistema', 'baja', 'resuelta', 2, '2026-06-21 18:00:00', '2026-06-22 09:30:00', '2026-06-22 09:30:00');

INSERT INTO operaciones_recepcion (
    id_operacion, codigo_operacion, tipo_operacion, modulo, descripcion,
    usuario_responsable, rol_usuario, registro_afectado, estado_anterior,
    estado_nuevo, estado_operacion, created_at
) VALUES
    (1, 'OP-3001', 'checkin_realizado', 'checkin', 'Habitación 203 asignada a Sergio Molina.', 3, 'Recepcionista', 'RSV-1019', 'confirmada', 'checkin', 'completada', '2026-06-22 08:05:00'),
    (2, 'OP-3002', 'reserva_confirmada', 'reservaciones', 'RSV-1024 confirmada desde landing.', 3, 'Recepcionista', 'RSV-1024', 'pendiente', 'confirmada', 'completada', '2026-06-22 08:25:00'),
    (3, 'OP-3003', 'habitacion_actualizada', 'habitaciones', 'Habitación 103 marcada como limpieza.', 2, 'Supervisor', 'Habitación 103', 'ocupada', 'limpieza', 'completada', '2026-06-22 08:50:00'),
    (4, 'OP-3004', 'solicitud_registrada', 'solicitudes', 'Toallas adicionales para habitación 302.', 3, 'Recepcionista', 'SOL-2001', NULL, 'pendiente', 'completada', '2026-06-22 09:00:00'),
    (5, 'OP-3005', 'checkout_realizado', 'checkout', 'Salida de Rodrigo Salinas registrada.', 3, 'Recepcionista', 'RSV-1004', 'checkin', 'checkout', 'completada', '2026-06-22 10:15:00'),
    (6, 'OP-3006', 'habitacion_actualizada', 'habitaciones', 'Habitación 110 enviada a limpieza.', 3, 'Recepcionista', 'Habitación 110', 'ocupada', 'limpieza', 'completada', '2026-06-22 10:16:00'),
    (7, 'OP-3007', 'checkout_realizado', 'checkout', 'Salida de Elena Ponce registrada.', 2, 'Supervisor', 'RSV-1005', 'checkin', 'checkout', 'completada', '2026-06-22 11:00:00'),
    (8, 'OP-3008', 'solicitud_resuelta', 'solicitudes', 'Información turística entregada a Sergio Molina.', 3, 'Recepcionista', 'SOL-2004', 'pendiente', 'resuelta', 'completada', '2026-06-22 08:45:00'),
    (9, 'OP-3009', 'reserva_creada', 'reservaciones', 'Solicitud RSV-1028 registrada desde landing.', NULL, 'Sistema', 'RSV-1028', NULL, 'pendiente', 'completada', '2026-06-22 08:10:00'),
    (10, 'OP-3010', 'huesped_registrado', 'huespedes', 'Registro de Carla Ríos creado desde solicitud pública.', 3, 'Recepcionista', 'Huésped 5533442', NULL, 'registrado', 'completada', '2026-06-22 08:12:00'),
    (11, 'OP-3011', 'reserva_cancelada', 'reservaciones', 'RSV-1022 cancelada por cambio de fechas.', 2, 'Supervisor', 'RSV-1022', 'pendiente', 'cancelada', 'completada', '2026-06-21 09:35:00');

INSERT INTO tarifas_habitacion (
    id_tarifa, id_tipo_habitacion, nombre_tarifa, precio, descripcion, estado
) VALUES
    (1, 1, 'Tarifa base Simple', 280, 'Tarifa referencial por noche para habitación Simple.', 'activa'),
    (2, 2, 'Tarifa base Doble', 380, 'Tarifa referencial por noche para habitación Doble.', 'activa'),
    (3, 3, 'Tarifa base Matrimonial', 450, 'Tarifa referencial por noche para habitación Matrimonial.', 'activa'),
    (4, 4, 'Tarifa base Familiar', 620, 'Tarifa referencial por noche para habitación Familiar.', 'activa'),
    (5, 5, 'Tarifa base Suite', 850, 'Tarifa referencial por noche para Suite.', 'activa');

INSERT INTO configuracion_hotel (
    id_configuracion, nombre_hotel, ciudad, pais, direccion, telefono,
    whatsapp, correo, checkin_hora, checkout_hora, moneda, updated_at
) VALUES
    (1, 'Hotel Overlook', 'Oruro', 'Bolivia', 'Zona central, Oruro',
     '+591 2 5250000', '+591 70000000', 'reservas@hoteloverlook.bo',
     '14:00', '12:00', 'BOB', '2026-06-22 09:15:00');

COMMIT;
