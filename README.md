# Sistema Backend de Turnos y Reservas (API REST con FileSystem)

Primera versión funcional del backend para la gestión de servicios y reservas de turnos, construida con **Node.js**, **Express** y persistencia en archivos **JSON** mediante el módulo nativo `fs/promises`. Desarrollada bajo el estándar de **ECMAScript Modules (ESM)**.

---

## 📁 Estructura del Proyecto

```text
backend-servicios-reservas/
├── src/
│   ├── config/
│   │   └── env.config.js          # Carga y validación estricta de variables de entorno
│   ├── data/
│   │   ├── services.json          # Archivo de persistencia de servicios
│   │   └── bookings.json          # Archivo de persistencia de reservas
│   ├── managers/
│   │   ├── ServiceManager.js      # Gestor CRUD para servicios con FileSystem
│   │   └── BookingManager.js      # Gestor de reservas y vinculación de servicios
│   ├── routes/
│   │   ├── services.router.js     # Router Express para el recurso /api/services
│   │   └── bookings.router.js     # Router Express para el recurso /api/bookings
│   ├── app.js                     # Configuración de Express, middlewares y rutas
│   └── server.js                  # Inicialización y arranque del servidor HTTP
├── .env.example                   # Plantilla de variables de entorno requeridas
├── .gitignore                     # Exclusión de node_modules y .env
├── package.json                   # Dependencias, scripts y metadatos del proyecto
└── README.md                      # Documentación completa de la API
```

---

## ⚙️ Requisitos Previos

- **Node.js**: versión 18.x o superior
- **npm**: versión 9.x o superior

---

## 🛠️ Instalación y Configuración

1. Clonar el repositorio y ubicarse en la carpeta del proyecto:
   ```bash
   cd backend-servicios-reservas
   ```

2. Instalar las dependencias requeridas:
   ```bash
   npm install
   ```

3. Crear el archivo `.env` en la raíz del proyecto tomando como modelo `.env.example`:
   ```env
   PORT=8080
   NODE_ENV=development
   ```

---

## 🚀 Scripts de Ejecución

- **Modo Desarrollo** (con reinicio automático al guardar cambios mediante `--watch`):
  ```bash
  npm run dev
  ```

- **Modo Producción**:
  ```bash
  npm start
  ```

El servidor quedará escuchando en `http://localhost:8080`.

---

## 📡 Endpoints de la API

### 1. Recurso Services (`/api/services`)

Representa los servicios disponibles para agendar turnos.  
Formato de un servicio:
```json
{
  "id": 1,
  "name": "Corte de Cabello Clásico",
  "description": "Corte personalizado con tijera y máquina",
  "duration": 45,
  "price": 8500,
  "category": "Peluquería",
  "available": true
}
```

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **GET** | `/api/services` | Devuelve la lista completa de servicios. Permite filtros opcionales por query params (`?category=` y `?available=`). |
| **GET** | `/api/services/:sid` | Devuelve el detalle de un servicio específico por su `id`. |
| **POST** | `/api/services` | Crea un nuevo servicio. Valida todos los campos requeridos (`name`, `description`, `duration`, `price`, `category`, `available`). El `id` se autogenera. |
| **PUT** | `/api/services/:sid` | Actualiza un servicio existente. No permite modificar el `id`. |
| **DELETE** | `/api/services/:sid` | Elimina un servicio por su `id`. |

---

### 2. Recurso Bookings (`/api/bookings`)

Representa las reservas realizadas por los clientes y la asociación de servicios solicitados.  
Formato de una reserva:
```json
{
  "id": 1,
  "clientName": "Juan Pérez",
  "clientEmail": "juan.perez@example.com",
  "date": "2026-10-15",
  "time": "14:30",
  "status": "pending",
  "services": [
    {
      "service": 1,
      "quantity": 2
    }
  ]
}
```

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **POST** | `/api/bookings` | Crea una reserva (puede iniciarse con `services` vacío). Valida `clientName`, `clientEmail`, `date` y `time`. |
| **GET** | `/api/bookings/:bid` | Devuelve una reserva específica por su `id`. |
| **POST** | `/api/bookings/:bid/services/:sid` | Agrega un servicio a una reserva existente. Valida que existan tanto la reserva como el servicio. Si el servicio ya figuraba en la reserva, incrementa en 1 su propiedad `quantity`. |
| **GET** | `/api/bookings` | (Opcional) Devuelve la lista completa de reservas. |

---

## 🧪 Ejemplos de Peticiones

### Crear una reserva:
```bash
POST /api/bookings
Content-Type: application/json

{
  "clientName": "Laura Gómez",
  "clientEmail": "laura.gomez@example.com",
  "date": "2026-10-20",
  "time": "16:00"
}
```

### Asociar un servicio a una reserva:
```bash
POST /api/bookings/1/services/2
```
*Si se ejecuta por primera vez, agrega `{ "service": 2, "quantity": 1 }` al array `services`.*  
*Si se vuelve a ejecutar la misma petición, la reserva se actualizará a `{ "service": 2, "quantity": 2 }`.*

---

## 🔒 Persistencia

Todos los datos se guardan de forma permanente en los archivos `src/data/services.json` y `src/data/bookings.json`. Los cambios persisten aun cuando el servidor se reinicia o detiene.
