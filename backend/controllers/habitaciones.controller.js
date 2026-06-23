const db = require("../db");
const { registrarOperacion } = require("../utils/operations");
const {
  createHttpError,
  handleControllerError,
  requireFields,
  parsePositiveId,
} = require("../utils/http");

const ESTADOS = [
  "disponible",
  "ocupada",
  "reservada",
  "limpieza",
  "mantenimiento",
];

const selectHabitacion = `
  SELECT
    h.id_habitacion,
    h.numero,
    h.piso,
    h.capacidad,
    h.tarifa_noche,
    h.estado,
    h.observaciones,
    h.created_at,
    h.updated_at,
    th.id_tipo_habitacion,
    th.nombre AS tipo_habitacion
  FROM habitaciones h
  JOIN tipos_habitacion th
    ON th.id_tipo_habitacion = h.id_tipo_habitacion
`;

function listar(req, res) {
  try {
    const conditions = [];
    const params = {};

    if (req.query.estado) {
      conditions.push("h.estado = @estado");
      params.estado = req.query.estado;
    }
    if (req.query.tipo) {
      conditions.push("th.nombre = @tipo");
      params.tipo = req.query.tipo;
    }
    if (req.query.piso) {
      conditions.push("h.piso = @piso");
      params.piso = Number(req.query.piso);
    }
    if (req.query.buscar) {
      conditions.push("h.numero LIKE @buscar");
      params.buscar = `%${req.query.buscar}%`;
    }

    const rows = db
      .prepare(
        `${selectHabitacion}
         ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
         ORDER BY CAST(h.numero AS INTEGER), h.numero`
      )
      .all(params);

    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function obtener(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_habitacion");
    const row = db
      .prepare(`${selectHabitacion} WHERE h.id_habitacion = ?`)
      .get(id);

    if (!row) throw createHttpError(404, "Habitación no encontrada.");
    return res.json({ ok: true, data: row });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function crear(req, res) {
  try {
    requireFields(req.body, [
      "id_tipo_habitacion",
      "numero",
      "piso",
      "capacidad",
      "tarifa_noche",
    ]);

    const estado = req.body.estado || "disponible";
    if (!ESTADOS.includes(estado)) {
      throw createHttpError(400, "Estado de habitación no permitido.");
    }

    const tipo = db
      .prepare(
        "SELECT id_tipo_habitacion FROM tipos_habitacion WHERE id_tipo_habitacion = ? AND estado = 'activo'"
      )
      .get(req.body.id_tipo_habitacion);
    if (!tipo) {
      throw createHttpError(400, "El tipo de habitación no existe o está inactivo.");
    }

    const result = db
      .prepare(
        `INSERT INTO habitaciones (
          id_tipo_habitacion, numero, piso, capacidad,
          tarifa_noche, estado, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        req.body.id_tipo_habitacion,
        String(req.body.numero).trim(),
        Number(req.body.piso),
        Number(req.body.capacidad),
        Number(req.body.tarifa_noche),
        estado,
        req.body.observaciones || null
      );

    const room = db
      .prepare(`${selectHabitacion} WHERE h.id_habitacion = ?`)
      .get(Number(result.lastInsertRowid));

    return res.status(201).json({ ok: true, data: room });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizarEstado(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_habitacion");
    requireFields(req.body, ["estado"]);

    if (!ESTADOS.includes(req.body.estado)) {
      throw createHttpError(400, "Estado de habitación no permitido.");
    }

    const transaction = db.transaction(() => {
      const room = db
        .prepare(
          "SELECT id_habitacion, numero, estado FROM habitaciones WHERE id_habitacion = ?"
        )
        .get(id);
      if (!room) throw createHttpError(404, "Habitación no encontrada.");

      if (room.estado === req.body.estado) {
        throw createHttpError(409, "La habitación ya tiene ese estado.");
      }
      if (room.estado === "mantenimiento" && req.body.estado === "ocupada") {
        throw createHttpError(
          409,
          "Una habitación en mantenimiento no puede pasar directamente a ocupada."
        );
      }

      db.prepare(
        `UPDATE habitaciones
         SET estado = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id_habitacion = ?`
      ).run(req.body.estado, id);

      registrarOperacion(
        {
          tipo_operacion: "habitacion_actualizada",
          modulo: "habitaciones",
          descripcion: `Habitación ${room.numero} actualizada de ${room.estado} a ${req.body.estado}.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: `Habitación ${room.numero}`,
          estado_anterior: room.estado,
          estado_nuevo: req.body.estado,
        },
        db
      );
    });

    transaction();
    return res.json({
      ok: true,
      message: "Estado de habitación actualizado correctamente.",
      data: db
        .prepare(`${selectHabitacion} WHERE h.id_habitacion = ?`)
        .get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { listar, obtener, crear, actualizarEstado };
