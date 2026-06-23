const db = require("../db");
const { generarCodigo } = require("../utils/codes");
const { registrarOperacion } = require("../utils/operations");
const {
  createHttpError,
  handleControllerError,
  requireFields,
  parsePositiveId,
} = require("../utils/http");

const ESTADOS = ["pendiente", "en_atencion", "resuelta", "cancelada"];
const CANALES = ["recepcion", "whatsapp", "telefono", "landing", "sistema"];
const PRIORIDADES = ["baja", "media", "alta", "urgente"];

const selectRequest = `
  SELECT
    s.*,
    h.nombre_completo AS huesped,
    hb.numero AS habitacion,
    u.nombre_completo AS responsable_nombre
  FROM solicitudes_huesped s
  LEFT JOIN huespedes h ON h.id_huesped = s.id_huesped
  LEFT JOIN habitaciones hb ON hb.id_habitacion = s.id_habitacion
  LEFT JOIN usuarios u ON u.id_usuario = s.responsable
`;

function listar(req, res) {
  try {
    const conditions = [];
    const params = {};
    if (req.query.estado) {
      if (!ESTADOS.includes(req.query.estado)) {
        throw createHttpError(400, "Estado de solicitud no permitido.");
      }
      conditions.push("s.estado = @estado");
      params.estado = req.query.estado;
    }
    if (req.query.prioridad) {
      if (!PRIORIDADES.includes(req.query.prioridad)) {
        throw createHttpError(400, "Prioridad no permitida.");
      }
      conditions.push("s.prioridad = @prioridad");
      params.prioridad = req.query.prioridad;
    }

    const rows = db
      .prepare(
        `${selectRequest}
         ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
         ORDER BY
           CASE s.prioridad
             WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2
             WHEN 'media' THEN 3 ELSE 4
           END,
           datetime(s.created_at) DESC`
      )
      .all(params);
    return res.json({ ok: true, data: rows });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function crear(req, res) {
  try {
    requireFields(req.body, ["tipo_solicitud", "descripcion"]);
    const channel = req.body.canal || "recepcion";
    const priority = req.body.prioridad || "media";
    if (!CANALES.includes(channel) || !PRIORIDADES.includes(priority)) {
      throw createHttpError(400, "Canal o prioridad no permitidos.");
    }

    const transaction = db.transaction(() => {
      if (req.body.id_huesped) {
        const guest = db
          .prepare("SELECT id_huesped FROM huespedes WHERE id_huesped = ?")
          .get(req.body.id_huesped);
        if (!guest) throw createHttpError(400, "El huésped no existe.");
      }
      if (req.body.id_habitacion) {
        const room = db
          .prepare(
            "SELECT id_habitacion FROM habitaciones WHERE id_habitacion = ?"
          )
          .get(req.body.id_habitacion);
        if (!room) throw createHttpError(400, "La habitación no existe.");
      }

      const code = generarCodigo(
        db,
        "solicitudes_huesped",
        "codigo_solicitud",
        "SOL"
      );
      const result = db
        .prepare(
          `INSERT INTO solicitudes_huesped (
            codigo_solicitud, id_huesped, id_habitacion, tipo_solicitud,
            descripcion, canal, prioridad, estado, responsable
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`
        )
        .run(
          code,
          req.body.id_huesped || null,
          req.body.id_habitacion || null,
          req.body.tipo_solicitud.trim(),
          req.body.descripcion.trim(),
          channel,
          priority,
          req.body.responsable || null
        );

      registrarOperacion(
        {
          tipo_operacion: "solicitud_registrada",
          modulo: "solicitudes",
          descripcion: `Solicitud ${code} registrada.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: code,
          estado_nuevo: "pendiente",
        },
        db
      );
      return Number(result.lastInsertRowid);
    });

    const id = transaction();
    return res.status(201).json({
      ok: true,
      data: db
        .prepare(`${selectRequest} WHERE s.id_solicitud = ?`)
        .get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function asignar(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_solicitud");
    requireFields(req.body, ["responsable"]);

    const transaction = db.transaction(() => {
      const request = db
        .prepare("SELECT * FROM solicitudes_huesped WHERE id_solicitud = ?")
        .get(id);
      if (!request) throw createHttpError(404, "Solicitud no encontrada.");

      const user = db
        .prepare(
          "SELECT id_usuario, nombre_completo FROM usuarios WHERE id_usuario = ? AND estado = 'activo'"
        )
        .get(req.body.responsable);
      if (!user) {
        throw createHttpError(400, "El responsable no existe o no está activo.");
      }

      db.prepare(
        `UPDATE solicitudes_huesped
         SET responsable = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id_solicitud = ?`
      ).run(req.body.responsable, id);

      registrarOperacion(
        {
          tipo_operacion: "solicitud_registrada",
          modulo: "solicitudes",
          descripcion: `Solicitud ${request.codigo_solicitud} asignada a ${user.nombre_completo}.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: request.codigo_solicitud,
          estado_anterior: request.responsable
            ? `responsable:${request.responsable}`
            : "sin_responsable",
          estado_nuevo: `responsable:${user.id_usuario}`,
        },
        db
      );
    });

    transaction();

    return res.json({
      ok: true,
      message: "Responsable asignado correctamente.",
      data: db
        .prepare(`${selectRequest} WHERE s.id_solicitud = ?`)
        .get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

function actualizarEstado(req, res) {
  try {
    const id = parsePositiveId(req.params.id, "id_solicitud");
    requireFields(req.body, ["estado"]);
    if (!ESTADOS.includes(req.body.estado)) {
      throw createHttpError(400, "Estado de solicitud no permitido.");
    }

    const transaction = db.transaction(() => {
      const request = db
        .prepare("SELECT * FROM solicitudes_huesped WHERE id_solicitud = ?")
        .get(id);
      if (!request) throw createHttpError(404, "Solicitud no encontrada.");
      if (request.estado === req.body.estado) {
        throw createHttpError(409, "La solicitud ya tiene ese estado.");
      }
      if (request.estado === "resuelta") {
        throw createHttpError(409, "Una solicitud resuelta no puede reabrirse.");
      }

      db.prepare(
        `UPDATE solicitudes_huesped
         SET estado = ?, updated_at = CURRENT_TIMESTAMP,
             closed_at = CASE
               WHEN ? = 'resuelta' THEN CURRENT_TIMESTAMP
               WHEN ? = 'cancelada' THEN CURRENT_TIMESTAMP
               ELSE NULL
             END
         WHERE id_solicitud = ?`
      ).run(req.body.estado, req.body.estado, req.body.estado, id);

      registrarOperacion(
        {
          tipo_operacion:
            req.body.estado === "resuelta"
              ? "solicitud_resuelta"
              : "solicitud_registrada",
          modulo: "solicitudes",
          descripcion: `Solicitud ${request.codigo_solicitud} cambió de ${request.estado} a ${req.body.estado}.`,
          usuario_responsable: req.body.usuario_responsable || null,
          registro_afectado: request.codigo_solicitud,
          estado_anterior: request.estado,
          estado_nuevo: req.body.estado,
        },
        db
      );
    });

    transaction();
    return res.json({
      ok: true,
      message: "Estado de solicitud actualizado correctamente.",
      data: db
        .prepare(`${selectRequest} WHERE s.id_solicitud = ?`)
        .get(id),
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { listar, crear, asignar, actualizarEstado };
