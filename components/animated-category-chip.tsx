import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radius } from '@/constants/theme-extended';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedCategoryChipProps {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  selectedColor: string;
  unselectedColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
}

export function AnimatedCategoryChip({
  name,
  icon,
  isSelected,
  onPress,
  selectedColor,
  unselectedColor,
  borderColor,
  textColor,
  iconColor,
}: AnimatedCategoryChipProps) {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(isSelected ? 1 : 0);
  const borderOpacity = useSharedValue(isSelected ? 1 : 0.5);

  React.useEffect(() => {
    backgroundColor.value = withTiming(isSelected ? 1 : 0, { duration: 250 });
    borderOpacity.value = withTiming(isSelected ? 1 : 0.5, { duration: 250 });
  }, [isSelected, backgroundColor, borderOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: backgroundColor.value === 1 ? selectedColor : unselectedColor,
    transform: [{ scale: scale.value }],
    borderWidth: 1.5,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chip, { borderColor: isSelected ? selectedColor : borderColor }, animatedStyle]}>
      <View style={styles.content}>
        <IconSymbol
          name={icon as any}
          size={16}
          color={isSelected ? '#ffffff' : iconColor}
        />
        <ThemedText
          style={[
            styles.text,
            {
              color: isSelected ? '#ffffff' : textColor,
              fontWeight: isSelected ? '600' : '500',
            },
          ]}>
          {name}
        </ThemedText>
        {isSelected && (
          <Animated.View style={styles.checkmark}>
            <IconSymbol name="checkmark" size={12} color="#ffffff" />
          </Animated.View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginRight: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 14,
  },
  checkmark: {
    marginLeft: 2,
  },
});
