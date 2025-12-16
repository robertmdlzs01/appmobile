import dotenv from 'dotenv';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { testConnection } from './config/database';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Importar rutas
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import ticketsRouter from './routes/tickets';
import usersRouter from './routes/users';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  },
});

app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected ? 'Servidor funcionando correctamente' : 'Error de conexión a la base de datos',
    timestamp: new Date().toISOString(),
  });
});

// Rutas API
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/tickets', ticketsRouter);

// Manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;

