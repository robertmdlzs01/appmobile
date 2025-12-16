# Backend API para Eventu

Backend Node.js/Express que se conecta a MySQL en Plesk (donde está alojado WordPress) para la aplicación Eventu.

## 🚀 Características

- ✅ Conexión a MySQL (Plesk)
- ✅ Endpoints REST para eventos y tickets
- ✅ Gestión de entradas y validaciones
- ⚠️ Las compras se gestionan en la web (no en esta app)
- ✅ Autenticación JWT
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Manejo de errores
- ✅ TypeScript

## 📋 Requisitos Previos

- Node.js 18+ 
- MySQL 5.7+ o 8.0+
- Acceso a la base de datos en Plesk

## 🔧 Instalación

1. **Instalar dependencias:**

```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL de Plesk:

```env
DB_HOST=tu_host_mysql
DB_PORT=3306
DB_NAME=eventu_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password
```

3. **Crear base de datos:**

Ejecuta el script SQL en tu MySQL de Plesk:

```bash
mysql -u tu_usuario -p < database/schema.sql
```

O ejecuta el contenido de `database/schema.sql` desde el panel de Plesk (phpMyAdmin).

## 🏃 Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

El servidor se ejecutará en `http://localhost:3000` (o el puerto configurado en `.env`).

## 📡 Endpoints

### Health Check

```
GET /health
```

### Eventos

- `GET /api/events` - Lista de eventos (con filtros opcionales)
- `GET /api/events/featured` - Eventos destacados
- `GET /api/events/:id` - Detalle de evento

**Query params para `/api/events`:**
- `page` - Número de página
- `limit` - Límite de resultados
- `category` - Filtrar por categoría
- `status` - Filtrar por estado
- `featured` - Solo destacados (true/false)
- `dateFrom` - Fecha desde (YYYY-MM-DD)
- `dateTo` - Fecha hasta (YYYY-MM-DD)
- `search` - Búsqueda de texto

### Tickets

- `GET /api/tickets` - Tickets del usuario (requiere autenticación)
- `GET /api/tickets/:id` - Detalle de ticket (requiere autenticación)
- `GET /api/tickets/:id/validation` - Estado de validación (requiere autenticación)
- `POST /api/tickets/:id/validate` - Validar/escaneear ticket (requiere autenticación)

### Nota sobre Compras

Las compras se gestionan en la web (eventu.co), no en esta app. Esta app se enfoca en:
- Visualización de eventos
- Gestión de entradas (tickets)
- Validación de tickets
- Facturación (si aplica)

Los tickets pueden tener un `purchase_id` que referencia a una compra realizada en la web.

## 🔐 Autenticación

Los endpoints que requieren autenticación necesitan un token JWT en el header:

```
Authorization: Bearer <token>
```

Para generar tokens, necesitarás implementar un endpoint de login o usar tu sistema de autenticación existente.

## 📊 Estructura de Respuesta

Todas las respuestas siguen este formato:

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }  // Solo en listas
}
```

**Error:**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 🔗 Conexión con Plesk/WordPress

El backend se conecta directamente a MySQL en Plesk donde está alojado WordPress.

### Configuración

Configura las credenciales de MySQL en `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=eventu_db
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
```

### Sincronización con WordPress

Para sincronizar eventos desde WordPress:

```bash
npm run sync:wordpress
```

El script `scripts/sync-wordpress.ts` se conecta a la misma base de datos MySQL y sincroniza eventos.

## 🚀 Despliegue en Plesk

1. **Sube el código al servidor:**
   - Usa Git o FTP para subir el código
   - Colócalo en un subdirectorio o subdominio (ej: `api.eventu.co`)

2. **Configura Node.js en Plesk:**
   - Ve a "Node.js" en el panel de Plesk
   - Selecciona la versión de Node.js
   - Establece el archivo de inicio: `dist/server.js`
   - Configura las variables de entorno desde `.env`

3. **Configura el dominio:**
   - Crea un subdominio (ej: `api.eventu.co`)
   - Apunta al directorio del backend

4. **Instala dependencias y compila:**
   ```bash
   npm install
   npm run build
   ```

5. **Inicia la aplicación:**
   - Desde el panel de Plesk, inicia la aplicación Node.js

## 🔒 Seguridad

- ✅ Helmet.js para headers de seguridad
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validación de entrada
- ✅ Prepared statements (protección SQL injection)

## 📝 Notas

- Asegúrate de que las credenciales de MySQL tengan los permisos necesarios
- En producción, usa variables de entorno seguras
- Configura SSL/HTTPS en Plesk
- Considera usar un proxy reverso (Nginx) delante de Node.js

## 🐛 Troubleshooting

**Error de conexión a MySQL:**
- Verifica las credenciales en `.env`
- Asegúrate de que MySQL esté accesible desde el servidor
- Verifica que el usuario tenga permisos en la base de datos

**Error 404 en rutas:**
- Verifica que las rutas estén correctamente configuradas
- Asegúrate de que el servidor esté ejecutándose

**Error de autenticación:**
- Verifica que `JWT_SECRET` esté configurado
- Asegúrate de enviar el token en el header `Authorization`

