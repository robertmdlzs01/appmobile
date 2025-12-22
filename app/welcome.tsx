import { ThemedText } from '@/components/themed-text';
import { EventuColors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Path, Svg } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const waveOffset = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800 });   
    waveOffset.value = withRepeat(
      withTiming(width, { duration: 10000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const waveAnimatedStyle = useAnimatedStyle(() => {
    const x = waveOffset.value;
    return {
      transform: [{ translateX: x }],
    };
  });
  
  const waveAnimatedStyle2 = useAnimatedStyle(() => {
    const x = waveOffset.value - width;
    return {
      transform: [{ translateX: x }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: fadeIn.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: (1 - fadeIn.value) * 20 }],
  }));

  const handleContinue = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
    
    setTimeout(() => {
      buttonScale.value = withTiming(1, { duration: 100 });
      router.push('/login');
    }, 150);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[EventuColors.magenta, EventuColors.hotPink, EventuColors.violet]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <Animated.View style={[styles.wavyContainer, waveAnimatedStyle]}>
          <Svg width={width * 2} height={300} style={styles.wavySvg} viewBox={`0 0 ${width * 2} 300`}>
            <Path
              d={`M0,100 Q${width * 0.25},50 ${width * 0.5},100 T${width},100 T${width * 1.5},100`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <Path
              d={`M0,130 Q${width * 0.25},80 ${width * 0.5},130 T${width},130 T${width * 1.5},130`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <Path
              d={`M0,160 Q${width * 0.25},110 ${width * 0.5},160 T${width},160 T${width * 1.5},160`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
          </Svg>
        </Animated.View>
        
        <Animated.View style={[styles.wavyContainer, waveAnimatedStyle2]}>
          <Svg width={width * 2} height={300} style={styles.wavySvg} viewBox={`0 0 ${width * 2} 300`}>
            <Path
              d={`M0,100 Q${width * 0.25},50 ${width * 0.5},100 T${width},100 T${width * 1.5},100`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <Path
              d={`M0,130 Q${width * 0.25},80 ${width * 0.5},130 T${width},130 T${width * 1.5},130`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <Path
              d={`M0,160 Q${width * 0.25},110 ${width * 0.5},160 T${width},160 T${width * 1.5},160`}
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
          </Svg>
        </Animated.View>

        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <ThemedText type="title" style={styles.title}>
              Eventu.co
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              ¡Tickets a un Click!
            </ThemedText>
          </View>

          <Animated.View style={buttonAnimatedStyle}>
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed,
              ]}
            >
              <ThemedText type="defaultSemiBold" style={styles.continueButtonText}>
                Continuar
              </ThemedText>
              <View style={styles.continueButtonIcon}>
                <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: 60,
  },
  wavyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 2,
    height: 300,
    opacity: 0.3,
  },
  wavySvg: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  header: {
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 45,
    backgroundColor: EventuColors.white,
    padding: 30,
    marginBottom: 20,
    shadowColor: EventuColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: EventuColors.white,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
    textAlign: 'center',

  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EventuColors.white,
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 36,
    gap: 14,
    shadowColor: EventuColors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  continueButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: EventuColors.black,
  },
  continueButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: EventuColors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
