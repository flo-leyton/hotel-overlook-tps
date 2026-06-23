const db = require("../db");
const { generarCodigo } = require("../utils/codes");
const { registrarOperacion } = require("../utils/operations");
const {
  createHttpError,
  handleControllerError,
  requireFields,
  parsePositiveId,
} = require("../utils/http");

const ORIGENES = ["recepcion", "landing", "whatsapp", "telefono", "agencia"];
const ESTADOS = ["pendiente", "confirmada", "checkin", "checkout", "cancelada"];

const reservationSelect = `
  SELECT
    r.*,
    h.nombre_completo AS huesped,
    h.documento,
    h.telefono,
    h.correo,
    hb.numero AS habitacion,
    hb.tarifa_noche,
    th.nombre AS tipo_habitacion,
    u.nombre_completo AS creado_por
  FROM reservaciones r
  JOIN huespedes h ON h.id_huesped = r.id_huesped
  LEFT JOIN habitaciones hb ON hb.id_habitacion = r.id_habitacion
  LEFT JOIN tipos_habitacion th
    ON th.id_tipo_habitacion = r.id_tipo_habitacion
  LEFT JOIN usuarios u ON u.id_usuario = r.created_by
`;

function validarFechas(fechaEntrada, fechaSalida) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaEntrada) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fechaSalida)) {
    throw createHttpError(400, "Las fechas deben usar el formato YYYY-MM-DD.");
  }
  if (fechaSalida <= fechaEntrada) {
    throw createHttpError(400, "La fecha de salida debe ser posterior a la entrada.");
  }
}

function validarReferencias(body) {
  const guest = db
    .prepare("SELECT id_huesped FROM huespedes WHERE id_huesped = ?")
    .get(body.id_huesped);
  if (!guest) throw createHttpError(400, "El huésped indicado no existe.");

  if (body.id_tipo_habitacion) {
    const type = db
      .prepare(
        "SELECT id_tipo_habitacion FROM tipos_habitacion WHERE id_tipo_habitacion = ? AND estado = 'activo'"
      )
      .get(body.id_tipo_habitacion);
    if (!type) throw createHttpError(400, "El tipo de habitación no existe.");
  }

  if (body.id_habitacion) {
    const room = db
      .prepare(
        "SELECT id_habitacion, id_tipo_habitacion, estado FROM habitaciones WHERE id_habitacion = ?"
      )
      .get(body.id_habitacion);
    if (!room) throw createHttpError(400, "La habitación indicada no existe.");
    if (room.estado === "mantenimiento") {
      throw createHttpError(409, "No puede reservarse una habitación en mantenimiento.");
    }
    if (
      body.id_tipo_habitacion &&
      Number(body.id_tipo_habitacion) !== room.id_tipo_habitacion
    ) {
      throw createHttpError(400, "La habitación no corresponde al tipo solicitado.");
    }
  }
}

