import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../middleware/error.middleware';
import Event from '../models/Event';
import { SyncService } from '../services/sync.service';
import logger from '../utils/logger';

export class EventsController {
  private syncService: SyncService;

  constructor(syncService: SyncService) {
    this.syncService = syncService;
  }

  /**
   * GET /events
   * Obtiene lista de eventos con filtros opcionales
   */
  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '20',
        category,
        status = 'publish',
        featured,
        dateFrom,
        dateTo,
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const query: any = { status };

      if (category) {
        query.category = category;
      }

      if (featured !== undefined) {
        query.featured = featured === 'true';
      }

      if (dateFrom || dateTo) {
        query.date = {};
        if (dateFrom) query.date.$gte = dateFrom;
        if (dateTo) query.date.$lte = dateTo;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ];
      }

      const [events, total] = await Promise.all([
        Event.find(query)
          .sort({ date: 1, createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Event.countDocuments(query),
      ]);

      const formattedEvents = events.map((event) => this.formatEventForApp(event));

      res.json({
        success: true,
        data: formattedEvents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      logger.error('Error al obtener eventos:', error);
      next(error);
    }
  };

  /**
   * GET /events/:id
   * Obtiene detalles de un evento específico
   */
  getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const event = await Event.findOne({
        $or: [
          { _id: id },
          { slug: id },
          { wordpressId: parseInt(id, 10) },
        ],
      }).lean();

      if (!event) {
        throw new CustomError('Evento no encontrado', 404);
      }

      res.json({
        success: true,
        data: this.formatEventForApp(event),
      });
    } catch (error) {
      logger.error('Error al obtener evento:', error);
      next(error);
    }
  };

  /**
   * GET /events/featured
   * Obtiene eventos destacados
   */
  getFeaturedEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limit = '10' } = req.query;
      const limitNum = parseInt(limit as string, 10);

      const events = await Event.find({
        featured: true,
        status: 'publish',
      })
        .sort({ date: 1, createdAt: -1 })
        .limit(limitNum)
        .lean();

      const formattedEvents = events.map((event) => this.formatEventForApp(event));

      res.json({
        success: true,
        data: formattedEvents,
      });
    } catch (error) {
      logger.error('Error al obtener eventos destacados:', error);
      next(error);
    }
  };

  /**
   * POST /sync-events
   * Endpoint para sincronizar eventos desde WordPress (webhook o manual)
   */
  syncEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId, fullSync = false } = req.body;

      let result;

      if (eventId) {
        logger.info(`Sincronizando evento ${eventId} desde webhook`);
        result = await this.syncService.syncEventById(eventId);
        res.json({
          success: true,
          message: result.created ? 'Evento creado' : 'Evento actualizado',
          data: result,
        });
      } else if (fullSync) {
        logger.info('Iniciando sincronización completa desde endpoint');
        result = await this.syncService.syncAllEvents();
        res.json({
          success: true,
          message: 'Sincronización completa finalizada',
          data: result,
        });
      } else {
        const lastSyncDate = await this.syncService.getLastSyncDate();
        const sinceDate = lastSyncDate || new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        result = await this.syncService.syncEventsSince(sinceDate);
        res.json({
          success: true,
          message: 'Sincronización incremental finalizada',
          data: result,
        });
      }
    } catch (error) {
      logger.error('Error al sincronizar eventos:', error);
      next(error);
    }
  };

  /**
   * Formatea un evento de la BD al formato esperado por la app React Native
   */
  private formatEventForApp(event: any): any {
    return {
      id: event._id.toString(),
      name: event.name,
      subtitle: event.subtitle,
      description: event.description,
      fullDescription: event.fullDescription,
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price,
      category: event.category,
      images: event.images,
      videoUrl: event.videoUrl,
      promoter: event.promoter,
      instructions: event.instructions,
      availableTickets: event.availableTickets,
      soldTickets: event.soldTickets,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
