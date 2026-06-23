const db = require("../db");
const { registrarOperacion } = require("../utils/operations");
const {
  createHttpError,
  handleControllerError,
  requireFields,
} = require("../utils/http");

function crear(req, res) {
  try {
    requireFields(req.body, [
      "id_reservacion",
      "id_habitacion",
      "id_huesped",
    ]);

    const transaction = db.transaction(() => {
      const reservation = db
        .prepare("SELECT * FROM reservaciones WHERE id_reservacion = ?")
        .get(req.body.id_reservacion);
      if (!reservation) throw createHttpError(404, "Reservación no encontrada.");
      if (reservation.estado_reserva !== "confirmada") {
        throw createHttpError(
          409,
          "El check-in requiere una reservación confirmada."
        );
      }
      if (reservation.id_huesped !== Number(req.body.id_huesped)) {
        throw createHttpError(
          400,
          "El huésped no corresponde a la reservación."
        );
      }
      if (
        reservation.id_habitacion &&
        reservation.id_habitacion !== Number(req.body.id_habitacion)
      ) {
        throw createHttpError(
          409,
          "La habitación no coincide con la asignada a la reservación."
        );
      }

      const room = db
        .prepare("SELECT * FROM habitaciones WHERE id_habitacion = ?")
        .get(req.body.id_habitacion);
      if (!room) throw createHttpError(404, "Habitación no encontrada.");
      if (!["disponible", "reservada"].includes(room.estado)) {
        throw createHttpError(
          409,
          `No puede realizarse el check-in: la habitación está ${room.estado}.`
        );
      }

      const existing = db
        .prepare("SELECT id_checkin FROM checkins WHERE id_reservacion = ?")
        .get(req.body.id_reservacion);
      if (existing) {
        throw createHttpError(409, "La reservación ya tiene un check-in.");
      }

      const result = db
        .prepare(
          `INSERT INTO checkins (
            id_reservacion, id_habitacion, id_huesped,
            usuario_responsable, observaciones
          ) VALUES (?, ?, ?, ?, ?)`
        )
        .run(
          req.body.id_reservacion,
          req.body.id_habitacion,
          req.body.id_huesped,
          req.body.usuario_responsable || null,
          req.body.observaciones || null
        );

      db.prepare(
        `UPDATE reservaciones
         SET estado_reserva = 'checkin', id_habitacion = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_reservacion = ?`
      ).run(req.body.id_habitacion, req.body.id_reservacion);

      db.prepare(
        `UPDATE habitaciones
         SET estado = 'ocupada', updated_at = CURRENT_TIMESTAMP
         WHERE id_habitacion = ?`
      ).run(req.body.id_habitacion);

      const operation = registrarOperacion(
        {
          tipo_operacion: "checkin_realizado",
          modulo: "checkin",
          descripcion: `Check-in de ${reservation.codigo_reserva} realizado en habitación ${room.numero}.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: reservation.codigo_reserva,
          estado_anterior: reservation.estado_reserva,
          estado_nuevo: "checkin",
        },
        db
      );

      return {
        id_checkin: Number(result.lastInsertRowid),
        codigo_reserva: reservation.codigo_reserva,
        habitacion: room.numero,
        estado_reserva: "checkin",
        estado_habitacion: "ocupada",
        operacion: operation,
      };
    });

    const result = transaction();
    return res.status(201).json({
      ok: true,
      message:
        "Check-in registrado correctamente. La reserva está en check-in y la habitación ocupada.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { crear };
