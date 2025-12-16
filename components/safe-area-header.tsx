import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';

interface SafeAreaHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  additionalPadding?: number;
}

/**
 * Componente wrapper para headers que respeta el SafeArea
 * En iOS respeta la Dynamic Island y en Android la status bar
 */
export function SafeAreaHeader({ 
  children, 
  style, 
  additionalPadding = 16 
}: SafeAreaHeaderProps) {
  const { paddingTop } = useSafeAreaHeaderPadding();

  return (
    <View style={[styles.header, { paddingTop: paddingTop + additionalPadding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});

