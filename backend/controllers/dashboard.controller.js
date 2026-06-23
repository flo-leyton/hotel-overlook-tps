const db = require("../db");
const { handleControllerError } = require("../utils/http");

function obtenerResumen(req, res) {
  try {
    const habitaciones = db
      .prepare(
        `SELECT
          COUNT(*) AS total_habitaciones,
          SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) AS disponibles,
          SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) AS ocupadas,
          SUM(CASE WHEN estado = 'reservada' THEN 1 ELSE 0 END) AS reservadas,
          SUM(CASE WHEN estado = 'limpieza' THEN 1 ELSE 0 END) AS limpieza,
          SUM(CASE WHEN estado = 'mantenimiento' THEN 1 ELSE 0 END) AS mantenimiento
        FROM habitaciones`
      )
      .get();

    const noDisponibles =
      habitaciones.ocupadas +
      habitaciones.reservadas +
      habitaciones.limpieza +
      habitaciones.mantenimiento;

    const operacionesHoy = db
      .prepare(
        `SELECT
          SUM(CASE
            WHEN estado_reserva = 'confirmada'
             AND fecha_entrada = date('now', 'localtime')
            THEN 1 ELSE 0 END
          ) AS checkins_pendientes_hoy,
          SUM(CASE
            WHEN estado_reserva = 'checkin'
             AND fecha_salida <= date('now', 'localtime')
            THEN 1 ELSE 0 END
          ) AS checkouts_pendientes_hoy,
          SUM(CASE
            WHEN estado_reserva = 'pendiente'
             AND origen_reserva = 'landing'
            THEN 1 ELSE 0 END
          ) AS reservas_pendientes_landing
        FROM reservaciones`
      )
      .get();

    const solicitudes = db
      .prepare(
        `SELECT COUNT(*) AS solicitudes_pendientes
         FROM solicitudes_huesped
         WHERE estado IN ('pendiente', 'en_atencion')`
      )
      .get();

    const ultimasOperaciones = db
      .prepare(
        `SELECT
          o.id_operacion,
          o.codigo_operacion,
          o.tipo_operacion,
          o.modulo,
          o.descripcion,
          o.rol_usuario,
          o.registro_afectado,
          o.estado_anterior,
          o.estado_nuevo,
          o.created_at,
          u.nombre_completo AS usuario
        FROM operaciones_recepcion o
        LEFT JOIN usuarios u ON u.id_usuario = o.usuario_responsable
        ORDER BY datetime(o.created_at) DESC, o.id_operacion DESC
        LIMIT 10`
      )
      .all();

    return res.json({
      ok: true,
      data: {
        ...habitaciones,
        porcentaje_ocupacion: habitaciones.total_habitaciones
          ? Math.round((noDisponibles / habitaciones.total_habitaciones) * 100)
          : 0,
        checkins_pendientes_hoy:
          operacionesHoy.checkins_pendientes_hoy || 0,
        checkouts_pendientes_hoy:
          operacionesHoy.checkouts_pendientes_hoy || 0,
        reservas_pendientes_landing:
          operacionesHoy.reservas_pendientes_landing || 0,
        solicitudes_pendientes: solicitudes.solicitudes_pendientes,
        ultimas_operaciones: ultimasOperaciones,
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

module.exports = { obtenerResumen };
