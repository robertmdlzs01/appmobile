
import { Platform } from 'react-native';

export const EventuColors = {
  magenta: '#E4006F',
  hotPink: '#FF1E80',
  fuchsia: '#FF4EB6',
  violet: '#A42EFF',
  white: '#FFFFFF',
  black: '#000000',
  darkBrown: '#4A2828',
  darkRed: '#5C2E2E',
  brown: '#6B3333',
  darkGray: '#1A1A1A',
  mediumGray: '#666666',
  lightGray: '#E5E5E5',
  veryLightGray: '#F8F8F8',
  success: '#00C853',
  error: '#FF1744',
  warning: '#FFB300',
} as const;

export const EventuGradients = {
  primary: ['#E4006F', '#FF1E80', '#A42EFF'] as const,
  secondary: ['#FF4EB6', '#E4006F'] as const,
  tertiary: ['#A42EFF', '#FF1E80'] as const,
  dark: ['#1A1A1A', '#2D2D2D'] as const,
  darkTheme: ['#4A2828', '#5C2E2E'] as const,
} as const;

const Colors = {
  light: {
    text: EventuColors.black,
    secondaryText: EventuColors.mediumGray,
    background: EventuColors.white,
    secondaryBackground: EventuColors.veryLightGray,
    tint: EventuColors.magenta,
    primary: EventuColors.magenta,
    border: EventuColors.lightGray,
    card: EventuColors.white,
    gradient: EventuGradients.primary,
    success: EventuColors.success,
    error: EventuColors.error,
    warning: EventuColors.warning,
  },
  dark: {
    text: EventuColors.white,
    secondaryText: '#AAAAAA',
    background: EventuColors.darkGray,
    secondaryBackground: '#2D2D2D',
    tint: EventuColors.hotPink,
    primary: EventuColors.hotPink,
    border: '#333333',
    card: '#2D2D2D',
    gradient: EventuGradients.primary,
    success: EventuColors.success,
    error: EventuColors.error,
    warning: EventuColors.warning,
  },
};

export default Colors;

export const Fonts = Platform.select({
  ios: {
    
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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
