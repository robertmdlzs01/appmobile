import { ApiResponse, apiService } from './api';

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

export interface TicketWithValidation {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  time: string;
  venue?: string;
  location: string;
  seat: string;
  quantity?: number;
  price: number;
  status: 'active' | 'used' | 'cancelled';
  validation?: TicketValidation;
}

export const ticketsApi = {
  /**
   * Obtiene tickets del usuario autenticado
   */
  async getTickets(): Promise<ApiResponse<any[]>> {
    try {
      return await apiService.get<any[]>('/tickets');
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener tickets',
      };
    }
  },

  /**
   * Obtiene un ticket por ID
   */
  async getTicketById(ticketId: string): Promise<ApiResponse<any>> {
    try {
      return await apiService.get<any>(`/tickets/${ticketId}`);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener ticket',
      };
    }
  },

  /**
   * Obtiene el estado de validación de un boleto
   */
  async getTicketValidation(ticketId: string): Promise<ApiResponse<{ validation: TicketValidation }>> {
    try {
      return await apiService.get<{ validation: TicketValidation }>(`/tickets/${ticketId}/validation`);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener validación del boleto',
      };
    }
  },

  /**
   * Obtiene el estado de validación de múltiples boletos
   */
  async getTicketsValidation(ticketIds: string[]): Promise<ApiResponse<{ validations: TicketValidation[] }>> {
    try {
      const validations = await Promise.all(
        ticketIds.map(id => this.getTicketValidation(id))
      );

      return {
        success: true,
        data: {
          validations: validations
            .filter(r => r.success && r.data)
            .map(r => r.data!.validation),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener validaciones',
      };
    }
  },

  /**
   * Valida/escanea un ticket (para staff)
   * Nota: staffId se obtiene automáticamente del token de autenticación
   */
  async validateTicket(
    ticketId: string,
    action: 'scan' | 'validate' | 'reject',
    rejectionReason?: string
  ): Promise<ApiResponse<{ validation: TicketValidation }>> {
    try {
      return await apiService.post<{ validation: TicketValidation }>(
        `/tickets/${ticketId}/validate`,
        { action, rejectionReason }
      );
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al validar ticket',
      };
    }
  },

  /**
   * Obtiene el historial completo de validaciones (para staff)
   */
  async getValidationHistory(
    options?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<{ history: TicketValidation[] }>> {
    try {
      return await apiService.get<{ history: TicketValidation[] }>(
        '/tickets/validations/history',
        options
      );
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener historial de validaciones',
      };
    }
  },
};




