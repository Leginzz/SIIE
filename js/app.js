import { dataService } from "./storage-service.js";

const state = {
  user: null,
  usuarios: [],
  infracciones: [],
  pagos: [],
  garantias: [],
  selectedSection: "dashboard"
};

const roleSections = {
  Administrador: ["dashboard", "captura", "folios", "caja", "pagos", "garantias", "recolecciones", "usuarios", "reportes"],
  Oficial: ["dashboard", "captura", "folios"],
  Cajero: ["dashboard", "caja", "pagos", "garantias"],
  "Auxiliar Operativo": ["dashboard", "recolecciones"]
};

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const shortDate = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

const elements = {
  loginView: document.querySelector("#loginView"),
  appView: document.querySelector("#appView"),
  loginForm: document.querySelector("#loginForm"),
  logoutBtn: document.querySelector("#logoutBtn"),
  mainNav: document.querySelector("#mainNav"),
  menuBtn: document.querySelector("#menuBtn"),
  sidebar: document.querySelector(".sidebar"),
  sectionTitle: document.querySelector("#sectionTitle"),
  currentUser: document.querySelector("#currentUser"),
  storageBadge: document.querySelector("#storageBadge"),
  infractionForm: document.querySelector("#infractionForm"),
  cashSearch: document.querySelector("#cashSearch"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  warrantyForm: document.querySelector("#warrantyForm"),
  cancelWarrantyEdit: document.querySelector("#cancelWarrantyEdit"),
  userForm: document.querySelector("#userForm"),
  cancelUserEdit: document.querySelector("#cancelUserEdit"),
  toast: document.querySelector("#appToast")
};

const sectionLabels = {
  dashboard: "Dashboard",
  captura: "Captura de infracciones",
  folios: "Generación de folio y QR",
  caja: "Módulo de caja",
  pagos: "Registro de pagos",
  garantias: "Control de garantías",
  recolecciones: "Recolecciones",
  usuarios: "Gestión de usuarios",
  reportes: "Reportes"
};

function showToast(message) {
  elements.toast.querySelector(".toast-body").textContent = message;
  bootstrap.Toast.getOrCreateInstance(elements.toast).show();
}

function allowedSections() {
  return roleSections[state.user?.rol] || [];
}

function canAccess(section) {
  return allowedSections().includes(section);
}

function visibleInfracciones() {
  if (state.user?.rol === "Oficial") {
    return state.infracciones.filter((item) => item.agenteUsuario === state.user.usuario);
  }
  return state.infracciones;
}

function visibleGarantias() {
  const folios = new Set(visibleInfracciones().map((item) => item.folio));
  if (state.user?.rol === "Oficial") {
    return state.garantias.filter((item) => folios.has(item.folio));
  }
  if (state.user?.rol === "Auxiliar Operativo") {
    return state.garantias.filter((item) => isCollectionStatus(item.estado));
  }
  return state.garantias;
}

function isCollectionStatus(status) {
  return ["Pendiente de recolección", "Recogida", "Entregada en oficina"].includes(status);
}

function setRoleAccess() {
  document.querySelectorAll("#mainNav [data-section]").forEach((button) => {
    button.classList.toggle("d-none", !canAccess(button.dataset.section));
  });
}

function getTodayFolio() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const count = state.infracciones.filter((item) => item.folio.includes(`${year}${month}`)).length + 1;
  return `SIIE-${year}${month}-${String(count).padStart(4, "0")}`;
}

