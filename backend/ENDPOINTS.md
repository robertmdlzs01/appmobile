# Documentación de Endpoints - Backend Eventu

## Base URL

```
Producción: https://api.eventu.com/api
Desarrollo: http://localhost:3000/api
```

## Autenticación

Los endpoints públicos no requieren autenticación. Para endpoints protegidos, incluir:

```
Authorization: Bearer <token>
```

## Endpoints Disponibles

### Health Check

**GET** `/health`

Verifica el estado del servidor.

**Respuesta:**
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "uptime": 123.45
}
```

---

### Eventos

#### GET `/api/events`

Obtiene lista de eventos con filtros opcionales.

**Query Parameters:**
- `page` (number, default: 1) - Número de página
- `limit` (number, default: 20, max: 100) - Eventos por página
- `category` (string) - Filtrar por categoría
- `status` (string, default: 'publish') - Estado del evento
- `featured` (boolean) - Solo eventos destacados
- `dateFrom` (ISO8601) - Fecha desde
- `dateTo` (ISO8601) - Fecha hasta
- `search` (string) - Búsqueda en nombre, descripción, ubicación

**Ejemplo:**
```
GET /api/events?page=1&limit=20&category=Music&featured=true
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "SANTALAND 2025",
      "subtitle": "Evento navideño inolvidable",
      "description": "...",
      "date": "2025-12-12",
      "time": "18:00",
      "location": "Barranquilla",
      "price": 85000,
      "category": "Music",
      "images": ["..."],
      "status": "publish"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

#### GET `/api/events/:id`

Obtiene detalles de un evento específico.

**Parámetros:**
- `id` - ID de MongoDB, slug o WordPress ID

**Ejemplo:**
```
GET /api/events/507f1f77bcf86cd799439011
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "SANTALAND 2025",
    "subtitle": "Evento navideño inolvidable",
    "description": "...",
    "fullDescription": "...",
    "date": "2025-12-12",
    "time": "18:00",
    "location": "Barranquilla",
    "price": 85000,
    "category": "Music",
    "images": ["..."],
    "videoUrl": null,
    "promoter": "Eventu",
    "instructions": ["..."],
    "availableTickets": 1000,
    "soldTickets": 350,
    "status": "publish",
    "createdAt": "2025-01-XX...",
    "updatedAt": "2025-01-XX..."
  }
}
```

---

#### GET `/api/events/featured`

Obtiene eventos destacados.

**Query Parameters:**
- `limit` (number, default: 10, max: 50) - Cantidad de eventos

**Ejemplo:**
```
GET /api/events/featured?limit=10
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      ...
    }
  ]
}
```

---

#### POST `/api/events/sync`

Sincroniza eventos desde WordPress (webhook o manual).

**Headers:**
- `x-webhook-secret` (requerido) - Secret del webhook

**Body:**
```json
{
  "eventId": 123,
  "fullSync": false
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Evento creado",
  "data": {
    "created": true,
    "updated": false
  }
}
```

---

## Códigos de Estado HTTP

- `200` - Éxito
- `400` - Error de validación
- `401` - No autenticado
- `403` - No autorizado
- `404` - No encontrado
- `429` - Demasiadas solicitudes (rate limit)
- `500` - Error del servidor

## Manejo de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "campo",
      "message": "mensaje de error"
    }
  ]
}
```

## Rate Limiting

- **Límite:** 100 requests por 15 minutos por IP
- **Header de respuesta:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## WebSockets

**URL:** `wss://api.eventu.com` (producción) o `ws://localhost:3000` (desarrollo)

**Eventos:**
- `event:created` - Nuevo evento creado
- `event:updated` - Evento actualizado
- `event:deleted` - Evento eliminado

**Suscripción:**
```javascript
socket.emit('subscribe:events');
```

