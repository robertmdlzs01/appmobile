

import * as Crypto from 'expo-crypto';
import {
  generateSecureQR,
  packageToQRData,
  type TicketData
} from './advanced-crypto';



const getQRValidationBaseURL = (): string => {
  
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api$/, ''); 
  }
  return 'https://api.eventu.com';
};

const QR_VALIDATION_ENDPOINT = '/api/tickets/validate-qr';

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
  
  qrId?: string; 
  scanCount?: number; 
  maxScans?: number; 
  encrypted?: boolean; 
}

export interface QRGenerationData {
  ticketId: string;
  eventId: string;
  eventName: string;
  date: string;
  timestamp: number;
  userId?: string;
  seat?: string;
  quantity?: number;
}

export interface DynamicQRData {
  url: string; 
  qrId: string; 
  token: string; 
  expiresAt: number; 
  maxScans: number; 
  createdAt: number; 
}


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


export function parseQRCode(qrString: string): QRPayload | null {
  try {
    const data = JSON.parse(qrString);
    
    if (!isValidQRPayload(data)) {
      return null;
    }
    
    
    const now = Math.floor(Date.now() / 1000);
    if (data.exp < now) {
      return null; 
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
}

// Extraer el ticketID de un código QR escaneado

/**
 * Extrae el ticketID de un código QR escaneado
 * const qrCode = "AF345RS|1734567890123|abc123xyz|5";
 * const ticketId = extractTicketIdFromQR(qrCode); // Retorna: "AF345RS"
 */

export function extractTicketIdFromQR(qrString: string): string | null {
  if (!qrString || typeof qrString !== 'string') {
    console.warn('extractTicketIdFromQR: QR string inválido');
    return null;
  }
  
  // El ticketID es la primera parte antes del primer "|"
  const parts = qrString.split('|');
  
  if (parts.length < 1 || !parts[0] || parts[0].trim() === '') {
    console.warn('extractTicketIdFromQR: Formato de QR inválido, no se pudo extraer ticketID');
    return null;
  }
  
  const ticketId = parts[0].trim();
  
  return ticketId;
}





function generateQRId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `qr_${timestamp}_${randomPart}`;
}


async function encryptToken(data: string): Promise<string> {
  const { digestStringAsync, CryptoDigestAlgorithm } = await import('expo-crypto');
  return await digestStringAsync(CryptoDigestAlgorithm.SHA256, data);
}


async function getBaseToken(ticketId: string): Promise<string> {
  
  
  const tokenData = JSON.stringify({
    ticketId,
    timestamp: Date.now(),
    type: 'base_token',
  });
  
  const baseToken = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    tokenData
  );
  
  return baseToken;
}


export async function generateSecureDynamicQR(
  ticketId: string,
  eventId: string,
  expiresIn: number = 900, 
  metadata?: {
    eventName?: string;
    date?: string;
    seat?: string;
    userId?: string;
  },
  options?: {
    oneTimeUse?: boolean;
    maxScans?: number;
  }
): Promise<DynamicQRData> {
  const qrId = generateQRId();
  const timestamp = Date.now();
  const expiresAt = timestamp + (expiresIn * 1000);
  
  
  const baseToken = await getBaseToken(ticketId);
  
  
  const ticketData: TicketData = {
    ticketId,
    eventId,
    eventName: metadata?.eventName || '',
    date: metadata?.date || '',
    seat: metadata?.seat,
    userId: metadata?.userId,
  };
  
  
  const encryptedPackage = await generateSecureQR(baseToken, ticketData);
  
  
  
  const qrDataString = packageToQRData(encryptedPackage);
  
  const maxScans = options?.oneTimeUse ? 1 : (options?.maxScans || 1);
  
  return {
    url: qrDataString, 
    qrId,
    token: encryptedPackage.encryptedData, 
    expiresAt,
    maxScans,
    createdAt: timestamp,
  };
}


export async function generateDynamicQR(
  ticketId: string,
  eventId: string,
  expiresIn: number = 900,
  metadata?: {
    eventName?: string;
    date?: string;
    seat?: string;
    userId?: string;
  },
  options?: {
    oneTimeUse?: boolean;
    maxScans?: number;
  }
): Promise<DynamicQRData> {
  
  return generateSecureDynamicQR(ticketId, eventId, expiresIn, metadata, options);
}


export async function generateQRPayload(
  ticketId: string,
  token: string,
  expiresIn: number,
  validated: boolean = false,
  metadata?: {
    eventId?: string;
    eventName?: string;
    date?: string;
    seat?: string;
  },
  options?: {
    oneTimeUse?: boolean;
    maxScans?: number;
  }
): Promise<QRPayload> {
  const expiration = Math.floor(Date.now() / 1000) + expiresIn;
  const qrId = generateQRId();
  
  
  if (options?.oneTimeUse || options?.maxScans) {
    const dynamicQR = await generateDynamicQR(
      ticketId,
      metadata?.eventId || '',
      expiresIn,
      metadata,
      options
    );
    
    return {
      type: 'eventu_ticket',
      ticketId,
      token: dynamicQR.token,
      exp: validated ? Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) : expiration,
      validated,
      eventId: metadata?.eventId,
      eventName: metadata?.eventName,
      date: metadata?.date,
      version: '2.0', 
      qrId: dynamicQR.qrId,
      scanCount: 0,
      maxScans: dynamicQR.maxScans,
      encrypted: true,
    };
  }
  
  
  return {
    type: 'eventu_ticket',
    ticketId,
    token,
    exp: validated ? Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) : expiration,
    validated,
    eventId: metadata?.eventId,
    eventName: metadata?.eventName,
    date: metadata?.date,
    version: '1.0',
    qrId,
    scanCount: 0,
    maxScans: 1,
    encrypted: false,
  };
}


export function isQRExpired(payload: QRPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}


export function getTimeUntilExpiration(payload: QRPayload): number {
  const now = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - now;
  return Math.max(0, remaining);
}


export function canScanQR(payload: QRPayload): boolean {
  if (payload.validated) return false; 
  if (payload.scanCount !== undefined && payload.maxScans !== undefined) {
    return payload.scanCount < payload.maxScans;
  }
  return true; 
}


export function isOneTimeUseQR(payload: QRPayload): boolean {
  return payload.maxScans === 1 || (payload.maxScans !== undefined && payload.maxScans <= 1);
}


export function isEncryptedQR(payload: QRPayload): boolean {
  return payload.encrypted === true || payload.version === '2.0';
}


export function extractTokenFromURL(url: string): { token: string; qrId: string } | null {
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('t');
    const qrId = urlObj.searchParams.get('id');
    
    if (token && qrId) {
      return { token: decodeURIComponent(token), qrId };
    }
    return null;
  } catch (error) {
    console.error('Error extracting token from URL:', error);
    return null;
  }
}

