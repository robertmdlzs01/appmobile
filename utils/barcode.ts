/**
 * Utilidades para generar códigos de barras
 * Implementa Code128 para códigos de barras alfanuméricos
 */

/**
 * Genera un código de barras Code128 basado en un token dinámico
 * El token cambia periódicamente por seguridad (igual que el QR)
 */
export function generateBarcodeData(token: string): string {
  // Prefijo para identificar códigos de Eventu
  const prefix = 'EVT';
  
  // Usar el token (hash) pero limitarlo a caracteres alfanuméricos
  // Tomar los primeros caracteres alfanuméricos del token
  const cleanToken = token.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Combinar prefijo + token (máximo 20 caracteres para Code128)
  // Si el token es muy corto, usar los primeros caracteres
  const barcodeData = `${prefix}${cleanToken.substring(0, 17)}`.substring(0, 20);
  
  return barcodeData;
}

/**
 * Genera un token dinámico para el código de barras (igual que el QR)
 * Este token cambia periódicamente por seguridad
 */
export async function generateBarcodeToken(
  ticketId: string,
  eventId: string,
  eventName: string,
  date: string,
  timestamp: number = Date.now()
): Promise<string> {
  const barcodeData = JSON.stringify({
    ticketId,
    eventId,
    eventName,
    date,
    timestamp,
    type: 'barcode',
    version: '1.0',
  });
  
  // Usar expo-crypto para generar el hash
  const { digestStringAsync, CryptoDigestAlgorithm } = await import('expo-crypto');
  const token = await digestStringAsync(
    CryptoDigestAlgorithm.SHA256,
    barcodeData
  );
  
  return token;
}

/**
 * Valida si un código de barras es válido para Eventu
 */
export function isValidBarcode(barcode: string): boolean {
  return barcode.startsWith('EVT') && barcode.length >= 6 && barcode.length <= 20;
}

/**
 * Extrae información de un código de barras con token dinámico
 * NOTA: Los códigos de barras ahora usan tokens dinámicos que cambian periódicamente.
 * El backend debe validar estos tokens directamente, no extraer el ticketId.
 * 
 * Esta función mantiene compatibilidad con códigos antiguos si los hay.
 */
export function extractTicketIdFromBarcode(barcode: string): string | null {
  if (!isValidBarcode(barcode)) {
    return null;
  }
  
  // Remover el prefijo 'EVT'
  const token = barcode.substring(3);
  
  // NOTA: Con tokens dinámicos, no podemos extraer el ticketId directamente.
  // El backend debe validar el token completo.
  // Por ahora, retornamos el token completo para que el backend lo valide.
  return token || null;
}

/**
 * Valida si un código de barras contiene un token válido
 * El backend debe verificar si este token corresponde a un ticket válido
 */
export function isValidBarcodeToken(barcode: string): boolean {
  return isValidBarcode(barcode) && barcode.length >= 10; // Tokens SHA256 son largos
}

/**
 * Genera un código de barras visual (simulado) con líneas
 * En producción, usarías una librería real de códigos de barras
 * 
 * Implementa un patrón Code128 simulado con barras y espacios
 */
export function generateBarcodeLines(barcodeData: string, width: number = 200, height: number = 60): Array<{ width: number; height: number }> {
  const lines: Array<{ width: number; height: number }> = [];
  
  // Padding lateral
  const padding = 10;
  const availableWidth = width - (padding * 2);
  
  // Generar hash determinístico del código para consistencia
  let hash = 0;
  for (let i = 0; i < barcodeData.length; i++) {
    hash = ((hash << 5) - hash) + barcodeData.charCodeAt(i);
    hash = hash & hash; // Convertir a 32bit
  }
  
  // Usar el hash como semilla para generar un patrón consistente
  const seed = Math.abs(hash);
  
  // Número de barras (solo las líneas negras, no los espacios)
  // Code128 tiene aproximadamente 11 módulos por carácter (6 barras + 5 espacios)
  const numBars = Math.min(barcodeData.length * 6, 50);
  
  // Anchos de barras posibles (simulando diferentes grosores)
  const barWidths = [1, 1.5, 2, 2.5, 3];
  
  // Generar patrón de barras (solo las líneas negras)
  // Cada carácter genera aproximadamente 3-4 barras
  const barsPerChar = 3;
  const totalBars = Math.min(barcodeData.length * barsPerChar, 40);
  
  // Calcular ancho promedio de barra y espacio
  const avgBarWidth = 2; // Ancho promedio de barra
  const avgSpaceWidth = 1; // Ancho promedio de espacio
  const estimatedTotalWidth = (totalBars * avgBarWidth) + ((totalBars - 1) * avgSpaceWidth);
  
  // Factor de escala para ajustar al ancho disponible
  const scaleFactor = availableWidth / estimatedTotalWidth;
  const scaledBarWidth = avgBarWidth * scaleFactor;
  const scaledSpaceWidth = avgSpaceWidth * scaleFactor;
  
  // Generar barras con variación
  for (let i = 0; i < totalBars; i++) {
    const charIndex = Math.floor(i / barsPerChar) % barcodeData.length;
    const charCode = barcodeData.charCodeAt(charIndex);
    const random = ((seed + i * 7919) % 100) / 100;
    
    // Variación de ancho de barra (entre 1.5x y 2.5x del ancho base)
    const widthVariation = 1.5 + (random * 1.0);
    const barWidth = Math.max(scaledBarWidth * widthVariation, 1.2);
    
    // Variación de altura (más realista)
    const heightVariation = ((seed + i * 17) % 12) - 6; // -6 a +6
    const baseHeight = height - 20;
    const barHeight = Math.max(baseHeight + heightVariation, baseHeight * 0.65);
    
    lines.push({
      width: barWidth,
      height: barHeight,
    });
  }
  
  return lines;
}

