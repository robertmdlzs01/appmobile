import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface FadeInViewProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function FadeInView({ children, delay = 0, duration = 200, style, ...props }: FadeInViewProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
