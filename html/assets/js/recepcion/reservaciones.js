(function () {
  "use strict";
  const api = window.RecepcionAPI;
  const statusBadges = {
    pendiente: "bg-warning text-dark",
    confirmada: "bg-success",
    checkin: "bg-primary",
    checkout: "bg-secondary",
    cancelada: "bg-danger",
  };
  const originBadges = {
    recepcion: "bg-primary-subtle text-primary",
    landing: "bg-info-subtle text-info",
    whatsapp: "bg-success-subtle text-success",
    telefono: "bg-secondary-subtle text-secondary",
    agencia: "bg-dark-subtle text-dark",
  };
  let reservations = [];
  let guests = [];
  let rates = [];
  const valueMap = {
    Recepción: "recepcion",
    Landing: "landing",
    WhatsApp: "whatsapp",
    Teléfono: "telefono",
    Agencia: "agencia",
    Pendiente: "pendiente",
    Confirmada: "confirmada",
    "Check-in": "checkin",
    "Check-out": "checkout",
    Cancelada: "cancelada",
  };

  function actualizarMetricasReservaciones(reservaciones) {
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;
    const fechaActual = [
      anioActual,
      String(mesActual).padStart(2, "0"),
      String(ahora.getDate()).padStart(2, "0"),
    ].join("-");

    const metricas = reservaciones.reduce(
      (resultado, reservacion) => {
        const [anioEntrada, mesEntrada] = String(
          reservacion.fecha_entrada || ""
        )
          .split("-")
          .map(Number);

        if (anioEntrada === anioActual && mesEntrada === mesActual) {
          resultado.totalMes += 1;
        }
        if (reservacion.estado_reserva === "pendiente") {
          resultado.pendientes += 1;
        }
        if (reservacion.estado_reserva === "confirmada") {
          resultado.confirmadas += 1;
        }
        if (
          reservacion.estado_reserva === "checkin" &&
          reservacion.fecha_entrada === fechaActual
        ) {
          resultado.checkinHoy += 1;
        }
        if (reservacion.estado_reserva === "cancelada") {
          resultado.canceladas += 1;
        }
        if (
          reservacion.origen_reserva === "landing" &&
          reservacion.estado_reserva === "pendiente"
        ) {
          resultado.landingPendientes += 1;
        }
        return resultado;
      },
      {
        totalMes: 0,
        pendientes: 0,
        confirmadas: 0,
        checkinHoy: 0,
        canceladas: 0,
        landingPendientes: 0,
      }
    );

    const valores = {
      "metric-reservas-total-mes": metricas.totalMes,
      "metric-reservas-pendientes": metricas.pendientes,
      "metric-reservas-confirmadas": metricas.confirmadas,
      "metric-reservas-checkin-hoy": metricas.checkinHoy,
      "metric-reservas-canceladas": metricas.canceladas,
      "metric-reservas-landing-pendientes": metricas.landingPendientes,
    };

    Object.entries(valores).forEach(([id, valor]) => {
      const elemento = document.getElementById(id);
      if (elemento) elemento.textContent = valor;
    });
  }

  function actions(item) {
    const puedeCancelar = window.RecepcionAuth?.puede("cancelar_reserva");
    if (item.estado_reserva === "pendiente") {
      return `<button class="btn btn-sm btn-success reservation-action" data-action="confirmar" data-id="${item.id_reservacion}">Confirmar</button>
        ${puedeCancelar ? `<button class="btn btn-sm btn-outline-danger reservation-action" data-action="cancelar" data-id="${item.id_reservacion}">Cancelar</button>` : ""}`;
    }
    if (item.estado_reserva === "confirmada") {
      return `<a class="btn btn-sm btn-primary" href="checkin.html">Check-in</a>
        ${puedeCancelar ? `<button class="btn btn-sm btn-outline-danger reservation-action" data-action="cancelar" data-id="${item.id_reservacion}">Cancelar</button>` : ""}`;
    }
    return '<span class="text-muted">Sin acciones</span>';
  }

  function renderTable() {
    const body = document.getElementById("reservaciones-table-body");
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
              <td>${api.formatearFecha(item.fecha_salida)}</td>
              <td>${item.adultos}</td><td>${item.ninos}</td>
              <td><span class="badge ${originBadges[item.origen_reserva]}">${api.escapeHtml(
                item.origen_reserva
              )}</span></td>
              <td><span class="badge ${statusBadges[item.estado_reserva]}">${api.escapeHtml(
                item.estado_reserva
              )}</span></td>
              <td class="text-end"><div class="table-actions">${actions(item)}</div></td>
            </tr>`
          )
          .join("")
      : '<tr><td colspan="11" class="text-center text-muted">No existen reservaciones.</td></tr>';
  }

  function renderLanding() {
    const container = document.getElementById("landing-requests-container");
    if (!container) return;
    const pending = reservations.filter(
      (item) =>
        item.origen_reserva === "landing" &&
        item.estado_reserva === "pendiente"
    );
    const landingMetric = document.getElementById(
      "metric-reservas-landing-pendientes"
    );
    if (landingMetric) landingMetric.textContent = pending.length;
    container.innerHTML = pending.length
      ? pending
          .map(
            (item) => `<div class="col-lg-6">
              <div class="landing-request-card">
                <div class="d-flex justify-content-between mb-3">
                  <div><h5 class="mb-1">${api.escapeHtml(item.huesped)}</h5>
                  <span class="text-muted">${api.escapeHtml(
                    item.codigo_reserva
                  )} · ${api.formatearFecha(
                    item.fecha_entrada
                  )} al ${api.formatearFecha(item.fecha_salida)}</span></div>
                  <span class="badge bg-warning text-dark align-self-start">Pendiente</span>
                </div>
                <p><strong>${api.escapeHtml(
                  item.tipo_habitacion || "Tipo pendiente"
                )}</strong> · ${item.adultos} adulto(s)</p>
                <div class="d-flex flex-wrap gap-2">
                  <button class="btn btn-sm btn-success reservation-action" data-action="confirmar" data-id="${
                    item.id_reservacion
                  }">Confirmar reserva</button>
                  ${window.RecepcionAuth?.puede("cancelar_reserva") ? `<button class="btn btn-sm btn-outline-danger reservation-action" data-action="cancelar" data-id="${item.id_reservacion}">Cancelar</button>` : ""}
                </div>
              </div>
            </div>`
          )
          .join("")
      : '<div class="col-12"><p class="text-muted mb-0">No hay solicitudes pendientes desde la landing.</p></div>';
  }

  async function cargar() {
    try {
      [reservations, guests, rates] = await Promise.all([
        api.apiGet("/reservaciones"),
        api.apiGet("/huespedes"),
        api.apiGet("/tarifas"),
      ]);
      actualizarMetricasReservaciones(reservations);
      renderTable();
      renderLanding();
      const guestList = document.getElementById("reservationGuestList");
      if (guestList) {
        guestList.innerHTML = guests
          .map(
            (guest) =>
              `<option value="${api.escapeHtml(guest.nombre_completo)}" data-document="${api.escapeHtml(
                guest.documento
              )}"></option>`
          )
          .join("");
      }
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#reservaciones-alerts",
        "danger",
        "No se pudieron cargar las reservaciones."
      );
    }
  }

  async function action(button) {
    try {
      await api.apiPatch(
        `/reservaciones/${button.dataset.id}/${button.dataset.action}`,
        {
          usuario_responsable:
            window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
        }
      );
      api.mostrarAlertaBootstrap(
        "#reservaciones-alerts",
        "success",
        button.dataset.action === "confirmar"
          ? "Reserva confirmada correctamente."
          : "Reserva cancelada correctamente."
      );
      await cargar();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#reservaciones-alerts",
        "danger",
        error.message
      );
    }
  }

  async function guardar(event) {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;
    const documentValue = document
      .getElementById("reservationDocument")
      .value.trim();
    const guest = guests.find((item) => item.documento === documentValue);
    if (!guest) {
      return api.mostrarAlertaBootstrap(
        "#reservation-form-alerts",
        "warning",
        "El huésped debe registrarse antes de crear la reservación."
      );
    }
    const typeName = document.getElementById("reservationRoomType").value;
    const rate = rates.find((item) => item.tipo_habitacion === typeName);
    try {
      await api.apiPost("/reservaciones", {
        id_huesped: guest.id_huesped,
        id_tipo_habitacion: rate?.id_tipo_habitacion || null,
        fecha_entrada: document.getElementById("reservationArrival").value,
        fecha_salida: document.getElementById("reservationDeparture").value,
        adultos: Number(document.getElementById("reservationAdults").value),
        ninos: Number(document.getElementById("reservationChildren").value),
        origen_reserva:
          valueMap[document.getElementById("reservationOrigin").value] ||
          "recepcion",
        estado_reserva:
          valueMap[document.getElementById("reservationStatus").value] ||
          "pendiente",
        solicitudes_especiales: document.getElementById("specialRequests").value,
        created_by: 3,
      });
      api.mostrarAlertaBootstrap(
        "#reservaciones-alerts",
        "success",
        "Reservación registrada correctamente."
      );
      bootstrap.Offcanvas.getOrCreateInstance(
        document.getElementById("reservationForm")
      ).hide();
      form.reset();
      form.classList.remove("was-validated");
      await cargar();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#reservation-form-alerts",
        "danger",
        error.message
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest(".reservation-action");
      if (button) action(button);
    });
    document
      .getElementById("reservation-data-form")
      ?.addEventListener("submit", guardar);
    document
      .getElementById("reservationGuest")
      ?.addEventListener("change", (event) => {
        const guest = guests.find(
          (item) => item.nombre_completo === event.target.value
        );
        if (guest) {
          document.getElementById("reservationDocument").value =
            guest.documento;
          document.getElementById("reservationPhone").value =
            guest.telefono || "";
          document.getElementById("reservationEmail").value =
            guest.correo || "";
        }
      });
    cargar();
  });
})();
