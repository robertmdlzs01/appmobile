
import { Platform } from 'react-native';

export const EventuColors = {
  // Colores principales - basados en el diseño web de Eventu Colombia
  magenta: '#E4006F',
  hotPink: '#FF1E80',
  fuchsia: '#FF4EB6',
  violet: '#A42EFF',
  
  // Colores neutros
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#1A1A1A',
  mediumGray: '#666666',
  lightGray: '#E5E5E5',
  veryLightGray: '#F8F8F8',
  offWhite: '#FAFAFA',
  
  // Colores de estado
  success: '#00C853',
  error: '#FF1744',
  warning: '#FFB300',
  info: '#2196F3',
  
  // Colores de fondo y superficie
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  
  // Colores de texto
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Colores legacy (mantener para compatibilidad)
  darkBrown: '#4A2828',
  darkRed: '#5C2E2E',
  brown: '#6B3333',
} as const;

export const EventuGradients = {
  // Gradientes principales - inspirados en el diseño web
  primary: ['#E4006F', '#FF1E80', '#A42EFF'] as const,
  secondary: ['#FF4EB6', '#E4006F'] as const,
  tertiary: ['#A42EFF', '#FF1E80'] as const,
  hero: ['#E4006F', '#FF1E80', '#FF4EB6', '#A42EFF'] as const,
  
  // Gradientes de fondo
  dark: ['#1A1A1A', '#2D2D2D'] as const,
  light: ['#FFFFFF', '#F8F8F8'] as const,
  
  // Gradientes legacy (mantener para compatibilidad)
  darkTheme: ['#4A2828', '#5C2E2E'] as const,
} as const;

const Colors = {
  light: {
    text: EventuColors.textPrimary,
    secondaryText: EventuColors.textSecondary,
    tertiaryText: EventuColors.textTertiary,
    background: EventuColors.background,
    secondaryBackground: EventuColors.backgroundSecondary,
    surface: EventuColors.surface,
    surfaceSecondary: EventuColors.surfaceSecondary,
    tint: EventuColors.magenta,
    primary: EventuColors.magenta,
    secondary: EventuColors.hotPink,
    accent: EventuColors.violet,
    border: EventuColors.lightGray,
    card: EventuColors.white,
    gradient: EventuGradients.primary,
    success: EventuColors.success,
    error: EventuColors.error,
    warning: EventuColors.warning,
    info: EventuColors.info,
    // Input styles - modernos y limpios
    inputBackground: EventuColors.offWhite,
    inputBorder: 'rgba(228, 0, 111, 0.15)',
    inputFocusBorder: EventuColors.magenta,
    // Shadows - suaves y modernas
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowStrong: 'rgba(0, 0, 0, 0.12)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    icon: EventuColors.mediumGray,
    iconActive: EventuColors.magenta,
    placeholder: 'rgba(0, 0, 0, 0.4)',
  },
  dark: {
    text: EventuColors.textInverse,
    secondaryText: '#AAAAAA',
    tertiaryText: '#888888',
    background: EventuColors.darkGray,
    secondaryBackground: '#2D2D2D',
    surface: '#2D2D2D',
    surfaceSecondary: '#333333',
    tint: EventuColors.hotPink,
    primary: EventuColors.hotPink,
    secondary: EventuColors.fuchsia,
    accent: EventuColors.violet,
    border: '#333333',
    card: '#2D2D2D',
    gradient: EventuGradients.primary,
    success: EventuColors.success,
    error: EventuColors.error,
    warning: EventuColors.warning,
    info: EventuColors.info,
    // Input styles para dark mode
    inputBackground: 'rgba(255, 255, 255, 0.05)',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputFocusBorder: EventuColors.hotPink,
    // Shadows para dark mode
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowStrong: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    icon: '#AAAAAA',
    iconActive: EventuColors.hotPink,
    placeholder: 'rgba(255, 255, 255, 0.4)',
  },
};

export default Colors;

export const Fonts = Platform.select({
  ios: {
    // Fuentes modernas para iOS
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    // Fuentes modernas y limpias para web - similar al diseño de Eventu
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Configuración de tipografía moderna
export const Typography = {
  // Tamaños de fuente - escala moderna
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 40,
    '7xl': 48,
    '8xl': 56,
  },
  // Pesos de fuente
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  // Alturas de línea
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  // Espaciado de letras
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
};
