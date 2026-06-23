(function () {
  "use strict";
  const api = window.RecepcionAPI;
  let reservations = [];
  let rooms = [];
  let selectedReservation = null;

  function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value || "";
  }
  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value ?? "—";
  }

  function renderReservations() {
    const body = document.getElementById("checkin-reservations-body");
    if (!body) return;
    body.innerHTML = reservations.length
      ? reservations
          .map(
            (item) => `<tr>
              <td><strong>${api.escapeHtml(item.codigo_reserva)}</strong></td>
              <td>${api.escapeHtml(item.huesped)}</td>
              <td>${api.escapeHtml(item.documento)}</td>
              <td>${api.escapeHtml(
                item.habitacion
                  ? `${item.habitacion} · ${item.tipo_habitacion || ""}`
                  : item.tipo_habitacion || "Sin asignar"
              )}</td>
              <td>${api.formatearFecha(item.fecha_entrada)}</td>
              <td><span class="badge bg-info-subtle text-info">${api.escapeHtml(
                item.origen_reserva
              )}</span></td>
              <td><span class="badge bg-success">Confirmada</span></td>
              <td class="text-end"><button class="btn btn-sm btn-primary select-checkin-reservation" type="button" data-id="${
                item.id_reservacion
              }">Seleccionar reserva</button></td>
            </tr>`
          )
          .join("")
      : '<tr><td colspan="8" class="text-center text-muted">No existen reservas confirmadas pendientes de check-in.</td></tr>';
  }

  function renderRooms() {
    const select = document.getElementById("alternativeRoom");
    const body = document.getElementById("checkin-rooms-body");
    const available = rooms.filter(
      (room) =>
        room.estado === "disponible" ||
        (room.estado === "reservada" &&
          selectedReservation?.id_habitacion === room.id_habitacion)
    );
    if (select) {
      select.innerHTML = available
        .map(
          (room) =>
            `<option value="${room.id_habitacion}">${api.escapeHtml(
              room.numero
            )} ${api.escapeHtml(room.tipo_habitacion)} · ${api.formatearMonedaBOB(
              room.tarifa_noche
            )} · ${api.escapeHtml(room.estado)}</option>`
        )
        .join("");
    }
    if (body) {
      body.innerHTML = available
        .map(
          (room) => `<tr><td>${api.escapeHtml(room.numero)}</td>
            <td>${api.escapeHtml(room.tipo_habitacion)}</td>
            <td>${api.formatearMonedaBOB(room.tarifa_noche)}</td>
            <td><span class="badge ${
              room.estado === "disponible" ? "bg-success" : "bg-info"
            }">${api.escapeHtml(room.estado)}</span></td></tr>`
        )
        .join("");
    }
  }

  async function selectReservation(id) {
    selectedReservation = reservations.find(
      (item) => item.id_reservacion === Number(id)
    );
    if (!selectedReservation) return;
    setValue("checkinCode", selectedReservation.codigo_reserva);
    setValue("checkinDocument", selectedReservation.documento);
    setValue("checkinGuest", selectedReservation.huesped);
    setValue("guestFullName", selectedReservation.huesped);
    setValue("guestId", selectedReservation.documento);
    setValue("guestPhone", selectedReservation.telefono);
    setValue("guestEmail", selectedReservation.correo);
    try {
      const guest = await api.apiGet(
        `/huespedes/${selectedReservation.id_huesped}`
      );
      setValue("guestNationality", guest.nacionalidad);
      setValue("guestCity", guest.ciudad_origen);
      setValue("guestNotes", guest.observaciones);
    } catch (error) {
      console.error("No se pudo cargar el detalle del huésped:", error);
    }

    const select = document.getElementById("alternativeRoom");
    if (select && selectedReservation.id_habitacion) {
      select.value = String(selectedReservation.id_habitacion);
    }
    renderRooms();
    updateSummary();
    api.mostrarAlertaBootstrap(
      "#checkin-alerts",
      "info",
      `Reserva ${selectedReservation.codigo_reserva} seleccionada.`
    );
  }

  function updateSummary() {
    if (!selectedReservation) return;
    const roomId = Number(document.getElementById("alternativeRoom")?.value);
    const room = rooms.find((item) => item.id_habitacion === roomId);
    setText("checkin-summary-code", selectedReservation.codigo_reserva);
    setText("checkin-summary-guest", selectedReservation.huesped);
    setText("checkin-summary-document", selectedReservation.documento);
    setText(
      "checkin-summary-room",
      room ? `${room.numero} · ${room.tipo_habitacion}` : "Sin seleccionar"
    );
    setText(
      "checkin-summary-arrival",
      api.formatearFecha(selectedReservation.fecha_entrada)
    );
    setText(
      "checkin-summary-departure",
      api.formatearFecha(selectedReservation.fecha_salida)
    );
  }

  async function confirmar() {
    if (!selectedReservation) {
      return api.mostrarAlertaBootstrap(
        "#checkin-alerts",
        "warning",
        "Seleccione una reserva antes de confirmar el check-in."
      );
    }
    const roomId = Number(document.getElementById("alternativeRoom")?.value);
    if (!roomId) {
      return api.mostrarAlertaBootstrap(
        "#checkin-alerts",
        "warning",
        "Seleccione una habitación."
      );
    }
    try {
      await api.apiPost("/checkin", {
        id_reservacion: selectedReservation.id_reservacion,
        id_habitacion: roomId,
        id_huesped: selectedReservation.id_huesped,
        usuario_responsable:
          window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
        observaciones: document.getElementById("guestNotes")?.value || "",
      });
      api.mostrarAlertaBootstrap(
        "#checkin-alerts",
        "success",
        "Check-in registrado correctamente."
      );
      selectedReservation = null;
      await cargar();
    } catch (error) {
      api.mostrarAlertaBootstrap("#checkin-alerts", "danger", error.message);
    }
  }

  async function cargar() {
    try {
      const [allReservations, allRooms] = await Promise.all([
        api.apiGet("/reservaciones?estado=confirmada"),
        api.apiGet("/habitaciones"),
      ]);
      reservations = allReservations;
      rooms = allRooms;
      setText("checkin-pending-count", reservations.length);
      renderReservations();
      renderRooms();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#checkin-alerts",
        "danger",
        "No se pudieron cargar los datos para check-in."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("checkin-reservations-body")
      ?.addEventListener("click", (event) => {
        const button = event.target.closest(".select-checkin-reservation");
        if (button) selectReservation(button.dataset.id);
      });
    document
      .getElementById("alternativeRoom")
      ?.addEventListener("change", updateSummary);
    document
      .getElementById("confirm-checkin-button")
      ?.addEventListener("click", confirmar);
    cargar();
  });
})();
