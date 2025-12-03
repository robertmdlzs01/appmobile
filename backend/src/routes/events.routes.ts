import { Router } from 'express';
import { body, query } from 'express-validator';
import { EventsController } from '../controllers/events.controller';
import { optionalAuth, verifyWebhookSecret } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

export const createEventsRouter = (eventsController: EventsController): Router => {
  const router = Router();

  router.get(
    '/',
    optionalAuth,
    [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
      query('category').optional().isString(),
      query('status').optional().isIn(['publish', 'draft', 'private', 'pending']),
      query('featured').optional().isBoolean(),
      query('dateFrom').optional().isISO8601(),
      query('dateTo').optional().isISO8601(),
      query('search').optional().isString(),
    ],
    validateRequest,
    eventsController.getEvents
  );

  router.get(
    '/featured',
    optionalAuth,
    [
      query('limit').optional().isInt({ min: 1, max: 50 }),
    ],
    validateRequest,
    eventsController.getFeaturedEvents
  );

  router.get(
    '/:id',
    optionalAuth,
    eventsController.getEventById
  );

  router.post(
    '/sync',
    verifyWebhookSecret,
    [
      body('eventId').optional().isInt(),
      body('fullSync').optional().isBoolean(),
    ],
    validateRequest,
    eventsController.syncEvents
  );

  return router;
};
