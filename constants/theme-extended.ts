
import { Platform } from 'react-native';
import { EventuColors } from './theme';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const Radius = {
  xs: 2,
  sm: 4,
  md: 6,
  default: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glowSecondary: {
    shadowColor: EventuColors.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const ZIndex = {
  base: 0,
  floating: 10,
  dropdown: 20,
  sticky: 30,
  backdrop: 40,
  modal: 50,
  tooltip: 60,
  notification: 70,
};

export const Transitions = {
  fast: 200,
  default: 300,
  slow: 500,
  easing: {
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
};

export const TouchTargets = {
  minimum: 44,
  recommended: 48,
  large: 56,
};

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

export const Typography = {
  sizes: {
    'xs': 12,
    'sm': 14,
    'base': 16,
    'lg': 18,
    'xl': 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
};

export const CategoryColorMap: Record<string, string> = {
  'Conciertos': EventuColors.violet,
  'Festivales': EventuColors.hotPink,
  'Teatro': EventuColors.magenta,
  'Deportes': EventuColors.fuchsia,
  'Cultura': EventuColors.violet,
  'Familiar': EventuColors.hotPink,
  'Gastronomía': EventuColors.fuchsia,
  'Negocios': EventuColors.mediumGray,
  'Música': EventuColors.violet,
  'Arte': EventuColors.violet,
  'Comedia': EventuColors.hotPink,
  'Comedia Stand-Up': EventuColors.hotPink,
  'Exposición': EventuColors.violet,
};

export const getCategoryColor = (categoryName: string): string => {
  return CategoryColorMap[categoryName] || EventuColors.mediumGray;
};
