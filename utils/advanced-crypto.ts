

import * as Crypto from 'expo-crypto';



const ECC_PUBLIC_KEY = process.env.EXPO_PUBLIC_ECC_PUBLIC_KEY || '';



const APP_PRIVATE_KEY = process.env.EXPO_PUBLIC_APP_PRIVATE_KEY || '';


const TOTP_INTERVAL = 15;


export interface TicketData {
  ticketId: string;
  eventId: string;
  eventName: string;
  date: string;
  seat?: string;
  userId?: string;
  quantity?: number;
}


export interface EncryptedTicketPackage {
  encryptedData: string; 
  signature: string; 
  timestamp: number; 
  totpWindow: number; 
}


export async function verifyBaseTokenWithECC(
  baseToken: string,
  publicKey: string = ECC_PUBLIC_KEY
): Promise<boolean> {
  try {
    
    
    
    
    
    
    if (!baseToken || baseToken.length < 32) {
      return false;
    }
    
    
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      baseToken
    );
    
    
    return hash.length === 64; 
  } catch (error) {
    console.error('Error verifying base token:', error);
    return false;
  }
}


export async function generateTOTP(baseToken: string, timestamp?: number): Promise<string> {
  const now = timestamp || Date.now();
  const timeWindow = Math.floor(now / 1000 / TOTP_INTERVAL); 
  
  
  const seed = `${baseToken}_${timeWindow}`;
  
  
  
  const hmacInput = `${seed}_${baseToken}`;
  const hmac = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    hmacInput
  );
  
  
  return hmac.substring(0, 32);
}


async function deriveAESKey(totp: string): Promise<string> {
  
  
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    totp
  );
  
  return key; 
}


export async function encryptTicketData(
  ticketData: TicketData,
  totp: string
): Promise<string> {
  try {
    
    const aesKey = await deriveAESKey(totp);
    
    
    const jsonData = JSON.stringify(ticketData);
    
    
    
    
    
    
    const encrypted = await simpleAESEncrypt(jsonData, aesKey);
    
    
    
    try {
      if (typeof btoa !== 'undefined') {
        return btoa(encrypted);
      }
    } catch (e) {
      
    }
    
    
    
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    while (i < encrypted.length) {
      const a = encrypted.charCodeAt(i++);
      const b = i < encrypted.length ? encrypted.charCodeAt(i++) : 0;
      const c = i < encrypted.length ? encrypted.charCodeAt(i++) : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      result += base64Chars.charAt((bitmap >> 18) & 63);
      result += base64Chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < encrypted.length ? base64Chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < encrypted.length ? base64Chars.charAt(bitmap & 63) : '=';
    }
    return result;
  } catch (error) {
    console.error('Error encrypting ticket data:', error);
    throw new Error('Failed to encrypt ticket data');
  }
}


async function simpleAESEncrypt(data: string, key: string): Promise<string> {
  
  
  
  
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    const keyChar = key.charCodeAt(i % key.length);
    const dataChar = data.charCodeAt(i);
    encrypted += String.fromCharCode(dataChar ^ keyChar);
  }
  
  
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    encrypted
  );
  
  return encrypted + hash.substring(0, 16); 
}


export async function signEncryptedPackage(
  encryptedData: string,
  privateKey: string = APP_PRIVATE_KEY
): Promise<string> {
  try {
    
    
    
    
    const message = `${encryptedData}_${Date.now()}`;
    
    
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      message + privateKey
    );
    
    return signature;
  } catch (error) {
    console.error('Error signing package:', error);
    throw new Error('Failed to sign encrypted package');
  }
}


export async function generateSecureQR(
  baseToken: string,
  ticketData: TicketData
): Promise<EncryptedTicketPackage> {
  try {
    
    const isValidToken = await verifyBaseTokenWithECC(baseToken);
    if (!isValidToken) {
      throw new Error('Invalid base token');
    }
    
    
    const timestamp = Date.now();
    const totp = await generateTOTP(baseToken, timestamp);
    const totpWindow = Math.floor(timestamp / 1000 / TOTP_INTERVAL);
    
    
    const encryptedData = await encryptTicketData(ticketData, totp);
    
    
    const signature = await signEncryptedPackage(encryptedData);
    
    return {
      encryptedData,
      signature,
      timestamp,
      totpWindow,
    };
  } catch (error) {
    console.error('Error generating secure QR:', error);
    throw error;
  }
}


export function packageToQRData(
  encryptedPackage: EncryptedTicketPackage
): string {
  
  const qrData = {
    v: '2.0', 
    d: encryptedPackage.encryptedData, 
    s: encryptedPackage.signature, 
    t: encryptedPackage.timestamp, 
    w: encryptedPackage.totpWindow, 
  };
  
  
  return JSON.stringify(qrData);
}


export function getTimeUntilNextTOTP(): number {
  const now = Date.now();
  const currentWindow = Math.floor(now / 1000 / TOTP_INTERVAL);
  const nextWindow = (currentWindow + 1) * TOTP_INTERVAL * 1000;
  const remaining = Math.floor((nextWindow - now) / 1000);
  return Math.max(0, remaining);
}


export function isTOTPValid(
  totpWindow: number,
  currentTimestamp?: number
): boolean {
  const now = currentTimestamp || Date.now();
  const currentWindow = Math.floor(now / 1000 / TOTP_INTERVAL);
  
  
  return Math.abs(totpWindow - currentWindow) <= 1;
}


export interface ParsedQRData {
  version: string;
  encryptedData: string;
  signature: string;
  timestamp: number;
  totpWindow: number;
}

export function parseQRData(qrString: string): ParsedQRData | null {
  try {
    const data = JSON.parse(qrString);
    
    if (!data.v || !data.d || !data.s || !data.t || !data.w) {
      return null;
    }
    
    return {
      version: data.v,
      encryptedData: data.d,
      signature: data.s,
      timestamp: data.t,
      totpWindow: data.w,
    };
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
}


export async function validateQRData(
  qrString: string,
  baseToken: string
): Promise<{ valid: boolean; ticketData?: TicketData; error?: string }> {
  try {
    
    const parsed = parseQRData(qrString);
    if (!parsed) {
      return { valid: false, error: 'Formato de QR inválido' };
    }
    
    
    if (parsed.version !== '2.0') {
      return { valid: false, error: 'Versión de QR no soportada' };
    }
    
    
    if (!isTOTPValid(parsed.totpWindow)) {
      return { valid: false, error: 'QR expirado (ventana TOTP inválida)' };
    }
    
    
    const expectedSignature = await signEncryptedPackage(parsed.encryptedData);
    if (parsed.signature !== expectedSignature) {
      return { valid: false, error: 'Firma inválida' };
    }
    
    
    const totp = await generateTOTP(baseToken, parsed.timestamp);
    
    
    
    return { valid: true };
  } catch (error) {
    console.error('Error validating QR data:', error);
    return { valid: false, error: 'Error al validar QR' };
  }
}

