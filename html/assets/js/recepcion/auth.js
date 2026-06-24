(function (global) {
  "use strict";

  const STORAGE_KEY = "hotel_overlook_usuario";
  function resolverApiBaseUrl() {
    const { protocol, hostname, port } = global.location;
    const esLiveServer =
      protocol === "file:" ||
      ["5500", "5501", "5502"].includes(port) ||
      (hostname === "127.0.0.1" && port !== "3000") ||
      (hostname === "localhost" && port && port !== "3000");
    return esLiveServer ? "http://localhost:3000/api" : "/api";
  }

  const API_BASE_URL = resolverApiBaseUrl();
  const HTML_PREFIX = global.location.pathname.includes("/html/")
    ? global.location.pathname.slice(
        0,
        global.location.pathname.indexOf("/html/") + "/html/".length
      )
    : "/";
  const LOGIN_PATH = `${HTML_PREFIX}dashboard/auth/sign-in.html`;
  const DASHBOARD_PATH = `${HTML_PREFIX}dashboard/recepcion/dashboard-recepcion.html`;

  function obtenerUsuario() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function guardarUsuario(usuario) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
  }

  function cerrarSesionLocal() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  function esAdministrador(usuario = obtenerUsuario()) {
    return usuario?.rol === "Administrador";
  }

  function esSupervisor(usuario = obtenerUsuario()) {
    return usuario?.rol === "Supervisor de recepción";
  }

  function puede(permiso, usuario = obtenerUsuario()) {
    if (!usuario) return false;
    if (esAdministrador(usuario)) return true;
    const supervisor = esSupervisor(usuario);
    const permisos = {
      ver_usuarios: false,
      gestionar_tarifas: supervisor,
      cancelar_reserva: supervisor,
      ver_operaciones: true,
    };
    return Boolean(permisos[permiso]);
  }

  async function login(correo, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "No fue posible iniciar sesión.");
    guardarUsuario(payload.usuario);
    return payload.usuario;
  }

  async function logout() {
    const usuario = obtenerUsuario();
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(usuario ? { "x-user-id": String(usuario.id_usuario) } : {}),
        },
      });
    } finally {
      cerrarSesionLocal();
      global.location.href = LOGIN_PATH;
    }
  }

  function protegerPagina() {
    const esLogin = global.location.pathname.endsWith("/dashboard/auth/sign-in.html");
    const esRecepcion = global.location.pathname.includes("/dashboard/recepcion/");
    const usuario = obtenerUsuario();
    if (esRecepcion && !usuario) {
      global.location.replace(LOGIN_PATH);
      return false;
    }
    if (esLogin && usuario) {
      global.location.replace(DASHBOARD_PATH);
      return false;
    }
    if (
      esRecepcion &&
      global.location.pathname.endsWith("/usuarios.html") &&
      !esAdministrador(usuario)
    ) {
      global.location.replace(DASHBOARD_PATH);
      return false;
    }
    if (
      esRecepcion &&
      global.location.pathname.endsWith("/tarifas.html") &&
      usuario?.rol === "Recepcionista"
    ) {
      global.location.replace(DASHBOARD_PATH);
      return false;
    }
    return true;
  }

  global.RecepcionAuth = {
    STORAGE_KEY,
    obtenerUsuario,
    guardarUsuario,
    cerrarSesionLocal,
    esAdministrador,
    esSupervisor,
    puede,
    login,
    logout,
    protegerPagina,
  };

  protegerPagina();
})(window);
