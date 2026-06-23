const db = require("../db");
const {
  createHttpError,
  handleControllerError,
  parsePositiveId,
} = require("../utils/http");

const selectOperation = `
  SELECT
    o.*,
    u.nombre_completo AS usuario,
    COALESCE(o.rol_usuario, r.nombre) AS rol
  FROM operaciones_recepcion o
  LEFT JOIN usuarios u ON u.id_usuario = o.usuario_responsable
  LEFT JOIN roles r ON r.id_rol = u.id_rol
`;

function listar(req, res) {
  try {
    const conditions = [];
    const params = {};
    if (req.query.tipo) {
      conditions.push("o.tipo_operacion = @tipo");
      params.tipo = req.query.tipo;
    }
    if (req.query.modulo) {
      conditions.push("o.modulo = @modulo");
      params.modulo = req.query.modulo;
    }
    if (req.query.fecha) {
      conditions.push("date(o.created_at) = @fecha");
      params.fecha = req.query.fecha;
    }
    if (req.user?.rol === "Recepcionista") {
      conditions.push("o.usuario_responsable = @usuario_actual");
      params.usuario_actual = req.user.id_usuario;
    }

    const limit = Math.min(Math.max(Number(req.query.limite) || 100, 1), 500);
    params.limit = limit;

    const rows = db
      .prepare(
        `${selectOperation}
         ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
         ORDER BY datetime(o.created_at) DESC, o.id_operacion DESC
         LIMIT @limit`
      )
      .all(params);
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function obtener(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_operacion");
    const row = db
      .prepare(`${selectOperation} WHERE o.id_operacion = ?`)
      .get(id);
    if (!row) throw createHttpError(404, "Operación no encontrada.");
    if (
      req.user?.rol === "Recepcionista" &&
      row.usuario_responsable !== req.user.id_usuario
    ) {
      throw createHttpError(403, "Solo puede consultar sus propias operaciones.");
    }
    return res.json({ ok: true, data: row });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { listar, obtener };
