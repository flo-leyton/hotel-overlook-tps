(function (global) {
  "use strict";

  const API_BASE_URL = "http://localhost:3000/api";

  async function apiRequest(endpoint, options) {
    try {
      const usuario = window.RecepcionAuth?.obtenerUsuario();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(usuario ? { "x-user-id": String(usuario.id_usuario) } : {}),
          ...(options?.headers || {}),
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "La operación no pudo completarse.");
      }
      return payload.data !== undefined ? payload.data : payload;
    } catch (error) {
      console.error(`Error API ${endpoint}:`, error);
      if (error instanceof TypeError) {
        throw new Error("No se pudo conectar con el backend.");
      }
      throw error;
    }
  }

  function apiGet(endpoint) {
    return apiRequest(endpoint, { method: "GET" });
  }
  function apiPost(endpoint, data) {
    return apiRequest(endpoint, { method: "POST", body: JSON.stringify(data) });
  }
  function apiPut(endpoint, data) {
    return apiRequest(endpoint, { method: "PUT", body: JSON.stringify(data) });
  }
  function apiPatch(endpoint, data) {
    return apiRequest(endpoint, { method: "PATCH", body: JSON.stringify(data) });
  }

  function mostrarAlertaBootstrap(contenedor, tipo, mensaje) {
    const element =
      typeof contenedor === "string"
        ? document.querySelector(contenedor)
        : contenedor;
    if (!element) return;
    element.innerHTML = `<div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${escapeHtml(mensaje)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>`;
  }

  function formatearFecha(value, includeTime) {
    if (!value) return "—";
    const stringValue = String(value);
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(stringValue);
    const isSqliteUtc = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
      stringValue
    );
    const normalized = isDateOnly
      ? `${stringValue}T12:00:00`
      : isSqliteUtc
        ? `${stringValue.replace(" ", "T")}Z`
      : stringValue.includes("T")
        ? stringValue
        : stringValue.replace(" ", "T");
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("es-BO", {
      dateStyle: "short",
      ...(includeTime ? { timeStyle: "short" } : {}),
      ...(!isDateOnly ? { timeZone: "America/La_Paz" } : {}),
    }).format(date);
  }

  function formatearMonedaBOB(value) {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function obtenerFechaISOHotel(value = new Date()) {
    const stringValue = String(value);
    const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
      stringValue
    )
      ? `${stringValue.replace(" ", "T")}Z`
      : value;
    const date = normalized instanceof Date ? normalized : new Date(normalized);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/La_Paz",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const getPart = (type) => parts.find((part) => part.type === type)?.value;
    return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  global.RecepcionAPI = {
    API_BASE_URL,
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    mostrarAlertaBootstrap,
    formatearFecha,
    formatearMonedaBOB,
    obtenerFechaISOHotel,
    escapeHtml,
  };
})(window);
