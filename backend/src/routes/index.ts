import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { createEventsRouter } from './events.routes';

export const createApiRouter = (eventsController: EventsController): Router => {
  const router = Router();

  router.use('/events', createEventsRouter(eventsController));

  return router;
};

