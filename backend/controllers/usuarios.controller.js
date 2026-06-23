const bcrypt = require("bcryptjs");
const db = require("../db");
const { registrarOperacion } = require("../utils/operations");
const {
  createHttpError,
  handleControllerError,
  requireFields,
  parsePositiveId,
} = require("../utils/http");
const { normalizarRol } = require("../middleware/auth");

const ESTADOS = ["activo", "inactivo", "bloqueado"];
const selectUser = `
  SELECT u.id_usuario, u.id_rol, u.nombre_completo, u.correo, u.estado,
         u.ultimo_acceso, u.created_at, u.updated_at,
         r.nombre AS rol, r.descripcion AS rol_descripcion
  FROM usuarios u
  JOIN roles r ON r.id_rol = u.id_rol
`;

function normalizarUsuario(usuario) {
  return usuario ? { ...usuario, rol: normalizarRol(usuario.rol) } : usuario;
}

function validarRol(idRol) {
  const rol = db.prepare("SELECT id_rol FROM roles WHERE id_rol = ?").get(idRol);
  if (!rol) throw createHttpError(400, "El rol indicado no existe.");
}

function listar(req, res) {
  try {
    const rows = db
      .prepare(`${selectUser} ORDER BY u.nombre_completo`)
      .all()
      .map(normalizarUsuario);
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function obtener(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_usuario");
    const row = normalizarUsuario(
      db.prepare(`${selectUser} WHERE u.id_usuario = ?`).get(id)
    );
    if (!row) throw createHttpError(404, "Usuario no encontrado.");
    return res.json({ ok: true, data: row });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function crear(req, res) {
  try {
    requireFields(req.body, [
      "id_rol",
      "nombre_completo",
      "correo",
      "password",
    ]);
    const estado = req.body.estado || "activo";
    if (!ESTADOS.includes(estado)) {
      throw createHttpError(400, "Estado de usuario no permitido.");
    }
    if (String(req.body.password).length < 8) {
      throw createHttpError(400, "La contraseña debe tener al menos 8 caracteres.");
    }
    validarRol(req.body.id_rol);

    const result = db
      .prepare(
        `INSERT INTO usuarios
         (id_rol, nombre_completo, correo, password_hash, estado)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        Number(req.body.id_rol),
        req.body.nombre_completo.trim(),
        req.body.correo.trim().toLowerCase(),
        bcrypt.hashSync(req.body.password, 12),
        estado
      );

    registrarOperacion(
      {
        tipo_operacion: "usuario_actualizado",
        modulo: "usuarios",
        descripcion: `Usuario ${req.body.nombre_completo.trim()} creado.`,
        usuario_responsable: req.user.id_usuario,
        registro_afectado: req.body.correo.trim().toLowerCase(),
        estado_nuevo: estado,
      },
      db
    );

    return res.status(201).json({
      ok: true,
      data: normalizarUsuario(
        db
          .prepare(`${selectUser} WHERE u.id_usuario = ?`)
          .get(Number(result.lastInsertRowid))
      ),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizar(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_usuario");
    requireFields(req.body, ["nombre_completo", "correo"]);
    const usuario = db.prepare("SELECT * FROM usuarios WHERE id_usuario = ?").get(id);
    if (!usuario) throw createHttpError(404, "Usuario no encontrado.");

    db.prepare(
      `UPDATE usuarios
       SET nombre_completo = ?, correo = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id_usuario = ?`
    ).run(
      req.body.nombre_completo.trim(),
      req.body.correo.trim().toLowerCase(),
      id
    );

    registrarOperacion(
      {
        tipo_operacion: "usuario_actualizado",
        modulo: "usuarios",
        descripcion: `Datos del usuario ${req.body.nombre_completo.trim()} actualizados.`,
        usuario_responsable: req.user.id_usuario,
        registro_afectado: req.body.correo.trim().toLowerCase(),
      },
      db
    );
    return res.json({
      ok: true,
      data: normalizarUsuario(db.prepare(`${selectUser} WHERE u.id_usuario = ?`).get(id)),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizarEstado(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_usuario");
    requireFields(req.body, ["estado"]);
    if (!ESTADOS.includes(req.body.estado)) {
      throw createHttpError(400, "Estado de usuario no permitido.");
    }
    if (id === req.user.id_usuario && req.body.estado !== "activo") {
      throw createHttpError(409, "No puede desactivar o bloquear su propia cuenta.");
    }
    const usuario = db.prepare("SELECT * FROM usuarios WHERE id_usuario = ?").get(id);
    if (!usuario) throw createHttpError(404, "Usuario no encontrado.");

    db.prepare(
      `UPDATE usuarios SET estado = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id_usuario = ?`
    ).run(req.body.estado, id);
    registrarOperacion(
      {
        tipo_operacion: "usuario_actualizado",
        modulo: "usuarios",
        descripcion: `Usuario ${usuario.nombre_completo} cambió de ${usuario.estado} a ${req.body.estado}.`,
        usuario_responsable: req.user.id_usuario,
        registro_afectado: usuario.correo,
        estado_anterior: usuario.estado,
        estado_nuevo: req.body.estado,
      },
      db
    );
    return res.json({
      ok: true,
      data: normalizarUsuario(db.prepare(`${selectUser} WHERE u.id_usuario = ?`).get(id)),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizarRol(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_usuario");
    requireFields(req.body, ["id_rol"]);
    if (id === req.user.id_usuario) {
      throw createHttpError(409, "No puede cambiar su propio rol.");
    }
    validarRol(req.body.id_rol);
    const usuario = db.prepare(`${selectUser} WHERE u.id_usuario = ?`).get(id);
    if (!usuario) throw createHttpError(404, "Usuario no encontrado.");
    db.prepare(
      `UPDATE usuarios SET id_rol = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id_usuario = ?`
    ).run(Number(req.body.id_rol), id);
    registrarOperacion(
      {
        tipo_operacion: "usuario_actualizado",
        modulo: "usuarios",
        descripcion: `Rol de ${usuario.nombre_completo} actualizado.`,
        usuario_responsable: req.user.id_usuario,
        registro_afectado: usuario.correo,
        estado_anterior: normalizarRol(usuario.rol),
        estado_nuevo: normalizarUsuario(
          db.prepare(`${selectUser} WHERE u.id_usuario = ?`).get(id)
        ).rol,
      },
      db
    );
    return res.json({
      ok: true,
      data: normalizarUsuario(db.prepare(`${selectUser} WHERE u.id_usuario = ?`).get(id)),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizarPassword(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_usuario");
    requireFields(req.body, ["password"]);
    if (String(req.body.password).length < 8) {
      throw createHttpError(400, "La contraseña debe tener al menos 8 caracteres.");
    }
    const usuario = db.prepare("SELECT * FROM usuarios WHERE id_usuario = ?").get(id);
    if (!usuario) throw createHttpError(404, "Usuario no encontrado.");
    db.prepare(
      `UPDATE usuarios SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id_usuario = ?`
    ).run(bcrypt.hashSync(req.body.password, 12), id);
    registrarOperacion(
      {
        tipo_operacion: "usuario_actualizado",
        modulo: "usuarios",
        descripcion: `Contraseña de ${usuario.nombre_completo} restablecida.`,
        usuario_responsable: req.user.id_usuario,
        registro_afectado: usuario.correo,
      },
      db
    );
    return res.json({ ok: true, message: "Contraseña actualizada correctamente." });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  actualizarEstado,
  actualizarRol,
  actualizarPassword,
};
