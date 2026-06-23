const db = require("../db");
const {
  createHttpError,
  handleControllerError,
  requireFields,
  parsePositiveId,
} = require("../utils/http");

const ESTADOS = ["activa", "inactiva"];
const selectRate = `
  SELECT
    t.*,
    th.nombre AS tipo_habitacion,
    th.capacidad,
    th.tarifa_base
  FROM tarifas_habitacion t
  JOIN tipos_habitacion th
    ON th.id_tipo_habitacion = t.id_tipo_habitacion
`;

function listar(req, res) {
  try {
    const rows = db
      .prepare(`${selectRate} ORDER BY th.nombre, t.nombre_tarifa`)
      .all();
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function crear(req, res) {
  try {
    requireFields(req.body, [
      "id_tipo_habitacion",
      "nombre_tarifa",
      "precio",
    ]);
    const status = req.body.estado || "activa";
    if (!ESTADOS.includes(status)) {
      throw createHttpError(400, "Estado de tarifa no permitido.");
    }
    const price = Number(req.body.precio);
    if (!Number.isFinite(price) || price < 0) {
      throw createHttpError(400, "El precio no es válido.");
    }
    const type = db
      .prepare(
        "SELECT id_tipo_habitacion FROM tipos_habitacion WHERE id_tipo_habitacion = ?"
      )
      .get(req.body.id_tipo_habitacion);
    if (!type) throw createHttpError(400, "El tipo de habitación no existe.");

    const result = db
      .prepare(
        `INSERT INTO tarifas_habitacion (
          id_tipo_habitacion, nombre_tarifa, precio, descripcion, estado
        ) VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        req.body.id_tipo_habitacion,
        req.body.nombre_tarifa.trim(),
        price,
        req.body.descripcion || null,
        status
      );

    return res.status(201).json({
      ok: true,
      data: db
        .prepare(`${selectRate} WHERE t.id_tarifa = ?`)
        .get(Number(result.lastInsertRowid)),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizarEstado(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_tarifa");
    requireFields(req.body, ["estado"]);
    if (!ESTADOS.includes(req.body.estado)) {
      throw createHttpError(400, "Estado de tarifa no permitido.");
    }
    const rate = db
      .prepare("SELECT * FROM tarifas_habitacion WHERE id_tarifa = ?")
      .get(id);
    if (!rate) throw createHttpError(404, "Tarifa no encontrada.");
    if (rate.estado === req.body.estado) {
      throw createHttpError(409, "La tarifa ya tiene ese estado.");
    }

    db.prepare(
      `UPDATE tarifas_habitacion
       SET estado = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id_tarifa = ?`
    ).run(req.body.estado, id);

    return res.json({
      ok: true,
      message: "Estado de tarifa actualizado correctamente.",
      data: db.prepare(`${selectRate} WHERE t.id_tarifa = ?`).get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { listar, crear, actualizarEstado };
