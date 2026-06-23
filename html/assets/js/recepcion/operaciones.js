(function () {
  "use strict";
  const api = window.RecepcionAPI;
  let operations = [];

  function render() {
    const body = document.getElementById("operaciones-table-body");
    if (!body) return;
    const search =
      document.getElementById("operationSearch")?.value.toLowerCase() || "";
    const type = document.getElementById("operationType")?.value || "";
    const date = document.getElementById("operationDate")?.value || "";
    const filtered = operations.filter(
      (item) =>
        (!search ||
          item.descripcion.toLowerCase().includes(search) ||
          item.codigo_operacion.toLowerCase().includes(search)) &&
        (!type || item.modulo === type) &&
        (!date || api.obtenerFechaISOHotel(item.created_at) === date)
    );
    body.innerHTML = filtered.length
      ? filtered
          .map(
            (item) => `<tr>
              <td>${api.formatearFecha(item.created_at, true)}</td>
              <td>${api.escapeHtml(item.tipo_operacion.replaceAll("_", " "))}</td>
              <td>${api.escapeHtml(item.registro_afectado || "—")}</td>
              <td>${api.escapeHtml(item.usuario || "Sistema")}</td>
              <td>${api.escapeHtml(item.rol || "Sistema")}</td>
              <td><span class="badge bg-success">${api.escapeHtml(
                item.estado_operacion
              )}</span></td>
              <td><button class="btn btn-sm btn-outline-primary operation-detail" data-id="${
                item.id_operacion
              }" type="button">Ver</button></td>
            </tr>`
          )
          .join("")
      : '<tr><td colspan="7" class="text-center text-muted">No existen operaciones para los filtros aplicados.</td></tr>';
  }

  async function cargar() {
    try {
      operations = await api.apiGet("/operaciones");
      render();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#operaciones-alerts",
        "danger",
        "No se pudo cargar el historial de operaciones."
      );
    }
  }

  async function showDetail(id) {
    try {
      const item = await api.apiGet(`/operaciones/${id}`);
      const container = document.getElementById("operation-detail-content");
      container.innerHTML = `
        <div class="row g-3">
          <div class="col-md-4"><small class="text-muted d-block">Código</small><strong>${api.escapeHtml(
            item.codigo_operacion
          )}</strong></div>
          <div class="col-md-4"><small class="text-muted d-block">Tipo</small><strong>${api.escapeHtml(
            item.tipo_operacion
          )}</strong></div>
          <div class="col-md-4"><small class="text-muted d-block">Módulo</small><strong>${api.escapeHtml(
            item.modulo
          )}</strong></div>
          <div class="col-md-6"><small class="text-muted d-block">Usuario y rol</small><strong>${api.escapeHtml(
            item.usuario || "Sistema"
          )} · ${api.escapeHtml(item.rol || "Sistema")}</strong></div>
          <div class="col-md-6"><small class="text-muted d-block">Fecha</small><strong>${api.formatearFecha(
            item.created_at,
            true
          )}</strong></div>
          <div class="col-12"><small class="text-muted d-block">Descripción</small><p>${api.escapeHtml(
            item.descripcion
          )}</p></div>
          <div class="col-md-4"><small class="text-muted d-block">Registro afectado</small><strong>${api.escapeHtml(
            item.registro_afectado || "—"
          )}</strong></div>
          <div class="col-md-4"><small class="text-muted d-block">Estado anterior</small><strong>${api.escapeHtml(
            item.estado_anterior || "—"
          )}</strong></div>
          <div class="col-md-4"><small class="text-muted d-block">Estado nuevo</small><strong>${api.escapeHtml(
            item.estado_nuevo || "—"
          )}</strong></div>
        </div>`;
      document.getElementById("operation-detail-card").classList.remove("d-none");
      document
        .getElementById("operation-detail-card")
        .scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#operaciones-alerts",
        "danger",
        error.message
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    ["operationSearch", "operationType", "operationDate"].forEach((id) =>
      document.getElementById(id)?.addEventListener("input", render)
    );
    document
      .getElementById("operaciones-table-body")
      ?.addEventListener("click", (event) => {
        const button = event.target.closest(".operation-detail");
        if (button) showDetail(button.dataset.id);
      });
    cargar();
  });
})();
