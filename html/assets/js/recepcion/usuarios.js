(function () {
  "use strict";
  const api = window.RecepcionAPI;
  let usuarios = [];
  let roles = [];

  const badgeEstado = {
    activo: "bg-success",
    inactivo: "bg-secondary",
    bloqueado: "bg-danger",
  };

  function actualizarMetricas() {
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("users-active", usuarios.filter((u) => u.estado === "activo").length);
    set("users-supervisors", usuarios.filter((u) => u.rol === "Supervisor de recepción").length);
    set("users-receptionists", usuarios.filter((u) => u.rol === "Recepcionista").length);
    set("users-blocked", usuarios.filter((u) => u.estado === "bloqueado").length);
  }

  function render() {
    const body = document.getElementById("usuarios-table-body");
    body.innerHTML = usuarios.map((u) => `<tr>
      <td><strong>${api.escapeHtml(u.nombre_completo)}</strong></td>
      <td>${api.escapeHtml(u.correo)}</td>
      <td><span class="badge bg-primary-subtle text-primary">${api.escapeHtml(u.rol)}</span></td>
      <td><span class="badge ${badgeEstado[u.estado]}">${api.escapeHtml(u.estado)}</span></td>
      <td>${api.formatearFecha(u.ultimo_acceso, true)}</td>
      <td class="text-end"><div class="table-actions">
        <button class="btn btn-sm btn-outline-primary edit-user" data-id="${u.id_usuario}" data-bs-toggle="offcanvas" data-bs-target="#userForm">Editar</button>
        <button class="btn btn-sm btn-outline-warning reset-password" data-id="${u.id_usuario}">Contraseña</button>
        <button class="btn btn-sm btn-outline-danger change-state" data-id="${u.id_usuario}" data-state="${u.estado === "bloqueado" ? "activo" : "bloqueado"}">${u.estado === "bloqueado" ? "Activar" : "Bloquear"}</button>
      </div></td>
    </tr>`).join("");
    actualizarMetricas();
  }

  async function cargar() {
    try {
      [usuarios, roles] = await Promise.all([api.apiGet("/usuarios"), api.apiGet("/roles")]);
      document.getElementById("userRole").innerHTML = roles.map(
        (r) => `<option value="${r.id_rol}">${api.escapeHtml(r.nombre)}</option>`
      ).join("");
      render();
    } catch (error) {
      api.mostrarAlertaBootstrap("#usuarios-alerts", "danger", error.message);
    }
  }

  function abrirEdicion(usuario) {
    document.getElementById("userId").value = usuario?.id_usuario || "";
    document.getElementById("userName").value = usuario?.nombre_completo || "";
    document.getElementById("userEmail").value = usuario?.correo || "";
    document.getElementById("userPassword").value = "";
    document.getElementById("userPassword").required = !usuario;
    document.getElementById("userRole").value = usuario?.id_rol || roles[0]?.id_rol || "";
    document.getElementById("userStatus").value = usuario?.estado || "activo";
    document.getElementById("userFormLabel").textContent = usuario ? "Editar usuario" : "Crear usuario";
  }

  async function guardar(event) {
    event.preventDefault();
    const form = event.currentTarget;
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;
    const id = document.getElementById("userId").value;
    const base = {
      nombre_completo: document.getElementById("userName").value.trim(),
      correo: document.getElementById("userEmail").value.trim(),
    };
    try {
      if (id) {
        await api.apiPut(`/usuarios/${id}`, base);
        const actual = usuarios.find((u) => u.id_usuario === Number(id));
        const rol = Number(document.getElementById("userRole").value);
        const estado = document.getElementById("userStatus").value;
        if (actual.id_rol !== rol) await api.apiPatch(`/usuarios/${id}/rol`, { id_rol: rol });
        if (actual.estado !== estado) await api.apiPatch(`/usuarios/${id}/estado`, { estado });
        const password = document.getElementById("userPassword").value;
        if (password) await api.apiPatch(`/usuarios/${id}/password`, { password });
      } else {
        await api.apiPost("/usuarios", {
          ...base,
          password: document.getElementById("userPassword").value,
          id_rol: Number(document.getElementById("userRole").value),
          estado: document.getElementById("userStatus").value,
        });
      }
      bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("userForm")).hide();
      form.reset();
      form.classList.remove("was-validated");
      await cargar();
      api.mostrarAlertaBootstrap("#usuarios-alerts", "success", "Usuario guardado correctamente.");
    } catch (error) {
      api.mostrarAlertaBootstrap("#user-form-alerts", "danger", error.message);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("user-data-form")?.addEventListener("submit", guardar);
    document.querySelector('[data-bs-target="#userForm"]')?.addEventListener("click", () => abrirEdicion(null));
    document.getElementById("usuarios-table-body")?.addEventListener("click", async (event) => {
      const edit = event.target.closest(".edit-user");
      if (edit) abrirEdicion(usuarios.find((u) => u.id_usuario === Number(edit.dataset.id)));
      const state = event.target.closest(".change-state");
      if (state) {
        try {
          await api.apiPatch(`/usuarios/${state.dataset.id}/estado`, { estado: state.dataset.state });
          await cargar();
        } catch (error) {
          api.mostrarAlertaBootstrap("#usuarios-alerts", "danger", error.message);
        }
      }
      const reset = event.target.closest(".reset-password");
      if (reset) {
        const password = window.prompt("Nueva contraseña temporal (mínimo 8 caracteres):");
        if (password) {
          try {
            await api.apiPatch(`/usuarios/${reset.dataset.id}/password`, { password });
            api.mostrarAlertaBootstrap("#usuarios-alerts", "success", "Contraseña actualizada.");
          } catch (error) {
            api.mostrarAlertaBootstrap("#usuarios-alerts", "danger", error.message);
          }
        }
      }
    });
    cargar();
  });
})();
