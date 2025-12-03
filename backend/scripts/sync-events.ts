#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { connectDatabase } from '../src/config/database';
import { getWordPressConfig } from '../src/config/wordpress';
import { SyncService } from '../src/services/sync.service';
import { WordPressService } from '../src/services/wordpress.service';
import logger from '../src/utils/logger';

async function main() {
  try {
    const args = process.argv.slice(2);
    const fullSync = args.includes('--full');

    logger.info('🔄 Iniciando sincronización manual...');

    await connectDatabase();

    const wpConfig = getWordPressConfig();
    const wpService = new WordPressService(wpConfig);

    const connected = await wpService.testConnection();
    if (!connected) {
      logger.error('❌ No se pudo conectar a WordPress');
      process.exit(1);
    }

    const syncService = new SyncService(wpService);

    let result;
    if (fullSync) {
      logger.info('Ejecutando sincronización completa...');
      result = await syncService.syncAllEvents();
    } else {
      logger.info('Ejecutando sincronización incremental...');
      const lastSyncDate = await syncService.getLastSyncDate();
      const sinceDate = lastSyncDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
      result = await syncService.syncEventsSince(sinceDate);
    }

    logger.info('✅ Sincronización completada:');
    logger.info(`   - Creados: ${result.created}`);
    logger.info(`   - Actualizados: ${result.updated}`);
    logger.info(`   - Errores: ${result.errors}`);

    process.exit(0);
  } catch (error) {
    logger.error('❌ Error en sincronización:', error);
    process.exit(1);
  }
}

main();
