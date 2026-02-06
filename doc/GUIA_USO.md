# UXIA API - Guía de Uso

## 📋 Resumen

Se han implementado todos los endpoints de la API NodeJS para el proyecto UXIA, incluyendo:

- **Usuarios**: Registro, login y gestión
- **Peticiones**: CRUD completo de peticiones
- **Respuestas**: CRUD completo de respuestas asociadas a peticiones
- **Autenticación**: Mediante API Key (token)

## 🚀 Iniciando el servidor

```bash
npm install
npm start
```

El servidor se iniciará en `http://localhost:3000`

## 📚 Documentación de la API

Accede a la documentación interactiva de Swagger en:
```
http://localhost:3000/api-docs
```

## 🔑 Autenticación

### 1. Registrar un usuario (obtener API Key)

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "SparkleFuzzMcGee",
    "email": "user@example.com",
    "telefon": "+34 600 000 000"
  }'
```

**Respuesta:**
```json
{
  "status": "OK",
  "message": "L'usuari s'ha creat correctament",
  "data": {
    "nickname": "SparkleFuzzMcGee",
    "email": "user@example.com",
    "api_key": "abc123def456..."
  }
}
```

### 2. Usar la API Key en los endpoints protegidos

**Opción 1: Header**
```bash
curl -X GET http://localhost:3000/api/petitions/me \
  -H "X-API-Key: abc123def456..."
```

**Opción 2: Query Parameter**
```bash
curl -X GET "http://localhost:3000/api/petitions/me?api_key=abc123def456..."
```

## 📝 Ejemplos de uso

### Crear una petición

```bash
curl -X POST http://localhost:3000/api/petitions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu_api_key" \
  -d '{
    "prompt": "Genera una imagen de un gato",
    "model": "stable-diffusion",
    "images": null
  }'
```

### Obtener mis peticiones

```bash
curl -X GET "http://localhost:3000/api/petitions/me?page=1&limit=10" \
  -H "X-API-Key: tu_api_key"
```

### Crear respuesta para una petición

```bash
curl -X POST http://localhost:3000/api/responses/petition/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu_api_key" \
  -d '{
    "status": "completed",
    "message": "Imagen generada exitosamente",
    "data": {
      "imageUrl": "https://...",
      "generatedAt": "2026-02-06T10:30:00Z"
    }
  }'
```

### Actualizar una petición

```bash
curl -X PUT http://localhost:3000/api/petitions/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tu_api_key" \
  -d '{
    "prompt": "Genera una imagen de un perro",
    "model": "dall-e-3"
  }'
```

### Eliminar una petición

```bash
curl -X DELETE http://localhost:3000/api/petitions/1 \
  -H "X-API-Key: tu_api_key"
```

## 🔒 Errores comunes

| Código | Mensaje | Solución |
|--------|---------|----------|
| 401 | API Key requerida | Incluye el header `X-API-Key` |
| 401 | API Key inválida | Verifica que la API Key sea correcta |
| 403 | No tens permís | Solo puedes editar tus propias peticiones |
| 404 | No encontrada | Verifica que el ID existe |
| 409 | Email ja registrat | Usa otro email para registrar un nuevo usuario |
| 409 | Ja existeix una resposta | Ya existe respuesta para esta petición |

## 📊 Health Check

Verifica el estado del servidor:

```bash
# Estado general
curl http://localhost:3000/health

# Estado de la base de datos
curl http://localhost:3000/health/db
```

## 🗂️ Estructura de archivos nuevos

```
src/
├── controllers/
│   ├── petitionController.js    ✅ NUEVO
│   ├── responseController.js    ✅ NUEVO
│   └── userController.js
├── routes/
│   ├── petitionRoutes.js        ✅ NUEVO
│   ├── responseRoutes.js        ✅ NUEVO
│   └── userRoutes.js            (actualizado)
└── middleware/
    └── authMiddleware.js        ✅ NUEVO

API_ENDPOINTS.md                 ✅ NUEVO (Documentación detallada)
```

## 🔄 Flujo de datos

```
Usuario se registra en /api/users/login
        ↓
Obtiene API Key (token)
        ↓
Crea petición en /api/petitions
        ↓
Sistema procesa la petición
        ↓
Crea respuesta en /api/responses/petition/{id}
        ↓
Usuario obtiene respuesta con /api/responses/petition/{id}
```

## 📱 Respuestas estándar

Todas las respuestas siguen el formato:

**Success:**
```json
{
  "status": "OK",
  "message": "Descripción de éxito (opcional)",
  "data": { /* objeto o array */ },
  "pagination": { /* si aplica */ }
}
```

**Error:**
```json
{
  "status": "ERROR",
  "message": "Descripción del error"
}
```

## 🧪 Testing

Para probar todos los endpoints, consulta [API_ENDPOINTS.md](./API_ENDPOINTS.md) para una documentación detallada de cada uno.

## 📦 Dependencias principales

- `express` - Framework web
- `sequelize` - ORM para base de datos
- `swagger-ui-express` - Documentación interactiva
- `dotenv` - Variables de entorno
- `crypto` - Generación de tokens

## ⚙️ Configuración

Variables de entorno necesarias en `.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=uxia_db
```

## 📞 Soporte

Para preguntas o problemas, revisa la documentación interactiva en:
```
http://localhost:3000/api-docs
```

---

**Última actualización**: 6 de febrer del 2026
**Estado**: ✅ Implementación completa
