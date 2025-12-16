import { ThemedText } from '@/components/themed-text';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const backgroundGradient: [string, string, string] = [
    EventuColors.violet + 'AA', 
    EventuColors.magenta + 'AA',
    EventuColors.hotPink + 'AA',
  ];
  const primaryBorderGradient: [string, string] = [
    EventuColors.fuchsia + '66', 
    EventuColors.violet + '77',
  ];

  const sparkleValue0 = useSharedValue(0);
  const sparkleValue1 = useSharedValue(0);
  const sparkleValue2 = useSharedValue(0);
  const sparkleValue3 = useSharedValue(0);
  const sparkleValue4 = useSharedValue(0);
  const sparkleValue5 = useSharedValue(0);
  const sparkleValue6 = useSharedValue(0);
  const sparkleValue7 = useSharedValue(0);
  const sparkleValue8 = useSharedValue(0);
  const sparkleValue9 = useSharedValue(0);

  const sparkleValuesRef = useRef([
    sparkleValue0,
    sparkleValue1,
    sparkleValue2,
    sparkleValue3,
    sparkleValue4,
    sparkleValue5,
    sparkleValue6,
    sparkleValue7,
    sparkleValue8,
    sparkleValue9,
  ]);

  useEffect(() => {
    const durations = [3200, 2600, 3800, 2900, 3400, 3000, 3100, 3600, 2800, 3300];
    sparkleValuesRef.current.forEach((value, index) => {
      value.value = withRepeat(withTiming(1, { duration: durations[index], easing: Easing.inOut(Easing.quad) }), -1, true);
    });
  }, []);

  const useSparkleStyle = (shared: SharedValue<number>, translateX = 0, translateY = 0, amplitude = 12) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(shared.value, [0, 0.5, 1], [0.2, 1, 0.2]),
      transform: [
        { scale: interpolate(shared.value, [0, 0.5, 1], [0.9, 1.2, 0.9]) },
        { translateY: translateY + interpolate(shared.value, [0, 1], [-amplitude / 2, amplitude / 2]) },
        { translateX: translateX + interpolate(shared.value, [0, 1], [-amplitude / 3, amplitude / 3]) },
      ],
    }));

  const sparkleStyles = [
    { style: useSparkleStyle(sparkleValue0, -40, -20, 10), extra: styles.sparkleOne },
    { style: useSparkleStyle(sparkleValue1, 50, 10, 14), extra: styles.sparkleTwo },
    { style: useSparkleStyle(sparkleValue2, 0, 30, 12), extra: styles.sparkleThree },
    { style: useSparkleStyle(sparkleValue3, -10, -35, 16), extra: styles.sparkleFour },
    { style: useSparkleStyle(sparkleValue4, 32, 26, 10), extra: styles.sparkleFive },
    { style: useSparkleStyle(sparkleValue5, -50, 12, 14), extra: styles.sparkleSix },
    { style: useSparkleStyle(sparkleValue6, -12, -48, 12), extra: styles.sparkleSeven },
    { style: useSparkleStyle(sparkleValue7, 18, -52, 10), extra: styles.sparkleEight },
    { style: useSparkleStyle(sparkleValue8, 46, -40, 12), extra: styles.sparkleNine },
    { style: useSparkleStyle(sparkleValue9, -60, -28, 9), extra: styles.sparkleTen },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        style={styles.background}>
        <View style={[styles.heroBlob, styles.heroBlobPrimary, { backgroundColor: EventuColors.violet + '22' }]} />
        <LinearGradient
          colors={[EventuColors.fuchsia + '55', EventuColors.violet + '22']}
          start={{ x: 0.2, y: 0.1 }}
          end={{ x: 0.8, y: 0.9 }}
          style={styles.heroBlobSecondary}
          />
        {sparkleStyles.map(({ style, extra }, index) => (
          <Animated.View key={`sparkle-${index}`} style={[styles.sparkle, extra, style]} />
        ))}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/eventu-logo.png')}
            style={styles.logo}
            resizeMode="contain"
            resizeMethod="resize"
          />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Eventu.co
            </ThemedText>
            <ThemedText style={styles.subtitle}>
            ¡Tickets a un Click!
            </ThemedText>
            
          </View>

          <View style={styles.actions}>
            <LinearGradient
              colors={primaryBorderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonBorder}>
                <Pressable
                onPress={() => router.push('/login')}
                  style={({ pressed }) => [
                  styles.primaryButton,
                    {
                    backgroundColor: colors.tint + 'AA',
                      shadowColor: colors.tint + '66',
                    },
                ]}>
                <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
                  Ingresar
                </ThemedText>
                </Pressable>
            </LinearGradient>

            <LinearGradient
              colors={primaryBorderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonBorder}>
              <Pressable
                onPress={() => router.push('/register')}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    backgroundColor: colors.tint + 'AA',
                    shadowColor: colors.tint + '66',
                  },
                ]}>
                <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
                  Registrarse
                </ThemedText>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  heroBlob: {
    position: 'absolute',
    borderRadius: width,
    opacity: 0.65,
  },
  heroBlobPrimary: {
    width: width * 0.95,
    height: width * 0.95,
    top: -width * 0.3,
    left: -width * 0.3,
  },
  heroBlobSecondary: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width,
    top: width * 0.35,
    right: -width * 0.25,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 48,
    paddingBottom: 40,
  },
  logoContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: width * 0.9,
    height: (width * 0.9) * 0.414, 
  },
  header: {
    gap: 18,
    alignItems: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 20,
    letterSpacing: 0.5,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 38,
    lineHeight: 44,
    color: '#ffffff',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
  },
  actions: {
    gap: 18,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonBorder: {
    borderRadius: Radius['3xl'],
    padding: 2,
    width: '100%',
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: Radius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
  },
  secondaryButton: {
    borderRadius: Radius['3xl'],
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  secondaryButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
  },
  sparkle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  sparkleOne: {
    top: width * 0.18,
    left: width * 0.2,
  },
  sparkleTwo: {
    top: width * 0.45,
    right: width * 0.22,
  },
  sparkleThree: {
    bottom: width * 0.3,
    left: width * 0.1,
  },
  sparkleFour: {
    top: width * 0.28,
    left: width * 0.55,
  },
  sparkleFive: {
    bottom: width * 0.22,
    right: width * 0.18,
  },
  sparkleSix: {
    top: width * 0.55,
    left: width * 0.08,
  },
  sparkleSeven: {
    top: width * 0.12,
    left: width * 0.45,
  },
  sparkleEight: {
    top: width * 0.08,
    right: width * 0.18,
  },
  sparkleNine: {
    top: width * 0.22,
    right: width * 0.08,
  },
  sparkleTen: {
    top: width * 0.14,
    left: width * 0.05,
  },
});
