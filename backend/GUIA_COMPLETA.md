# Guía Completa: Backend Intermediario Eventu

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Funciones y Servicios Creados](#funciones-y-servicios-creados)
4. [Instalación y Configuración Inicial](#instalación-y-configuración-inicial)
5. [Guía Paso a Paso de Integración con React Native](#guía-paso-a-paso-de-integración-con-react-native)
6. [Guía Paso a Paso de Despliegue](#guía-paso-a-paso-de-despliegue)
7. [Configuración de WordPress](#configuración-de-wordpress)
8. [Endpoints de la API](#endpoints-de-la-api)
9. [Troubleshooting](#troubleshooting)

---

## 📖 Descripción del Proyecto

Se ha desarrollado un **backend intermediario completo** que actúa como puente entre un sitio WordPress alojado en Plesk y una aplicación React Native existente. Este backend:

- ✅ **Consume la API REST de WordPress** para obtener eventos creados o actualizados
- ✅ **Sincroniza eventos automáticamente** mediante webhooks o polling periódico
- ✅ **Expone endpoints seguros** para que la app React Native recupere eventos en tiempo real o casi real
- ✅ **No requiere modificaciones** en el sitio WordPress ni en la app React Native existente
- ✅ **Utiliza tecnologías modernas**: Node.js/Express, MongoDB, Socket.IO, JWT

### Tecnologías Utilizadas

- **Backend**: Node.js 18+ con Express.js
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)
- **Tiempo Real**: Socket.IO (WebSockets)
- **Lenguaje**: TypeScript
- **Logging**: Winston
- **Validación**: express-validator
- **Seguridad**: Helmet, CORS, Rate Limiting

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   WordPress     │         │  Backend         │         │  React Native   │
│   (Plesk)       │────────▶│  Intermediario    │────────▶│     App         │
│                 │         │                  │         │                 │
│ • WP REST API   │         │ • Express.js     │         │ • useEvents()   │
│ • Webhooks      │         │ • MongoDB Cache  │         │ • FlatList      │
│ • Custom Posts  │         │ • Socket.IO      │         │ • Components    │
└─────────────────┘         │ • JWT Auth       │         └─────────────────┘
                             │ • Sync Service   │
                             └──────────────────┘
```

### Flujo de Datos

1. **WordPress → Backend**: 
   - Webhooks notifican cambios en eventos
   - O polling periódico consulta nuevos/actualizados
   - Backend consume WP REST API

2. **Backend → MongoDB**: 
   - Eventos se almacenan en MongoDB
   - Cache reduce carga en WordPress
   - Índices optimizan búsquedas

3. **Backend → App React Native**: 
   - API REST devuelve eventos en formato JSON
   - WebSockets notifican cambios en tiempo real
   - Compatible con componentes existentes

---

## 🔧 Funciones y Servicios Creados

### Estructura de Archivos

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Configuración MongoDB
│   │   └── wordpress.ts         # Configuración WordPress API
│   ├── controllers/
│   │   └── events.controller.ts # Controlador de eventos
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT y webhook auth
│   │   ├── error.middleware.ts  # Manejo de errores
│   │   └── validation.middleware.ts # Validación de requests
│   ├── models/
│   │   └── Event.ts             # Modelo MongoDB de Event
│   ├── routes/
│   │   └── events.routes.ts     # Rutas de la API
│   ├── services/
│   │   ├── wordpress.service.ts # Servicio WordPress API
│   │   ├── sync.service.ts      # Servicio de sincronización
│   │   ├── polling.service.ts   # Servicio de polling
│   │   └── websocket.service.ts # Servicio WebSocket
│   ├── utils/
│   │   ├── logger.ts            # Configuración Winston
│   │   └── jwt.utils.ts         # Helpers JWT
│   └── server.ts                # Servidor principal Express
├── scripts/
│   └── sync-events.ts           # Script de sincronización manual
└── package.json
```

### 1. WordPressService (`src/services/wordpress.service.ts`)

**Responsabilidad**: Comunicación con WordPress REST API

**Funciones principales**:

- `fetchEvents(params?)`: Obtiene lista de eventos desde WordPress
  - Parámetros: `page`, `per_page`, `status`, `after`, `before`
  - Retorna: Array de posts de WordPress
  - Maneja paginación automática

- `fetchEventById(id)`: Obtiene un evento específico por ID
  - Parámetros: ID numérico de WordPress
  - Retorna: Post individual con datos embebidos

- `transformWordPressPostToEvent(post)`: Convierte post de WP al formato de la app
  - Extrae campos ACF (Advanced Custom Fields)
  - Procesa imágenes del featured media
  - Convierte fechas y horas
  - Limpia HTML del contenido
  - Retorna objeto en formato compatible con la app

- `testConnection()`: Verifica conexión con WordPress
  - Hace request a la raíz de la API
  - Retorna boolean indicando éxito/fallo

- `stripHtml(html)`: Limpia etiquetas HTML de strings
- `extractSubtitle(excerpt)`: Extrae subtítulo del excerpt si no está en ACF

**Características**:
- Interceptores de axios para logging automático
- Timeout de 30 segundos
- Manejo robusto de errores con logging detallado
- Soporte para campos ACF (Advanced Custom Fields)
- Extracción automática de imágenes del featured media
- Transformación inteligente de datos

### 2. SyncService (`src/services/sync.service.ts`)

**Responsabilidad**: Sincronización de eventos entre WordPress y MongoDB

**Funciones principales**:

- `syncAllEvents()`: Sincronización completa de todos los eventos
  - Itera sobre todas las páginas de eventos
  - Sincroniza cada evento individualmente
  - Retorna estadísticas: `{ created, updated, errors }`

- `syncEvent(eventData)`: Sincroniza un evento individual
  - Detecta si es nuevo o actualizado
  - Crea o actualiza en MongoDB
  - Actualiza `lastSyncedAt`
  - Retorna: `{ created: boolean, updated: boolean }`

- `syncEventById(wordpressId)`: Sincroniza por ID de WordPress
  - Obtiene evento desde WordPress
  - Transforma y sincroniza
  - Manejo de errores individual

- `syncEventsSince(date)`: Sincronización incremental desde una fecha
  - Solo sincroniza eventos modificados después de la fecha
  - Optimiza tiempo y recursos
  - Retorna estadísticas

- `getLastSyncDate()`: Obtiene fecha de última sincronización
  - Consulta el evento más reciente en MongoDB
  - Usado para sincronización incremental

**Características**:
- Detecta automáticamente si un evento es nuevo o actualizado
- Manejo de errores por evento individual (no falla todo si uno falla)
- Logging detallado de operaciones
- Retorna estadísticas completas
- Optimizado para grandes volúmenes de datos

### 3. PollingService (`src/services/polling.service.ts`)

**Responsabilidad**: Sincronización periódica automática

**Funciones principales**:

- `start()`: Inicia el servicio de polling con cron
  - Configura job de cron según `POLLING_INTERVAL_MINUTES`
  - Ejecuta sincronización incremental automáticamente
  - Previene ejecuciones simultáneas

- `stop()`: Detiene el polling
  - Detiene el job de cron
  - Limpia recursos

- `runManualSync()`: Ejecuta sincronización manual
  - Útil para testing o sincronizaciones bajo demanda

**Características**:
- Configurable mediante variables de entorno
- Previene ejecuciones simultáneas (flag `isRunning`)
- Usa node-cron para programación
- Ejecuta sincronización incremental automática
- Logging de cada ejecución

### 4. WebSocketService (`src/services/websocket.service.ts`)

**Responsabilidad**: Comunicación en tiempo real vía WebSockets

**Funciones principales**:

- `initialize(httpServer)`: Inicializa Socket.IO
  - Configura CORS
  - Maneja conexiones/desconexiones
  - Configura salas de eventos

- `emitEvent(eventName, data)`: Emite evento a clientes
  - Emite a la sala 'events'
  - Logging de eventos emitidos

- `notifyEventCreated(event)`: Notifica nuevo evento
  - Emite evento `event:created`
  - Formato compatible con la app

- `notifyEventUpdated(event)`: Notifica evento actualizado
  - Emite evento `event:updated`

- `notifyEventDeleted(eventId)`: Notifica evento eliminado
  - Emite evento `event:deleted`

- `close()`: Cierra conexiones WebSocket

**Características**:
- Soporte para múltiples transportes (websocket, polling)
- Salas de eventos para suscripciones selectivas
- CORS configurable
- Manejo robusto de conexiones/desconexiones
- Eventos tipados y documentados

### 5. EventsController (`src/controllers/events.controller.ts`)

**Responsabilidad**: Lógica de negocio para endpoints de eventos

**Funciones principales**:

- `getEvents()`: GET /api/events - Lista de eventos con filtros
  - Filtros: categoría, fecha, búsqueda, estado, destacados
  - Paginación automática
  - Búsqueda en múltiples campos (nombre, descripción, ubicación)
  - Ordenamiento por fecha

- `getEventById()`: GET /api/events/:id - Detalles de evento
  - Busca por ID de MongoDB, slug o WordPress ID
  - Retorna 404 si no existe

- `getFeaturedEvents()`: GET /api/events/featured - Eventos destacados
  - Filtra por `featured: true`
  - Límite configurable

- `syncEvents()`: POST /api/events/sync - Sincronización manual/webhook
  - Sincroniza evento específico si se proporciona `eventId`
  - Sincronización completa si `fullSync: true`
  - Sincronización incremental por defecto

- `formatEventForApp(event)`: Formatea evento para la app
  - Convierte formato MongoDB al formato esperado por React Native
  - Compatible con componentes existentes

**Características**:
- Filtros avanzados y flexibles
- Paginación eficiente
- Búsqueda full-text en múltiples campos
- Formato compatible con app existente
- Manejo de errores robusto

### 6. Middleware de Autenticación (`src/middleware/auth.middleware.ts`)

**Funciones principales**:

- `authenticateToken()`: Verifica JWT token (requerido)
  - Extrae token del header `Authorization: Bearer <token>`
  - Verifica firma y expiración
  - Agrega `user` al request
  - Retorna 401/403 si falla

- `optionalAuth()`: Verifica JWT token (opcional)
  - Similar a `authenticateToken` pero no falla si no hay token
  - Útil para endpoints públicos con funcionalidad extra para autenticados

- `verifyWebhookSecret()`: Verifica secret de webhook
  - Valida header `x-webhook-secret`
  - Compara con `WEBHOOK_SECRET` de variables de entorno
  - Retorna 401 si no coincide

### 7. Middleware de Errores (`src/middleware/error.middleware.ts`)

**Funciones principales**:

- `errorHandler()`: Maneja errores de la aplicación
  - Captura todos los errores no manejados
  - Logging detallado según severidad
  - Respuesta JSON estandarizada
  - Stack trace en desarrollo

- `notFoundHandler()`: Maneja rutas no encontradas
  - Retorna 404 con mensaje descriptivo

- `CustomError`: Clase personalizada para errores
  - Extiende Error nativo
  - Incluye `statusCode` y `isOperational`
  - Útil para errores de negocio

### 8. Modelo Event (`src/models/Event.ts`)

**Campos principales**:

- `wordpressId`: ID en WordPress (único, indexado)
- `name`, `subtitle`, `description`, `fullDescription`
- `date`, `time`, `location`, `price`, `category`
- `images[]`, `videoUrl`, `promoter`, `instructions[]`
- `availableTickets`, `soldTickets`, `status`
- `slug`, `featured`, `lastSyncedAt`
- `createdAt`, `updatedAt` (timestamps automáticos)

**Índices optimizados**:
- `wordpressId` (único, para búsquedas rápidas)
- `slug` (único, para URLs amigables)
- `status + date` (para filtros comunes)
- `category` (para filtros por categoría)
- `featured` (para eventos destacados)
- `lastSyncedAt` (para sincronización incremental)

### 9. Logger (`src/utils/logger.ts`)

**Características**:
- Configuración con Winston
- Logs en archivos (`logs/combined.log`, `logs/error.log`)
- Logs en consola en desarrollo
- Niveles: debug, info, warn, error
- Formato estructurado con timestamps
- Rotación automática de archivos (5MB, 5 archivos)

### 10. Script de Sincronización Manual (`scripts/sync-events.ts`)

**Funcionalidad**:
- Ejecutable desde línea de comandos
- Sincronización completa: `npm run sync-events -- --full`
- Sincronización incremental por defecto
- Logging detallado de progreso
- Manejo de errores graceful

---

## 🚀 Instalación y Configuración Inicial

### Paso 1: Prerrequisitos

Asegúrate de tener instalado:
- **Node.js 18+** y npm
- **MongoDB** (local o MongoDB Atlas)
- Acceso a **WordPress** con REST API habilitada
- **Application Password** de WordPress

### Paso 2: Instalar Dependencias

```bash
cd backend
npm install
```

### Paso 3: Configurar Variables de Entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp env.example.txt .env
```

Edita `.env` con tus credenciales:

```env
# Puerto del servidor
PORT=3000

# URL del sitio WordPress en Plesk
WORDPRESS_URL=https://tu-sitio-wordpress.com
WORDPRESS_API_URL=https://tu-sitio-wordpress.com/wp-json/wp/v2

# Credenciales de WordPress API
WORDPRESS_USERNAME=tu_usuario
WORDPRESS_APPLICATION_PASSWORD=tu_application_password

# Custom Post Type de eventos
WORDPRESS_EVENT_POST_TYPE=evento

# Webhook secret para validar requests
WEBHOOK_SECRET=tu_secret_webhook_muy_seguro

# JWT Configuration
JWT_SECRET=tu_jwt_secret_muy_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/eventu_db
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/eventu_db

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Polling Configuration
POLLING_ENABLED=true
POLLING_INTERVAL_MINUTES=5

# Logging
LOG_LEVEL=info

# Environment
NODE_ENV=development
```

### Paso 4: Compilar TypeScript

```bash
npm run build
```

### Paso 5: Sincronizar Eventos Iniciales

```bash
npm run sync-events -- --full
```

Este comando sincronizará todos los eventos desde WordPress a MongoDB.

### Paso 6: Iniciar Servidor

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Paso 7: Verificar Funcionamiento

```bash
# Health check
curl http://localhost:3000/health

# Obtener eventos
curl http://localhost:3000/api/events
```

---

## 📱 Guía Paso a Paso de Integración con React Native

### Paso 1: Instalar Dependencias (Opcional para WebSockets)

Si quieres usar WebSockets para actualizaciones en tiempo real:

```bash
cd ..  # Volver a la raíz del proyecto
npm install socket.io-client
```

### Paso 2: Configurar Variables de Entorno en la App

Crea o edita `.env` en la raíz del proyecto React Native:

```env
EXPO_PUBLIC_API_URL=https://tu-backend.com/api
EXPO_PUBLIC_API_TOKEN=tu_token_jwt_opcional
```

**Nota**: Si usas Expo, las variables deben empezar con `EXPO_PUBLIC_` para estar disponibles en el cliente.

### Paso 3: Actualizar el Hook useEvents

Reemplaza el contenido de `hooks/useEvents.ts` con el siguiente código:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { cacheService } from '@/services/cache';

// Configuración del backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://tu-backend.com/api';
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN; // Opcional

interface Event {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  fullDescription?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  images?: string[];
  videoUrl?: string | null;
  promoter?: string;
  instructions?: string[];
  availableTickets?: number;
  soldTickets?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseEventsReturn {
  events: Event[];
  featuredEvents: Event[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

export function useEvents(forceRefresh = false): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Intentar cargar desde cache si no es forzado
      if (!force) {
        const cached = await cacheService.getCachedEvents();
        if (cached && cached.length > 0) {
          setEvents(cached);
          setLoading(false);
        }
      }

      // Headers con autenticación opcional
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (API_TOKEN) {
        headers['Authorization'] = `Bearer ${API_TOKEN}`;
      }

      // Obtener eventos normales
      const eventsResponse = await fetch(`${API_BASE_URL}/events?limit=100`, {
        headers,
      });

      if (!eventsResponse.ok) {
        throw new Error(`Error ${eventsResponse.status}: ${eventsResponse.statusText}`);
      }

      const eventsData = await eventsResponse.json();
      
      if (eventsData.success && eventsData.data) {
        setEvents(eventsData.data);
        await cacheService.cacheEvents(eventsData.data);
      }

      // Obtener eventos destacados
      const featuredResponse = await fetch(`${API_BASE_URL}/events/featured?limit=10`, {
        headers,
      });

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        if (featuredData.success && featuredData.data) {
          setFeaturedEvents(featuredData.data);
        }
      }

      setError(null);
    } catch (err: any) {
      console.error('Error loading events:', err);
      
      // Fallback a cache en caso de error
      const cached = await cacheService.getCachedEvents();
      if (cached && cached.length > 0) {
        setEvents(cached);
        setError(null);
      } else {
        setError(err.message || 'Error al cargar eventos');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents(true);
  }, [loadEvents]);

  useEffect(() => {
    loadEvents(forceRefresh);
  }, [loadEvents, forceRefresh]);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadEvents(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadEvents]);

  // Refresh cuando la app vuelve al foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        loadEvents(true);
      }
    });

    return () => subscription.remove();
  }, [loadEvents]);

  return {
    events,
    featuredEvents,
    loading,
    error,
    refreshing,
    refresh,
  };
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        
        // Intentar cache primero
        const cached = await cacheService.getCachedEventDetail(eventId);
        if (cached) {
          setEvent(cached);
          setLoading(false);
        }

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (process.env.EXPO_PUBLIC_API_TOKEN) {
          headers['Authorization'] = `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`;
        }

        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.data) {
          setEvent(data.data);
          await cacheService.cacheEventDetail(eventId, data.data);
        } else {
          throw new Error('Evento no encontrado');
        }

        setError(null);
      } catch (err: any) {
        console.error('Error loading event:', err);
        
        // Fallback a cache
        const cached = await cacheService.getCachedEventDetail(eventId);
        if (cached) {
          setEvent(cached);
          setError(null);
        } else {
          setError(err.message || 'Evento no encontrado');
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  return { event, loading, error };
}
```

### Paso 4: Crear Hook de WebSockets (Opcional)

Crea `hooks/useWebSocket.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://tu-backend.com';

export function useWebSocket(
  onEventCreated?: (event: any) => void,
  onEventUpdated?: (event: any) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al servidor
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Conectado al servidor WebSocket');
      socket.emit('subscribe:events');
    });

    socket.on('event:created', (event) => {
      console.log('Nuevo evento creado:', event);
      onEventCreated?.(event);
    });

    socket.on('event:updated', (event) => {
      console.log('Evento actualizado:', event);
      onEventUpdated?.(event);
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor WebSocket');
    });

    return () => {
      socket.emit('unsubscribe:events');
      socket.disconnect();
    };
  }, [onEventCreated, onEventUpdated]);

  return socketRef.current;
}
```

### Paso 5: Usar WebSockets en tu Componente (Opcional)

En tu componente principal (ej: `app/(tabs)/index.tsx`):

```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEvents } from '@/hooks/useEvents';

export default function HomeScreen() {
  const { events, featuredEvents, refresh } = useEvents();

  // Conectar WebSocket para actualizaciones en tiempo real
  useWebSocket(
    (newEvent) => {
      // Actualizar lista cuando se crea un evento
      refresh();
    },
    (updatedEvent) => {
      // Actualizar lista cuando se actualiza un evento
      refresh();
    }
  );

  // ... resto de tu componente
}
```

### Paso 6: Probar la Integración

1. Asegúrate de que el backend esté corriendo
2. Verifica que los eventos se hayan sincronizado desde WordPress
3. Ejecuta tu app React Native
4. Los eventos deberían cargarse desde el backend automáticamente

**Notas Importantes**:
- El formato de datos es compatible con tus componentes existentes (FlatList, etc.)
- El sistema de cache sigue funcionando como fallback
- Los errores se manejan gracefully con fallback a cache
- Los endpoints son públicos por defecto (puedes agregar JWT si lo necesitas)

---

## 🚢 Guía Paso a Paso de Despliegue

### Opción 1: Despliegue en Heroku (Recomendado para empezar)

#### Paso 1: Instalar Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# O descargar desde https://devcenter.heroku.com/articles/heroku-cli
```

#### Paso 2: Login a Heroku

```bash
heroku login
```

#### Paso 3: Crear Aplicación

```bash
cd backend
heroku create eventu-backend
```

#### Paso 4: Configurar Variables de Entorno

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
heroku config:set WORDPRESS_URL=https://tu-sitio-wordpress.com
heroku config:set WORDPRESS_USERNAME=tu_usuario
heroku config:set WORDPRESS_APPLICATION_PASSWORD=tu_password
heroku config:set WORDPRESS_EVENT_POST_TYPE=evento
heroku config:set MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/eventu_db
heroku config:set JWT_SECRET=tu_secret_muy_seguro
heroku config:set WEBHOOK_SECRET=tu_webhook_secret
heroku config:set POLLING_ENABLED=true
heroku config:set POLLING_INTERVAL_MINUTES=5
```

#### Paso 5: Configurar Buildpack

```bash
heroku buildpacks:set heroku/nodejs
```

#### Paso 6: Desplegar

```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### Paso 7: Verificar Despliegue

```bash
# Ver logs
heroku logs --tail

# Verificar health check
curl https://eventu-backend.herokuapp.com/health
```

### Opción 2: Despliegue con Docker

#### Paso 1: Crear Dockerfile

Crea `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Imagen de producción
FROM node:18-alpine

WORKDIR /app

# Copiar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "dist/server.js"]
```

#### Paso 2: Crear docker-compose.yml

Crea `backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - WORDPRESS_URL=${WORDPRESS_URL}
      - WORDPRESS_USERNAME=${WORDPRESS_USERNAME}
      - WORDPRESS_APPLICATION_PASSWORD=${WORDPRESS_APPLICATION_PASSWORD}
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - WEBHOOK_SECRET=${WEBHOOK_SECRET}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

#### Paso 3: Construir y Ejecutar

```bash
# Construir imagen
docker build -t eventu-backend .

# Ejecutar con docker-compose
docker-compose up -d

# O ejecutar manualmente
docker run -d \
  --name eventu-backend \
  -p 3000:3000 \
  --env-file .env \
  eventu-backend
```

### Opción 3: Despliegue en AWS EC2

#### Paso 1: Conectar a EC2

```bash
ssh -i tu-key.pem ubuntu@tu-ec2-ip
```

#### Paso 2: Instalar Node.js y PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

#### Paso 3: Clonar y Configurar

```bash
git clone https://github.com/tu-usuario/eventu-backend.git
cd eventu-backend/backend
npm install
cp env.example.txt .env
nano .env  # Editar con tus valores
```

#### Paso 4: Compilar y Ejecutar

```bash
npm run build
pm2 start dist/server.js --name eventu-backend
pm2 save
pm2 startup  # Configurar para iniciar al arrancar
```

#### Paso 5: Configurar Nginx

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/eventu-backend
```

Agregar configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/eventu-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Paso 6: Configurar SSL

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### Checklist de Despliegue

Antes de considerar el despliegue completo, verifica:

- [ ] Variables de entorno configuradas correctamente
- [ ] MongoDB accesible desde el servidor
- [ ] WordPress API accesible
- [ ] SSL/HTTPS configurado
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] Logs monitoreados
- [ ] Health checks funcionando (`/health`)
- [ ] Webhooks configurados en WordPress (o polling habilitado)
- [ ] Backup de base de datos configurado
- [ ] Monitoreo y alertas configurados

---

## 🔧 Configuración de WordPress

### Paso 1: Crear Application Password

1. Ve a **Usuarios → Tu Perfil** en WordPress
2. Desplázate hasta **Application Passwords**
3. Ingresa un nombre (ej: "Eventu Backend")
4. Haz clic en **Add New Application Password**
5. **Copia la contraseña generada** (solo se muestra una vez)
6. Úsala en `WORDPRESS_APPLICATION_PASSWORD` en tu `.env`

### Paso 2: Verificar Custom Post Type

Asegúrate de que WordPress tenga un Custom Post Type llamado `evento` (o el nombre que configuraste en `WORDPRESS_EVENT_POST_TYPE`).

Si no existe, puedes crearlo con un plugin como **Custom Post Type UI** o agregarlo en `functions.php`:

```php
function create_evento_post_type() {
    register_post_type('evento',
        array(
            'labels' => array(
                'name' => 'Eventos',
                'singular_name' => 'Evento'
            ),
            'public' => true,
            'show_in_rest' => true, // Importante para REST API
            'supports' => array('title', 'editor', 'thumbnail'),
        )
    );
}
add_action('init', 'create_evento_post_type');
```

### Paso 3: Configurar Campos ACF (Advanced Custom Fields)

Instala el plugin **Advanced Custom Fields** y crea los siguientes campos para el post type `evento`:

- **subtitle** (Text)
- **date** (Date Picker) - Formato: YYYY-MM-DD
- **time** (Time Picker) - Formato: HH:mm
- **location** (Text)
- **price** (Number)
- **category** (Text o Select)
- **images** (Gallery o Repeater con Image)
- **video_url** (URL)
- **promoter** (Text)
- **instructions** (Repeater con Text)
- **available_tickets** (Number)
- **sold_tickets** (Number)
- **featured** (True/False)

### Paso 4: Configurar Webhooks (Opcional pero Recomendado)

#### Opción A: Usar Plugin WP Webhooks

1. Instala el plugin **WP Webhooks** desde el repositorio de WordPress
2. Ve a **WP Webhooks → Send Data**
3. Crea un nuevo webhook:
   - **Webhook Name**: Eventu Backend Sync
   - **Webhook URL**: `https://tu-backend.com/api/events/sync`
   - **Request Method**: POST
   - **Request Headers**: 
     ```
     x-webhook-secret: tu_webhook_secret
     Content-Type: application/json
     ```
   - **Trigger**: Selecciona "Post Created" y "Post Updated"
   - **Post Types**: Selecciona "evento"
   - **Request Body**:
     ```json
     {
       "eventId": "{post_id}",
       "action": "{trigger_name}"
     }
     ```

#### Opción B: Código Personalizado

Agrega a `functions.php`:

```php
function notify_backend_on_event_change($post_id) {
    // Solo para el post type 'evento'
    if (get_post_type($post_id) !== 'evento') {
        return;
    }

    $webhook_url = 'https://tu-backend.com/api/events/sync';
    $webhook_secret = 'tu_webhook_secret';

    $body = array(
        'eventId' => $post_id,
        'action' => 'updated'
    );

    wp_remote_post($webhook_url, array(
        'headers' => array(
            'x-webhook-secret' => $webhook_secret,
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode($body),
        'timeout' => 5
    ));
}

add_action('save_post', 'notify_backend_on_event_change');
add_action('wp_insert_post', 'notify_backend_on_event_change');
```

### Paso 5: Verificar REST API

Prueba que la REST API funcione:

```bash
curl https://tu-sitio-wordpress.com/wp-json/wp/v2/evento
```

Deberías recibir una lista de eventos en formato JSON.

---

## 📊 Endpoints de la API

### GET /api/events

Obtiene lista de eventos con filtros opcionales.

**Query Parameters**:
- `page` (number): Número de página (default: 1)
- `limit` (number): Eventos por página (default: 20, max: 100)
- `category` (string): Filtrar por categoría
- `status` (string): Estado (default: 'publish')
- `featured` (boolean): Solo destacados
- `dateFrom` (ISO8601): Fecha desde
- `dateTo` (ISO8601): Fecha hasta
- `search` (string): Búsqueda

**Ejemplo**:
```bash
GET /api/events?page=1&limit=20&category=Music&featured=true
```

**Respuesta**:
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

### GET /api/events/:id

Obtiene detalles de un evento específico.

**Parámetros**:
- `id`: ID de MongoDB, slug o WordPress ID

### GET /api/events/featured

Obtiene eventos destacados.

**Query Parameters**:
- `limit` (number): Cantidad (default: 10, max: 50)

### POST /api/events/sync

Sincroniza eventos desde WordPress (webhook o manual).

**Headers**:
- `x-webhook-secret`: Secret del webhook (requerido)

**Body**:
```json
{
  "eventId": 123,
  "fullSync": false
}
```

### GET /health

Health check del servidor.

---

## 🐛 Troubleshooting

### Error: "No se pudo conectar a WordPress"

**Solución**:
1. Verifica que `WORDPRESS_URL` sea correcta
2. Asegúrate de que la REST API esté habilitada
3. Verifica las credenciales (username y application password)
4. Prueba la conexión manualmente:
   ```bash
   curl -u usuario:application_password https://tu-sitio.com/wp-json/wp/v2/
   ```

### Error: "Eventos no se sincronizan"

**Solución**:
1. Revisa los logs: `logs/combined.log` y `logs/error.log`
2. Verifica que el Custom Post Type `evento` exista
3. Comprueba que los campos ACF estén configurados
4. Ejecuta sincronización manual: `npm run sync-events -- --full`

### Error: "MongoDB connection error"

**Solución**:
1. Verifica que MongoDB esté corriendo (si es local)
2. Verifica `MONGODB_URI` en `.env`
3. Para MongoDB Atlas, verifica:
   - IP whitelist (debe incluir la IP del servidor)
   - Usuario y contraseña correctos
   - Network access configurado

### Error: "Webhook no funciona"

**Solución**:
1. Verifica que el webhook secret coincida en WordPress y backend
2. Revisa los logs del backend para ver si llegan requests
3. Prueba el webhook manualmente:
   ```bash
   curl -X POST https://tu-backend.com/api/events/sync \
     -H "x-webhook-secret: tu_secret" \
     -H "Content-Type: application/json" \
     -d '{"eventId": 123}'
   ```

### Error: "Rate limit exceeded"

**Solución**:
1. El backend tiene rate limiting configurado
2. Aumenta `RATE_LIMIT_MAX_REQUESTS` en `.env` si es necesario
3. Implementa cache en la app para reducir requests

### La app no muestra eventos

**Solución**:
1. Verifica que `EXPO_PUBLIC_API_URL` esté configurado correctamente
2. Prueba el endpoint manualmente:
   ```bash
   curl https://tu-backend.com/api/events
   ```
3. Revisa la consola de la app para errores
4. Verifica que el formato de respuesta sea compatible

---

## ✅ Validación del Flujo Completo

### Validación Automática

El backend incluye un script que valida todo el flujo automáticamente:

```bash
cd backend
npm run validate
```

Este script verifica:
- ✅ Backend está corriendo
- ✅ Eventos disponibles en la API
- ✅ Formato correcto de eventos
- ✅ Eventos destacados funcionando
- ✅ Sincronización con WordPress
- ✅ Compatibilidad con frontend

### Validación Manual Paso a Paso

#### 1. Verificar Backend

```bash
curl http://localhost:3000/health
```

#### 2. Sincronizar Eventos

```bash
npm run sync-events -- --full
```

#### 3. Verificar en API

```bash
curl http://localhost:3000/api/events
curl http://localhost:3000/api/events/featured
```

#### 4. Crear Evento en WordPress

1. Crea un nuevo evento del tipo `evento`
2. Completa campos ACF (date, time, location, price, category)
3. Publica el evento

#### 5. Sincronizar Nuevo Evento

**Con Webhooks**: Se sincroniza automáticamente

**Manual**:
```bash
curl -X POST http://localhost:3000/api/events/sync \
  -H "x-webhook-secret: tu_webhook_secret" \
  -H "Content-Type: application/json" \
  -d '{"eventId": 123}'
```

#### 6. Configurar App React Native

Crea `.env` en la raíz del proyecto:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Reinicia la app:
```bash
npm start -- --clear
```

#### 7. Verificar en la App

- ✅ Eventos cargándose desde el backend
- ✅ Nuevo evento apareciendo en la lista
- ✅ Tarjetas mostrando correctamente

### Checklist de Validación

- [ ] Backend corriendo y respondiendo en `/health`
- [ ] MongoDB conectado y con eventos sincronizados
- [ ] API devuelve eventos en `/api/events`
- [ ] Formato de eventos es correcto
- [ ] Evento creado en WordPress
- [ ] Evento sincronizado al backend
- [ ] Evento visible en la API
- [ ] `EXPO_PUBLIC_API_URL` configurado en la app
- [ ] App haciendo requests al backend
- [ ] Eventos apareciendo en la lista de la app
- [ ] Tarjetas de eventos mostrando correctamente

### Troubleshooting de Validación

**El evento no aparece en la API**:
- Verifica que esté publicado en WordPress (no borrador)
- Ejecuta sincronización manual: `npm run sync-events -- --full`
- Revisa logs: `logs/combined.log`

**El evento aparece en API pero no en la app**:
- Verifica `EXPO_PUBLIC_API_URL` en `.env`
- Reinicia app con `npm start -- --clear`
- Revisa consola para errores de red

**Error de CORS**:
- Verifica `CORS_ORIGIN` en `.env` o usa `*` para desarrollo

---

## 📝 Notas Finales

- El backend está diseñado para ser **no invasivo**: no requiere cambios en WordPress ni en la app React Native
- Los **webhooks son recomendados** para sincronización en tiempo real, pero el polling funciona como fallback
- El formato de datos es **compatible** con tus componentes existentes
- El sistema de **cache** en la app sigue funcionando como fallback
- Todos los endpoints son **públicos por defecto**, pero puedes agregar JWT si lo necesitas

Para más información, consulta los logs en `logs/combined.log` y `logs/error.log`.

---

**¡Listo!** Tu backend intermediario está completo y listo para sincronizar eventos entre WordPress y tu app React Native. 🚀
