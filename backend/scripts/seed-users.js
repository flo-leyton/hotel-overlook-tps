const bcrypt = require("bcryptjs");
const db = require("../db");

const roles = [
  [1, "Administrador", "Administración general del TPS y gestión de usuarios."],
  [2, "Supervisor de recepción", "Supervisión de operaciones de recepción."],
  [3, "Recepcionista", "Ejecución de transacciones diarias de recepción."],
];

const usuarios = [
  [1, 1, "Admin Hotel Overlook", "admin@hoteloverlook.bo", "Admin123"],
  [2, 2, "Miguel Arias", "supervisor@hoteloverlook.bo", "Supervisor123"],
  [3, 3, "Carla Mendoza", "recepcion@hoteloverlook.bo", "Recepcion123"],
];

const ejecutar = db.transaction(() => {
  for (const [id, nombre, descripcion] of roles) {
    db.prepare(
      `INSERT INTO roles (id_rol, nombre, descripcion)
       VALUES (?, ?, ?)
       ON CONFLICT(id_rol) DO UPDATE SET
         nombre = excluded.nombre,
         descripcion = excluded.descripcion,
         updated_at = CURRENT_TIMESTAMP`
    ).run(id, nombre, descripcion);
  }

  for (const [id, idRol, nombre, correo, password] of usuarios) {
    db.prepare(
      `INSERT INTO usuarios
       (id_usuario, id_rol, nombre_completo, correo, password_hash, estado)
       VALUES (?, ?, ?, ?, ?, 'activo')
       ON CONFLICT(id_usuario) DO UPDATE SET
         id_rol = excluded.id_rol,
         nombre_completo = excluded.nombre_completo,
         correo = excluded.correo,
         password_hash = excluded.password_hash,
         estado = 'activo',
         updated_at = CURRENT_TIMESTAMP`
    ).run(id, idRol, nombre, correo, bcrypt.hashSync(password, 12));
  }
});

ejecutar();
console.log("Roles y usuarios de prueba actualizados correctamente.");
