const firebaseConfig = {
  apiKey: "AIzaSyDJxYwe-ZDNhiGaIPZz2U_AVRk3GE3Lw",
  authDomain: "siie-fb7ab.firebaseapp.com",
  projectId: "siie-fb7ab",
  storageBucket: "siie-fb7ab.firebasestorage.app",
  messagingSenderId: "320632854500",
  appId: "1:320632854500:web:77e195460c3c7255c299f1"
};

const localKeys = {
  usuarios: "siie_usuarios",
  infracciones: "siie_infracciones",
  pagos: "siie_pagos",
  garantias: "siie_garantias",
  catalogoInfracciones: "siie_catalogo_infracciones",
  configuracion: "siie_configuracion"
};

const firestoreCollections = {
  infracciones: "infracciones",
  pagos: "pagos",
  garantias: "garantias",
  recolecciones: "recolecciones",
  catalogoInfracciones: "catalogo_infracciones",
  configuracion: "configuracion"
};

const collectionStatus = ["Pendiente de recolección", "Pendiente de recoleccion", "Recogida", "Entregada en oficina"];

const seedUsuarios = [
  { id: "user-admin", nombre: "Administrador SIIE", usuario: "admin@siie.local", password: "admin123", rol: "Administrador", activo: true, permisosExtra: [] },
  { id: "user-oficial", nombre: "Oficial Demo", usuario: "oficial@siie.local", password: "oficial123", rol: "Oficial", activo: true, permisosExtra: [] },
  { id: "user-cajero", nombre: "Cajero Demo", usuario: "cajero@siie.local", password: "cajero123", rol: "Cajero", activo: true, permisosExtra: [] },
  { id: "user-auxiliar", nombre: "Auxiliar Operativo Demo", usuario: "auxiliar@siie.local", password: "auxiliar123", rol: "Auxiliar Operativo", activo: true, permisosExtra: [] },
  { id: "user-jefe-administrativo", nombre: "Jefe Administrativo", usuario: "jefe@siie.local", password: "jefe123", rol: "Cajero", activo: true, permisosExtra: ["reportes", "usuarios"] },
  { id: "user-supervisor-operativo", nombre: "Supervisor Operativo", usuario: "supervisor@siie.local", password: "supervisor123", rol: "Oficial", activo: true, permisosExtra: ["reportes"] }
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
  { id: "pago-demo-1", recibo: "REC-202606-0001", folio: "SIIE-202606-0002", metodo: "Efectivo", importe: 1200, fecha: "2026-06-14T17:25:00.000Z" }
];

const seedGarantias = [
  { id: "garantia-demo-1", folio: "SIIE-202606-0001", tipo: "Licencia", documento: "VER-458921", titular: "Mariana Lopez", fechaResguardo: "2026-06-15", fechaDevolucion: "", estado: "Pendiente de recolección" },
  { id: "garantia-demo-2", folio: "SIIE-202606-0002", tipo: "Tarjeta de circulacion", documento: "TC-83921", titular: "Carlos Mendez", fechaResguardo: "2026-06-14", fechaDevolucion: "2026-06-14", estado: "Devuelta" }
];

const seedCatalogoInfracciones = [
  { id: "cat-vi-l", codigo: "VI-L", categoria: "CONDUCIR", descripcion: "EXCESO DE VELOCIDAD", articulo: "158 III", umas: 9, permiteDescuento: true, porcentajeDescuento: 50, activo: true },
  { id: "cat-vi-t", codigo: "VI-T", categoria: "CONDUCIR", descripcion: "CONDUCIR USANDO TELEFONO CELULAR", articulo: "157 IX", umas: 8, permiteDescuento: true, porcentajeDescuento: 50, activo: true },
  { id: "cat-do-l", codigo: "DO-L", categoria: "DOCUMENTOS", descripcion: "FALTA DE LICENCIA DE CONDUCIR", articulo: "152 I", umas: 10, permiteDescuento: true, porcentajeDescuento: 50, activo: true },
  { id: "cat-do-tc", codigo: "DO-TC", categoria: "DOCUMENTOS", descripcion: "FALTA DE TARJETA DE CIRCULACION", articulo: "152 II", umas: 7, permiteDescuento: true, porcentajeDescuento: 50, activo: true },
  { id: "cat-es-p", codigo: "ES-P", categoria: "ESTACIONAMIENTO", descripcion: "ESTACIONARSE EN LUGAR PROHIBIDO", articulo: "164 I", umas: 6, permiteDescuento: true, porcentajeDescuento: 50, activo: true },
  { id: "cat-se-r", codigo: "SE-R", categoria: "SEMAFOROS Y SENALES", descripcion: "NO RESPETAR LUZ ROJA DEL SEMAFORO", articulo: "160 II", umas: 12, permiteDescuento: false, porcentajeDescuento: 0, activo: true }
];

