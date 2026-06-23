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
      "noches",
      "tarifa_noche",
    ]);

    const nights = Number(req.body.noches);
    const rate = Number(req.body.tarifa_noche);
    const services = Number(req.body.servicios_adicionales || 0);
    const discounts = Number(req.body.descuentos || 0);

    if (
      !Number.isFinite(nights) ||
      !Number.isInteger(nights) ||
      nights <= 0 ||
      !Number.isFinite(rate) ||
      rate < 0 ||
      !Number.isFinite(services) ||
      services < 0 ||
      !Number.isFinite(discounts) ||
      discounts < 0
    ) {
      throw createHttpError(400, "Los valores monetarios o noches no son válidos.");
    }

    const subtotal = nights * rate;
    const total = subtotal + services - discounts;
    if (total < 0) {
      throw createHttpError(400, "Los descuentos no pueden producir un total negativo.");
    }

    const transaction = db.transaction(() => {
      const reservation = db
        .prepare("SELECT * FROM reservaciones WHERE id_reservacion = ?")
        .get(req.body.id_reservacion);
      if (!reservation) throw createHttpError(404, "Reservación no encontrada.");
      if (reservation.estado_reserva !== "checkin") {
        throw createHttpError(
          409,
          "El check-out requiere una reservación en estado checkin."
        );
      }
      if (
        reservation.id_huesped !== Number(req.body.id_huesped) ||
        reservation.id_habitacion !== Number(req.body.id_habitacion)
      ) {
        throw createHttpError(
          400,
          "El huésped o la habitación no corresponden a la reservación."
        );
      }

      const room = db
        .prepare("SELECT * FROM habitaciones WHERE id_habitacion = ?")
        .get(req.body.id_habitacion);
      if (!room) throw createHttpError(404, "Habitación no encontrada.");
      if (room.estado !== "ocupada") {
        throw createHttpError(
          409,
          "El check-out requiere que la habitación esté ocupada."
        );
      }

      const existing = db
        .prepare("SELECT id_checkout FROM checkouts WHERE id_reservacion = ?")
        .get(req.body.id_reservacion);
      if (existing) {
        throw createHttpError(409, "La reservación ya tiene un check-out.");
      }

      const result = db
        .prepare(
          `INSERT INTO checkouts (
            id_reservacion, id_habitacion, id_huesped, noches,
            tarifa_noche, subtotal_hospedaje, servicios_adicionales,
            descuentos, total_estimado, usuario_responsable, observaciones
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          req.body.id_reservacion,
          req.body.id_habitacion,
          req.body.id_huesped,
          nights,
          rate,
          subtotal,
          services,
          discounts,
          total,
          req.body.usuario_responsable || null,
          req.body.observaciones || null
        );

      db.prepare(
        `UPDATE reservaciones
         SET estado_reserva = 'checkout', total_estimado = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_reservacion = ?`
      ).run(total, req.body.id_reservacion);

      db.prepare(
        `UPDATE habitaciones
         SET estado = 'limpieza', updated_at = CURRENT_TIMESTAMP
         WHERE id_habitacion = ?`
      ).run(req.body.id_habitacion);

      const operation = registrarOperacion(
        {
          tipo_operacion: "checkout_realizado",
          modulo: "checkout",
          descripcion: `Check-out de ${reservation.codigo_reserva} realizado; habitación ${room.numero} enviada a limpieza.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: reservation.codigo_reserva,
          estado_anterior: reservation.estado_reserva,
          estado_nuevo: "checkout",
        },
        db
      );

      return {
        id_checkout: Number(result.lastInsertRowid),
        codigo_reserva: reservation.codigo_reserva,
        habitacion: room.numero,
        subtotal_hospedaje: subtotal,
        servicios_adicionales: services,
        descuentos: discounts,
        total_estimado: total,
        estado_reserva: "checkout",
        estado_habitacion: "limpieza",
        operacion: operation,
      };
    });

    const result = transaction();
    return res.status(201).json({
      ok: true,
      message:
        "Check-out registrado correctamente. La reserva está cerrada y la habitación en limpieza.",
      data: result,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { crear };
