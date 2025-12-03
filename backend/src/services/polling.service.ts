import cron from 'node-cron';
import logger from '../utils/logger';
import { SyncService } from './sync.service';

export class PollingService {
  private syncService: SyncService;
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  constructor(syncService: SyncService) {
    this.syncService = syncService;
  }

  /**
   * Inicia el servicio de polling periódico
   */
  start(): void {
    const pollingEnabled = process.env.POLLING_ENABLED === 'true';
    
    if (!pollingEnabled) {
      logger.info('Polling deshabilitado en configuración');
      return;
    }

    const intervalMinutes = parseInt(process.env.POLLING_INTERVAL_MINUTES || '5', 10);
    
    if (intervalMinutes < 1) {
      logger.warn('Intervalo de polling inválido, usando 5 minutos por defecto');
      return;
    }

    const cronExpression = `*/${intervalMinutes} * * * *`;

    logger.info(`🔄 Iniciando polling cada ${intervalMinutes} minutos`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      if (this.isRunning) {
        logger.warn('Polling ya en ejecución, saltando esta iteración');
        return;
      }

      try {
        this.isRunning = true;
        logger.info('🔄 Ejecutando sincronización periódica...');
        
        const lastSyncDate = await this.syncService.getLastSyncDate();
        const sinceDate = lastSyncDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const result = await this.syncService.syncEventsSince(sinceDate);
        
        logger.info(
          `✅ Polling completado: ${result.created} creados, ${result.updated} actualizados, ${result.errors} errores`
        );
      } catch (error) {
        logger.error('Error en polling:', error);
      } finally {
        this.isRunning = false;
      }
    });

    this.cronJob.fire();
  }

  /**
   * Detiene el servicio de polling
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Polling detenido');
    }
  }

  /**
   * Ejecuta una sincronización manual
   */
  async runManualSync(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Sincronización ya en ejecución');
    }

    try {
      this.isRunning = true;
      logger.info('🔄 Ejecutando sincronización manual...');
      
      const lastSyncDate = await this.syncService.getLastSyncDate();
      const sinceDate = lastSyncDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      await this.syncService.syncEventsSince(sinceDate);
    } finally {
      this.isRunning = false;
    }
  }
}
