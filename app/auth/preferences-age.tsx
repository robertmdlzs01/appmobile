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

const ageRanges = [
  { id: '18-24', label: '18-24', emoji: '🎓' },
  { id: '25-34', label: '25-34', emoji: '💼' },
  { id: '35-44', label: '35-44', emoji: '👔' },
  { id: '45-54', label: '45-54', emoji: '👨‍💼' },
  { id: '55+', label: '55+', emoji: '👴' },
];

export default function PreferencesAgeScreen() {
  const [selectedAge, setSelectedAge] = useState<string>('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleNext = () => {
    if (selectedAge) {
      console.log('Selected age:', selectedAge);
      router.push('/auth/preferences-interest');
    }
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
            <Pressable onPress={() => router.push('/auth/preferences-interest')}>
              <ThemedText style={styles.skipText}>Omitir</ThemedText>
            </Pressable>
          </View>

          {}
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: '66%' }]}
            />
          </View>

          {}
          <View style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              ¿Cuál es tu rango de edad?
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Ayúdanos a recomendarte eventos apropiados para tu edad
            </ThemedText>
          </View>

          {}
          <View style={styles.optionsContainer}>
            {ageRanges.map((age) => {
              const isSelected = selectedAge === age.id;
              return (
                <PressableCard
                  key={age.id}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    {
                      borderColor: isSelected ? EventuColors.hotPink : EventuColors.lightGray,
                      backgroundColor: isSelected
                        ? EventuColors.hotPink + '10' 
                        : EventuColors.white,
                    },
                  ]}
                  onPress={() => setSelectedAge(age.id)}
                  hapticFeedback={true}
                >
                  <Text style={styles.emoji}>{age.emoji}</Text>
                  <ThemedText
                    style={[
                      styles.optionText,
                      isSelected && { color: EventuColors.hotPink, fontWeight: '600' },
                    ]}
                  >
                    {age.label}
                  </ThemedText>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <LinearGradient
                        colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.checkmarkGradient}
                      >
                        <IconSymbol name="checkmark" size={16} color={EventuColors.white} />
                      </LinearGradient>
                    </View>
                  )}
                </PressableCard>
              );
            })}
          </View>
        </ScrollView>

        {}
        <View style={styles.bottomContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              !selectedAge && styles.buttonDisabled,
              { opacity: pressed || !selectedAge ? 0.7 : 1 },
            ]}
            onPress={handleNext}
            disabled={!selectedAge}
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
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1.5,
    borderRadius: Radius.xl,
    ...Shadows.sm,
  },
  optionSelected: {
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66', 
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkmarkGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
