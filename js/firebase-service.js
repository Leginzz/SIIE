import { firebaseConfig, hasFirebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const localKeys = {
  infracciones: "siie_infracciones",
  pagos: "siie_pagos"
};

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
    garantia: "Licencia",
    garantiaEstado: "Retenida",
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
    motivo: "No respetar semáforo",
    monto: 1200,
    agente: "Agente 014",
    garantia: "Tarjeta de circulación",
    garantiaEstado: "Liberada",
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

let db = null;

if (hasFirebaseConfig) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

function readLocal(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(stored);
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function withId(documentSnapshot) {
  return { id: documentSnapshot.id, ...documentSnapshot.data() };
}

export const dataService = {
  isFirestoreEnabled: hasFirebaseConfig,

  async login(user, password) {
    if (!hasFirebaseConfig) {
      return user === "admin@siie.local" && password === "admin123"
        ? { nombre: "Administrador SIIE", rol: "Administrador", usuario: user }
        : null;
    }

    const users = await getDocs(collection(db, "usuarios"));
    return users.docs.map(withId).find((item) => item.usuario === user && item.password === password) || null;
  },

  async listInfracciones() {
    if (!hasFirebaseConfig) {
      return readLocal(localKeys.infracciones, seedInfracciones);
    }

    const result = await getDocs(query(collection(db, "infracciones"), orderBy("fecha", "desc")));
    return result.docs.map(withId);
  },

  async createInfraccion(payload) {
    if (!hasFirebaseConfig) {
      const items = readLocal(localKeys.infracciones, seedInfracciones);
      const item = { id: crypto.randomUUID(), ...payload };
      writeLocal(localKeys.infracciones, [item, ...items]);
      return item;
    }

    const docRef = await addDoc(collection(db, "infracciones"), {
      ...payload,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...payload };
  },

  async updateInfraccion(id, payload) {
    if (!hasFirebaseConfig) {
      const items = readLocal(localKeys.infracciones, seedInfracciones);
      const updated = items.map((item) => (item.id === id ? { ...item, ...payload } : item));
      writeLocal(localKeys.infracciones, updated);
      return;
    }

    await updateDoc(doc(db, "infracciones", id), payload);
  },

  async listPagos() {
    if (!hasFirebaseConfig) {
      return readLocal(localKeys.pagos, seedPagos);
    }

    const result = await getDocs(query(collection(db, "pagos"), orderBy("fecha", "desc")));
    return result.docs.map(withId);
  },

  async createPago(payload) {
    if (!hasFirebaseConfig) {
      const items = readLocal(localKeys.pagos, seedPagos);
      const item = { id: crypto.randomUUID(), ...payload };
      writeLocal(localKeys.pagos, [item, ...items]);
      return item;
    }

    const docRef = await addDoc(collection(db, "pagos"), {
      ...payload,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...payload };
  }
};
