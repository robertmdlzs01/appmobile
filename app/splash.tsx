import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { EventuColors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    // Animación de entrada del logo
    logoScale.value = withTiming(1, { duration: 600 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    // Pulso sutil del logo
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/welcome');
        }
      }, 2000); // Mostrar splash por 2 segundos

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[EventuColors.violet, EventuColors.magenta, EventuColors.hotPink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={require('@/assets/images/eventu-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: width * 0.7,
    height: (width * 0.7) * 0.414,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

