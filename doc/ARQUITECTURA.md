# Arquitectura de la API UXIA

## 🏗️ Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (REST)                             │
│                    (curl, Postman, Web)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                              │
│                   (server.js - PORT 3000)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  REQUEST MIDDLEWARE                      │  │
│  │  - express.json()                                        │  │
│  │  - authMiddleware (valida API Key)                       │  │
│  │  - adminMiddleware (verifica rol admin)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ROUTING                               │  │
│  │                                                          │  │
│  │  /api/users        → userRoutes.js                       │  │
│  │  /api/petitions    → petitionRoutes.js                   │  │
│  │  /api/responses    → responseRoutes.js                   │  │
│  │  /api-docs         → Swagger UI                          │  │
│  │  /health           → Health Check                        │  │
│  │  /health/db        → Database Health Check               │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  CONTROLLERS                             │  │
│  │                                                          │  │
│  │  userController.js                                       │  │
│  │  ├─ loginUser()                                          │  │
│  │  ├─ getAllUsers()                                        │  │
│  │  ├─ getUserById()                                        │  │
│  │  └─ createUser()                                         │  │
│  │                                                          │  │
│  │  petitionController.js                                   │  │
│  │  ├─ createPetition()                                     │  │
│  │  ├─ getPetitions()                                       │  │
│  │  ├─ getPetitionById()                                    │  │
│  │  ├─ getPetitionsByUser()                                 │  │
│  │  ├─ updatePetition()                                     │  │
│  │  └─ deletePetition()                                     │  │
│  │                                                          │  │
│  │  responseController.js                                   │  │
│  │  ├─ getResponseByPetition()                              │  │
│  │  ├─ createResponse()                                     │  │
│  │  ├─ updateResponse()                                     │  │
│  │  ├─ deleteResponse()                                     │  │
│  │  └─ getAllResponses()                                    │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
│                             ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MODELS (Sequelize)                    │  │
│  │                                                          │  │
│  │  User.js          Token.js         Petition.js          │  │
│  │  ├─ id            ├─ id            ├─ id                │  │
│  │  ├─ nickname      ├─ userId ────┐  ├─ userId ──────┐   │  │
│  │  ├─ email         ├─ token       │  ├─ prompt       │   │  │
│  │  ├─ telefon       └─ createdAt   │  ├─ images       │   │  │
│  │  ├─ passwordHash                 │  ├─ model        │   │  │
│  │  ├─ role                         │  └─ createdAt    │   │  │
│  │  └─ createdAt                    │                  │   │  │
│  │       ↓                          │                  │   │  │
│  │     (1:1)                        ↓                  ↓   │  │
│  │                                                    (1:N)│  │
│  │                         Response.js                      │  │
│  │                         ├─ id                            │  │
│  │                         ├─ petitionId ─────────→ (1:1)  │  │
│  │                         ├─ status                        │  │
│  │                         ├─ message                       │  │
│  │                         ├─ data (JSON)                   │  │
│  │                         └─ createdAt                     │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL/MariaDB)                      │
│                                                                  │
│  Tables:                                                         │
│  ├─ users        (id, nickname, email, telefon, passwordHash, │
│  │               role, createdAt, updatedAt)                   │
│  │                                                              │
│  ├─ tokens       (id, userId, token, createdAt, updatedAt)     │
│  │                                                              │
│  ├─ petitions    (id, userId, prompt, images, model,          │
│  │               createdAt, updatedAt)                         │
│  │                                                              │
│  └─ responses    (id, petitionId, status, message, data,       │
│                   createdAt, updatedAt)                        │
│                                                                  │
│  Relaciones:                                                     │
│  └─ users (1) ──→ (N) petitions                                 │
│  └─ users (1) ──→ (1) tokens                                    │
│  └─ petitions (1) ──→ (1) responses                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Flujo de Datos

### 1️⃣ Flujo de Registro y Autenticación

```
┌─────────────────┐
│  Cliente: POST  │
│ /api/users/login│
└────────┬────────┘
         │
         ├─ Datos: nickname, email, telefon
         ↓
┌────────────────────┐
│ userController     │
│ loginUser()        │
└────────┬───────────┘
         │
         ├─ Validar email no duplicado
         ├─ Crear usuario en BD
         ├─ Generar API Key (token)
         ├─ Guardar token en tabla Tokens
         ↓
┌────────────────────────────┐
│ Respuesta: 201 CREATED     │
│ {                          │
│   status: "OK",            │
│   data: {                  │
│     nickname,              │
│     email,                 │
│     api_key: "abc123..."   │
│   }                        │
│ }                          │
└────────────────────────────┘
```

### 2️⃣ Flujo de Creación de Petición

```
┌────────────────────────┐
│ Cliente: POST          │
│ /api/petitions         │
│ Header: X-API-Key: ... │
└────────┬───────────────┘
         │
         ├─ Datos: prompt, model, images
         ↓
┌────────────────────────┐
│ authMiddleware         │
│ - Valida API Key       │
│ - Obtiene userId       │
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ petitionController     │
│ createPetition()       │
└────────┬───────────────┘
         │
         ├─ Validar campos obligatorios
         ├─ Crear petición en BD
         ├─ Incluir userId automáticamente
         ↓
┌────────────────────────────┐
│ Respuesta: 201 CREATED     │
│ {                          │
│   status: "OK",            │
│   data: {                  │
│     id, prompt, model, ... │
│   }                        │
│ }                          │
└────────────────────────────┘
```

### 3️⃣ Flujo de Respuesta a Petición

