import Event from '../models/Event';
import logger from '../utils/logger';
import { WordPressEventData, WordPressService } from './wordpress.service';

export class SyncService {
  private wordpressService: WordPressService;

  constructor(wordpressService: WordPressService) {
    this.wordpressService = wordpressService;
  }

  /**
   * Sincroniza todos los eventos desde WordPress
   */
  async syncAllEvents(): Promise<{ created: number; updated: number; errors: number }> {
    let created = 0;
    let updated = 0;
    let errors = 0;
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    logger.info('🔄 Iniciando sincronización completa de eventos...');

    try {
      while (hasMore) {
        const posts = await this.wordpressService.fetchEvents({
          page,
          per_page: perPage,
          status: 'publish',
        });

        if (posts.length === 0) {
          hasMore = false;
          break;
        }

        for (const post of posts) {
          try {
            const eventData = this.wordpressService.transformWordPressPostToEvent(post);
            const result = await this.syncEvent(eventData);
            
            if (result.created) created++;
            if (result.updated) updated++;
          } catch (error) {
            errors++;
            logger.error(`Error al sincronizar evento ${post.id}:`, error);
          }
        }

        if (posts.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }

      logger.info(
        `✅ Sincronización completada: ${created} creados, ${updated} actualizados, ${errors} errores`
      );

      return { created, updated, errors };
    } catch (error) {
      logger.error('Error crítico en sincronización:', error);
      throw error;
    }
  }

  /**
   * Sincroniza un evento específico
   */
  async syncEvent(eventData: WordPressEventData): Promise<{ created: boolean; updated: boolean }> {
    try {
      const wordpressId = parseInt(eventData.id);
      
      const existingEvent = await Event.findOne({ wordpressId });

      const eventDoc = {
        wordpressId,
        name: eventData.name,
        subtitle: eventData.subtitle,
        description: eventData.description,
        fullDescription: eventData.fullDescription,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        price: eventData.price,
        category: eventData.category,
        images: eventData.images,
        videoUrl: eventData.videoUrl,
        promoter: eventData.promoter,
        instructions: eventData.instructions,
        availableTickets: eventData.availableTickets,
        soldTickets: eventData.soldTickets,
        status: eventData.status,
        slug: eventData.slug,
        featured: eventData.featured || false,
        lastSyncedAt: new Date(),
      };

      if (existingEvent) {
        await Event.updateOne({ wordpressId }, eventDoc);
        logger.debug(`Evento ${wordpressId} actualizado`);
        return { created: false, updated: true };
      } else {
        await Event.create(eventDoc);
        logger.debug(`Evento ${wordpressId} creado`);
        return { created: true, updated: false };
      }
    } catch (error) {
      logger.error(`Error al sincronizar evento ${eventData.id}:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza un evento por su ID de WordPress
   */
  async syncEventById(wordpressId: number): Promise<{ created: boolean; updated: boolean }> {
    try {
      const post = await this.wordpressService.fetchEventById(wordpressId);
      const eventData = this.wordpressService.transformWordPressPostToEvent(post);
      return await this.syncEvent(eventData);
    } catch (error) {
      logger.error(`Error al sincronizar evento ${wordpressId}:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza solo eventos modificados desde una fecha específica
   */
  async syncEventsSince(date: Date): Promise<{ created: number; updated: number; errors: number }> {
    let created = 0;
    let updated = 0;
    let errors = 0;
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    const dateString = date.toISOString();

    logger.info(`🔄 Sincronizando eventos modificados desde ${dateString}...`);

    try {
      while (hasMore) {
        const posts = await this.wordpressService.fetchEvents({
          page,
          per_page: perPage,
          status: 'publish',
          after: dateString,
        });

        if (posts.length === 0) {
          hasMore = false;
          break;
        }

        for (const post of posts) {
          try {
            const eventData = this.wordpressService.transformWordPressPostToEvent(post);
            const result = await this.syncEvent(eventData);
            
            if (result.created) created++;
            if (result.updated) updated++;
          } catch (error) {
            errors++;
            logger.error(`Error al sincronizar evento ${post.id}:`, error);
          }
        }

        if (posts.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }

      logger.info(
        `✅ Sincronización incremental completada: ${created} creados, ${updated} actualizados, ${errors} errores`
      );

      return { created, updated, errors };
    } catch (error) {
      logger.error('Error crítico en sincronización incremental:', error);
      throw error;
    }
  }

  /**
   * Obtiene el último evento sincronizado para determinar la fecha de la próxima sincronización incremental
   */
  async getLastSyncDate(): Promise<Date | null> {
    try {
      const lastEvent = await Event.findOne()
        .sort({ lastSyncedAt: -1 })
        .select('lastSyncedAt')
        .lean();

      return lastEvent?.lastSyncedAt ? new Date(lastEvent.lastSyncedAt) : null;
    } catch (error) {
      logger.error('Error al obtener última fecha de sincronización:', error);
      return null;
    }
  }
}
