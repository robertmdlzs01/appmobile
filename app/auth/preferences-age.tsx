import { PressableCard } from '@/components/pressable-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const MIN_AGE = 13;
const MAX_AGE = 100;

export default function PreferencesAgeScreen() {
  const [age, setAge] = useState<number>(25);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scaleAnim = useSharedValue(1);

  const handleDecrease = () => {
    if (age > MIN_AGE) {
      setAge(age - 1);
      scaleAnim.value = withSpring(0.9, { damping: 15 }, () => {
        scaleAnim.value = withSpring(1, { damping: 15 });
      });
    }
  };

  const handleIncrease = () => {
    if (age < MAX_AGE) {
      setAge(age + 1);
      scaleAnim.value = withSpring(1.1, { damping: 15 }, () => {
        scaleAnim.value = withSpring(1, { damping: 15 });
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handleNext = () => {
    console.log('Selected age:', age);
    router.push('/auth/complete-profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5FB', '#F5F0FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('/auth/complete-profile')}>
              <ThemedText style={styles.skipText}>Omitir</ThemedText>
            </Pressable>
          </View>

          {}
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '100%' }]}
            />
          </View>

          {}
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              ¿Cuántos años tienes?
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Tu edad nos ayuda a ofrecerte el mejor contenido.
            </ThemedText>
          </View>

          {}
          <View style={styles.ageCounterContainer}>
            <View style={styles.ageDisplay}>
              <Animated.View style={[styles.ageNumberContainer, animatedStyle]}>
                <ThemedText type="title" style={styles.ageNumber}>
                  {age}
                </ThemedText>
                <ThemedText style={styles.ageLabel}>
                  {age === 1 ? 'año' : 'años'}
                </ThemedText>
              </Animated.View>
            </View>

            <View style={styles.controlsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.controlButton,
                  age === MIN_AGE && styles.controlButtonDisabled,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleDecrease}
                disabled={age === MIN_AGE}
              >
                <MaterialIcons 
                  name="remove" 
                  size={28} 
                  color={age === MIN_AGE ? EventuColors.lightGray : EventuColors.magenta} 
                />
              </Pressable>

              <View style={styles.ageSelector}>
                <View style={styles.sliderContainer}>
                  <View style={styles.sliderTrack}>
                    <View 
                      style={[
                        styles.sliderFill, 
                        { width: `${((age - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
                <View style={styles.ageRangeLabels}>
                  <Text style={styles.rangeLabel}>{MIN_AGE}</Text>
                  <Text style={styles.rangeLabel}>{MAX_AGE}</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.controlButton,
                  age === MAX_AGE && styles.controlButtonDisabled,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handleIncrease}
                disabled={age === MAX_AGE}
              >
                <MaterialIcons 
                  name="add" 
                  size={28} 
                  color={age === MAX_AGE ? EventuColors.lightGray : EventuColors.magenta} 
                />
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {}
        <View style={styles.bottomContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={handleNext}
          >
            <LinearGradient
              colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <ThemedText style={styles.buttonText}>Continuar</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.mediumGray,
  },
  progressBar: {
    height: 4,
    backgroundColor: EventuColors.lightGray,
    borderRadius: 2,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
  },
  ageCounterContainer: {
    alignItems: 'center',
    gap: 40,
  },
  ageDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  ageNumberContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ageNumber: {
    fontSize: 72,
    fontWeight: '800',
    color: EventuColors.magenta,
    lineHeight: 80,
    letterSpacing: -2,
  },
  ageLabel: {
    fontSize: 20,
    color: EventuColors.mediumGray,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: EventuColors.white,
    borderWidth: 2,
    borderColor: EventuColors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  controlButtonDisabled: {
    borderColor: EventuColors.lightGray,
    opacity: 0.5,
  },
  ageSelector: {
    flex: 1,
    gap: 8,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: EventuColors.lightGray,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: EventuColors.magenta,
    borderRadius: 3,
  },
  ageRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rangeLabel: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66', 
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: EventuColors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
