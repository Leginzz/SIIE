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
- Sistema de roles: Administrador, Oficial, Cajero y Auxiliar Operativo.
- Gestión local de usuarios.
- CRUD completo de garantías.
- Persistencia demo con LocalStorage.

## Publicacion en GitHub Pages

1. Sube esta carpeta a un repositorio de GitHub.
2. En GitHub, abre `Settings > Pages`.
3. Selecciona la rama principal y la carpeta raiz.
4. Guarda la configuracion y espera a que Pages publique el sitio.

## Modo demo

El sistema funciona con LocalStorage del navegador, sin backend y sin Firebase. Los datos se conservan en el navegador donde se use el prototipo.

Usuarios demo:

- Usuario: `admin@siie.local`
- Contrasena: `admin123`
- Usuario: `oficial@siie.local`
- Contrasena: `oficial123`
- Usuario: `cajero@siie.local`
- Contrasena: `cajero123`
- Usuario: `auxiliar@siie.local`
- Contrasena: `auxiliar123`
- Usuario: `jefe@siie.local`
- Contrasena: `jefe123`
- Usuario: `supervisor@siie.local`
- Contrasena: `supervisor123`

## Permisos

- Administrador: acceso completo, usuarios, reportes y estadisticas.
- Oficial: captura infracciones, genera folios y QR, consulta solo sus infracciones.
- Cajero: consulta infracciones, registra pagos y gestiona devolucion de garantias.
- Auxiliar Operativo: consulta recolecciones, ve detalles y marca garantias como recogidas o entregadas en oficina.
- Los permisos adicionales por usuario se suman a los permisos del rol base y no reducen permisos existentes.
- Jefe Administrativo: rol Cajero con permisos extra para reportes y usuarios.
- Supervisor Operativo: rol Oficial con permiso extra para reportes.
