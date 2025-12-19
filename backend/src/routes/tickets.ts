import { Response, Router } from 'express';
import { authenticateToken, AuthRequest, requireStaff } from '../middleware/auth';
import { TicketModel } from '../models/Ticket';

const router = Router();


router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const tickets = await TicketModel.getUserTickets(userId);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener tickets',
    });
  }
});


router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await TicketModel.getTicketById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado',
      });
    }

    // Verificar que el ticket pertenece al usuario
    const userId = req.user?.id;
    if (ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este ticket',
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener ticket',
    });
  }
});


router.get('/:id/validation', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await TicketModel.getTicketById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket no encontrado',
      });
    }

    // Verificar que el ticket pertenece al usuario
    const userId = req.user?.id;
    if (ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este ticket',
      });
    }

    const validation = await TicketModel.getTicketValidation(req.params.id);

    res.json({
      success: true,
      data: { validation },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener validación del ticket',
    });
  }
});


router.get('/validations/history', requireStaff, async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Verificar que el usuario es staff
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await TicketModel.getValidationHistory(limit, offset);

    res.json({
      success: true,
      data: { history },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener historial de validaciones',
    });
  }
});


router.post('/:id/validate', requireStaff, async (req: AuthRequest, res: Response) => {
  try {
    const { action, rejectionReason } = req.body;
    const staffId = req.user?.id;

    if (!staffId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    if (!['scan', 'validate', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Acción inválida. Debe ser: scan, validate o reject',
      });
    }

    const validation = await TicketModel.validateTicket(
      req.params.id,
      staffId,
      action,
      rejectionReason
    );

    res.json({
      success: true,
      data: { validation },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al validar ticket',
    });
  }
});

export default router;

