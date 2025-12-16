import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
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

const AnimatedView = Animated.createAnimatedComponent(View);

function AnimatedTabIcon({
  iconName,
  focused,
  color,
  activeColor,
}: {
  iconName: string;
  focused: boolean;
  color: string;
  activeColor: string;
}) {
  const scale = useSharedValue(focused ? 1.05 : 1);
  const opacity = useSharedValue(focused ? 1 : 1);
  const iconScale = useSharedValue(focused ? 1 : 1);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.05 : 1, {
      damping: 18,
      stiffness: 200,
    });
    opacity.value = withTiming(focused ? 1 : 1, { duration: 125 });
    iconScale.value = withSpring(focused ? 1 : 1, {
      damping: 15,
      stiffness: 180,
    });
  }, [focused, scale, opacity, iconScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (focused) {
    return (
      <AnimatedView style={containerAnimatedStyle}>
        <AnimatedView style={styles.activeTabIcon}>
          <LinearGradient
            colors={[EventuColors.hotPink, EventuColors.magenta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeTabGradient}
          >
            <Animated.View style={iconAnimatedStyle}>
              <IconSymbol size={26} name={iconName as any} color="#ffffff" />
            </Animated.View>
          </LinearGradient>
        </AnimatedView>
      </AnimatedView>
    );
  }
  return (
    <Animated.View style={[containerAnimatedStyle, styles.navIcon]}>
      <IconSymbol size={24} name={iconName as any} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderTabIcon = (iconName: string, focused: boolean, color: string) => (
    <AnimatedTabIcon
      iconName={iconName}
      focused={focused}
      color={color}
      activeColor={colors.tint}
    />
  );

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#A0A0A0',
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === 'ios' ? 30 : 20}
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 0,
          height: 70,
          minHeight: 70,
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
    left: (width - (width * 0.65)) / 2,
    width: width * 0.65,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderTopWidth: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 1000,
    ...Platform.select({
      ios: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        elevation: 12,
      },
    }),
  },
  navIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginVertical: 0,
  },
  activeTabIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginVertical: 0,
    ...Platform.select({
      ios: {
        shadowColor: EventuColors.hotPink,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.6,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  activeTabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});