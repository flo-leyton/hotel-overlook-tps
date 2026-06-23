(function () {
  "use strict";
  const api = window.RecepcionAPI;

  function selectRoom(event) {
    const button = event.target.closest(".room-request");
    if (button) {
      const select = document.getElementById("tipoHabitacion");
      if (select) select.value = button.dataset.room || "";
    }
  }

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    data.adultos = Number(data.adultos || 1);
    data.ninos = Number(data.ninos || 0);
    data.origen_reserva = "landing";
    data.estado_reserva = "pendiente";

    if (!data.correo && !data.telefono) {
      return api.mostrarAlertaBootstrap(
        "#landing-reservation-alerts",
        "warning",
        "Ingrese al menos un correo o teléfono de contacto."
      );
    }

    try {
      const response = await api.apiPost("/reservaciones/publica", data);
      api.mostrarAlertaBootstrap(
        "#landing-reservation-alerts",
        "success",
        `Solicitud enviada correctamente. Tu código de reserva es ${response.codigo_reserva}. Recepción revisará disponibilidad y se comunicará contigo.`
      );
      form.reset();
      form.classList.remove("was-validated");
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#landing-reservation-alerts",
        "danger",
        error.message || "No se pudo conectar con el backend."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", selectRoom);
    document
      .getElementById("publicReservationForm")
      ?.addEventListener("submit", submit);
  });
})();
