import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, usePathname, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width * 0.75;
const TAB_BAR_HEIGHT = 56;
const TAB_COUNT = 3;

const AnimatedView = Animated.createAnimatedComponent(View);

function AnimatedTabIcon({
  iconName,
  focused,
  color,
}: {
  iconName: string;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const iconScale = useSharedValue(focused ? 1 : 0.9);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
    iconScale.value = withSpring(focused ? 1 : 0.9, {
      damping: 15,
      stiffness: 180,
    });
  }, [focused, scale, iconScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <AnimatedView style={[styles.tabIconContainer, containerAnimatedStyle]}>
      <Animated.View style={iconAnimatedStyle}>
        <IconSymbol 
          size={focused ? 28 : 26} 
          name={iconName as any} 
          color={focused ? EventuColors.magenta : EventuColors.mediumGray} 
        />
      </Animated.View>
    </AnimatedView>
  );
}

function AnimatedIndicator({ activeIndex }: { activeIndex: number }) {
  const indicatorPosition = useSharedValue(activeIndex);

  useEffect(() => {
    indicatorPosition.value = withTiming(activeIndex, {
      duration: 300,
    });
  }, [activeIndex, indicatorPosition]);

  const indicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (TAB_BAR_WIDTH - 32) / TAB_COUNT;
    const indicatorWidth = tabWidth * 0.35;
    const leftOffset = (tabWidth - indicatorWidth) / 2;
    const paddingOffset = 16;
    
    return {
      left: paddingOffset + indicatorPosition.value * tabWidth + leftOffset,
      width: indicatorWidth,
    };
  });

  return (
    <AnimatedView style={[styles.indicator, indicatorStyle]}>
      <View style={styles.indicatorBar} />
    </AnimatedView>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const segments = useSegments();

  const getActiveIndex = () => {
    if (pathname?.includes('tickets')) return 0;
    if (pathname?.includes('profile')) return 2;
    return 1;
  };

  const activeIndex = getActiveIndex();

  const renderTabIcon = (iconName: string, focused: boolean, color: string) => (
    <AnimatedTabIcon
      iconName={iconName}
      focused={focused}
      color={color}
    />
  );

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: EventuColors.magenta,
        tabBarInactiveTintColor: EventuColors.mediumGray,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          {
            left: (width - TAB_BAR_WIDTH) / 2,
          },
        ],
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 60}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
            <AnimatedIndicator activeIndex={activeIndex} />
          </View>
        ),
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
          paddingTop: 4,
          paddingBottom: 0,
          height: TAB_BAR_HEIGHT,
          minHeight: TAB_BAR_HEIGHT,
        },
        tabBarHideOnKeyboard: true,
        tabBarAccessibilityLabel: 'Tab bar',
      }}>
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Entradas',
          tabBarIcon: ({ color, focused }) => renderTabIcon('ticket.fill', focused, color),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color, focused }) => renderTabIcon('house.fill', focused, color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => renderTabIcon('person.fill', focused, color),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 25,
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    overflow: 'visible',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 40,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_HEIGHT / 2,
    backgroundColor: EventuColors.white,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 40,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  indicator: {
    position: 'absolute',
    bottom: 6,
    height: 2.5,
    borderRadius: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorBar: {
    width: '100%',
    height: '100%',
    backgroundColor: EventuColors.magenta,
    borderRadius: 1.25,
    ...Platform.select({
      ios: {
        shadowColor: EventuColors.magenta,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});