import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, PressableProps, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Radius } from '@/constants/theme-extended';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: any;
  hapticFeedback?: boolean;
  springConfig?: { damping: number; stiffness: number };
}

export function PressableCard({
  children,
  style,
  hapticFeedback = true,
  springConfig = { damping: 15, stiffness: 300 },
  ...props
}: PressableCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfig);
    if (hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.base, style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
  },
});
