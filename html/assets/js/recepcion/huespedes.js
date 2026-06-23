(function () {
  "use strict";
  const api = window.RecepcionAPI;
  let guests = [];
  let editingId = null;

  function render() {
    const body = document.getElementById("huespedes-table-body");
    if (!body) return;
    const search =
      document.getElementById("guestSearch")?.value.toLowerCase() || "";
    const filtered = guests.filter(
      (guest) =>
        guest.nombre_completo.toLowerCase().includes(search) ||
        guest.documento.toLowerCase().includes(search) ||
        (guest.correo || "").toLowerCase().includes(search)
    );
    body.innerHTML = filtered.length
      ? filtered
          .map(
            (guest) => `<tr>
              <td><strong>${api.escapeHtml(guest.documento)}</strong></td>
              <td>${api.escapeHtml(guest.nombre_completo)}</td>
              <td>${api.escapeHtml(guest.nacionalidad || "—")}</td>
              <td>${api.escapeHtml(guest.telefono || "—")}</td>
              <td>${guest.correo ? `<a href="mailto:${api.escapeHtml(
                guest.correo
              )}">${api.escapeHtml(guest.correo)}</a>` : "—"}</td>
              <td>${api.escapeHtml(guest.ciudad_origen || "—")}</td>
              <td><span class="badge bg-success">Registrado</span></td>
              <td>—</td>
              <td class="text-end">
                <div class="table-actions">
                <button class="btn btn-sm btn-outline-secondary edit-guest" type="button"
                  data-id="${guest.id_huesped}" data-bs-toggle="offcanvas"
                  data-bs-target="#guestForm">Editar</button>
                <a class="btn btn-sm btn-outline-success" href="reservaciones.html">Crear reserva</a>
                </div>
              </td>
            </tr>`
          )
          .join("")
      : '<tr><td colspan="9" class="text-center text-muted">No se encontraron huéspedes.</td></tr>';
  }

  async function cargar() {
    try {
      guests = await api.apiGet("/huespedes");
      document.getElementById("guests-total").textContent = guests.length;
      render();
    } catch (error) {
      api.mostrarAlertaBootstrap(
        "#huespedes-alerts",
        "danger",
        "No se pudieron cargar los huéspedes."
      );
    }
  }

  function fillForm(guest) {
    editingId = guest?.id_huesped || null;
    const values = {
      guestName: guest?.nombre_completo || "",
      guestDocument: guest?.documento || "",
      guestCountry: guest?.nacionalidad || "",
      guestPhone: guest?.telefono || "",
      guestEmail: guest?.correo || "",
      guestCity: guest?.ciudad_origen || "",
      guestBirth: guest?.fecha_nacimiento || "",
      guestNotes: guest?.observaciones || "",
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.value = value;
    });
  }

  async function guardar(event) {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;
    const data = {
      nombre_completo: document.getElementById("guestName").value.trim(),
      documento: document.getElementById("guestDocument").value.trim(),
      nacionalidad: document.getElementById("guestCountry").value,
      telefono: document.getElementById("guestPhone").value.trim(),
      correo: document.getElementById("guestEmail").value.trim(),
      ciudad_origen: document.getElementById("guestCity").value.trim(),
      fecha_nacimiento: document.getElementById("guestBirth").value || null,
      observaciones: document.getElementById("guestNotes").value.trim(),
      usuario_responsable:
        window.RecepcionAuth?.obtenerUsuario()?.id_usuario || null,
    };
    try {
      if (editingId) await api.apiPut(`/huespedes/${editingId}`, data);
      else await api.apiPost("/huespedes", data);
      api.mostrarAlertaBootstrap(
        "#huespedes-alerts",
        "success",
        editingId
          ? "Huésped actualizado correctamente."
          : "Huésped registrado correctamente."
      );
      bootstrap.Offcanvas.getOrCreateInstance(
        document.getElementById("guestForm")
      ).hide();
      form.reset();
      form.classList.remove("was-validated");
      editingId = null;
      await cargar();
    } catch (error) {
      api.mostrarAlertaBootstrap("#guest-form-alerts", "danger", error.message);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("guestSearch")?.addEventListener("input", render);
    document
      .getElementById("guest-data-form")
      ?.addEventListener("submit", guardar);
    document
      .getElementById("huespedes-table-body")
      ?.addEventListener("click", (event) => {
        const button = event.target.closest(".edit-guest");
        if (button) {
          fillForm(
            guests.find(
              (guest) => guest.id_huesped === Number(button.dataset.id)
            )
          );
        }
      });
    document
      .querySelector('[data-bs-target="#guestForm"]')
      ?.addEventListener("click", (event) => {
        if (!event.target.closest(".edit-guest")) fillForm(null);
      });
    cargar();
  });
})();
