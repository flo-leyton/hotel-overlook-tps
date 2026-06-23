# Despliegue en Render — Hotel Overlook TPS

Este proyecto debe desplegarse en Render como **Web Service Node.js**. No debe desplegarse como Static Site, porque el frontend consume una API Express y usa SQLite.

## Configuración en Render

- Build Command:

```bash
npm install
```

- Start Command:

```bash
npm start
```

## Variables de entorno sugeridas

Para demo académica sin disco persistente:

```text
NODE_ENV=production
SQLITE_PATH=database/hotel_overlook_tps.sqlite
```

Si se configura Render Disk para mayor persistencia:

```text
NODE_ENV=production
SQLITE_PATH=/var/data/hotel_overlook_tps.sqlite
```

## Rutas esperadas

Local:

```text
http://localhost:3000/api/health
http://localhost:3000/
http://localhost:3000/landing-pages/hotel-overlook.html
http://localhost:3000/dashboard/recepcion/dashboard-recepcion.html
```

Render:

```text
/api/health
/
/landing-pages/hotel-overlook.html
/dashboard/recepcion/dashboard-recepcion.html
```

## SQLite en Render

El archivo `database/hotel_overlook_tps.sqlite` se mantiene en el repositorio para la demo académica inicial.

En Render Free, si no se usa Persistent Disk, los cambios realizados en SQLite pueden perderse después de reinicios o redeploys. Para mayor persistencia, configurar un Render Disk y usar:

```text
SQLITE_PATH=/var/data/hotel_overlook_tps.sqlite
```

Para producción real, se recomienda migrar a PostgreSQL. Esa migración queda fuera del alcance actual del TPS.

## Pasos para subir a GitHub y conectar Render

1. Verificar que `node_modules/` no se suba al repositorio.
2. Confirmar que `.gitignore` incluye `.env`, logs y archivos SQLite `*.sqlite-wal` / `*.sqlite-shm`.
3. Subir el proyecto a GitHub.
4. En Render, crear un nuevo **Web Service**.
5. Conectar el repositorio de GitHub.
6. Configurar:
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
7. Agregar variables de entorno.
8. Desplegar.

## Pruebas locales antes del deploy

```bash
npm install
npm start
```

Luego abrir:

```text
http://localhost:3000/api/health
http://localhost:3000/
http://localhost:3000/dashboard/recepcion/dashboard-recepcion.html
http://localhost:3000/landing-pages/hotel-overlook.html
```
