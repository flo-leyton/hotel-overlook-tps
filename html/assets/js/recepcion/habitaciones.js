(function () {
  "use strict";
  const api = window.RecepcionAPI;
  const badge = {
    disponible: "bg-success",
    ocupada: "bg-danger",
    reservada: "bg-info",
    limpieza: "bg-warning text-dark",
    mantenimiento: "bg-dark",
  };
  let rooms = [];

  function actualizarMetricas() {
    const counts = rooms.reduce((acc, room) => {
      acc[room.estado] = (acc[room.estado] || 0) + 1;
      return acc;
    }, {});
    const values = {
      "rooms-total": rooms.length,
      "rooms-disponibles": counts.disponible || 0,
      "rooms-ocupadas": counts.ocupada || 0,
      "rooms-reservadas": counts.reservada || 0,
      "rooms-limpieza": counts.limpieza || 0,
      "rooms-mantenimiento": counts.mantenimiento || 0,
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  function render() {
    const body = document.getElementById("habitaciones-table-body");
    if (!body) return;
    const search = document.getElementById("roomSearch")?.value.toLowerCase();
    const type = document.getElementById("roomTypeFilter")?.value;
    const status = document.getElementById("roomStatusFilter")?.value;
    const floor = document.getElementById("floorFilter")?.value;
    const filtered = rooms.filter(
      (room) =>
        (!search || room.numero.toLowerCase().includes(search)) &&
        (!type || type === "Todos los tipos" || room.tipo_habitacion === type) &&
        (!status ||
          status === "Todos los estados" ||
          room.estado === status.toLowerCase()) &&
        (!floor ||
          floor === "Todos los pisos" ||
          `Piso ${room.piso}` === floor)
    );
    body.innerHTML = filtered.length
      ? filtered
          .map(
            (room) => `<tr>
              <td><strong>${api.escapeHtml(room.numero)}</strong></td>
              <td>Piso ${room.piso}</td>
              <td>${api.escapeHtml(room.tipo_habitacion)}</td>
              <td>${room.capacidad} persona${room.capacidad === 1 ? "" : "s"}</td>
              <td>${api.formatearMonedaBOB(room.tarifa_noche)}</td>
              <td><span class="badge ${badge[room.estado]}">${api.escapeHtml(
                room.estado
              )}</span></td>
              <td>—</td>
              <td>${api.formatearFecha(room.updated_at, true)}</td>
              <td class="text-end">
                <select class="form-select form-select-sm d-inline-block room-status-select table-action-select" data-id="${
                  room.id_habitacion
                }">
                  ${Object.keys(badge)
                    .map(
                      (state) =>
                        `<option value="${state}" ${
                          state === room.estado ? "selected" : ""
                        }>${state}</option>`
                    )
                    .join("")}
                </select>
              </td>
            </tr>`
          )
          .join("")
      : '<tr><td colspan="9" class="text-center text-muted">No se encontraron habitaciones.</td></tr>';
  }

  async function cargar() {
    try {
      rooms = await api.apiGet("/habitaciones");
      actualizarMetricas();
      render();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#habitaciones-alerts",
        "danger",
        "No se pudieron cargar las habitaciones."
      );
    }
  }

  async function cambiarEstado(select) {
    const previous = rooms.find(
      (room) => room.id_habitacion === Number(select.dataset.id)
    )?.estado;
    try {
      await api.apiPatch(`/habitaciones/${select.dataset.id}/estado`, {
        estado: select.value,
        usuario_responsable:
          window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
      });
      api.mostrarAlertaBootstrap(
        "#habitaciones-alerts",
        "success",
        "Estado de habitación actualizado correctamente."
      );
      await cargar();
    } catch (error) {
      select.value = previous;
      api.mostrarAlertaBootstrap(
        "#habitaciones-alerts",
        "danger",
        error.message
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    ["roomSearch", "roomTypeFilter", "roomStatusFilter", "floorFilter"].forEach(
      (id) =>
        document.getElementById(id)?.addEventListener("input", render)
    );
    document
      .getElementById("habitaciones-table-body")
      ?.addEventListener("change", (event) => {
        if (event.target.matches(".room-status-select")) {
          cambiarEstado(event.target);
        }
      });
    cargar();
  });
})();
