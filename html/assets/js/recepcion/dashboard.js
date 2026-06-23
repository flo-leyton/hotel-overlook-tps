(function () {
  "use strict";
  const api = window.RecepcionAPI;

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  async function cargarDashboard() {
    try {
      const data = await api.apiGet("/dashboard/resumen");
      setText("metric-total-habitaciones", data.total_habitaciones);
      setText("metric-disponibles", data.disponibles);
      setText("metric-ocupadas", data.ocupadas);
      setText("metric-reservadas", data.reservadas);
      setText("metric-limpieza", data.limpieza);
      setText("metric-mantenimiento", data.mantenimiento);
      setText("metric-ocupacion", `${data.porcentaje_ocupacion}%`);
      setText("metric-checkins-hoy", data.checkins_pendientes_hoy);
      setText("metric-checkouts-hoy", data.checkouts_pendientes_hoy);
      setText("metric-reservas-landing", data.reservas_pendientes_landing);
      setText("metric-solicitudes-pendientes", data.solicitudes_pendientes);

      const progress = document.getElementById("progress-ocupacion");
      if (progress) {
        progress.style.width = `${data.porcentaje_ocupacion}%`;
        progress.setAttribute("aria-valuenow", data.porcentaje_ocupacion);
      }

      const unavailable =
        data.ocupadas + data.reservadas + data.limpieza + data.mantenimiento;
      setText(
        "ocupacion-detalle",
        `${unavailable} de ${data.total_habitaciones} habitaciones no disponibles para venta inmediata`
      );

      const container = document.getElementById(
        "ultimas-operaciones-container"
      );
      if (container) {
        container.innerHTML = data.ultimas_operaciones.length
          ? data.ultimas_operaciones
              .slice(0, 6)
              .map(
                (item, index) => `<div class="operation-item">
                  <span class="operation-dot ${
                    ["bg-success", "bg-primary", "bg-warning", "bg-danger"][
                      index % 4
                    ]
                  }"></span>
                  <div class="d-flex justify-content-between gap-2">
                    <strong>${api.escapeHtml(
                      item.tipo_operacion.replaceAll("_", " ")
                    )}</strong>
                    <small class="text-muted">${api.formatearFecha(
                      item.created_at,
                      true
                    )}</small>
                  </div>
                  <small class="text-primary">${api.escapeHtml(
                    item.usuario || item.rol_usuario || "Sistema"
                  )}</small>
                  <p class="mb-0 text-muted">${api.escapeHtml(
                    item.descripcion
                  )}</p>
                </div>`
              )
              .join("")
          : '<p class="text-muted mb-0">No existen operaciones registradas.</p>';
      }
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#dashboard-alerts",
        "danger",
        error.message || "No se pudo cargar el dashboard."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", cargarDashboard);
})();
