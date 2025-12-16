import pool from '../config/database';

export interface Ticket {
  id: string;
  eventId: string;
  eventName?: string;
  userId: string;
  ticketType: string;
  price: number;
  quantity: number;
  seatNumber?: string;
  status: 'active' | 'used' | 'cancelled';
  purchaseId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketValidation {
  ticketId: string;
  validated: boolean;
  validatedAt?: string;
  validatedBy?: string;
  scannedAt?: string;
  scannedBy?: string;
  validationStatus: 'pending' | 'scanned' | 'validated' | 'rejected';
  rejectionReason?: string;
}

export class TicketModel {
  /**
   * Obtiene tickets de un usuario
   */
  static async getUserTickets(userId: string): Promise<Ticket[]> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          t.id,
          t.event_id as eventId,
          e.name as eventName,
          t.user_id as userId,
          t.ticket_type as ticketType,
          t.price,
          t.quantity,
          t.seat_number as seatNumber,
          t.status,
          t.purchase_id as purchaseId,
          t.created_at as createdAt,
          t.updated_at as updatedAt
        FROM tickets t
        LEFT JOIN events e ON t.event_id = e.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
        `,
        [userId]
      );

      return rows as Ticket[];
    } catch (error) {
      console.error('Error al obtener tickets del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene un ticket por ID
   */
  static async getTicketById(ticketId: string): Promise<Ticket | null> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          t.id,
          t.event_id as eventId,
          e.name as eventName,
          t.user_id as userId,
          t.ticket_type as ticketType,
          t.price,
          t.quantity,
          t.seat_number as seatNumber,
          t.status,
          t.purchase_id as purchaseId,
          t.created_at as createdAt,
          t.updated_at as updatedAt
        FROM tickets t
        LEFT JOIN events e ON t.event_id = e.id
        WHERE t.id = ?
        `,
        [ticketId]
      );

      const tickets = rows as Ticket[];
      return tickets.length > 0 ? tickets[0] : null;
    } catch (error) {
      console.error('Error al obtener ticket:', error);
      throw error;
    }
  }

  /**
   * Obtiene la validación de un ticket
   */
  static async getTicketValidation(ticketId: string): Promise<TicketValidation | null> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          ticket_id as ticketId,
          validated,
          validated_at as validatedAt,
          validated_by as validatedBy,
          scanned_at as scannedAt,
          scanned_by as scannedBy,
          validation_status as validationStatus,
          rejection_reason as rejectionReason
        FROM ticket_validations
        WHERE ticket_id = ?
        `,
        [ticketId]
      );

      const validations = rows as any[];
      if (validations.length === 0) {
        // Si no existe validación, retornar estado pendiente
        return {
          ticketId,
          validated: false,
          validationStatus: 'pending',
        };
      }

      return validations[0];
    } catch (error) {
      console.error('Error al obtener validación del ticket:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial completo de validaciones (para staff)
   */
  static async getValidationHistory(
    limit: number = 100,
    offset: number = 0
  ): Promise<Array<TicketValidation & { eventName?: string; eventId?: string }>> {
    try {
      const [rows] = await pool.execute(
        `
        SELECT 
          tv.ticket_id as ticketId,
          tv.validated,
          tv.validated_at as validatedAt,
          tv.validated_by as validatedBy,
          tv.scanned_at as scannedAt,
          tv.scanned_by as scannedBy,
          tv.validation_status as validationStatus,
          tv.rejection_reason as rejectionReason,
          t.event_id as eventId,
          e.name as eventName
        FROM ticket_validations tv
        LEFT JOIN tickets t ON tv.ticket_id = t.id
        LEFT JOIN events e ON t.event_id = e.id
        ORDER BY tv.scanned_at DESC, tv.validated_at DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      );

      return rows as Array<TicketValidation & { eventName?: string; eventId?: string }>;
    } catch (error) {
      console.error('Error al obtener historial de validaciones:', error);
      throw error;
    }
  }

  /**
   * Valida/escanea un ticket
   */
  static async validateTicket(
    ticketId: string,
    staffId: string,
    action: 'scan' | 'validate' | 'reject',
    rejectionReason?: string
  ): Promise<TicketValidation> {
    try {
      const ticket = await this.getTicketById(ticketId);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      if (ticket.status !== 'active') {
        throw new Error('El ticket no está activo');
      }

      const now = new Date().toISOString();
      let validationStatus: 'pending' | 'scanned' | 'validated' | 'rejected';
      let validated = false;

      if (action === 'scan') {
        validationStatus = 'scanned';
      } else if (action === 'validate') {
        validationStatus = 'validated';
        validated = true;
      } else {
        validationStatus = 'rejected';
      }

      // Insertar o actualizar validación
      await pool.execute(
        `
        INSERT INTO ticket_validations (
          ticket_id,
          validated,
          validated_at,
          validated_by,
          scanned_at,
          scanned_by,
          validation_status,
          rejection_reason,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          validated = VALUES(validated),
          validated_at = VALUES(validated_at),
          validated_by = VALUES(validated_by),
          scanned_at = VALUES(scanned_at),
          scanned_by = VALUES(scanned_by),
          validation_status = VALUES(validation_status),
          rejection_reason = VALUES(rejection_reason),
          updated_at = VALUES(updated_at)
        `,
        [
          ticketId,
          validated,
          validated ? now : null,
          validated ? staffId : null,
          now,
          staffId,
          validationStatus,
          rejectionReason || null,
          now,
        ]
      );

      // Si se valida, marcar ticket como usado
      if (action === 'validate') {
        await pool.execute(
          'UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?',
          ['used', now, ticketId]
        );
      }

      return await this.getTicketValidation(ticketId) as TicketValidation;
    } catch (error) {
      console.error('Error al validar ticket:', error);
      throw error;
    }
  }
}

