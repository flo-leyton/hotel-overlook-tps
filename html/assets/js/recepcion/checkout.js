(function () {
  "use strict";
  const api = window.RecepcionAPI;
  let reservations = [];
  let selectedReservation = null;

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value ?? "—";
  }

  function calculateNights(start, end) {
    const difference = new Date(`${end}T12:00:00`) - new Date(`${start}T12:00:00`);
    return Math.max(1, Math.round(difference / 86400000));
  }

  function renderReservations() {
    const body = document.getElementById("checkout-reservations-body");
    if (!body) return;
    body.innerHTML = reservations.length
      ? reservations
          .map(
            (item) => `<tr>
              <td><strong>${api.escapeHtml(item.codigo_reserva)}</strong></td>
              <td>${api.escapeHtml(item.huesped)}</td>
              <td>${api.escapeHtml(item.habitacion || "—")}</td>
              <td>${api.escapeHtml(item.tipo_habitacion || "—")}</td>
              <td>${api.formatearFecha(item.fecha_entrada)}</td>
              <td>${api.formatearFecha(item.fecha_salida)}</td>
              <td><span class="badge bg-primary">Check-in</span></td>
              <td class="text-end"><button class="btn btn-sm btn-primary select-checkout-reservation" type="button" data-id="${
                item.id_reservacion
              }">Seleccionar huésped</button></td>
            </tr>`
          )
          .join("")
      : '<tr><td colspan="8" class="text-center text-muted">No existen estadías activas.</td></tr>';
  }

  function selectReservation(id) {
    selectedReservation = reservations.find(
      (item) => item.id_reservacion === Number(id)
    );
    if (!selectedReservation) return;
    const nights = calculateNights(
      selectedReservation.fecha_entrada,
      selectedReservation.fecha_salida
    );
    setText("checkout-stay-guest", selectedReservation.huesped);
    setText("checkout-stay-document", selectedReservation.documento);
    setText("checkout-stay-room", selectedReservation.habitacion);
    setText("checkout-stay-type", selectedReservation.tipo_habitacion);
    setText(
      "checkout-stay-arrival",
      api.formatearFecha(selectedReservation.fecha_entrada)
    );
    setText(
      "checkout-stay-departure",
      api.formatearFecha(selectedReservation.fecha_salida)
    );
    setText("checkout-stay-nights", nights);
    const rate = Number(selectedReservation.tarifa_noche || 0);
    document.getElementById("checkout-night-rate").value =
      rate || selectedReservation.tarifa_noche || 0;
    document.getElementById("checkout-nights").value = nights;
    updateTotals();
    api.mostrarAlertaBootstrap(
      "#checkout-alerts",
      "info",
      `Estadía ${selectedReservation.codigo_reserva} seleccionada.`
    );
  }

  function updateTotals() {
    const nights = Number(document.getElementById("checkout-nights")?.value || 0);
    const rate = Number(
      document.getElementById("checkout-night-rate")?.value || 0
    );
    const services = Number(
      document.getElementById("checkout-services")?.value || 0
    );
    const discounts = Number(
      document.getElementById("checkout-discounts")?.value || 0
    );
    const subtotal = nights * rate;
    const total = subtotal + services - discounts;
    setText("checkout-subtotal", api.formatearMonedaBOB(subtotal));
    setText("checkout-services-total", api.formatearMonedaBOB(services));
    setText("checkout-discounts-total", api.formatearMonedaBOB(discounts));
    setText("checkout-total", api.formatearMonedaBOB(total));
    setText(
      "checkout-summary-code",
      selectedReservation?.codigo_reserva || "—"
    );
    setText("checkout-summary-guest", selectedReservation?.huesped || "—");
    setText(
      "checkout-summary-room",
      selectedReservation
        ? `${selectedReservation.habitacion} · ${selectedReservation.tipo_habitacion}`
        : "—"
    );
    setText("checkout-summary-total", api.formatearMonedaBOB(total));
  }

  async function finalizar() {
    if (!selectedReservation) {
      return api.mostrarAlertaBootstrap(
        "#checkout-alerts",
        "warning",
        "Seleccione una estadía antes de finalizar el check-out."
      );
    }
    const data = {
      id_reservacion: selectedReservation.id_reservacion,
      id_habitacion: selectedReservation.id_habitacion,
      id_huesped: selectedReservation.id_huesped,
      noches: Number(document.getElementById("checkout-nights").value),
      tarifa_noche: Number(
        document.getElementById("checkout-night-rate").value
      ),
      servicios_adicionales: Number(
        document.getElementById("checkout-services").value
      ),
      descuentos: Number(
        document.getElementById("checkout-discounts").value
      ),
      usuario_responsable:
        window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
      observaciones:
        document.getElementById("checkout-observations")?.value || "",
    };
    try {
      await api.apiPost("/checkout", data);
      api.mostrarAlertaBootstrap(
        "#checkout-alerts",
        "success",
        "Check-out registrado correctamente."
      );
      selectedReservation = null;
      await cargar();
    } catch (error) {
      api.mostrarAlertaBootstrap("#checkout-alerts", "danger", error.message);
    }
  }

  async function cargar() {
    try {
      reservations = await api.apiGet("/reservaciones?estado=checkin");
      setText("checkout-pending-count", reservations.length);
      renderReservations();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#checkout-alerts",
        "danger",
        "No se pudieron cargar las estadías activas."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("checkout-reservations-body")
      ?.addEventListener("click", (event) => {
        const button = event.target.closest(".select-checkout-reservation");
        if (button) selectReservation(button.dataset.id);
      });
    [
      "checkout-nights",
      "checkout-night-rate",
      "checkout-services",
      "checkout-discounts",
    ].forEach((id) =>
      document.getElementById(id)?.addEventListener("input", updateTotals)
    );
    document
      .getElementById("confirm-checkout-button")
      ?.addEventListener("click", finalizar);
    cargar();
  });
})();
