# API Endpoints - UXIA NodeJS Server

## Resumen de Endpoints Implementados

### 1. USUARIOS (Users)

#### POST /api/users/login
- **Descripción**: Registrar usuario y generar API Key
- **Método**: POST
- **Parámetros**: 
  - `nickname` (string, requerido)
  - `email` (string, requerido)
  - `telefon` (string, requerido)
- **Respuesta**: 
  ```json
  {
    "status": "OK",
    "message": "L'usuari s'ha creat correctament",
    "data": {
      "nickname": "...",
      "email": "...",
      "api_key": "..."
    }
  }
  ```
- **Códigos de error**:
  - 400: Falten camps obligatoris
  - 409: Email ja registrat
  - 500: Error interno

#### GET /api/users
- **Descripción**: Obtener todos los usuarios
- **Método**: GET
- **Respuesta**: Array de usuarios con id, nickname, email, role, createdAt
- **Códigos de error**:
  - 500: Error interno

#### GET /api/users/:id
- **Descripción**: Obtener usuario por ID
- **Método**: GET
- **Parámetros**: `id` (integer, path)
- **Respuesta**: Objeto usuario
- **Códigos de error**:
  - 404: Usuario no encontrado
  - 500: Error interno

#### POST /api/users
- **Descripción**: Crear nuevo usuario
- **Método**: POST
- **Parámetros**:
  - `nickname` (string, requerido)
  - `email` (string, requerido)
  - `password` (string, requerido)
  - `role` (string, opcional, default: 'user')
- **Respuesta**: Objeto usuario creado
- **Códigos de error**:
  - 400: Error de validación
  - 500: Error interno

---

### 2. PETICIONES (Petitions)

#### GET /api/petitions
- **Descripción**: Obtener todas las peticiones con paginación
- **Método**: GET
- **Parámetros Query**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
  - `userId` (integer, opcional)
- **Respuesta**:
  ```json
  {
    "status": "OK",
    "data": [...],
    "pagination": {
      "total": 0,
      "page": 1,
      "limit": 10,
      "totalPages": 0
    }
  }
  ```
- **Códigos de error**:
  - 500: Error interno

#### POST /api/petitions
- **Descripción**: Crear nueva petición
- **Método**: POST
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros**:
  - `prompt` (string, requerido)
  - `images` (string, opcional)
  - `model` (string, requerido)
- **Respuesta**:
  ```json
  {
    "status": "OK",
    "message": "Petició creada correctament",
    "data": {
      "id": 0,
      "prompt": "...",
      "model": "...",
      "images": null,
      "createdAt": "..."
    }
  }
  ```
- **Códigos de error**:
  - 400: Falten camps obligatoris
  - 401: API Key requerida o inválida
  - 500: Error interno

#### GET /api/petitions/me
- **Descripción**: Obtener mis peticiones (del usuario autenticado)
- **Método**: GET
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros Query**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
- **Respuesta**: Array de peticiones con paginación
- **Códigos de error**:
  - 401: API Key requerida o inválida
  - 500: Error interno

#### GET /api/petitions/:id
- **Descripción**: Obtener petición por ID
- **Método**: GET
- **Parámetros**: `id` (integer, path)
- **Respuesta**: Objeto petición con respuesta asociada
- **Códigos de error**:
  - 404: Petición no encontrada
  - 500: Error interno

#### PUT /api/petitions/:id
- **Descripción**: Actualizar petición
- **Método**: PUT
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros**: `id` (integer, path)
- **Body**:
  - `prompt` (string, opcional)
  - `images` (string, opcional)
  - `model` (string, opcional)
- **Respuesta**: Objeto petición actualizado
- **Códigos de error**:
  - 401: API Key requerida o inválida
  - 403: No tens permís per actualitzar aquesta petició
  - 404: Petición no encontrada
  - 500: Error interno

#### DELETE /api/petitions/:id
- **Descripción**: Eliminar petición
- **Método**: DELETE
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros**: `id` (integer, path)
- **Respuesta**:
  ```json
  {
    "status": "OK",
    "message": "Petició eliminada correctament"
  }
  ```
