import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Typography } from '@/constants/theme';
import { EventuColors } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'heading' | 'caption' | 'body';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'heading' ? styles.heading : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.fontSizes.base,
    lineHeight: Typography.fontSizes.base * Typography.lineHeights.normal,
    fontWeight: Typography.fontWeights.normal,
  },
  body: {
    fontSize: Typography.fontSizes.base,
    lineHeight: Typography.fontSizes.base * Typography.lineHeights.normal,
    fontWeight: Typography.fontWeights.normal,
  },
  defaultSemiBold: {
    fontSize: Typography.fontSizes.base,
    lineHeight: Typography.fontSizes.base * Typography.lineHeights.normal,
    fontWeight: Typography.fontWeights.semibold,
  },
  title: {
    fontSize: Typography.fontSizes['4xl'],
    fontWeight: Typography.fontWeights.extrabold,
    lineHeight: Typography.fontSizes['4xl'] * Typography.lineHeights.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },
  heading: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    lineHeight: Typography.fontSizes['2xl'] * Typography.lineHeights.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    lineHeight: Typography.fontSizes.xl * Typography.lineHeights.normal,
  },
  caption: {
    fontSize: Typography.fontSizes.sm,
    lineHeight: Typography.fontSizes.sm * Typography.lineHeights.normal,
    fontWeight: Typography.fontWeights.medium,
  },
  link: {
    fontSize: Typography.fontSizes.base,
    lineHeight: Typography.fontSizes.base * Typography.lineHeights.normal,
    fontWeight: Typography.fontWeights.semibold,
    color: EventuColors.magenta,
  },
});