const seedConfiguracion = { umaActual: 117.31 };

const firebaseState = {
  initialized: false,
  available: false,
  mode: "local",
  db: null,
  api: null,
  message: "Firebase no inicializado",
  migrationAvailable: false
};

function clone(value) {
  return structuredClone(value);
}

function readLocal(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    writeLocal(key, fallback);
    return clone(fallback);
  }
  return JSON.parse(stored);
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readMergedLocal(key, fallback) {
  const stored = readLocal(key, fallback);
  const migrationKey = `${key}_seed_migration_v5`;
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

function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function sortByDateDesc(items, field = "fecha") {
  return [...items].sort((a, b) => new Date(b[field] || 0) - new Date(a[field] || 0));
}

function normalizeUser(item) {
  return { ...item, permisosExtra: Array.isArray(item.permisosExtra) ? item.permisosExtra : [] };
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
  return { ...item, estado: stateMap[item.estado] || item.estado || "Pendiente de recolección" };
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
    return clone(seedConfiguracion);
  }
  return { ...seedConfiguracion, ...JSON.parse(stored) };
}

function hasLocalCollectionData() {
  return [
    localKeys.infracciones,
    localKeys.pagos,
    localKeys.garantias,
    localKeys.catalogoInfracciones,
    localKeys.configuracion
  ].some((key) => localStorage.getItem(key));
}

async function initFirebase() {
  if (firebaseState.initialized) return firebaseState.available;
  firebaseState.initialized = true;

  try {
    const appModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    const app = appModule.initializeApp(firebaseConfig);
    firebaseState.db = firestoreModule.getFirestore(app);
    firebaseState.api = firestoreModule;
    firebaseState.available = true;
    firebaseState.mode = "firestore";
    firebaseState.message = "Firestore disponible";
    return true;
  } catch (error) {
    firebaseState.available = false;
    firebaseState.mode = "local";
    firebaseState.message = `Firebase no disponible: ${error.message}`;
    return false;
  }
}

function markFirestoreFailure(error) {
  console.warn("Firestore fallback to LocalStorage:", error);
  firebaseState.available = false;
  firebaseState.mode = "local";
  firebaseState.message = `Firestore no disponible: ${error.message}`;
}