function normalizeDate(value) {
  return value ? new Date(value.toDate ? value.toDate() : value) : new Date();
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function statusBadge(status) {
  const className = status === "Pagada" || status === "Devuelta"
    ? "status-pagada"
    : status === "Cancelada"
      ? "status-cancelada"
      : "status-pendiente";
  return `<span class="badge-status ${className}">${status}</span>`;
}

function setSection(section) {
  if (!canAccess(section)) {
    showToast("Tu rol no tiene acceso a esta vista.");
    section = allowedSections()[0] || "dashboard";
  }

  state.selectedSection = section;
  document.querySelectorAll(".section-view").forEach((view) => view.classList.toggle("active", view.id === section));
  document.querySelectorAll("#mainNav .nav-link").forEach((item) => item.classList.toggle("active", item.dataset.section === section));
  elements.sectionTitle.textContent = sectionLabels[section];
  elements.sidebar.classList.remove("open");
}

async function loadData() {
  state.usuarios = await dataService.listUsuarios();
  state.infracciones = await dataService.listInfracciones();
  state.pagos = await dataService.listPagos();
  state.garantias = await dataService.listGarantias();
  renderAll();
}

function renderAll() {
  renderDashboard();
  renderFolios();
  renderCaja();
  renderPagos();
  renderGarantias();
  renderRecolecciones();
  renderUsuarios();
  renderReportes();
}

function renderDashboard() {
  const infracciones = visibleInfracciones();
  const garantias = visibleGarantias();
  const paidFolios = new Set(state.pagos.map((pago) => pago.folio));
  const pending = infracciones.filter((item) => item.estado !== "Pagada" && !paidFolios.has(item.folio));
  const revenue = state.pagos
    .filter((pago) => state.user?.rol !== "Oficial" || infracciones.some((item) => item.folio === pago.folio))
    .reduce((sum, item) => sum + Number(item.importe || 0), 0);

  document.querySelector("#metricInfracciones").textContent = infracciones.length;
  document.querySelector("#metricPendientes").textContent = pending.length;
  document.querySelector("#metricRecaudado").textContent = currency.format(revenue);
  document.querySelector("#metricGarantiasResguardadas").textContent = garantias.filter((item) => item.estado === "Resguardada").length;
  document.querySelector("#metricGarantiasDisponibles").textContent = garantias.filter((item) => item.estado === "Disponible para devolución").length;
  document.querySelector("#metricGarantiasDevueltas").textContent = garantias.filter((item) => item.estado === "Devuelta").length;
  document.querySelector("#metricPendientesRecoleccion").textContent = garantias.filter((item) => item.estado === "Pendiente de recolección").length;
  document.querySelector("#metricRecogidas").textContent = garantias.filter((item) => item.estado === "Recogida").length;
  document.querySelector("#metricEntregadasOficina").textContent = garantias.filter((item) => item.estado === "Entregada en oficina").length;

  document.querySelector("#recentTable").innerHTML = infracciones.slice(0, 6).map((item) => `
    <tr>
      <td><strong>${item.folio}</strong></td>
      <td>${item.conductor}</td>
      <td>${statusBadge(item.estado)}</td>
      <td>${currency.format(Number(item.monto || 0))}</td>
    </tr>
  `).join("") || emptyRow(4, "Sin infracciones registradas");
}

function renderFolios() {
  const infracciones = visibleInfracciones();
  document.querySelector("#folioTable").innerHTML = infracciones.map((item) => `
    <tr>
      <td><strong>${item.folio}</strong></td>
      <td>${item.placas}</td>
      <td>${shortDate.format(normalizeDate(item.fecha))}</td>
      <td><button class="btn btn-sm btn-outline-primary" data-qr="${item.id}"><i class="bi bi-qr-code"></i></button></td>
    </tr>
  `).join("") || emptyRow(4, "Sin folios generados");

  document.querySelectorAll("[data-qr]").forEach((button) => {
    button.addEventListener("click", () => renderQr(button.dataset.qr));
  });
}

function renderQr(id) {
  const item = visibleInfracciones().find((record) => record.id === id);
  if (!item) return;

  const qrBox = document.querySelector("#qrBox");
  qrBox.innerHTML = "";
  const payload = `${location.origin}${location.pathname}?folio=${encodeURIComponent(item.folio)}`;
  if (!window.QRCode) {
    qrBox.innerHTML = `<a class="btn btn-outline-primary" href="${payload}" target="_blank" rel="noreferrer">Abrir verificación</a>`;
    showToast("La librería QR no está disponible; se dejó enlace de verificación.");
    return;
  }

  new QRCode(qrBox, {
    text: payload,
    width: 220,
    height: 220,
    correctLevel: QRCode.CorrectLevel.M
  });
  document.querySelector("#qrHelp").textContent = `${item.folio} | ${item.conductor} | ${item.placas}`;
}

function renderCaja() {
  const term = elements.cashSearch.value.trim().toLowerCase();
  const items = visibleInfracciones().filter((item) => {
    const haystack = `${item.folio} ${item.placas} ${item.conductor}`.toLowerCase();
    return !term || haystack.includes(term);
  });

  document.querySelector("#cashCards").innerHTML = items.map((item) => `
    <div class="col-md-6 col-xl-4">
      <article class="cash-card">
        <header>
          <div>
            <h4>${item.folio}</h4>
            <small class="text-muted">${item.conductor}</small>
          </div>
          ${statusBadge(item.estado)}
        </header>
        <p class="mb-1"><strong>Placas:</strong> ${item.placas}</p>
        <p class="mb-1"><strong>Motivo:</strong> ${item.motivo}</p>
        <p class="fs-5 fw-bold mb-3">${currency.format(Number(item.monto || 0))}</p>
        <div class="d-flex gap-2">
          <button class="btn btn-success flex-fill" data-pay="${item.id}" ${item.estado === "Pagada" ? "disabled" : ""}>
            <i class="bi bi-check2-circle me-1"></i>Cobrar
          </button>
          <button class="btn btn-outline-danger" data-cancel="${item.id}" ${item.estado === "Pagada" ? "disabled" : ""}>
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      </article>
    </div>
  `).join("") || `<div class="col-12"><p class="text-muted mb-0">No se encontraron infracciones.</p></div>`;

  document.querySelectorAll("[data-pay]").forEach((button) => {
    button.addEventListener("click", () => registerPayment(button.dataset.pay));
  });
  document.querySelectorAll("[data-cancel]").forEach((button) => {
    button.addEventListener("click", () => updateInfractionStatus(button.dataset.cancel, "Cancelada"));
  });
}

function renderPagos() {
  const folios = new Set(visibleInfracciones().map((item) => item.folio));
  const pagos = state.user?.rol === "Oficial" ? state.pagos.filter((item) => folios.has(item.folio)) : state.pagos;
  document.querySelector("#paymentsTable").innerHTML = pagos.map((item) => `
    <tr>
      <td><strong>${item.recibo}</strong></td>
      <td>${item.folio}</td>
      <td>${item.metodo}</td>
      <td>${currency.format(Number(item.importe || 0))}</td>
      <td>${shortDate.format(normalizeDate(item.fecha))}</td>
    </tr>
  `).join("") || emptyRow(5, "Sin pagos registrados");
}

function renderWarrantyFolioOptions() {
  const options = visibleInfracciones().map((item) => `<option value="${item.folio}">${item.folio} - ${item.conductor}</option>`);
  elements.warrantyForm.elements.folio.innerHTML = options.join("") || `<option value="">Sin infracciones disponibles</option>`;
}

function renderGarantias() {
  renderWarrantyFolioOptions();
  const items = visibleGarantias();
  document.querySelector("#warrantyTable").innerHTML = items.map((item) => `
    <tr>
      <td><strong>${item.folio}</strong></td>
      <td>${item.tipo}</td>
      <td>${item.documento}</td>
      <td>${item.titular}</td>
      <td>${statusBadge(item.estado)}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" data-edit-warranty="${item.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-outline-success" data-return-warranty="${item.id}" ${item.estado === "Devuelta" ? "disabled" : ""}><i class="bi bi-unlock"></i></button>
          <button class="btn btn-outline-danger" data-delete-warranty="${item.id}"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join("") || emptyRow(6, "Sin garantías registradas");

  document.querySelectorAll("[data-edit-warranty]").forEach((button) => button.addEventListener("click", () => editWarranty(button.dataset.editWarranty)));
  document.querySelectorAll("[data-return-warranty]").forEach((button) => button.addEventListener("click", () => returnWarranty(button.dataset.returnWarranty)));
  document.querySelectorAll("[data-delete-warranty]").forEach((button) => button.addEventListener("click", () => deleteWarranty(button.dataset.deleteWarranty)));
}

function renderRecolecciones() {
  const items = state.garantias.filter((item) => isCollectionStatus(item.estado));
  document.querySelector("#collectionsTable").innerHTML = items.map((item) => `
    <tr>
      <td><strong>${item.folio}</strong></td>
      <td>${item.tipo}</td>
      <td>${item.titular}</td>
      <td>${statusBadge(item.estado)}</td>
      <td>${item.fechaResguardo || ""}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" data-collect-detail="${item.id}"><i class="bi bi-eye"></i></button>
          <button class="btn btn-outline-success" data-mark-collected="${item.id}" ${item.estado !== "Pendiente de recolección" ? "disabled" : ""}>Recogida</button>
          <button class="btn btn-outline-secondary" data-mark-office="${item.id}" ${item.estado === "Entregada en oficina" ? "disabled" : ""}>En oficina</button>
        </div>
      </td>
    </tr>
  `).join("") || emptyRow(6, "Sin garantías pendientes de recolección");

  document.querySelectorAll("[data-collect-detail]").forEach((button) => button.addEventListener("click", () => showCollectionDetail(button.dataset.collectDetail)));
  document.querySelectorAll("[data-mark-collected]").forEach((button) => button.addEventListener("click", () => updateCollectionStatus(button.dataset.markCollected, "Recogida")));
  document.querySelectorAll("[data-mark-office]").forEach((button) => button.addEventListener("click", () => updateCollectionStatus(button.dataset.markOffice, "Entregada en oficina")));
}

function renderUsuarios() {
  document.querySelector("#usersTable").innerHTML = state.usuarios.map((item) => `
    <tr>
      <td>${item.nombre}</td>
      <td><strong>${item.usuario}</strong></td>
      <td>${item.rol}</td>
      <td>${item.activo ? "Activo" : "Inactivo"}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" data-edit-user="${item.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-outline-danger" data-delete-user="${item.id}" ${item.usuario === state.user?.usuario ? "disabled" : ""}><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join("") || emptyRow(5, "Sin usuarios registrados");

  document.querySelectorAll("[data-edit-user]").forEach((button) => button.addEventListener("click", () => editUser(button.dataset.editUser)));
  document.querySelectorAll("[data-delete-user]").forEach((button) => button.addEventListener("click", () => deleteUser(button.dataset.deleteUser)));
}

function renderReportes() {
  const infracciones = visibleInfracciones();
  const paid = infracciones.filter((item) => item.estado === "Pagada").length;
  const revenue = state.pagos
    .filter((pago) => infracciones.some((item) => item.folio === pago.folio))
    .reduce((sum, item) => sum + Number(item.importe || 0), 0);
  const byReason = infracciones.reduce((map, item) => {
    map[item.motivo] = (map[item.motivo] || 0) + 1;
    return map;
  }, {});
  const max = Math.max(1, ...Object.values(byReason));

  document.querySelector("#reportTotal").textContent = infracciones.length;
  document.querySelector("#reportPaid").textContent = paid;
  document.querySelector("#reportPending").textContent = infracciones.length - paid;
  document.querySelector("#reportRevenue").textContent = currency.format(revenue);
  document.querySelector("#reasonReport").innerHTML = Object.entries(byReason).map(([reason, count]) => `
    <div class="reason-row">
      <strong>${reason}</strong>
      <div class="reason-bar"><span style="width:${(count / max) * 100}%"></span></div>
      <span>${count}</span>
    </div>
  `).join("") || `<p class="text-muted mb-0">Sin datos para reportar.</p>`;
}

function emptyRow(columns, message) {
  return `<tr><td colspan="${columns}" class="text-muted text-center py-4">${message}</td></tr>`;
}

async function registerPayment(id) {
  if (!canAccess("caja")) return showToast("Tu rol no puede registrar pagos.");
  const item = visibleInfracciones().find((record) => record.id === id);
  if (!item) return;

  const receipt = `REC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(state.pagos.length + 1).padStart(4, "0")}`;
  await dataService.createPago({
    recibo: receipt,
    folio: item.folio,
    metodo: "Efectivo",
    importe: Number(item.monto || 0),
    fecha: new Date().toISOString()
  });
  await dataService.updateInfraccion(item.id, { estado: "Pagada" });
  await markWarrantyAvailable(item.folio);
  showToast(`Pago registrado para ${item.folio}.`);
  await loadData();
}

async function updateInfractionStatus(id, status) {
  if (!canAccess("caja")) return showToast("Tu rol no puede actualizar infracciones desde caja.");
  await dataService.updateInfraccion(id, { estado: status });
  showToast(`Infracción marcada como ${status.toLowerCase()}.`);
  await loadData();
}

async function markWarrantyAvailable(folio) {
  const warranty = state.garantias.find((item) => item.folio === folio && item.estado === "Entregada en oficina");
  if (warranty) {
    await dataService.updateGarantia(warranty.id, { estado: "Disponible para devolución" });
  }
}

function resetWarrantyForm() {
  elements.warrantyForm.reset();
  elements.warrantyForm.elements.id.value = "";
  elements.warrantyForm.elements.fechaResguardo.value = todayInputValue();
  document.querySelector("#warrantyFormTitle").textContent = "Nueva garantía";
  elements.cancelWarrantyEdit.classList.add("d-none");
}

function editWarranty(id) {
  const item = state.garantias.find((record) => record.id === id);
  if (!item) return;
  Object.entries(item).forEach(([key, value]) => {
    if (elements.warrantyForm.elements[key]) elements.warrantyForm.elements[key].value = value;
  });
  document.querySelector("#warrantyFormTitle").textContent = "Editar garantía";
  elements.cancelWarrantyEdit.classList.remove("d-none");
  elements.warrantyForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function returnWarranty(id) {
  await dataService.updateGarantia(id, { estado: "Devuelta", fechaDevolucion: todayInputValue() });
  showToast("Garantía marcada como devuelta.");
  await loadData();
}

function showCollectionDetail(id) {
  const item = state.garantias.find((record) => record.id === id);
  if (!item) return;
  showToast(`${item.folio} | ${item.tipo} | ${item.documento} | ${item.titular} | ${item.estado}`);
}

async function updateCollectionStatus(id, status) {
  if (!canAccess("recolecciones")) return showToast("Tu rol no puede actualizar recolecciones.");
  await dataService.updateGarantia(id, { estado: status });
  showToast(`Garantía marcada como ${status.toLowerCase()}.`);
  await loadData();
}

async function deleteWarranty(id) {
  await dataService.deleteGarantia(id);
  showToast("Garantía eliminada.");
  await loadData();
}

function resetUserForm() {
  elements.userForm.reset();
  elements.userForm.elements.id.value = "";
  document.querySelector("#userFormTitle").textContent = "Nuevo usuario";
  elements.cancelUserEdit.classList.add("d-none");
}

function editUser(id) {
  const item = state.usuarios.find((record) => record.id === id);
  if (!item) return;
  Object.entries(item).forEach(([key, value]) => {
    if (elements.userForm.elements[key]) elements.userForm.elements[key].value = String(value);
  });
  document.querySelector("#userFormTitle").textContent = "Editar usuario";
  elements.cancelUserEdit.classList.remove("d-none");
  elements.userForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteUser(id) {
  await dataService.deleteUsuario(id);
  showToast("Usuario eliminado.");
  await loadData();
}

function exportCsv() {
  const header = ["folio", "fecha", "conductor", "placas", "motivo", "monto", "estado", "agenteUsuario"];
  const rows = visibleInfracciones().map((item) => header.map((field) => `"${String(item[field] ?? "").replaceAll('"', '""')}"`).join(","));
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "reporte-siie.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = document.querySelector("#loginUser").value.trim();
  const password = document.querySelector("#loginPassword").value;
  const account = await dataService.login(user, password);

  if (!account) {
    showToast("Usuario o contraseña incorrectos.");
    return;
  }

  state.user = account;
  elements.currentUser.textContent = `${account.nombre || account.usuario} | ${account.rol}`;
  elements.storageBadge.textContent = "Modo demo LocalStorage";
  elements.storageBadge.className = "badge rounded-pill text-bg-warning";
  elements.loginView.classList.add("d-none");
  elements.appView.classList.remove("d-none");
  setRoleAccess();
  await loadData();
  resetWarrantyForm();
  resetUserForm();
  setSection(allowedSections()[0] || "dashboard");
});

elements.logoutBtn.addEventListener("click", () => {
  state.user = null;
  elements.appView.classList.add("d-none");
  elements.loginView.classList.remove("d-none");
});

elements.mainNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-section]");
  if (button) setSection(button.dataset.section);
});

elements.menuBtn.addEventListener("click", () => elements.sidebar.classList.toggle("open"));
elements.cashSearch.addEventListener("input", renderCaja);
elements.exportCsvBtn.addEventListener("click", exportCsv);
elements.cancelWarrantyEdit.addEventListener("click", resetWarrantyForm);
elements.cancelUserEdit.addEventListener("click", resetUserForm);

elements.infractionForm.elements.garantiaRetenida.addEventListener("change", () => {
  const showWarrantyFields = elements.infractionForm.elements.garantiaRetenida.value === "Sí";
  document.querySelectorAll(".warranty-capture-field").forEach((field) => field.classList.toggle("d-none", !showWarrantyFields));
  elements.infractionForm.elements.garantiaDocumento.required = showWarrantyFields;
  elements.infractionForm.elements.garantiaTitular.required = showWarrantyFields;
});

elements.infractionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canAccess("captura")) return showToast("Tu rol no puede crear infracciones.");

  const data = Object.fromEntries(new FormData(elements.infractionForm));
  const payload = {
    ...data,
    folio: getTodayFolio(),
    monto: Number(data.monto || 0),
    garantia: data.garantiaRetenida === "Sí" ? data.garantia : "Ninguna",
    agenteUsuario: state.user.usuario,
    estado: "Pendiente",
    fecha: new Date().toISOString()
  };

  await dataService.createInfraccion(payload);
  if (data.garantiaRetenida === "Sí") {
    await dataService.createGarantia({
      folio: payload.folio,
      tipo: data.garantia,
      documento: data.garantiaDocumento,
      titular: data.garantiaTitular || data.conductor,
      fechaResguardo: todayInputValue(),
      fechaDevolucion: "",
      estado: "Pendiente de recolección"
    });
  }
  elements.infractionForm.reset();
  elements.infractionForm.elements.monto.value = 850;
  document.querySelectorAll(".warranty-capture-field").forEach((field) => field.classList.add("d-none"));
  elements.infractionForm.elements.garantiaDocumento.required = false;
  elements.infractionForm.elements.garantiaTitular.required = false;
  showToast(`Folio ${payload.folio} generado correctamente.`);
  await loadData();
  setSection("folios");
  const created = state.infracciones.find((item) => item.folio === payload.folio);
  if (created) renderQr(created.id);
});

elements.warrantyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canAccess("garantias")) return showToast("Tu rol no puede gestionar garantías.");

  const data = Object.fromEntries(new FormData(elements.warrantyForm));
  if (data.estado === "Devuelta" && !data.fechaDevolucion) data.fechaDevolucion = todayInputValue();

  if (data.id) {
    await dataService.updateGarantia(data.id, data);
    showToast("Garantía actualizada.");
  } else {
    delete data.id;
    await dataService.createGarantia(data);
    showToast("Garantía registrada.");
  }

  resetWarrantyForm();
  await loadData();
});

elements.userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canAccess("usuarios")) return showToast("Tu rol no puede gestionar usuarios.");

  const data = Object.fromEntries(new FormData(elements.userForm));
  data.activo = data.activo === "true";

  if (data.id) {
    await dataService.updateUsuario(data.id, data);
    showToast("Usuario actualizado.");
  } else {
    delete data.id;
    await dataService.createUsuario(data);
    showToast("Usuario registrado.");
  }

  resetUserForm();
  await loadData();
});
