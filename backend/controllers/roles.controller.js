const db = require("../db");
const { handleControllerError, parsePositiveId, createHttpError } = require("../utils/http");
const { normalizarRol } = require("../middleware/auth");

function listar(req, res) {
  try {
    const rows = db.prepare("SELECT * FROM roles ORDER BY id_rol").all().map(
      (rol) => ({ ...rol, nombre: normalizarRol(rol.nombre) })
    );
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function obtener(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_rol");
    const rol = db.prepare("SELECT * FROM roles WHERE id_rol = ?").get(id);
    if (!rol) throw createHttpError(404, "Rol no encontrado.");
    return res.json({
      ok: true,
      data: { ...rol, nombre: normalizarRol(rol.nombre) },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { listar, obtener };
