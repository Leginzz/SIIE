const localKeys = {
  usuarios: "siie_usuarios",
  infracciones: "siie_infracciones",
  pagos: "siie_pagos",
  garantias: "siie_garantias"
};

const seedUsuarios = [
  {
    id: "user-admin",
    nombre: "Administrador SIIE",
    usuario: "admin@siie.local",
    password: "admin123",
    rol: "Administrador",
    activo: true
  },
  {
    id: "user-oficial",
    nombre: "Oficial Demo",
    usuario: "oficial@siie.local",
    password: "oficial123",
    rol: "Oficial",
    activo: true
  },
  {
    id: "user-cajero",
    nombre: "Cajero Demo",
    usuario: "cajero@siie.local",
    password: "cajero123",
    rol: "Cajero",
    activo: true
  }
];

const seedInfracciones = [
  {
    id: "demo-1",
    folio: "SIIE-202606-0001",
    conductor: "Mariana Lopez",
    licencia: "VER-458921",
    placas: "YTG-842-A",
    vehiculo: "Nissan Versa blanco",
    motivo: "Estacionarse en lugar prohibido",
    monto: 850,
    agente: "Agente 027",
    agenteUsuario: "oficial@siie.local",
    garantia: "Licencia",
    ubicacion: "Av. Juarez, Centro",
    observaciones: "Unidad obstruia acceso peatonal.",
    estado: "Pendiente",
    fecha: "2026-06-15T09:35:00.000Z"
  },
  {
    id: "demo-2",
    folio: "SIIE-202606-0002",
    conductor: "Carlos Mendez",
    licencia: "VER-103784",
    placas: "XKL-219-B",
    vehiculo: "Toyota Hilux gris",
    motivo: "No respetar semaforo",
    monto: 1200,
    agente: "Agente 014",
    agenteUsuario: "admin@siie.local",
    garantia: "Tarjeta de circulacion",
    ubicacion: "Blvd. Independencia",
    observaciones: "Pago realizado en caja.",
    estado: "Pagada",
    fecha: "2026-06-14T17:10:00.000Z"
  }
];

const seedPagos = [
  {
    id: "pago-demo-1",
    recibo: "REC-202606-0001",
    folio: "SIIE-202606-0002",
    metodo: "Efectivo",
    importe: 1200,
    fecha: "2026-06-14T17:25:00.000Z"
  }
];

const seedGarantias = [
  {
    id: "garantia-demo-1",
    folio: "SIIE-202606-0001",
    tipo: "Licencia",
    documento: "VER-458921",
    titular: "Mariana Lopez",
    fechaResguardo: "2026-06-15",
    fechaDevolucion: "",
    estado: "Resguardada"
  },
  {
    id: "garantia-demo-2",
    folio: "SIIE-202606-0002",
    tipo: "Tarjeta de circulacion",
    documento: "TC-83921",
    titular: "Carlos Mendez",
    fechaResguardo: "2026-06-14",
    fechaDevolucion: "2026-06-14",
    estado: "Devuelta"
  }
];

function readLocal(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return structuredClone(fallback);
  }
  return JSON.parse(stored);
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function sortByDateDesc(items, field = "fecha") {
  return [...items].sort((a, b) => new Date(b[field] || 0) - new Date(a[field] || 0));
}

export const dataService = {
  async login(user, password) {
    return readLocal(localKeys.usuarios, seedUsuarios)
      .find((item) => item.usuario === user && item.password === password && item.activo) || null;
  },

  async listUsuarios() {
    return readLocal(localKeys.usuarios, seedUsuarios);
  },

  async createUsuario(payload) {
    const items = readLocal(localKeys.usuarios, seedUsuarios);
    const item = { id: createId("usuario"), activo: true, ...payload };
    writeLocal(localKeys.usuarios, [item, ...items]);
    return item;
  },

  async updateUsuario(id, payload) {
    const items = readLocal(localKeys.usuarios, seedUsuarios);
    writeLocal(localKeys.usuarios, items.map((item) => (item.id === id ? { ...item, ...payload } : item)));
  },

  async deleteUsuario(id) {
    const items = readLocal(localKeys.usuarios, seedUsuarios);
    writeLocal(localKeys.usuarios, items.filter((item) => item.id !== id));
  },

  async listInfracciones() {
    return sortByDateDesc(readLocal(localKeys.infracciones, seedInfracciones));
  },

  async createInfraccion(payload) {
    const items = readLocal(localKeys.infracciones, seedInfracciones);
    const item = { id: createId("infraccion"), ...payload };
    writeLocal(localKeys.infracciones, [item, ...items]);
    return item;
  },

  async updateInfraccion(id, payload) {
    const items = readLocal(localKeys.infracciones, seedInfracciones);
    writeLocal(localKeys.infracciones, items.map((item) => (item.id === id ? { ...item, ...payload } : item)));
  },

  async listPagos() {
    return sortByDateDesc(readLocal(localKeys.pagos, seedPagos));
  },

  async createPago(payload) {
    const items = readLocal(localKeys.pagos, seedPagos);
    const item = { id: createId("pago"), ...payload };
    writeLocal(localKeys.pagos, [item, ...items]);
    return item;
  },

  async listGarantias() {
    return [...readLocal(localKeys.garantias, seedGarantias)].sort((a, b) => new Date(b.fechaResguardo || 0) - new Date(a.fechaResguardo || 0));
  },

  async createGarantia(payload) {
    const items = readLocal(localKeys.garantias, seedGarantias);
    const item = { id: createId("garantia"), ...payload };
    writeLocal(localKeys.garantias, [item, ...items]);
    return item;
  },

  async updateGarantia(id, payload) {
    const items = readLocal(localKeys.garantias, seedGarantias);
    writeLocal(localKeys.garantias, items.map((item) => (item.id === id ? { ...item, ...payload } : item)));
  },

  async deleteGarantia(id) {
    const items = readLocal(localKeys.garantias, seedGarantias);
    writeLocal(localKeys.garantias, items.filter((item) => item.id !== id));
  }
};
