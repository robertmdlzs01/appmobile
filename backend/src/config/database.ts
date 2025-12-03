import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(mongoUri);
    logger.info('✅ Conectado a MongoDB exitosamente');

    mongoose.connection.on('error', (err) => {
      logger.error('❌ Error de conexión a MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB desconectado');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Conexión a MongoDB cerrada por terminación de la aplicación');
      process.exit(0);
    });
  } catch (error) {
    logger.error('❌ Error al conectar a MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('Desconectado de MongoDB');
  } catch (error) {
    logger.error('Error al desconectar de MongoDB:', error);
    throw error;
  }
};