function insertarReserva(body, origin, status, createdBy, connection) {
  validarFechas(body.fecha_entrada, body.fecha_salida);
  validarReferencias(body);

  const codigo = generarCodigo(
    connection,
    "reservaciones",
    "codigo_reserva",
    "RSV"
  );

  const result = connection
    .prepare(
      `INSERT INTO reservaciones (
        codigo_reserva, id_huesped, id_habitacion, id_tipo_habitacion,
        fecha_entrada, fecha_salida, adultos, ninos, origen_reserva,
        estado_reserva, solicitudes_especiales, total_estimado, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      codigo,
      body.id_huesped,
      body.id_habitacion || null,
      body.id_tipo_habitacion || null,
      body.fecha_entrada,
      body.fecha_salida,
      Number(body.adultos || 1),
      Number(body.ninos || 0),
      origin,
      status,
      body.solicitudes_especiales || null,
      Number(body.total_estimado || 0),
      createdBy || null
    );

  return { id: Number(result.lastInsertRowid), codigo };
}

function listar(req, res) {
  try {
    const conditions = [];
    const params = {};

    if (req.query.estado) {
      if (!ESTADOS.includes(req.query.estado)) {
        throw createHttpError(400, "Estado de reservación no permitido.");
      }
      conditions.push("r.estado_reserva = @estado");
      params.estado = req.query.estado;
    }
    if (req.query.origen) {
      if (!ORIGENES.includes(req.query.origen)) {
        throw createHttpError(400, "Origen de reservación no permitido.");
      }
      conditions.push("r.origen_reserva = @origen");
      params.origen = req.query.origen;
    }
    if (req.query.fecha_entrada) {
      conditions.push("r.fecha_entrada = @fecha_entrada");
      params.fecha_entrada = req.query.fecha_entrada;
    }
    if (req.query.buscar) {
      conditions.push(
        "(r.codigo_reserva LIKE @buscar OR h.nombre_completo LIKE @buscar OR h.documento LIKE @buscar)"
      );
      params.buscar = `%${req.query.buscar}%`;
    }

    const rows = db
      .prepare(
        `${reservationSelect}
         ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
         ORDER BY r.fecha_entrada DESC, r.id_reservacion DESC`
      )
      .all(params);

    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function obtener(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_reservacion");
    const row = db
      .prepare(`${reservationSelect} WHERE r.id_reservacion = ?`)
      .get(id);
    if (!row) throw createHttpError(404, "Reservación no encontrada.");
    return res.json({ ok: true, data: row });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function crear(req, res) {
  try {
    requireFields(req.body, [
      "id_huesped",
      "fecha_entrada",
      "fecha_salida",
    ]);

    const origin = req.body.origen_reserva || "recepcion";
    const status = req.body.estado_reserva || "pendiente";
    if (!ORIGENES.includes(origin) || !ESTADOS.includes(status)) {
      throw createHttpError(400, "Origen o estado de reservación no permitido.");
    }

    const transaction = db.transaction(() => {
      const reservation = insertarReserva(
        req.body,
        origin,
        status,
        req.body.created_by,
        db
      );
      registrarOperacion(
        {
          tipo_operacion: "reserva_creada",
          modulo: "reservaciones",
          descripcion: `Reservación ${reservation.codigo} creada desde ${origin}.`,
          usuario_responsable: req.body.created_by || null,
          registro_afectado: reservation.codigo,
          estado_nuevo: status,
        },
        db
      );
      return reservation;
    });

    const reservation = transaction();
    return res.status(201).json({
      ok: true,
      message: "Reservación creada correctamente.",
      data: db
        .prepare(`${reservationSelect} WHERE r.id_reservacion = ?`)
        .get(reservation.id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function crearPublica(req, res) {
  try {
    requireFields(req.body, [
      "nombre_completo",
      "documento",
      "nacionalidad",
      "ciudad_origen",
      "fecha_entrada",
      "fecha_salida",
      "tipo_habitacion",
      "adultos",
      "canal_preferido",
    ]);
    if (!req.body.correo && !req.body.telefono) {
      throw createHttpError(
        400,
        "Debe proporcionar al menos un correo o teléfono de contacto."
      );
    }

    const transaction = db.transaction(() => {
      let guest = db
        .prepare("SELECT * FROM huespedes WHERE documento = ?")
        .get(req.body.documento.trim());

      if (!guest) {
        const result = db
          .prepare(
            `INSERT INTO huespedes (
              nombre_completo, documento, nacionalidad, telefono,
              correo, ciudad_origen
            ) VALUES (?, ?, ?, ?, ?, ?)`
          )
          .run(
            req.body.nombre_completo.trim(),
            req.body.documento.trim(),
            req.body.nacionalidad,
            req.body.telefono,
            req.body.correo,
            req.body.ciudad_origen
          );
        guest = { id_huesped: Number(result.lastInsertRowid) };
      } else {
        db.prepare(
          `UPDATE huespedes
           SET nombre_completo = ?, nacionalidad = ?, telefono = ?,
               correo = ?, ciudad_origen = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id_huesped = ?`
        ).run(
          req.body.nombre_completo.trim(),
          req.body.nacionalidad,
          req.body.telefono,
          req.body.correo,
          req.body.ciudad_origen,
          guest.id_huesped
        );
      }

      const type = db
        .prepare(
          `SELECT id_tipo_habitacion, tarifa_base
           FROM tipos_habitacion
           WHERE lower(nombre) = lower(?) AND estado = 'activo'`
        )
        .get(req.body.tipo_habitacion);
      if (!type) {
        throw createHttpError(400, "El tipo de habitación solicitado no existe.");
      }

      const body = {
        ...req.body,
        id_huesped: guest.id_huesped,
        id_tipo_habitacion: type.id_tipo_habitacion,
        id_habitacion: null,
        ninos: Number(req.body.ninos || 0),
        total_estimado: 0,
      };
      const reservation = insertarReserva(
        body,
        "landing",
        "pendiente",
        null,
        db
      );

      registrarOperacion(
        {
          tipo_operacion: "reserva_creada",
          modulo: "reservaciones",
          descripcion: `Solicitud pública ${reservation.codigo} registrada desde landing.`,
          rol_usuario: "Sistema",
          registro_afectado: reservation.codigo,
          estado_nuevo: "pendiente",
        },
        db
      );
      return reservation;
    });

    const reservation = transaction();
    return res.status(201).json({
      ok: true,
      message:
        "Solicitud recibida. Recepción revisará la disponibilidad antes de confirmar.",
      data: {
        id_reservacion: reservation.id,
        codigo_reserva: reservation.codigo,
        origen_reserva: "landing",
        estado_reserva: "pendiente",
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function confirmar(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_reservacion");
    const transaction = db.transaction(() => {
      const reservation = db
        .prepare("SELECT * FROM reservaciones WHERE id_reservacion = ?")
        .get(id);
      if (!reservation) throw createHttpError(404, "Reservación no encontrada.");
      if (reservation.estado_reserva === "cancelada") {
        throw createHttpError(409, "No puede confirmarse una reserva cancelada.");
      }
      if (reservation.estado_reserva !== "pendiente") {
        throw createHttpError(409, "Solo pueden confirmarse reservas pendientes.");
      }

      const roomId = req.body.id_habitacion || reservation.id_habitacion;
      if (roomId) {
        const room = db
          .prepare(
            "SELECT id_habitacion, numero, estado FROM habitaciones WHERE id_habitacion = ?"
          )
          .get(roomId);
        if (!room) throw createHttpError(400, "La habitación no existe.");
        if (!["disponible", "reservada"].includes(room.estado)) {
          throw createHttpError(
            409,
            `La habitación no puede reservarse porque está ${room.estado}.`
          );
        }
        db.prepare(
          `UPDATE habitaciones
           SET estado = 'reservada', updated_at = CURRENT_TIMESTAMP
           WHERE id_habitacion = ?`
        ).run(roomId);
      }

      db.prepare(
        `UPDATE reservaciones
         SET estado_reserva = 'confirmada', id_habitacion = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_reservacion = ?`
      ).run(roomId || null, id);

      registrarOperacion(
        {
          tipo_operacion: "reserva_confirmada",
          modulo: "reservaciones",
          descripcion: `Reservación ${reservation.codigo_reserva} confirmada.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: reservation.codigo_reserva,
          estado_anterior: reservation.estado_reserva,
          estado_nuevo: "confirmada",
        },
        db
      );
    });

    transaction();
    return res.json({
      ok: true,
      message: "Reservación confirmada correctamente.",
      data: db
        .prepare(`${reservationSelect} WHERE r.id_reservacion = ?`)
        .get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function cancelar(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_reservacion");
    const transaction = db.transaction(() => {
      const reservation = db
        .prepare("SELECT * FROM reservaciones WHERE id_reservacion = ?")
        .get(id);
      if (!reservation) throw createHttpError(404, "Reservación no encontrada.");
      if (!["pendiente", "confirmada"].includes(reservation.estado_reserva)) {
        throw createHttpError(
          409,
          "Solo pueden cancelarse reservas pendientes o confirmadas."
        );
      }

      db.prepare(
        `UPDATE reservaciones
         SET estado_reserva = 'cancelada', updated_at = CURRENT_TIMESTAMP
         WHERE id_reservacion = ?`
      ).run(id);

      if (reservation.id_habitacion) {
        const otherActive = db
          .prepare(
            `SELECT COUNT(*) AS total
             FROM reservaciones
             WHERE id_habitacion = ?
               AND id_reservacion <> ?
               AND estado_reserva IN ('confirmada', 'checkin')`
          )
          .get(reservation.id_habitacion, id).total;
        if (!otherActive) {
          db.prepare(
            `UPDATE habitaciones
             SET estado = 'disponible', updated_at = CURRENT_TIMESTAMP
             WHERE id_habitacion = ? AND estado = 'reservada'`
          ).run(reservation.id_habitacion);
        }
      }

      registrarOperacion(
        {
          tipo_operacion: "reserva_cancelada",
          modulo: "reservaciones",
          descripcion: `Reservación ${reservation.codigo_reserva} cancelada.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: reservation.codigo_reserva,
          estado_anterior: reservation.estado_reserva,
          estado_nuevo: "cancelada",
        },
        db
      );
    });

    transaction();
    return res.json({
      ok: true,
      message: "Reservación cancelada correctamente.",
      data: db
        .prepare(`${reservationSelect} WHERE r.id_reservacion = ?`)
        .get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  crearPublica,
  confirmar,
  cancelar,
};
