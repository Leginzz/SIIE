# SIIE - Sistema Integral de Infracciones Electronicas

Prototipo web estatico para Transito de Tuxpan, listo para publicarse en GitHub Pages.

## Modulos incluidos

- Login de acceso.
- Dashboard operativo.
- Captura de infracciones.
- Generacion automatica de folio y codigo QR.
- Modulo de caja.
- Registro de pagos.
- Control de garantias.
- Reportes y exportacion CSV.
- Persistencia en Firebase Firestore cuando se configura el proyecto.

## Publicacion en GitHub Pages

1. Sube esta carpeta a un repositorio de GitHub.
2. En GitHub, abre `Settings > Pages`.
3. Selecciona la rama principal y la carpeta raiz.
4. Guarda la configuracion y espera a que Pages publique el sitio.

## Configuracion de Firebase

Edita `js/firebase-config.js` y reemplaza los valores vacios por los datos de tu app web de Firebase:

```js
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxx"
};
```

Colecciones usadas:

- `usuarios`: usuario, password, nombre, rol.
- `infracciones`: folio, conductor, licencia, placas, vehiculo, motivo, monto, agente, garantia, garantiaEstado, ubicacion, observaciones, estado, fecha.
- `pagos`: recibo, folio, metodo, importe, fecha.

Mientras Firebase no este configurado, el sistema funciona en modo demostracion usando almacenamiento local del navegador.

Usuario demo:

- Usuario: `admin@siie.local`
- Contrasena: `admin123`
