import { Router, Request, Response } from 'express';
import { EventModel, EventsQueryParams } from '../models/Event';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/events
 * Obtiene lista de eventos con filtros opcionales
 */
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const params: EventsQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      category: req.query.category as string,
      status: req.query.status as string,
      featured: req.query.featured === 'true',
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      search: req.query.search as string,
    };

    const events = await EventModel.getEvents(params);
    const total = await EventModel.countEvents(params);

    const page = params.page || 1;
    const limit = params.limit || events.length;
    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener eventos',
    });
  }
});

/**
 * GET /api/events/featured
 * Obtiene eventos destacados
 */
router.get('/featured', optionalAuth, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const events = await EventModel.getFeaturedEvents(limit);

    res.json({
      success: true,
      data: events,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener eventos destacados',
    });
  }
});

/**
 * GET /api/events/:id
 * Obtiene detalles de un evento específico
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const event = await EventModel.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener evento',
    });
  }
});

export default router;