```
┌─────────────────────────┐
│ Cliente: POST           │
│ /api/responses/         │
│ petition/:petitionId    │
│ Header: X-API-Key: ...  │
└────────┬────────────────┘
         │
         ├─ Datos: status, message, data
         ↓
┌────────────────────────┐
│ authMiddleware         │
│ - Valida API Key       │
└────────┬───────────────┘
         │
         ↓
┌────────────────────────┐
│ responseController     │
│ createResponse()       │
└────────┬───────────────┘
         │
         ├─ Validar campos
         ├─ Validar petición existe
         ├─ Validar sin respuesta previa
         ├─ Crear respuesta en BD
         ↓
┌────────────────────────────┐
│ Respuesta: 201 CREATED     │
│ {                          │
│   status: "OK",            │
│   data: {                  │
│     id, petitionId,        │
│     status, message, data  │
│   }                        │
│ }                          │
└────────────────────────────┘
```

---

## 🔐 Flujo de Seguridad

```
┌──────────────────┐
│ Cliente envia    │
│ API Key          │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────┐
│ authMiddleware           │
│ ┌────────────────────┐   │
│ │ Busca en header    │   │
│ │ X-API-Key: ...     │   │
│ └────────┬───────────┘   │
│          │ si no existe   │
│          ↓                │
│ ┌────────────────────┐   │
│ │ Busca en query     │   │
│ │ ?api_key=...       │   │
│ └────────┬───────────┘   │
│          │                │
│          ↓                │
│ ┌────────────────────┐   │
│ │ Valida en BD       │   │
│ │ SELECT * FROM      │   │
│ │ tokens WHERE       │   │
│ │ token = ?          │   │
│ └────────┬───────────┘   │
│          │                │
│          ├─ NO EXISTE     │
│          │ ↓              │
│          │ 401 Unauth.    │
│          │                │
│          ├─ EXISTE        │
│          │ ↓              │
│          │ req.userId = X │
│          │ next()         │
│          ↓                │
└──────────────────────────┘
         │
         ↓
┌──────────────────────┐
│ Controller           │
│ Usa req.userId       │
│ para validaciones    │
│ de propiedad         │
└──────────────────────┘
```

---

## 📡 Endpoints por Grupo

### 🧑 Usuarios (4 endpoints)
```
POST   /api/users/login         Registrarse + API Key
GET    /api/users               Listar todos
GET    /api/users/:id           Obtener uno
POST   /api/users               Crear (alternativo)
```

### 📝 Peticiones (6 endpoints)
```
GET    /api/petitions           Listar todas (paginado)
POST   /api/petitions           Crear [AUTH]
GET    /api/petitions/me        Mis peticiones [AUTH]
GET    /api/petitions/:id       Obtener una
PUT    /api/petitions/:id       Actualizar [AUTH]
DELETE /api/petitions/:id       Eliminar [AUTH]
```

### 💬 Respuestas (5 endpoints)
```
GET    /api/responses                    Listar todas [AUTH]
GET    /api/responses/petition/:id       Obtener una
POST   /api/responses/petition/:id       Crear [AUTH]
PUT    /api/responses/petition/:id       Actualizar [AUTH]
DELETE /api/responses/petition/:id       Eliminar [AUTH]
```

---

## ⚙️ Configuración y Variables de Entorno

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=uxia_db
DB_PORT=3306

# Autenticación
JWT_SECRET=your_secret_key (opcional para JWT futuro)
```

---

## 🧪 Stack Tecnológico

```
├─ Framework
│  └─ Express.js 4.x
│
├─ Base de Datos
│  ├─ MySQL/MariaDB
│  └─ Sequelize ORM
│
├─ Autenticación
│  └─ Token API Key
│
├─ Documentación
│  ├─ Swagger/OpenAPI
│  └─ Markdown
│
├─ Testing
│  ├─ Jest
│  └─ Supertest
│
└─ Utilidades
   ├─ dotenv
   ├─ crypto
   └─ moment (opcional)
```

---

## 📈 Escalabilidad Futura

```
Actual:
┌─────────────────┐
│  Single Server  │
│  Express + Node │
└────────┬────────┘
         │
         ↓
    MySQL DB

Futuro:
┌────────────┬────────────┬────────────┐
│ Load Bal.  │ Load Bal.  │ Load Bal.  │
└─────┬──────┴─────┬──────┴──────┬─────┘
      │            │             │
   Server 1     Server 2     Server N
      │            │             │
      └────────┬───┴────┬────────┘
               │        │
          ┌────┴───┬────┴────┐
          │  Cache │ Database │
          │ Redis  │ Cluster  │
          └────────┴──────────┘
```

---

## 🎯 Características Implementadas

| Feature | Implementado | Ubicación |
|---------|--------------|-----------|
| CRUD Usuarios | ✅ | userController |
| CRUD Peticiones | ✅ | petitionController |
| CRUD Respuestas | ✅ | responseController |
| Autenticación | ✅ | authMiddleware |
| Validaciones | ✅ | Todos los controllers |
| Paginación | ✅ | getPetitions, getAllResponses |
| Relaciones BD | ✅ | Models & index.js |
| Swagger Docs | ✅ | swagger.js + rutas |
| Tests | ✅ | tests/api.test.js |
| Health Checks | ✅ | server.js |
| Error Handling | ✅ | Todos los endpoints |

---

## 📚 Referencias Rápidas

- **Documentación Swagger**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`
- **DB Health**: `http://localhost:3000/health/db`
- **Detalles API**: Ver [API_ENDPOINTS.md](./API_ENDPOINTS.md)
- **Guía de Uso**: Ver [GUIA_USO.md](./GUIA_USO.md)

---

**Última Actualización**: 6 de febrer del 2026
**Versión**: 1.0.0
**Estado**: ✅ Completamente Implementado
