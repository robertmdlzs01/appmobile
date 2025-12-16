/**
 * Utilidades para manejo de códigos QR de tickets
 */

export interface QRPayload {
  type: 'eventu_ticket';
  ticketId: string;
  token: string;
  exp: number;
  validated: boolean;
  eventId?: string;
  eventName?: string;
  date?: string;
  version?: string;
}

export interface QRGenerationData {
  ticketId: string;
  eventId: string;
  eventName: string;
  date: string;
  timestamp: number;
  userId?: string;
}

/**
 * Valida el formato de un payload QR
 */
export function isValidQRPayload(data: any): data is QRPayload {
  return (
    data &&
    typeof data === 'object' &&
    data.type === 'eventu_ticket' &&
    typeof data.ticketId === 'string' &&
    typeof data.token === 'string' &&
    typeof data.exp === 'number' &&
    typeof data.validated === 'boolean'
  );
}

/**
 * Parsea un string JSON a QRPayload
 */
export function parseQRCode(qrString: string): QRPayload | null {
  try {
    const data = JSON.parse(qrString);
    
    if (!isValidQRPayload(data)) {
      return null;
    }
    
    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (data.exp < now) {
      return null; // QR expirado
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
}

/**
 * Genera un payload QR con formato mejorado
 */
export function generateQRPayload(
  ticketId: string,
  token: string,
  expiresIn: number,
  validated: boolean = false,
  metadata?: {
    eventId?: string;
    eventName?: string;
    date?: string;
  }
): QRPayload {
  const expiration = Math.floor(Date.now() / 1000) + expiresIn;
  
  return {
    type: 'eventu_ticket',
    ticketId,
    token,
    exp: validated ? Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) : expiration, // 1 año si está validado
    validated,
    eventId: metadata?.eventId,
    eventName: metadata?.eventName,
    date: metadata?.date,
    version: '1.0',
  };
}

/**
 * Valida si un QR está expirado
 */
export function isQRExpired(payload: QRPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Obtiene el tiempo restante hasta la expiración en segundos
 */
export function getTimeUntilExpiration(payload: QRPayload): number {
  const now = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - now;
  return Math.max(0, remaining);
}

