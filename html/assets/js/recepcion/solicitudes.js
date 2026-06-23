(function () {
  "use strict";
  const api = window.RecepcionAPI;
  const statusBadges = {
    pendiente: "bg-warning text-dark",
    en_atencion: "bg-info",
    resuelta: "bg-success",
    cancelada: "bg-danger",
  };
  const priorityBadges = {
    baja: "bg-secondary",
    media: "bg-primary",
    alta: "bg-warning text-dark",
    urgente: "bg-danger",
  };
  let requests = [];
  let users = [];

  function render() {
    const body = document.getElementById("solicitudes-table-body");
    if (!body) return;
    body.innerHTML = requests.length
      ? requests
          .map(
            (item) => `<tr>
              <td>${api.formatearFecha(item.created_at, true)}</td>
              <td>${api.escapeHtml(item.habitacion || "—")}</td>
              <td><strong>${api.escapeHtml(item.tipo_solicitud)}</strong><br>
                <small>${api.escapeHtml(item.descripcion)}</small></td>
              <td><span class="badge ${priorityBadges[item.prioridad]}">${api.escapeHtml(
                item.prioridad
              )}</span></td>
              <td><span class="badge ${statusBadges[item.estado]}">${api.escapeHtml(
                item.estado
              )}</span></td>
              <td>
                <div class="request-controls">
                <select class="form-select form-select-sm request-assignee mb-1" data-id="${
                  item.id_solicitud
                }">
                  <option value="">Sin asignar</option>
                  ${users
                    .filter((user) => user.estado === "activo")
                    .map(
                      (user) =>
                        `<option value="${user.id_usuario}" ${
                          user.id_usuario === item.responsable ? "selected" : ""
                        }>${api.escapeHtml(user.nombre_completo)}</option>`
                    )
                    .join("")}
                </select>
                <select class="form-select form-select-sm request-status" data-id="${
                  item.id_solicitud
                }" ${item.estado === "resuelta" ? "disabled" : ""}>
                  ${Object.keys(statusBadges)
                    .map(
                      (state) =>
                        `<option value="${state}" ${
                          state === item.estado ? "selected" : ""
                        }>${state}</option>`
                    )
                    .join("")}
                </select>
                </div>
              </td>
            </tr>`
          )
          .join("")
      : '<tr><td colspan="6" class="text-center text-muted">No existen solicitudes.</td></tr>';
  }

  async function cargar() {
    try {
      [requests, users] = await Promise.all([
        api.apiGet("/solicitudes"),
        api.apiGet("/usuarios"),
      ]);
      render();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#solicitudes-alerts",
        "danger",
        "No se pudieron cargar las solicitudes."
      );
    }
  }

  async function guardar(event) {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;
    try {
      await api.apiPost("/solicitudes", {
        id_habitacion:
          Number(document.getElementById("requestRoom").value) || null,
        tipo_solicitud: document.getElementById("requestType").value,
        descripcion: document.getElementById("requestDescription").value,
        canal: document.getElementById("requestChannel").value,
        prioridad: document.getElementById("requestPriority").value,
        usuario_responsable:
          window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
      });
      api.mostrarAlertaBootstrap(
        "#solicitudes-alerts",
        "success",
        "Solicitud registrada correctamente."
      );
      form.reset();
      form.classList.remove("was-validated");
      await cargar();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#solicitudes-alerts",
        "danger",
        error.message
      );
    }
  }

  async function change(event) {
    const element = event.target;
    try {
      if (element.matches(".request-status")) {
        await api.apiPatch(`/solicitudes/${element.dataset.id}/estado`, {
          estado: element.value,
          usuario_responsable:
            window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
        });
        api.mostrarAlertaBootstrap(
          "#solicitudes-alerts",
          "success",
          "Estado de solicitud actualizado."
        );
      }
      if (element.matches(".request-assignee") && element.value) {
        await api.apiPatch(`/solicitudes/${element.dataset.id}/asignar`, {
          responsable: Number(element.value),
          usuario_responsable:
            window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
        });
        api.mostrarAlertaBootstrap(
          "#solicitudes-alerts",
          "success",
          "Responsable asignado correctamente."
        );
      }
      await cargar();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#solicitudes-alerts",
        "danger",
        error.message
      );
      await cargar();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("request-data-form")
      ?.addEventListener("submit", guardar);
    document
      .getElementById("solicitudes-table-body")
      ?.addEventListener("change", change);
    cargar();
  });
})();