- **Códigos de error**:
  - 401: API Key requerida o inválida
  - 403: No tens permís per eliminar aquesta petició
  - 404: Petición no encontrada
  - 500: Error interno

---

### 3. RESPUESTAS (Responses)

#### GET /api/responses
- **Descripción**: Obtener todas las respuestas (para admin)
- **Método**: GET
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros Query**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
  - `status` (string, opcional)
- **Respuesta**: Array de respuestas con paginación
- **Códigos de error**:
  - 401: API Key requerida o inválida
  - 500: Error interno

#### GET /api/responses/petition/:petitionId
- **Descripción**: Obtener respuesta de una petición
- **Método**: GET
- **Parámetros**: `petitionId` (integer, path)
- **Respuesta**: Objeto respuesta
- **Códigos de error**:
  - 404: Petición o respuesta no encontrada
  - 500: Error interno

#### POST /api/responses/petition/:petitionId
- **Descripción**: Crear respuesta para una petición
- **Método**: POST
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros**: `petitionId` (integer, path)
- **Body**:
  - `status` (string, requerido) - ej: "completed", "pending", "error"
  - `message` (string, requerido)
  - `data` (object, opcional)
- **Respuesta**:
  ```json
  {
    "status": "OK",
    "message": "Resposta creada correctament",
    "data": {
      "id": 0,
      "petitionId": 0,
      "status": "...",
      "message": "...",
      "data": null,
      "createdAt": "..."
    }
  }
  ```
- **Códigos de error**:
  - 400: Falten camps obligatoris
  - 401: API Key requerida o inválida
  - 404: Petición no encontrada
  - 409: Ja existeix una resposta per aquesta petició
  - 500: Error interno

#### PUT /api/responses/petition/:petitionId
- **Descripción**: Actualizar respuesta
- **Método**: PUT
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros**: `petitionId` (integer, path)
- **Body**:
  - `status` (string, opcional)
  - `message` (string, opcional)
  - `data` (object, opcional)
- **Respuesta**: Objeto respuesta actualizado
- **Códigos de error**:
  - 401: API Key requerida o inválida
  - 404: Respuesta no encontrada
  - 500: Error interno

#### DELETE /api/responses/petition/:petitionId
- **Descripción**: Eliminar respuesta
- **Método**: DELETE
- **Autenticación**: Requerida (X-API-Key header)
- **Parámetros**: `petitionId` (integer, path)
- **Respuesta**:
  ```json
  {
    "status": "OK",
    "message": "Resposta eliminada correctament"
  }
  ```
- **Códigos de error**:
  - 401: API Key requerida o inválida
  - 404: Respuesta no encontrada
  - 500: Error interno

---

## Autenticación

Los endpoints protegidos requieren una API Key que se obtiene en el registro de usuario (`/api/users/login`).

### Cómo usar la autenticación:
- **Header**: `X-API-Key: <tu_api_key>`
- **Query Parameter**: `?api_key=<tu_api_key>`

---

## Cambios Realizados

1. ✅ Creado `petitionController.js` con métodos CRUD completos
2. ✅ Creado `responseController.js` con métodos para gestionar respuestas
3. ✅ Creado `petitionRoutes.js` con todos los endpoints
4. ✅ Creado `responseRoutes.js` con todos los endpoints
5. ✅ Creado `authMiddleware.js` para validar API Keys
6. ✅ Actualizado `server.js` para integrar las nuevas rutas
7. ✅ Actualizado `userRoutes.js` reordenando las rutas para evitar conflictos

---

## Estructura de Base de Datos

- **Users**: id, nickname, email, telefon, passwordHash, role
- **Tokens**: id, userId (FK), token
- **Petitions**: id, userId (FK), prompt, images, model
- **Responses**: id, petitionId (FK), status, message, data (JSON)

---

## URLs de Referencia

- **Documentación Swagger**: `http://localhost:3000/api-docs`
- **Health Check**: `http://localhost:3000/health`
- **DB Health Check**: `http://localhost:3000/health/db`
