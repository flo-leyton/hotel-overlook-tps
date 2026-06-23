const db = require("../db");
const { registrarOperacion } = require("../utils/operations");
const {
  createHttpError,
  handleControllerError,
  requireFields,
  parsePositiveId,
} = require("../utils/http");

function listar(req, res) {
  try {
    const search = req.query.buscar?.trim();
    const rows = search
      ? db
          .prepare(
            `SELECT * FROM huespedes
             WHERE nombre_completo LIKE @buscar
                OR documento LIKE @buscar
                OR correo LIKE @buscar
             ORDER BY nombre_completo`
          )
          .all({ buscar: `%${search}%` })
      : db.prepare("SELECT * FROM huespedes ORDER BY nombre_completo").all();

    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function obtener(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_huesped");
    const guest = db
      .prepare("SELECT * FROM huespedes WHERE id_huesped = ?")
      .get(id);
    if (!guest) throw createHttpError(404, "Huésped no encontrado.");

    const reservations = db
      .prepare(
        `SELECT codigo_reserva, fecha_entrada, fecha_salida,
                origen_reserva, estado_reserva, total_estimado
         FROM reservaciones
         WHERE id_huesped = ?
         ORDER BY fecha_entrada DESC`
      )
      .all(id);

    return res.json({
      ok: true,
      data: { ...guest, reservaciones: reservations },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function crear(req, res) {
  try {
    requireFields(req.body, ["nombre_completo", "documento"]);

    const transaction = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO huespedes (
            nombre_completo, documento, nacionalidad, telefono, correo,
            ciudad_origen, fecha_nacimiento, observaciones
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          req.body.nombre_completo.trim(),
          req.body.documento.trim(),
          req.body.nacionalidad || null,
          req.body.telefono || null,
          req.body.correo || null,
          req.body.ciudad_origen || null,
          req.body.fecha_nacimiento || null,
          req.body.observaciones || null
        );

      const id = Number(result.lastInsertRowid);
      registrarOperacion(
        {
          tipo_operacion: "huesped_registrado",
          modulo: "huespedes",
          descripcion: `Huésped ${req.body.nombre_completo.trim()} registrado.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: req.body.documento.trim(),
          estado_nuevo: "registrado",
        },
        db
      );
      return id;
    });

    const id = transaction();
    return res.status(201).json({
      ok: true,
      data: db.prepare("SELECT * FROM huespedes WHERE id_huesped = ?").get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizar(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_huesped");
    requireFields(req.body, ["nombre_completo", "documento"]);

    const current = db
      .prepare("SELECT id_huesped FROM huespedes WHERE id_huesped = ?")
      .get(id);
    if (!current) throw createHttpError(404, "Huésped no encontrado.");

    db.prepare(
      `UPDATE huespedes
       SET nombre_completo = ?, documento = ?, nacionalidad = ?,
           telefono = ?, correo = ?, ciudad_origen = ?,
           fecha_nacimiento = ?, observaciones = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id_huesped = ?`
    ).run(
      req.body.nombre_completo.trim(),
      req.body.documento.trim(),
      req.body.nacionalidad || null,
      req.body.telefono || null,
      req.body.correo || null,
      req.body.ciudad_origen || null,
      req.body.fecha_nacimiento || null,
      req.body.observaciones || null,
      id
    );

    return res.json({
      ok: true,
      message: "Huésped actualizado correctamente.",
      data: db.prepare("SELECT * FROM huespedes WHERE id_huesped = ?").get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { listar, obtener, crear, actualizar };
