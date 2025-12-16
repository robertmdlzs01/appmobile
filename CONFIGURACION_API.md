# Configuración de API para Backend Real

## 📱 Configuración en la App React Native

### Paso 1: Variables de Entorno

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
# URL del backend en producción
EXPO_PUBLIC_API_URL=https://api.eventu.co/api

# Token JWT opcional (si los endpoints requieren autenticación)
EXPO_PUBLIC_API_TOKEN=tu_token_jwt_opcional

# Timeout de requests (opcional, default: 30000ms)
EXPO_PUBLIC_API_TIMEOUT=30000
```

**Importante:** En Expo, las variables deben empezar con `EXPO_PUBLIC_` para estar disponibles en el cliente.

### Paso 2: Verificar Configuración

El servicio de API está configurado en:
- `services/api.ts` - Servicio base de API
- `services/events.api.ts` - Endpoints específicos de eventos (actualizado para usar backend real)
- `services/tickets.api.ts` - Endpoints de tickets (actualizado para usar backend real)
- `services/purchases.api.ts` - ⚠️ Deprecado: Las compras se gestionan en la web (eventu.co)
- `hooks/useEvents.ts` - Hook que consume la API

### Paso 3: Probar Conexión

```bash
# En desarrollo, puedes probar con:
curl https://api.eventu.co/api/events
```

## 🔧 Configuración en el Backend

El backend está ubicado en la carpeta `backend/`. Ver `backend/README.md` para instrucciones completas.

### Variables de Entorno Necesarias

En el archivo `.env` del backend (`backend/.env`):

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=production

# Base de Datos MySQL (Plesk)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eventu_db
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql

# JWT Secret (para autenticación)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS - Orígenes permitidos (separados por comas)
CORS_ORIGIN=https://eventu.co,https://www.eventu.co,https://app.eventu.co

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WordPress Integration (opcional)
WP_URL=https://eventu.co
WP_API_URL=https://eventu.co/wp-json/wp/v2
```

### Base de Datos MySQL

1. **Crear la base de datos:**
   - Ejecuta el script `backend/database/schema.sql` en MySQL
   - Puedes hacerlo desde phpMyAdmin en Plesk

2. **Configurar credenciales:**
   - Obtén las credenciales de MySQL desde Plesk
   - Actualiza `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` en `.env`

### Endpoints Disponibles

**Eventos:**
- `GET /api/events` - Lista de eventos (con filtros: page, limit, category, status, featured, dateFrom, dateTo, search)
- `GET /api/events/:id` - Detalle de evento
- `GET /api/events/featured` - Eventos destacados

**Tickets:**
- `GET /api/tickets` - Tickets del usuario (requiere autenticación)
- `GET /api/tickets/:id` - Detalle de ticket (requiere autenticación)
- `GET /api/tickets/:id/validation` - Estado de validación (requiere autenticación)
- `POST /api/tickets/:id/validate` - Validar/escaneear ticket (requiere autenticación)

**Nota sobre Compras:**
Las compras se gestionan en la web (eventu.co), no en esta app. La app redirige a la web para realizar compras.

**Sistema:**
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

## 🚀 Despliegue en Plesk

### Backend

1. **Sube el código al servidor:**
   ```bash
   # Desde tu máquina local
   cd backend
   npm install
   npm run build
   # Sube la carpeta backend/ al servidor vía FTP/SFTP o Git
   ```

2. **Configura Node.js en Plesk:**
   - Ve a "Node.js" en el panel de Plesk
   - Selecciona la versión de Node.js (18+)
   - Establece el archivo de inicio: `dist/server.js`
   - Establece el directorio de aplicación: `backend/`
   - Configura las variables de entorno desde `.env`

3. **Crea un subdominio:**
   - Crea `api.eventu.co` o usa un subdirectorio
   - Apunta al directorio del backend

4. **Configura la base de datos:**
   - Ejecuta `backend/database/schema.sql` en MySQL desde phpMyAdmin
   - Verifica las credenciales de conexión

5. **Inicia la aplicación:**
   - Desde el panel de Plesk, inicia la aplicación Node.js
   - Verifica que el servidor esté corriendo: `https://api.eventu.co/health`

### Integración con WordPress

Si necesitas sincronizar eventos desde WordPress:

1. **Configura variables de WordPress en `.env`:**
   ```env
   WP_DB_NAME=wordpress_db
   WP_DB_USER=wordpress_user
   WP_DB_PASSWORD=wordpress_password
   ```

2. **Ejecuta el script de sincronización:**
   ```bash
   cd backend
   npm run sync:wordpress
   ```

   O configura un cron job en Plesk para ejecutarlo periódicamente.

3. **Ver `backend/README.md`** para más detalles sobre la conexión con Plesk/WordPress.

### App

1. Actualiza `EXPO_PUBLIC_API_URL` en `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://api.eventu.co/api
   ```

2. Reinicia la app:
   ```bash
   npm start -- --clear
   ```

3. La app se conectará automáticamente al backend real

## 📝 Notas

- El servicio de API maneja automáticamente timeouts (30 segundos por defecto)
- Los errores se manejan gracefully con fallback a cache
- El formato de datos es compatible con los componentes existentes
- El backend se conecta directamente a MySQL en Plesk
- Los servicios de la app han sido actualizados para usar el backend real en lugar de datos mock
- Para desarrollo local, puedes usar `http://localhost:3000/api` como `EXPO_PUBLIC_API_URL`

## 🔗 Archivos Importantes

- `backend/README.md` - Documentación completa del backend
- `backend/README.md` - Documentación del backend y conexión con Plesk/WordPress
- `backend/database/schema.sql` - Script de creación de base de datos
- `backend/env.example` - Ejemplo de variables de entorno

