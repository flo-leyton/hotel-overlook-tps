const db = require("../db");

const ROLE_ALIASES = {
  Supervisor: "Supervisor de recepción",
};

function normalizarRol(nombre) {
  return ROLE_ALIASES[nombre] || nombre;
}

function obtenerUsuarioDesdeHeader(req) {
  const id = Number(req.get("x-user-id"));
  if (!Number.isInteger(id) || id <= 0) return null;

  const usuario = db
    .prepare(
      `SELECT u.id_usuario, u.nombre_completo, u.correo, u.estado,
              r.id_rol, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ?`
    )
    .get(id);

  if (!usuario) return null;
  return { ...usuario, rol: normalizarRol(usuario.rol) };
}

function verificarAutenticacion(req, res, next) {
  const usuario = obtenerUsuarioDesdeHeader(req);
  if (!usuario) {
    return res.status(401).json({
      ok: false,
      error: "Debe iniciar sesión para realizar esta operación.",
    });
  }
  if (usuario.estado !== "activo") {
    return res.status(403).json({
      ok: false,
      error: `El usuario se encuentra ${usuario.estado}.`,
    });
  }
  req.user = usuario;
  return next();
}

function verificarRol(rolesPermitidos) {
  const roles = rolesPermitidos.map(normalizarRol);
  return [
    verificarAutenticacion,
    function validarRol(req, res, next) {
      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({
          ok: false,
          error: "No cuenta con permisos para realizar esta operación.",
        });
      }
      return next();
    },
  ];
}

function aplicarUsuarioActual(req, res, next) {
  if (req.user && req.body && typeof req.body === "object") {
    req.body.usuario_responsable = req.user.id_usuario;
    req.body.created_by = req.user.id_usuario;
  }
  next();
}

module.exports = {
  normalizarRol,
  obtenerUsuarioDesdeHeader,
  verificarAutenticacion,
  verificarRol,
  aplicarUsuarioActual,
};
