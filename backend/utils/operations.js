const { generarCodigo } = require("./codes");

function obtenerRolUsuario(db, idUsuario) {
  if (!idUsuario) return null;

  return db
    .prepare(
      `SELECT r.nombre
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ?`
    )
    .get(idUsuario)?.nombre;
}

function registrarOperacion(
  {
    tipo_operacion,
    modulo,
    descripcion,
    usuario_responsable = null,
    rol_usuario = null,
    registro_afectado = null,
    estado_anterior = null,
    estado_nuevo = null,
  },
  connection
) {
  const codigo = generarCodigo(
    connection,
    "operaciones_recepcion",
    "codigo_operacion",
    "OP"
  );
  const rol = rol_usuario || obtenerRolUsuario(connection, usuario_responsable);

  const result = connection
    .prepare(
      `INSERT INTO operaciones_recepcion (
        codigo_operacion, tipo_operacion, modulo, descripcion,
        usuario_responsable, rol_usuario, registro_afectado,
        estado_anterior, estado_nuevo, estado_operacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completada')`
    )
    .run(
      codigo,
      tipo_operacion,
      modulo,
      descripcion,
      usuario_responsable,
      rol,
      registro_afectado,
      estado_anterior,
      estado_nuevo
    );

  return {
    id_operacion: Number(result.lastInsertRowid),
    codigo_operacion: codigo,
  };
}

module.exports = { registrarOperacion, obtenerRolUsuario };
