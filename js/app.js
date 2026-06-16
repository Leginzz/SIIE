import { dataService } from "./firebase-service.js";

const state = {
  user: null,
  infracciones: [],
  pagos: [],
  selectedSection: "dashboard"
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
  firebaseBadge: document.querySelector("#firebaseBadge"),
  infractionForm: document.querySelector("#infractionForm"),
  cashSearch: document.querySelector("#cashSearch"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  toast: document.querySelector("#appToast")
};

const sectionLabels = {
  dashboard: "Dashboard",
  captura: "Captura de infracciones",
  folios: "Generación de folio y QR",
  caja: "Módulo de caja",
  pagos: "Registro de pagos",
  garantias: "Control de garantías",
  reportes: "Reportes"
};

function showToast(message) {
  elements.toast.querySelector(".toast-body").textContent = message;
  bootstrap.Toast.getOrCreateInstance(elements.toast).show();
}

function getTodayFolio() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const count = state.infracciones.filter((item) => item.folio.includes(`${year}${month}`)).length + 1;
  return `SIIE-${year}${month}-${String(count).padStart(4, "0")}`;
}

function normalizeDate(value) {
  if (!value) return new Date();
  if (value.toDate) return value.toDate();
  return new Date(value);
}

function statusBadge(status) {
  const className = status === "Pagada" ? "status-pagada" : status === "Cancelada" ? "status-cancelada" : "status-pendiente";
  return `<span class="badge-status ${className}">${status}</span>`;
}

function setSection(section) {
  state.selectedSection = section;
  document.querySelectorAll(".section-view").forEach((view) => view.classList.toggle("active", view.id === section));
  document.querySelectorAll("#mainNav .nav-link").forEach((item) => item.classList.toggle("active", item.dataset.section === section));
  elements.sectionTitle.textContent = sectionLabels[section];
  elements.sidebar.classList.remove("open");
}

async function loadData() {
  state.infracciones = await dataService.listInfracciones();
  state.pagos = await dataService.listPagos();
  renderAll();
}

function renderAll() {
  renderDashboard();
  renderFolios();
  renderCaja();
  renderPagos();
  renderGarantias();
  renderReportes();
}

function renderDashboard() {
  const paidFolios = new Set(state.pagos.map((pago) => pago.folio));
  const paid = state.infracciones.filter((item) => item.estado === "Pagada" || paidFolios.has(item.folio));
  const pending = state.infracciones.filter((item) => item.estado !== "Pagada" && !paidFolios.has(item.folio));
  const warranties = state.infracciones.filter((item) => item.garantia && item.garantia !== "Ninguna" && item.garantiaEstado !== "Liberada");
  const revenue = state.pagos.reduce((sum, item) => sum + Number(item.importe || 0), 0);

  document.querySelector("#metricInfracciones").textContent = state.infracciones.length;
  document.querySelector("#metricPendientes").textContent = pending.length;
  document.querySelector("#metricRecaudado").textContent = currency.format(revenue);
  document.querySelector("#metricGarantias").textContent = warranties.length;

  document.querySelector("#recentTable").innerHTML = state.infracciones.slice(0, 6).map((item) => `
    <tr>
      <td><strong>${item.folio}</strong></td>
      <td>${item.conductor}</td>
      <td>${statusBadge(item.estado)}</td>
      <td>${currency.format(Number(item.monto || 0))}</td>
    </tr>
  `).join("") || emptyRow(4, "Sin infracciones registradas");
}

