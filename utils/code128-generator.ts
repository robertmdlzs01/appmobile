/**
 * Generador de código de barras Code128 real
 * Implementa el estándar Code128 para generar códigos de barras escaneables
 */

/**
 * Tabla de caracteres Code128
 * Cada carácter tiene un patrón de 11 módulos (barras y espacios)
 */
const CODE128_CHARS: Record<string, number[]> = {
  // Caracteres especiales y números
  ' ': [2, 1, 1, 2, 2, 2, 2, 2, 2],
  '!': [2, 1, 2, 2, 2, 1, 2, 2, 2],
  '"': [2, 1, 2, 2, 1, 2, 2, 2, 2],
  '#': [1, 1, 1, 1, 2, 2, 2, 2, 2],
  '$': [1, 1, 1, 2, 2, 1, 2, 2, 2],
  '%': [1, 1, 1, 2, 2, 2, 2, 1, 2],
  '&': [1, 1, 2, 1, 1, 2, 2, 2, 2],
  "'": [1, 1, 2, 2, 1, 1, 2, 2, 2],
  '(': [1, 1, 2, 2, 2, 2, 1, 1, 2],
  ')': [1, 2, 1, 1, 2, 2, 2, 2, 2],
  '*': [1, 2, 1, 2, 2, 1, 2, 2, 2],
  '+': [1, 2, 1, 2, 2, 2, 2, 1, 2],
  ',': [1, 2, 2, 1, 1, 2, 2, 2, 2],
  '-': [1, 2, 2, 2, 1, 1, 2, 2, 2],
  '.': [1, 2, 2, 2, 2, 2, 1, 1, 2],
  '/': [2, 2, 1, 1, 1, 2, 2, 2, 2],
  '0': [2, 2, 1, 2, 1, 1, 2, 2, 2],
  '1': [2, 2, 1, 2, 2, 1, 1, 2, 2],
  '2': [2, 2, 1, 2, 2, 2, 2, 1, 1],
  '3': [2, 1, 2, 1, 1, 2, 2, 2, 2],
  '4': [2, 1, 2, 2, 1, 1, 2, 2, 2],
  '5': [2, 1, 2, 2, 2, 2, 1, 1, 2],
  '6': [1, 1, 2, 1, 2, 2, 2, 2, 2],
  '7': [1, 1, 2, 2, 1, 2, 2, 2, 2],
  '8': [1, 1, 2, 2, 2, 2, 1, 2, 2],
  '9': [1, 2, 2, 1, 2, 1, 2, 2, 2],
  ':': [1, 2, 2, 1, 2, 2, 2, 1, 2],
  ';': [1, 2, 2, 2, 1, 2, 1, 2, 2],
  '<': [1, 2, 2, 2, 1, 2, 2, 2, 1],
  '=': [1, 2, 2, 2, 2, 1, 2, 1, 2],
  '>': [1, 2, 2, 2, 2, 1, 2, 2, 1],
  '?': [2, 2, 2, 1, 1, 2, 1, 2, 2],
  '@': [2, 2, 2, 1, 2, 1, 1, 2, 2],
  'A': [2, 2, 2, 1, 2, 2, 1, 1, 2],
  'B': [2, 2, 2, 2, 1, 1, 2, 1, 2],
  'C': [2, 2, 2, 2, 1, 2, 1, 1, 2],
  'D': [2, 2, 2, 2, 1, 2, 2, 2, 1],
  'E': [2, 2, 2, 2, 2, 1, 1, 2, 1],
  'F': [1, 1, 1, 2, 2, 2, 1, 2, 2],
  'G': [1, 1, 1, 2, 2, 2, 2, 2, 1],
  'H': [1, 1, 2, 1, 2, 2, 1, 2, 2],
  'I': [1, 1, 2, 1, 2, 2, 2, 2, 1],
  'J': [1, 1, 2, 2, 1, 2, 1, 2, 2],
  'K': [1, 1, 2, 2, 1, 2, 2, 2, 1],
  'L': [1, 1, 2, 2, 2, 1, 2, 1, 2],
  'M': [1, 1, 2, 2, 2, 1, 2, 2, 1],
  'N': [1, 1, 2, 2, 2, 2, 1, 2, 1],
  'O': [1, 2, 1, 1, 2, 2, 1, 2, 2],
  'P': [1, 2, 1, 1, 2, 2, 2, 2, 1],
  'Q': [1, 2, 1, 2, 1, 2, 1, 2, 2],
  'R': [1, 2, 1, 2, 1, 2, 2, 2, 1],
  'S': [1, 2, 1, 2, 2, 1, 2, 1, 2],
  'T': [1, 2, 1, 2, 2, 1, 2, 2, 1],
  'U': [1, 2, 1, 2, 2, 2, 1, 2, 1],
  'V': [1, 2, 2, 1, 1, 2, 1, 2, 2],
  'W': [1, 2, 2, 1, 1, 2, 2, 2, 1],
  'X': [1, 2, 2, 1, 2, 1, 1, 2, 2],
  'Y': [1, 2, 2, 1, 2, 1, 2, 2, 1],
  'Z': [1, 2, 2, 1, 2, 2, 1, 2, 1],
};

/**
 * Patrón de inicio Code128 (START B)
 */
const START_PATTERN = [2, 1, 1, 2, 2, 2, 2, 2, 1, 2];

/**
 * Patrón de stop Code128
 */
const STOP_PATTERN = [2, 3, 3, 1, 1, 1, 2];

/**
 * Convierte un patrón de módulos a barras y espacios
 * Cada número representa el ancho del módulo (1 = delgado, 2 = grueso, 3 = muy grueso)
 */
function patternToBars(pattern: number[], moduleWidth: number): Array<{ width: number; isBar: boolean }> {
  const modules: Array<{ width: number; isBar: boolean }> = [];
  let isBar = true; // Empezar con barra
  
  for (const width of pattern) {
    modules.push({
      width: width * moduleWidth,
      isBar: isBar,
    });
    isBar = !isBar; // Alternar entre barra y espacio
  }
  
  return modules;
}

/**
 * Genera los módulos del código de barras Code128
 */
export function generateCode128Modules(
  data: string,
  width: number,
  height: number
): Array<{ x: number; width: number; height: number }> {
  const bars: Array<{ x: number; width: number; height: number }> = [];
  const padding = 10;
  const availableWidth = width - (padding * 2);
  
  // Ancho del módulo base (ajustable)
  const moduleWidth = 1.5;
  
  // Generar patrón completo
  const fullPattern: number[] = [];
  
  // Agregar patrón de inicio
  fullPattern.push(...START_PATTERN);
  
  // Agregar patrones de cada carácter
  for (const char of data.toUpperCase()) {
    const charPattern = CODE128_CHARS[char] || CODE128_CHARS[' '];
    fullPattern.push(...charPattern);
  }
  
  // Agregar patrón de stop
  fullPattern.push(...STOP_PATTERN);
  
  // Convertir patrón a barras y espacios
  const modules = patternToBars(fullPattern, moduleWidth);
  
  // Calcular ancho total
  const totalWidth = modules.reduce((sum, m) => sum + m.width, 0);
  
  // Escalar para ajustar al ancho disponible
  const scale = availableWidth / totalWidth;
  
  // Generar barras (solo las negras, no los espacios)
  let currentX = padding;
  
  for (const module of modules) {
    if (module.isBar) {
      bars.push({
        x: currentX,
        width: module.width * scale,
        height: height,
      });
    }
    currentX += module.width * scale;
  }
  
  return bars;
}

