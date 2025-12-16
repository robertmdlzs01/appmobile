/**
 * NOTA: Las compras se gestionan en la web (eventu.co), no en esta app.
 * Este archivo se mantiene solo para compatibilidad si hay referencias en otros lugares.
 * 
 * Para realizar compras, redirige al usuario a la web:
 * https://eventu.co/booking?eventId=...&tickets=...&totalAmount=...
 */

export interface Ticket {
  ticketId?: string;
  ticketType: string;
  price: number;
  quantity: number;
  seatNumber?: string;
}

export interface Purchase {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  eventId: string;
  eventName: string;
  tickets: Ticket[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentTransactionId?: string;
  siigoInvoiceId?: string;
  siigoInvoiceNumber?: string;
  emailSent: boolean;
  emailSentAt?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

// Exportar interfaces vacías para compatibilidad
export const purchasesApi = {
  /**
   * @deprecated Las compras se gestionan en la web. Usa redirección a eventu.co/booking
   */
  async createPurchase(): Promise<any> {
    throw new Error('Las compras se gestionan en la web. Redirige a https://eventu.co/booking');
  },

  /**
   * @deprecated Las compras se gestionan en la web
   */
  async getPurchase(): Promise<any> {
    throw new Error('Las compras se gestionan en la web');
  },

  /**
   * @deprecated Las compras se gestionan en la web
   */
  async getPurchaseByOrderNumber(): Promise<any> {
    throw new Error('Las compras se gestionan en la web');
  },

  /**
   * @deprecated Las compras se gestionan en la web
   */
  async getUserPurchases(): Promise<any> {
    throw new Error('Las compras se gestionan en la web');
  },
};
