(function () {
  "use strict";

  const sidebarIcons = {
    dashboard: `<svg class="icon-20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path opacity="0.4" d="M16.0756 2H19.4616C20.8639 2 22.0001 3.14585 22.0001 4.55996V7.97452C22.0001 9.38864 20.8639 10.5345 19.4616 10.5345H16.0756C14.6734 10.5345 13.5371 9.38864 13.5371 7.97452V4.55996C13.5371 3.14585 14.6734 2 16.0756 2Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M4.53852 2H7.92449C9.32676 2 10.463 3.14585 10.463 4.55996V7.97452C10.463 9.38864 9.32676 10.5345 7.92449 10.5345H4.53852C3.13626 10.5345 2 9.38864 2 7.97452V4.55996C2 3.14585 3.13626 2 4.53852 2ZM4.53852 13.4655H7.92449C9.32676 13.4655 10.463 14.6114 10.463 16.0255V19.44C10.463 20.8532 9.32676 22 7.92449 22H4.53852C3.13626 22 2 20.8532 2 19.44V16.0255C2 14.6114 3.13626 13.4655 4.53852 13.4655ZM19.4615 13.4655H16.0755C14.6732 13.4655 13.537 14.6114 13.537 16.0255V19.44C13.537 20.8532 14.6732 22 16.0755 22H19.4615C20.8637 22 22 20.8532 22 19.44V16.0255C22 14.6114 20.8637 13.4655 19.4615 13.4655Z" fill="currentColor"/></svg>`,
    operations: `<svg class="icon-20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path opacity="0.4" d="M10.0833 15.958H3.50777C2.67555 15.958 2 16.6217 2 17.4393C2 18.2559 2.67555 18.9207 3.50777 18.9207H10.0833C10.9155 18.9207 11.5911 18.2559 11.5911 17.4393C11.5911 16.6217 10.9155 15.958 10.0833 15.958Z" fill="currentColor"/><path opacity="0.4" d="M22.0001 6.37867C22.0001 5.56214 21.3246 4.89844 20.4934 4.89844H13.9179C13.0857 4.89844 12.4102 5.56214 12.4102 6.37867C12.4102 7.1963 13.0857 7.86 13.9179 7.86H20.4934C21.3246 7.86 22.0001 7.1963 22.0001 6.37867Z" fill="currentColor"/><path d="M8.87774 6.37856C8.87774 8.24523 7.33886 9.75821 5.43887 9.75821C3.53999 9.75821 2 8.24523 2 6.37856C2 4.51298 3.53999 3 5.43887 3C7.33886 3 8.87774 4.51298 8.87774 6.37856Z" fill="currentColor"/><path d="M21.9998 17.3992C21.9998 19.2648 20.4609 20.7777 18.5609 20.7777C16.6621 20.7777 15.1221 19.2648 15.1221 17.3992C15.1221 15.5325 16.6621 14.0195 18.5609 14.0195C20.4609 14.0195 21.9998 15.5325 21.9998 17.3992Z" fill="currentColor"/></svg>`,
    hotel: `<svg class="icon-20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path opacity="0.4" d="M16.191 2H7.81C4.77 2 3 3.78 3 6.83V17.16C3 20.26 4.77 22 7.81 22H16.191C19.28 22 21 20.26 21 17.16V6.83C21 3.78 19.28 2 16.191 2Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M8.07996 6.6499C7.64896 6.6499 7.29996 6.9999 7.29996 7.4399C7.29996 7.8699 7.64896 8.2199 8.07996 8.2199H11.069C11.5 8.2199 11.85 7.8699 11.85 7.4289C11.85 6.9999 11.5 6.6499 11.069 6.6499H8.07996ZM15.92 12.7399H8.07996C7.64896 12.7399 7.29996 12.3899 7.29996 11.9599C7.29996 11.5299 7.64896 11.1789 8.07996 11.1789H15.92C16.35 11.1789 16.7 11.5299 16.7 11.9599C16.7 12.3899 16.35 12.7399 15.92 12.7399ZM15.92 17.3099H8.07996C7.64896 17.3099 7.29996 16.9599 7.29996 16.5299C7.29996 16.0999 7.64896 15.7399 8.07996 15.7399H15.92C16.35 15.7399 16.7 16.0999 16.7 16.5299C16.7 16.9599 16.35 17.3099 15.92 17.3099Z" fill="currentColor"/></svg>`,
    control: `<svg class="icon-20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path opacity="0.4" d="M12.0865 22C11.9627 22 11.8388 21.9716 11.7271 21.9137L8.12599 20.0496C7.10415 19.5201 6.30481 18.9259 5.68063 18.2336C4.31449 16.7195 3.5544 14.776 3.54232 12.7599L3.50004 6.12426C3.495 5.35842 3.98931 4.67103 4.72826 4.41215L11.3405 2.10679C11.7331 1.96656 12.1711 1.9646 12.5707 2.09992L19.2081 4.32684C19.9511 4.57493 20.4535 5.25742 20.4575 6.02228L20.4998 12.6628C20.5129 14.676 19.779 16.6274 18.434 18.1581C17.8168 18.8602 17.0245 19.4632 16.0128 20.0025L12.4439 21.9088C12.3331 21.9686 12.2103 21.999 12.0865 22Z" fill="currentColor"/><path d="M11.3194 14.3209C11.1261 14.3219 10.9328 14.2523 10.7838 14.1091L8.86695 12.2656C8.57097 11.9793 8.56795 11.5145 8.86091 11.2262C9.15387 10.9369 9.63207 10.934 9.92906 11.2193L11.3083 12.5451L14.6758 9.22479C14.9698 8.93552 15.448 8.93258 15.744 9.21793C16.041 9.50426 16.044 9.97004 15.751 10.2574L11.8519 14.1022C11.7049 14.2474 11.5127 14.3199 11.3194 14.3209Z" fill="currentColor"/></svg>`,
    user: `<svg class="icon-20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11.9488 14.54C8.49884 14.54 5.58789 15.1038 5.58789 17.2795C5.58789 19.4562 8.51765 20.0001 11.9488 20.0001C15.3988 20.0001 18.3098 19.4364 18.3098 17.2606C18.3098 15.084 15.38 14.54 11.9488 14.54Z" fill="currentColor"/><path opacity="0.4" d="M11.949 12.467C14.2851 12.467 16.1583 10.5831 16.1583 8.23351C16.1583 5.88306 14.2851 4 11.949 4C9.61293 4 7.73975 5.88306 7.73975 8.23351C7.73975 10.5831 9.61293 12.467 11.949 12.467Z" fill="currentColor"/></svg>`,
    wallet: `<svg class="icon-20" width="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.9964 8.37513H17.7618C15.7911 8.37859 14.1947 9.93514 14.1911 11.8566C14.1884 13.7823 15.7867 15.3458 17.7618 15.3484H22V15.6543C22 19.0136 19.9636 21 16.5173 21H7.48356C4.03644 21 2 19.0136 2 15.6543V8.33786C2 4.97862 4.03644 3 7.48356 3H16.5138C19.96 3 21.9964 4.97862 21.9964 8.33786V8.37513Z" fill="currentColor"/><path opacity="0.4" d="M16.0374 12.2966C16.2465 13.2478 17.0805 13.917 18.0326 13.8996H21.2825C21.6787 13.8996 22 13.5715 22 13.166V10.6344C21.9991 10.2297 21.6787 9.90077 21.2825 9.8999H17.9561C16.8731 9.90338 15.9983 10.8024 16 11.9102C16 12.0398 16.0128 12.1695 16.0374 12.2966Z" fill="currentColor"/></svg>`
  };

  const menuGroups = [
    ["sidebar-operacion", "Operación diaria", sidebarIcons.operations, [
      ["reservaciones.html", "Reservaciones", "R", sidebarIcons.dashboard],
      ["checkin.html", "Check-in", "CI", sidebarIcons.user],
      ["checkout.html", "Check-out", "CO", sidebarIcons.wallet]
    ]],
    ["sidebar-gestion", "Gestión hotelera", sidebarIcons.hotel, [
      ["habitaciones.html", "Habitaciones", "H", sidebarIcons.hotel],
      ["huespedes.html", "Huéspedes", "HU", sidebarIcons.user],
      ["solicitudes.html", "Solicitudes", "S", sidebarIcons.operations]
    ]],
    ["sidebar-control", "Configuración", sidebarIcons.control, [
      ["operaciones.html", "Operaciones", "O", sidebarIcons.operations],
      ["usuarios.html", "Usuarios", "U", sidebarIcons.user],
      ["tarifas.html", "Tarifas", "T", sidebarIcons.wallet]
    ]]
  ];

  const metricIcons = {
    room: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path opacity=".4" d="M4 21V6.5C4 4.57 5.57 3 7.5 3h9C18.43 3 20 4.57 20 6.5V21H4Z" fill="currentColor"/><path d="M8 8h3v3H8V8Zm5 0h3v3h-3V8Zm-5 5h3v3H8v-3Zm5 0h3v3h-3v-3ZM2 21h20M9 21v-3h6v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    available: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle opacity=".4" cx="12" cy="12" r="10" fill="currentColor"/><path d="m7.5 12.3 3 3 6-6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    occupied: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path opacity=".4" d="M4 11h16v8H4v-8Z" fill="currentColor"/><path d="M4 18v-7h16v7M4 15H2v5m18-5h2v5M7 11V7h5a3 3 0 0 1 3 3v1M4 20h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    calendar: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path opacity=".4" d="M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z" fill="currentColor"/><path d="M7 3v4m10-4v4M4 9h16M8 13h3m2 0h3m-8 4h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    cleaning: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path opacity=".4" d="m15 4 5 5-9 9H6v-5l9-9Z" fill="currentColor"/><path d="m4 20 6-6m2-2 6-6m-2-2 4 4M8 14l2 2m-5 4h6M6 6l.6 1.4L8 8l-1.4.6L6 10l-.6-1.4L4 8l1.4-.6L6 6Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    maintenance: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path opacity=".4" d="m13 8 5-5 3 3-5 5-3-3Z" fill="currentColor"/><path d="m14 7 3-3 3 3-3 3m-3-3-9 9a2.1 2.1 0 0 0 3 3l9-9M5 5l4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    guest: sidebarIcons.user,
    guestAdd: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path opacity=".4" d="M9.5 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="currentColor"/><path d="M9.5 15C5.45 15 2 15.65 2 18.25S5.43 21.5 9.5 21.5c2.04 0 3.91-.16 5.27-.66M19 8v6m-3-3h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    globe: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle opacity=".4" cx="12" cy="12" r="10" fill="currentColor"/><path d="M2 12h20M12 2c2.5 2.74 3.8 6.08 3.8 10S14.5 19.26 12 22C9.5 19.26 8.2 15.92 8.2 12S9.5 4.74 12 2Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
    pending: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle opacity=".4" cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    confirmed: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path opacity=".4" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="currentColor"/><path d="m7.5 12.5 3 3 6-6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    cancelled: `<svg class="icon-24" width="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle opacity=".4" cx="12" cy="12" r="10" fill="currentColor"/><path d="m8 8 8 8m0-8-8 8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`,
    rate: sidebarIcons.wallet
  };

  function getMetricIcon(card) {
    const label = (
      card.querySelector("p.text-muted, .card-title")?.textContent || ""
    ).toLocaleLowerCase("es");

    if (label.includes("disponible")) return metricIcons.available;
    if (label.includes("ocupada")) return metricIcons.occupied;
    if (label.includes("limpieza")) return metricIcons.cleaning;
    if (label.includes("mantenimiento")) return metricIcons.maintenance;
    if (label.includes("cancelada")) return metricIcons.cancelled;
    if (label.includes("confirmada")) return metricIcons.confirmed;
    if (label.includes("pendiente")) return metricIcons.pending;
    if (label.includes("check-in") || label.includes("reserv")) return metricIcons.calendar;
    if (label.includes("nuevo")) return metricIcons.guestAdd;
    if (label.includes("extranjero")) return metricIcons.globe;
    if (label.includes("huésped") || label.includes("huesped")) return metricIcons.guest;
    if (label.includes("tarifa") || label.includes("simple") || label.includes("doble") || label.includes("suite")) return metricIcons.rate;
    if (label.includes("habitación") || label.includes("habitacion")) return metricIcons.room;
    return metricIcons.room;
  }

  const body = document.body;
  const activeUser = window.RecepcionAuth?.obtenerUsuario() || {
    nombre_completo: "Usuario no identificado",
    rol: "Sin sesión",
  };
  const roleKey = String(activeUser.rol || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const activeAvatar = roleKey.includes("administrador")
    ? "../../assets/images/auth/admin-avatar.jpg"
    : roleKey.includes("supervisor")
      ? "../../assets/images/auth/supervisor-avatar.png"
      : roleKey.includes("recepcionista")
        ? "../../assets/images/auth/recepcionista-avatar.png"
        : "../../assets/images/avatars/01.png";
  const OVERLOOK_TIME_ZONE = "America/La_Paz";

  function getHotelDate() {
    return new Date();
  }

  function getActiveShift(date = getHotelDate()) {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: OVERLOOK_TIME_ZONE,
        hour: "2-digit",
        hourCycle: "h23",
      }).format(date)
    );
    if (hour >= 6 && hour < 14) return "Turno mañana";
    if (hour >= 14 && hour < 22) return "Turno tarde";
    return "Turno noche";
  }

  function updateOperationalContext() {
    const now = getHotelDate();
    const dateText = new Intl.DateTimeFormat("es-BO", {
      timeZone: OVERLOOK_TIME_ZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
    const timeText = new Intl.DateTimeFormat("es-BO", {
      timeZone: OVERLOOK_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const dateTimeText = `${dateText} · ${timeText}`;
    const activeShift = getActiveShift(now);

    document.querySelectorAll("[data-active-user-name]").forEach((element) => {
      element.textContent = activeUser.nombre_completo;
    });
    document.querySelectorAll("[data-active-user-role]").forEach((element) => {
      element.textContent = activeUser.rol;
    });
    document.querySelectorAll("[data-active-shift]").forEach((element) => {
      element.textContent = activeShift;
    });
    document.querySelectorAll("[data-current-date]").forEach((element) => {
      element.textContent = dateText;
    });
    document.querySelectorAll("[data-current-time]").forEach((element) => {
      element.textContent = timeText;
    });
    document.querySelectorAll("[data-current-datetime]").forEach((element) => {
      element.textContent = dateTimeText;
    });

    const navbarRole = document.querySelector(".caption-sub-title");
    if (navbarRole) navbarRole.textContent = `${activeUser.rol} · ${activeShift}`;
  }
  const currentPage = body.dataset.page;
  const pageTitle = body.dataset.title;
  const pageDescription = body.dataset.description;
  const pageContent = document.getElementById("page-content");
  body.classList.add("hotel-overlook-tps");

  const arrowIcon = `<svg class="icon-18" xmlns="http://www.w3.org/2000/svg" width="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
  const dashboardActive = currentPage === "dashboard-recepcion.html";
  const menu = menuGroups.map(function (group) {
    const groupActive = group[3].some(function (page) {
      return page[0] === currentPage;
    });
    const children = group[3].map(function (page) {
      if (page[0] === "usuarios.html" && activeUser.rol !== "Administrador") {
        return "";
      }
      if (page[0] === "tarifas.html" && activeUser.rol === "Recepcionista") {
        return "";
      }
      const isActive = page[0] === currentPage;
      return `
        <li class="nav-item">
          <a class="nav-link ${isActive ? "active" : ""}" href="${page[0]}" ${isActive ? 'aria-current="page"' : ""}>
            <i class="icon reception-submenu-icon">${page[3]}</i>
            <i class="sidenav-mini-icon">${page[2]}</i>
            <span class="item-name">${page[1]}</span>
          </a>
        </li>`;
    }).join("");
    return `
      <li class="nav-item">
        <a class="nav-link ${groupActive ? "active" : ""}" data-bs-toggle="collapse" href="#${group[0]}" role="button"
          aria-expanded="${groupActive ? "true" : "false"}" aria-controls="${group[0]}"
          data-sidebar-toggle="tooltip" data-bs-placement="right" title="${group[1]}">
          <i class="icon reception-sidebar-icon">${group[2]}</i>
          <span class="item-name">${group[1]}</span>
          <i class="right-icon">${arrowIcon}</i>
        </a>
        <ul class="sub-nav collapse ${groupActive ? "show" : ""}" id="${group[0]}" data-bs-parent="#sidebar-menu">
          ${children}
        </ul>
      </li>`;
  }).join("");

  body.insertAdjacentHTML("afterbegin", `
    <div id="loading">
      <div class="loader simple-loader"><div class="loader-body"></div></div>
    </div>
    <aside class="sidebar sidebar-default sidebar-white sidebar-base navs-rounded-all">
      <div class="sidebar-header d-flex align-items-center justify-content-start">
        <a href="dashboard-recepcion.html" class="navbar-brand">
          <div class="logo-main">
            <div class="logo-normal">
              <img src="../../landing-pages/assets/images/hotel-overlook/logo-hotel-overlook.png" class="reception-brand-logo reception-brand-logo-normal" alt="Hotel Overlook" onerror="this.classList.add('d-none');">
              <svg class="icon-30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="24" height="20" rx="3" fill="currentColor" opacity=".2"/>
                <path d="M7 21V10h5v11M18 21V10h5v11M5 21h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="logo-mini">
              <img src="../../landing-pages/assets/images/hotel-overlook/logo-hotel-overlook.png" class="reception-brand-logo reception-brand-logo-mini" alt="Hotel Overlook" onerror="this.classList.add('d-none');">
              <svg class="icon-30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="24" height="20" rx="3" fill="currentColor" opacity=".2"/>
                <path d="M7 21V10h5v11M18 21V10h5v11M5 21h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <h4 class="logo-title reception-brand-title">Overlook</h4>
        </a>
        <div class="sidebar-toggle" data-toggle="sidebar" data-active="true">
          <i class="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.25 12.27h15M10.3 18.3l-6.05-6.03L10.3 6.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </i>
        </div>
      </div>
      <div class="sidebar-body pt-0 data-scrollbar">
        <div class="sidebar-list">
          <ul class="navbar-nav iq-main-menu" id="sidebar-menu">
            <li class="nav-item static-item">
              <a class="nav-link static-item disabled" href="#" tabindex="-1">
                <span class="default-icon">TPS</span><span class="mini-icon">TPS</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${dashboardActive ? "active" : ""}" href="dashboard-recepcion.html"
                ${dashboardActive ? 'aria-current="page"' : ""}
                data-sidebar-toggle="tooltip" data-bs-placement="right" title="Dashboard">
                <i class="icon reception-sidebar-icon">${sidebarIcons.dashboard}</i>
                <span class="item-name">Dashboard</span>
              </a>
            </li>
            ${menu}
          </ul>
        </div>
      </div>
      <div class="sidebar-footer"></div>
    </aside>
    <main class="main-content">
      <div class="position-relative iq-banner">
        <nav class="nav navbar navbar-expand-xl navbar-light iq-navbar">
          <div class="container-fluid navbar-inner">
            <a href="dashboard-recepcion.html" class="navbar-brand">
              <div class="reception-navbar-brand-copy">
                <img src="../../landing-pages/assets/images/hotel-overlook/logo-hotel-overlook.png" class="reception-navbar-logo" alt="Hotel Overlook" onerror="this.classList.add('d-none');">
                <h5 class="mb-0 reception-navbar-logo-fallback">Hotel Overlook</h5>
                <small class="text-muted">Módulo TPS de Recepción</small>
              </div>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Abrir navegación">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="mb-2 navbar-nav ms-auto align-items-center navbar-list mb-lg-0">
                <li class="nav-item dropdown">
                  <a class="nav-link py-0 d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img id="active-user-avatar" src="${activeAvatar}" alt="Avatar de ${activeUser.nombre_completo}" class="theme-color-default-img img-fluid avatar avatar-40 avatar-rounded reception-role-avatar">
                    <div class="caption ms-3 d-none d-md-block">
                      <h6 class="mb-0 caption-title">${activeUser.nombre_completo}</h6>
                      <p class="mb-0 caption-sub-title">${activeUser.rol}</p>
                    </div>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><span class="dropdown-item-text small">${activeUser.correo || ""}</span></li>
                    <li><span class="dropdown-item">${activeUser.rol}</span></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" id="logout-button" type="button">Cerrar sesión</button></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div class="iq-navbar-header">
          <div class="container-fluid iq-container">
            <div class="row">
              <div class="col-md-12">
                <div class="d-flex justify-content-between align-items-center flex-wrap">
                  <div>
                    <h1>${pageTitle}</h1>
                    <p>${pageDescription}</p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          <div class="iq-header-img">
            <img src="../../assets/images/dashboard/top-header.png" alt="" class="theme-color-default-img img-fluid w-100 h-100 animated-scaleX">
          </div>
        </div>
      </div>
      <div class="container-fluid content-inner mt-n5 py-0" id="recepcion-content"></div>
      <footer class="footer">
        <div class="footer-body">
          <div class="center"><span>Hotel Overlook - Copyright 2026</span></div>
          
        </div>
      </footer>
    </main>
  `);

  const activeUserAvatar = document.getElementById("active-user-avatar");
  activeUserAvatar?.addEventListener("error", function () {
    this.src = "../../assets/images/avatars/01.png";
  }, { once: true });

  const receptionContent = document.getElementById("recepcion-content");
  receptionContent.appendChild(pageContent.content.cloneNode(true));
  pageContent.remove();
  updateOperationalContext();
  window.setInterval(updateOperationalContext, 60000);

  document
    .getElementById("logout-button")
    ?.addEventListener("click", function () {
      window.RecepcionAuth.logout();
    });

  Array.from(receptionContent.children).forEach(function (element) {
    if (!element.matches('[id$="-alerts"]')) {
      element.classList.add("reception-page-section");
    }
  });

  receptionContent.querySelectorAll(".row").forEach(function (row) {
    if (row.querySelector(":scope > [class*='col-'] > .card")) {
      row.classList.add("reception-card-grid");
    }

    const directCards = Array.from(
      row.querySelectorAll(":scope > [class*='col-'] > .card")
    );
    const isKpiGrid =
      directCards.length >= 3 &&
      directCards.every(function (card) {
        const body = card.querySelector(":scope > .card-body");
        return (
          body &&
          !card.querySelector(":scope > .card-header") &&
          body.querySelector("h2") &&
          body.querySelector(".badge") &&
          !body.querySelector(".btn")
        );
      });

    if (isKpiGrid) {
      row.classList.add("reception-kpi-grid");
      directCards.forEach(function (card) {
        card.classList.add("reception-kpi-card");
        if (!card.querySelector(".metric-icon")) {
          const icon = document.createElement("span");
          icon.className =
            "metric-icon reception-generated-metric-icon d-inline-flex align-items-center justify-content-center";
          icon.setAttribute("aria-hidden", "true");
          icon.innerHTML = getMetricIcon(card);
          card.querySelector(".card-body").prepend(icon);
        }
      });

      if (
        currentPage === "dashboard-recepcion.html" &&
        row.closest('[aria-labelledby="hotel-status-heading"]')
      ) {
        row.classList.add("dashboard-kpi-scroller");
        row.setAttribute("tabindex", "0");
        row.setAttribute(
          "aria-label",
          "Indicadores del estado general del hotel. Deslice horizontalmente para ver todas las tarjetas."
        );

        const controls = document.createElement("div");
        controls.className =
          "dashboard-kpi-controls d-flex align-items-center justify-content-end gap-2";

        row.insertAdjacentElement("beforebegin", controls);

        const scrollAmount = function () {
          const cardColumn = row.querySelector(":scope > [class*='col-']");
          return cardColumn ? cardColumn.getBoundingClientRect().width + 24 : 340;
        };

        controls
          .querySelector(".dashboard-kpi-prev")
          .addEventListener("click", function () {
            row.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
          });

        controls
          .querySelector(".dashboard-kpi-next")
          .addEventListener("click", function () {
            row.scrollBy({ left: scrollAmount(), behavior: "smooth" });
          });
      }
    }
  });

  receptionContent
    .querySelectorAll(".table-responsive, .table-responsive-lg")
    .forEach(function (wrapper) {
      wrapper.classList.add("reception-table-wrapper");
    });

  receptionContent.querySelectorAll("form .row").forEach(function (row) {
    row.classList.add("reception-form-grid");
  });

  [
    "roomSearch",
    "guestSearch",
    "reservationSearch",
    "operationSearch"
  ].forEach(function (id) {
    const control = document.getElementById(id);
    const row = control ? control.closest(".row") : null;
    const card = control ? control.closest(".card") : null;
    if (row) row.classList.add("reception-filter-bar");
    if (card) card.classList.add("reception-filter-card");
  });

  receptionContent.querySelectorAll(".btn-group").forEach(function (group) {
    group.classList.add("reception-actions");
  });

  receptionContent.querySelectorAll("td.text-end").forEach(function (cell) {
    if (cell.querySelector(".btn, a.btn, .form-select")) {
      cell.classList.add("reception-actions");
    }
  });

  receptionContent.querySelectorAll(".badge").forEach(function (badge) {
    badge.classList.add("reception-status-badge");
  });

  receptionContent
    .querySelectorAll('[id^="metric-"], [id^="rooms-"], [id^="guests-"]')
    .forEach(function (metric) {
      const card = metric.closest(".card");
      if (card) card.classList.add("reception-metric-card");
    });

  const wizard = receptionContent.querySelector("#form-wizard1");
  if (wizard) {
    const wizardCard = wizard.closest(".card");
    if (wizardCard) wizardCard.classList.add("reception-wizard");
  }

  receptionContent
    .querySelectorAll("#solicitudes-table-body tr")
    .forEach(function (ticket) {
      ticket.classList.add("reception-ticket-row");
    });
})();
