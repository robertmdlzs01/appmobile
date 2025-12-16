import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  index?: number;
}

export function AnimatedCard({ children, delay = 0, index = 0, style, ...props }: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const totalDelay = delay + index * 25;
    opacity.value = withDelay(totalDelay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(totalDelay, withSpring(0, { damping: 15, stiffness: 100 }));
    scale.value = withDelay(totalDelay, withSpring(1, { damping: 12, stiffness: 150 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