function docData(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

async function firestoreList(collectionName) {
  await initFirebase();
  if (!firebaseState.available) return null;

  try {
    const { collection, getDocs } = firebaseState.api;
    const result = await getDocs(collection(firebaseState.db, collectionName));
    return result.docs.map(docData);
  } catch (error) {
    markFirestoreFailure(error);
    return null;
  }
}

async function firestoreCreate(collectionName, payload) {
  await initFirebase();
  if (!firebaseState.available) return null;

  try {
    const { addDoc, collection } = firebaseState.api;
    const docRef = await addDoc(collection(firebaseState.db, collectionName), payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    markFirestoreFailure(error);
    return null;
  }
}

async function firestoreSet(collectionName, id, payload) {
  await initFirebase();
  if (!firebaseState.available) return false;

  try {
    const { doc, setDoc } = firebaseState.api;
    await setDoc(doc(firebaseState.db, collectionName, id), payload, { merge: true });
    return true;
  } catch (error) {
    markFirestoreFailure(error);
    return false;
  }
}

async function firestoreDelete(collectionName, id) {
  await initFirebase();
  if (!firebaseState.available) return false;

  try {
    const { deleteDoc, doc } = firebaseState.api;
    await deleteDoc(doc(firebaseState.db, collectionName, id));
    return true;
  } catch (error) {
    markFirestoreFailure(error);
    return false;
  }
}

async function firestoreGetConfig() {
  await initFirebase();
  if (!firebaseState.available) return null;

  try {
    const { doc, getDoc } = firebaseState.api;
    const snapshot = await getDoc(doc(firebaseState.db, firestoreCollections.configuracion, "principal"));
    return snapshot.exists() ? { ...seedConfiguracion, ...snapshot.data() } : null;
  } catch (error) {
    markFirestoreFailure(error);
    return null;
  }
}

async function firestoreSetConfig(payload) {
  return firestoreSet(firestoreCollections.configuracion, "principal", payload);
}

async function listRemoteOrLocal({ localKey, fallback, collectionName, normalize = (item) => item, sort = (items) => items }) {
  const remote = await firestoreList(collectionName);
  if (remote && remote.length > 0) {
    firebaseState.migrationAvailable = false;
    return sort(remote.map(normalize));
  }

  const localItems = readMergedLocal(localKey, fallback).map(normalize);
  firebaseState.migrationAvailable = firebaseState.available && localItems.length > 0;
  return sort(localItems);
}

async function createRemoteOrLocal({ localKey, fallback, collectionName, prefix, payload, normalize = (item) => item }) {
  const normalizedPayload = normalize(payload);
  const remote = await firestoreCreate(collectionName, normalizedPayload);
  if (remote) return normalize(remote);

  const items = readLocal(localKey, fallback);
  const item = normalize({ id: createId(prefix), ...normalizedPayload });
  writeLocal(localKey, [item, ...items]);
  return item;
}

async function updateRemoteOrLocal({ localKey, fallback, collectionName, id, payload, normalize = (item) => item }) {
  const ok = await firestoreSet(collectionName, id, payload);
  if (ok) return;

  const items = readLocal(localKey, fallback);
  writeLocal(localKey, items.map((item) => (item.id === id ? normalize({ ...item, ...payload }) : normalize(item))));
}

async function deleteRemoteOrLocal({ localKey, fallback, collectionName, id }) {
  const ok = await firestoreDelete(collectionName, id);
  if (ok) return;

  const items = readLocal(localKey, fallback);
  writeLocal(localKey, items.filter((item) => item.id !== id));
}

async function syncRecoleccion(garantia) {
  const normalized = normalizeWarranty(garantia);
  if (!normalized.id || !firebaseState.available) return;

  if (collectionStatus.includes(normalized.estado)) {
    await firestoreSet(firestoreCollections.recolecciones, normalized.id, normalized);
  } else {
    await firestoreDelete(firestoreCollections.recolecciones, normalized.id);
  }
}

async function migrateArray(localKey, fallback, collectionName, normalize = (item) => item) {
  const items = readLocal(localKey, fallback).map(normalize);
  for (const item of items) {
    await firestoreSet(collectionName, item.id || createId("migrado"), item);
  }
  return items;
}

export const dataService = {
  async initPersistence() {
    await initFirebase();
    return this.getStorageStatus();
  },

  getStorageStatus() {
    return {
      mode: firebaseState.available ? "firestore" : "local",
      label: firebaseState.available ? "Modo Producción (Firestore)" : "Modo Demo (LocalStorage)",
      available: firebaseState.available,
      message: firebaseState.message,
      migrationAvailable: firebaseState.migrationAvailable
    };
  },

  async canMigrateLocalData() {
    await initFirebase();
    if (!firebaseState.available) return false;
    return hasLocalCollectionData();
  },

  async migrateLocalToFirestore() {
    await initFirebase();
    if (!firebaseState.available) throw new Error("Firestore no está disponible.");

    const garantias = await migrateArray(localKeys.garantias, seedGarantias, firestoreCollections.garantias, normalizeWarranty);
    await migrateArray(localKeys.infracciones, seedInfracciones, firestoreCollections.infracciones);
    await migrateArray(localKeys.pagos, seedPagos, firestoreCollections.pagos);
    await migrateArray(localKeys.catalogoInfracciones, seedCatalogoInfracciones, firestoreCollections.catalogoInfracciones, normalizeCatalogItem);
    await firestoreSetConfig(readConfig());
    for (const garantia of garantias) await syncRecoleccion(garantia);
    firebaseState.migrationAvailable = false;
  },

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
    return listRemoteOrLocal({
      localKey: localKeys.catalogoInfracciones,
      fallback: seedCatalogoInfracciones,
      collectionName: firestoreCollections.catalogoInfracciones,
      normalize: normalizeCatalogItem,
      sort: (items) => [...items].sort((a, b) => a.categoria.localeCompare(b.categoria) || a.descripcion.localeCompare(b.descripcion))
    });
  },

  async createCatalogoInfraccion(payload) {
    return createRemoteOrLocal({
      localKey: localKeys.catalogoInfracciones,
      fallback: seedCatalogoInfracciones,
      collectionName: firestoreCollections.catalogoInfracciones,
      prefix: "catalogo",
      payload,
      normalize: normalizeCatalogItem
    });
  },

  async updateCatalogoInfraccion(id, payload) {
    return updateRemoteOrLocal({
      localKey: localKeys.catalogoInfracciones,
      fallback: seedCatalogoInfracciones,
      collectionName: firestoreCollections.catalogoInfracciones,
      id,
      payload,
      normalize: normalizeCatalogItem
    });
  },

  async getConfiguracion() {
    const remote = await firestoreGetConfig();
    if (remote) {
      firebaseState.migrationAvailable = false;
      return remote;
    }
    const config = readConfig();
    firebaseState.migrationAvailable = firebaseState.available;
    return config;
  },

  async updateConfiguracion(payload) {
    const config = { ...readConfig(), ...payload, umaActual: Number(payload.umaActual || 0) };
    const ok = await firestoreSetConfig(config);
    if (!ok) writeLocal(localKeys.configuracion, config);
    return config;
  },

  async listInfracciones() {
    return listRemoteOrLocal({
      localKey: localKeys.infracciones,
      fallback: seedInfracciones,
      collectionName: firestoreCollections.infracciones,
      sort: (items) => sortByDateDesc(items)
    });
  },

  async createInfraccion(payload) {
    return createRemoteOrLocal({
      localKey: localKeys.infracciones,
      fallback: seedInfracciones,
      collectionName: firestoreCollections.infracciones,
      prefix: "infraccion",
      payload
    });
  },

  async updateInfraccion(id, payload) {
    return updateRemoteOrLocal({
      localKey: localKeys.infracciones,
      fallback: seedInfracciones,
      collectionName: firestoreCollections.infracciones,
      id,
      payload
    });
  },

  async listPagos() {
    return listRemoteOrLocal({
      localKey: localKeys.pagos,
      fallback: seedPagos,
      collectionName: firestoreCollections.pagos,
      sort: (items) => sortByDateDesc(items)
    });
  },

  async createPago(payload) {
    return createRemoteOrLocal({
      localKey: localKeys.pagos,
      fallback: seedPagos,
      collectionName: firestoreCollections.pagos,
      prefix: "pago",
      payload
    });
  },

  async listGarantias() {
    return listRemoteOrLocal({
      localKey: localKeys.garantias,
      fallback: seedGarantias,
      collectionName: firestoreCollections.garantias,
      normalize: normalizeWarranty,
      sort: (items) => [...items].sort((a, b) => new Date(b.fechaResguardo || 0) - new Date(a.fechaResguardo || 0))
    });
  },

  async createGarantia(payload) {
    const item = await createRemoteOrLocal({
      localKey: localKeys.garantias,
      fallback: seedGarantias,
      collectionName: firestoreCollections.garantias,
      prefix: "garantia",
      payload,
      normalize: normalizeWarranty
    });
    await syncRecoleccion(item);
    return item;
  },

  async updateGarantia(id, payload) {
    await updateRemoteOrLocal({
      localKey: localKeys.garantias,
      fallback: seedGarantias,
      collectionName: firestoreCollections.garantias,
      id,
      payload,
      normalize: normalizeWarranty
    });
    const updated = (await this.listGarantias()).find((item) => item.id === id);
    if (updated) await syncRecoleccion(updated);
  },

  async deleteGarantia(id) {
    await deleteRemoteOrLocal({
      localKey: localKeys.garantias,
      fallback: seedGarantias,
      collectionName: firestoreCollections.garantias,
      id
    });
    await firestoreDelete(firestoreCollections.recolecciones, id);
  },

  saveInfraccion(payload) {
    return this.createInfraccion(payload);
  },

  getInfracciones() {
    return this.listInfracciones();
  },

  savePago(payload) {
    return this.createPago(payload);
  },

  getPagos() {
    return this.listPagos();
  },

  saveGarantia(payload) {
    return this.createGarantia(payload);
  },

  getGarantias() {
    return this.listGarantias();
  }
};
