const localKeys = {
  usuarios: "siie_usuarios",
  infracciones: "siie_infracciones",
  pagos: "siie_pagos",
  garantias: "siie_garantias",
  catalogoInfracciones: "siie_catalogo_infracciones",
  configuracion: "siie_configuracion"
};

const seedUsuarios = [
  {
    id: "user-admin",
    nombre: "Administrador SIIE",
    usuario: "admin@siie.local",
    password: "admin123",
    rol: "Administrador",
    activo: true,
    permisosExtra: []
  },
  {
    id: "user-oficial",
    nombre: "Oficial Demo",
    usuario: "oficial@siie.local",
    password: "oficial123",
    rol: "Oficial",
    activo: true,
    permisosExtra: []
  },
  {
    id: "user-cajero",
    nombre: "Cajero Demo",
    usuario: "cajero@siie.local",
    password: "cajero123",
    rol: "Cajero",
    activo: true,
    permisosExtra: []
  },
  {
    id: "user-auxiliar",
    nombre: "Auxiliar Operativo Demo",
    usuario: "auxiliar@siie.local",
    password: "auxiliar123",
    rol: "Auxiliar Operativo",
    activo: true,
    permisosExtra: []
  },
  {
    id: "user-jefe-administrativo",
    nombre: "Jefe Administrativo",
    usuario: "jefe@siie.local",
    password: "jefe123",
    rol: "Cajero",
    activo: true,
    permisosExtra: ["reportes", "usuarios"]
  },
  {
    id: "user-supervisor-operativo",
    nombre: "Supervisor Operativo",
    usuario: "supervisor@siie.local",
    password: "supervisor123",
    rol: "Oficial",
    activo: true,
    permisosExtra: ["reportes"]
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
    estado: "Pendiente de recolección"
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

const seedCatalogoInfracciones = [
  {
    id: "cat-vi-l",
    codigo: "VI-L",
    categoria: "CONDUCIR",
    descripcion: "EXCESO DE VELOCIDAD",
    articulo: "158 III",
    umas: 9,
    permiteDescuento: true,
    porcentajeDescuento: 50,
    activo: true
  },
  {
    id: "cat-vi-t",
    codigo: "VI-T",
    categoria: "CONDUCIR",
    descripcion: "CONDUCIR USANDO TELEFONO CELULAR",
    articulo: "157 IX",
    umas: 8,
    permiteDescuento: true,
    porcentajeDescuento: 50,
    activo: true
  },
  {
    id: "cat-do-l",
    codigo: "DO-L",
    categoria: "DOCUMENTOS",
    descripcion: "FALTA DE LICENCIA DE CONDUCIR",
    articulo: "152 I",
    umas: 10,
    permiteDescuento: true,
    porcentajeDescuento: 50,
    activo: true
  },
  {
    id: "cat-do-tc",
    codigo: "DO-TC",
    categoria: "DOCUMENTOS",
    descripcion: "FALTA DE TARJETA DE CIRCULACION",
    articulo: "152 II",
    umas: 7,
    permiteDescuento: true,
    porcentajeDescuento: 50,
    activo: true
  },
  {
    id: "cat-es-p",
    codigo: "ES-P",
    categoria: "ESTACIONAMIENTO",
    descripcion: "ESTACIONARSE EN LUGAR PROHIBIDO",
    articulo: "164 I",
    umas: 6,
    permiteDescuento: true,
    porcentajeDescuento: 50,
    activo: true
  },
  {
    id: "cat-se-r",
    codigo: "SE-R",
    categoria: "SEMAFOROS Y SENALES",
    descripcion: "NO RESPETAR LUZ ROJA DEL SEMAFORO",
    articulo: "160 II",
    umas: 12,
    permiteDescuento: false,
    porcentajeDescuento: 0,
    activo: true
  }
];

const seedConfiguracion = {
  umaActual: 117.31
};

function readLocal(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return structuredClone(fallback);
  }
  return JSON.parse(stored);
}

function readMergedLocal(key, fallback) {
  const stored = readLocal(key, fallback);
  const migrationKey = `${key}_seed_migration_v4`;
  if (localStorage.getItem(migrationKey)) return stored;

  const byId = new Map(stored.map((item) => [item.id, item]));
  fallback.forEach((item) => {
    if (!byId.has(item.id)) byId.set(item.id, item);
  });
  const merged = Array.from(byId.values());
  writeLocal(key, merged);
  localStorage.setItem(migrationKey, "true");
  return merged;
}

function normalizeWarranty(item) {
  const stateMap = {
    Resguardada: "Pendiente de recolección",
    "Pendiente de recoleccion": "Pendiente de recolección",
    "Pendiente de recolección": "Pendiente de recolección",
    Recogida: "Recogida",
    "Entregada en oficina": "Entregada en oficina",
    "Disponible para devolución": "Disponible para devolución",
    "Disponible para devolucion": "Disponible para devolución",
    Devuelta: "Devuelta"
  };

  return {
    ...item,
    estado: stateMap[item.estado] || item.estado || "Pendiente de recolección"
  };
}

function normalizeUser(item) {
  return {
    ...item,
    permisosExtra: Array.isArray(item.permisosExtra) ? item.permisosExtra : []
  };
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

function normalizeCatalogItem(item) {
  return {
    ...item,
    umas: Number(item.umas || 0),
    permiteDescuento: Boolean(item.permiteDescuento),
    porcentajeDescuento: Number(item.porcentajeDescuento || 0),
    activo: item.activo !== false
  };
}

function readConfig() {
  const stored = localStorage.getItem(localKeys.configuracion);
  if (!stored) {
    writeLocal(localKeys.configuracion, seedConfiguracion);
    return structuredClone(seedConfiguracion);
  }
  return { ...seedConfiguracion, ...JSON.parse(stored) };
}

export const dataService = {
  async login(user, password) {
    return readMergedLocal(localKeys.usuarios, seedUsuarios).map(normalizeUser)
      .find((item) => item.usuario === user && item.password === password && item.activo) || null;
  },

  async listUsuarios() {
    const items = readMergedLocal(localKeys.usuarios, seedUsuarios).map(normalizeUser);
    writeLocal(localKeys.usuarios, items);
    return items;
  },

  async createUsuario(payload) {
    const items = readLocal(localKeys.usuarios, seedUsuarios);
    const item = normalizeUser({ id: createId("usuario"), activo: true, ...payload });
    writeLocal(localKeys.usuarios, [item, ...items]);
    return item;
  },

  async updateUsuario(id, payload) {
    const items = readLocal(localKeys.usuarios, seedUsuarios);
    writeLocal(localKeys.usuarios, items.map((item) => (item.id === id ? normalizeUser({ ...item, ...payload }) : normalizeUser(item))));
  },

  async deleteUsuario(id) {
    const items = readLocal(localKeys.usuarios, seedUsuarios);
    writeLocal(localKeys.usuarios, items.filter((item) => item.id !== id));
  },

  async listCatalogoInfracciones() {
    const items = readMergedLocal(localKeys.catalogoInfracciones, seedCatalogoInfracciones).map(normalizeCatalogItem);
    writeLocal(localKeys.catalogoInfracciones, items);
    return [...items].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.descripcion.localeCompare(b.descripcion));
  },

  async createCatalogoInfraccion(payload) {
    const items = readLocal(localKeys.catalogoInfracciones, seedCatalogoInfracciones);
    const item = normalizeCatalogItem({ id: createId("catalogo"), activo: true, ...payload });
    writeLocal(localKeys.catalogoInfracciones, [item, ...items]);
    return item;
  },

  async updateCatalogoInfraccion(id, payload) {
    const items = readLocal(localKeys.catalogoInfracciones, seedCatalogoInfracciones);
    writeLocal(localKeys.catalogoInfracciones, items.map((item) => (item.id === id ? normalizeCatalogItem({ ...item, ...payload }) : normalizeCatalogItem(item))));
  },

  async getConfiguracion() {
    return readConfig();
  },

  async updateConfiguracion(payload) {
    const config = { ...readConfig(), ...payload, umaActual: Number(payload.umaActual || 0) };
    writeLocal(localKeys.configuracion, config);
    return config;
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
    const items = readMergedLocal(localKeys.garantias, seedGarantias).map(normalizeWarranty);
    writeLocal(localKeys.garantias, items);
    return [...items].sort((a, b) => new Date(b.fechaResguardo || 0) - new Date(a.fechaResguardo || 0));
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