function renderFolios() {
  document.querySelector("#folioTable").innerHTML = state.infracciones.map((item) => `
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
  const item = state.infracciones.find((record) => record.id === id);
  const qrBox = document.querySelector("#qrBox");
  qrBox.innerHTML = "";
  const payload = `${location.origin}${location.pathname}?folio=${encodeURIComponent(item.folio)}`;
  if (!window.QRCode) {
    qrBox.innerHTML = `<a class="btn btn-outline-primary" href="${payload}" target="_blank" rel="noreferrer">Abrir verificacion</a>`;
    showToast("La libreria QR no esta disponible; se dejo enlace de verificacion.");
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
  const items = state.infracciones.filter((item) => {
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
  document.querySelector("#paymentsTable").innerHTML = state.pagos.map((item) => `
    <tr>
      <td><strong>${item.recibo}</strong></td>
      <td>${item.folio}</td>
      <td>${item.metodo}</td>
      <td>${currency.format(Number(item.importe || 0))}</td>
      <td>${shortDate.format(normalizeDate(item.fecha))}</td>
    </tr>
  `).join("") || emptyRow(5, "Sin pagos registrados");
}

function renderGarantias() {
  const items = state.infracciones.filter((item) => item.garantia && item.garantia !== "Ninguna");
  document.querySelector("#warrantyTable").innerHTML = items.map((item) => `
    <tr>
      <td><strong>${item.folio}</strong></td>
      <td>${item.garantia}</td>
      <td>${item.conductor}</td>
      <td>${item.garantiaEstado || "Retenida"}</td>
      <td>
        <button class="btn btn-sm btn-outline-success" data-release="${item.id}" ${item.garantiaEstado === "Liberada" ? "disabled" : ""}>
          <i class="bi bi-unlock me-1"></i>Liberar
        </button>
      </td>
    </tr>
  `).join("") || emptyRow(5, "Sin garantías registradas");

  document.querySelectorAll("[data-release]").forEach((button) => {
    button.addEventListener("click", () => releaseWarranty(button.dataset.release));
  });
}

function renderReportes() {
  const paid = state.infracciones.filter((item) => item.estado === "Pagada").length;
  const revenue = state.pagos.reduce((sum, item) => sum + Number(item.importe || 0), 0);
  const byReason = state.infracciones.reduce((map, item) => {
    map[item.motivo] = (map[item.motivo] || 0) + 1;
    return map;
  }, {});
  const max = Math.max(1, ...Object.values(byReason));

  document.querySelector("#reportTotal").textContent = state.infracciones.length;
  document.querySelector("#reportPaid").textContent = paid;
  document.querySelector("#reportPending").textContent = state.infracciones.length - paid;
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
  const item = state.infracciones.find((record) => record.id === id);
  const receipt = `REC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(state.pagos.length + 1).padStart(4, "0")}`;
  await dataService.createPago({
    recibo: receipt,
    folio: item.folio,
    metodo: "Efectivo",
    importe: Number(item.monto || 0),
    fecha: new Date().toISOString()
  });
  await dataService.updateInfraccion(item.id, { estado: "Pagada" });
  showToast(`Pago registrado para ${item.folio}.`);
  await loadData();
}

async function updateInfractionStatus(id, status) {
  await dataService.updateInfraccion(id, { estado: status });
  showToast(`Infracción marcada como ${status.toLowerCase()}.`);
  await loadData();
}

async function releaseWarranty(id) {
  await dataService.updateInfraccion(id, { garantiaEstado: "Liberada" });
  showToast("Garantía liberada correctamente.");
  await loadData();
}

function exportCsv() {
  const header = ["folio", "fecha", "conductor", "placas", "motivo", "monto", "estado", "garantia"];
  const rows = state.infracciones.map((item) => header.map((field) => `"${String(item[field] ?? "").replaceAll('"', '""')}"`).join(","));
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
  elements.currentUser.textContent = `${account.nombre || account.usuario} | ${account.rol || "Usuario"}`;
  elements.firebaseBadge.textContent = dataService.isFirestoreEnabled ? "Firestore activo" : "Modo demo";
  elements.firebaseBadge.className = dataService.isFirestoreEnabled ? "badge rounded-pill text-bg-success" : "badge rounded-pill text-bg-warning";
  elements.loginView.classList.add("d-none");
  elements.appView.classList.remove("d-none");
  await loadData();
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

elements.infractionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(elements.infractionForm));
  const payload = {
    ...data,
    folio: getTodayFolio(),
    monto: Number(data.monto || 0),
    estado: "Pendiente",
    garantiaEstado: data.garantia === "Ninguna" ? "No aplica" : "Retenida",
    fecha: new Date().toISOString()
  };

  await dataService.createInfraccion(payload);
  elements.infractionForm.reset();
  elements.infractionForm.elements.monto.value = 850;
  showToast(`Folio ${payload.folio} generado correctamente.`);
  await loadData();
  setSection("folios");
  const created = state.infracciones.find((item) => item.folio === payload.folio);
  if (created) renderQr(created.id);
});
