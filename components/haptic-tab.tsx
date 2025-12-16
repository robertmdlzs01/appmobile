import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else if (Platform.OS === 'android') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPress={(ev) => {
        props.onPress?.(ev);
      }}
      style={({ pressed }) => [
        props.style,
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
          minHeight: 70,
          minWidth: 70,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: props.accessibilityState?.selected }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    />
  );
}
