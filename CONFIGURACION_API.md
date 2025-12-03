# Configuración de API para Backend Real

## 📱 Configuración en la App React Native

### Paso 1: Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
# URL del backend en producción
EXPO_PUBLIC_API_URL=https://api.eventu.com/api

# Token JWT opcional (si los endpoints requieren autenticación)
EXPO_PUBLIC_API_TOKEN=tu_token_jwt_opcional

# Timeout de requests (opcional, default: 30000ms)
EXPO_PUBLIC_API_TIMEOUT=30000
```

**Importante:** En Expo, las variables deben empezar con `EXPO_PUBLIC_` para estar disponibles en el cliente.

### Paso 2: Verificar Configuración

El servicio de API está configurado en:
- `services/api.ts` - Servicio base de API
- `services/events.api.ts` - Endpoints específicos de eventos
- `hooks/useEvents.ts` - Hook que consume la API

### Paso 3: Probar Conexión

```bash
# En desarrollo, puedes probar con:
curl https://api.eventu.com/api/events
```

## 🔧 Configuración en el Backend

### Variables de Entorno Necesarias

En el archivo `.env` del backend:

```env
# URL base del API (para logs y documentación)
API_BASE_URL=https://api.eventu.com

# CORS - Lista de orígenes permitidos (separados por comas)
CORS_ORIGIN=https://app.eventu.com,https://eventu.com,https://www.eventu.com

# Puerto del servidor
PORT=3000

# Resto de configuración...
```

### Endpoints Disponibles

- `GET /api/events` - Lista de eventos
- `GET /api/events/:id` - Detalle de evento
- `GET /api/events/featured` - Eventos destacados
- `POST /api/events/sync` - Sincronización (requiere webhook secret)
- `GET /health` - Health check

## 🔒 Seguridad

### CORS

El backend está configurado para aceptar requests desde:
- Los dominios especificados en `CORS_ORIGIN`
- O `*` para desarrollo (no recomendado en producción)

### Rate Limiting

- 100 requests por 15 minutos por IP
- Configurable en `.env`:
  ```env
  RATE_LIMIT_WINDOW_MS=900000
  RATE_LIMIT_MAX_REQUESTS=100
  ```

### Autenticación

Los endpoints son públicos por defecto. Para agregar autenticación:

1. Configura `JWT_SECRET` en el backend
2. Genera tokens en tu servicio de autenticación
3. Pasa el token en el header: `Authorization: Bearer <token>`

## 📊 Estructura de Respuesta

Todas las respuestas siguen este formato:

```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }  // Solo en listas
}
```

Errores:

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ]
}
```

## 🧪 Testing

### Probar Endpoints Manualmente

```bash
# Health check
curl https://api.eventu.com/health

# Obtener eventos
curl https://api.eventu.com/api/events

# Obtener evento específico
curl https://api.eventu.com/api/events/EVENT_ID

# Eventos destacados
curl https://api.eventu.com/api/events/featured?limit=10
```

### Desde la App

1. Configura `EXPO_PUBLIC_API_URL` en `.env`
2. Reinicia la app: `npm start -- --clear`
3. Los eventos deberían cargarse automáticamente

## 🚀 Despliegue

### Backend

1. Despliega el backend en tu servidor (Heroku, AWS, etc.)
2. Configura las variables de entorno
3. Asegúrate de que `CORS_ORIGIN` incluya la URL de tu app
4. Verifica que el dominio tenga SSL/HTTPS

### App

1. Actualiza `EXPO_PUBLIC_API_URL` con la URL real del backend
2. Compila la app para producción
3. La app se conectará automáticamente al backend real

## 📝 Notas

- El servicio de API maneja automáticamente timeouts (30 segundos por defecto)
- Los errores se manejan gracefully con fallback a cache
- El formato de datos es compatible con los componentes existentes
- Los WebSockets están disponibles en `wss://api.eventu.com` (producción)

