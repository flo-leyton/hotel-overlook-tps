const bcrypt = require("bcryptjs");
const db = require("../db");
const { handleControllerError, requireFields, createHttpError } = require("../utils/http");
const { obtenerUsuarioDesdeHeader, normalizarRol } = require("../middleware/auth");

function usuarioPublico(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    nombre_completo: usuario.nombre_completo,
    correo: usuario.correo,
    rol: normalizarRol(usuario.rol),
    estado: usuario.estado,
  };
}

function login(req, res) {
  try {
    requireFields(req.body, ["correo", "password"]);
    const usuario = db
      .prepare(
        `SELECT u.*, r.nombre AS rol
         FROM usuarios u
         JOIN roles r ON r.id_rol = u.id_rol
         WHERE lower(u.correo) = lower(?)`
      )
      .get(req.body.correo.trim());

    if (!usuario || !bcrypt.compareSync(req.body.password, usuario.password_hash)) {
      throw createHttpError(401, "Correo o contraseña incorrectos.");
    }
    if (usuario.estado !== "activo") {
      throw createHttpError(403, `El usuario se encuentra ${usuario.estado}.`);
    }

    db.prepare(
      `UPDATE usuarios
       SET ultimo_acceso = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id_usuario = ?`
    ).run(usuario.id_usuario);

    return res.json({ ok: true, usuario: usuarioPublico(usuario) });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function logout(req, res) {
  return res.json({ ok: true, message: "Sesión cerrada correctamente." });
}

function me(req, res) {
  const usuario = obtenerUsuarioDesdeHeader(req);
  if (!usuario) {
    return res.status(401).json({ ok: false, error: "Sesión no válida." });
  }
  return res.json({ ok: true, usuario: usuarioPublico(usuario) });
}

module.exports = { login, logout, me };
