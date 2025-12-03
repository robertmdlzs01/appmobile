import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import http from 'http';
import { connectDatabase } from './config/database';
import { getWordPressConfig } from './config/wordpress';
import { EventsController } from './controllers/events.controller';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import Event from './models/Event';
import { createEventsRouter } from './routes/events.routes';
import { PollingService } from './services/polling.service';
import { SyncService } from './services/sync.service';
import { WebSocketService } from './services/websocket.service';
import { WordPressService } from './services/wordpress.service';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

let wordpressService: WordPressService;
let syncService: SyncService;
let pollingService: PollingService;
let webSocketService: WebSocketService;

app.use(helmet());
app.use(compression());

const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-webhook-secret'],
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

async function initializeServices(): Promise<void> {
  try {
    await connectDatabase();

    const wpConfig = getWordPressConfig();
    wordpressService = new WordPressService(wpConfig);

    const wpConnected = await wordpressService.testConnection();
    if (!wpConnected) {
      logger.warn('⚠️ No se pudo verificar conexión con WordPress, continuando...');
    }

    syncService = new SyncService(wordpressService);
    pollingService = new PollingService(syncService);
    webSocketService = new WebSocketService();

    webSocketService.initialize(server);

    const eventsController = new EventsController(syncService);
    const eventsRouter = createEventsRouter(eventsController);

    app.use('/api/events', eventsRouter);

    const originalSyncEvent = syncService.syncEvent.bind(syncService);
    syncService.syncEvent = async (eventData) => {
      const result = await originalSyncEvent(eventData);
      
      try {
        if (result.created || result.updated) {
          const event = await Event.findOne({
            wordpressId: parseInt(eventData.id),
          }).lean();
          if (event) {
            if (result.created) {
              webSocketService.notifyEventCreated(event);
            } else {
              webSocketService.notifyEventUpdated(event);
            }
          }
        }
      } catch (error) {
        logger.error('Error al notificar evento vía WebSocket:', error);
      }
      
      return result;
    };

    pollingService.start();

    logger.info('✅ Servicios inicializados correctamente');
  } catch (error) {
    logger.error('❌ Error al inicializar servicios:', error);
    throw error;
  }
}

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await initializeServices();

    server.listen(PORT, '0.0.0.0', () => {
      const apiUrl = process.env.API_BASE_URL || `http://localhost:${PORT}`;
      logger.info(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      logger.info(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API disponible en: ${apiUrl}/api`);
      logger.info(`🌐 CORS configurado para: ${process.env.CORS_ORIGIN || '*'}`);
      logger.info(`📋 Endpoints disponibles:`);
      logger.info(`   GET  ${apiUrl}/api/events`);
      logger.info(`   GET  ${apiUrl}/api/events/:id`);
      logger.info(`   GET  ${apiUrl}/api/events/featured`);
      logger.info(`   POST ${apiUrl}/api/events/sync`);
      logger.info(`   GET  ${apiUrl}/health`);
    });
  } catch (error) {
    logger.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  pollingService?.stop();
  webSocketService?.close();
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  pollingService?.stop();
  webSocketService?.close();
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

export default app;
