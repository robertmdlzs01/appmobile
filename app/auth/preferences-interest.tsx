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
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

const interests = [
  { id: 'music', label: 'Música', icon: 'music.note' },
  { id: 'sports', label: 'Deportes', icon: 'sportscourt.fill' },
  { id: 'theater', label: 'Teatro', icon: 'theatermasks.fill' },
  { id: 'comedy', label: 'Comedia', icon: 'face.smiling.fill' },
  { id: 'arts', label: 'Arte', icon: 'paintbrush.fill' },
  { id: 'food', label: 'Comida', icon: 'fork.knife' },
  { id: 'technology', label: 'Tecnología', icon: 'laptopcomputer' },
  { id: 'fashion', label: 'Moda', icon: 'tshirt.fill' },
];

export default function PreferencesInterestScreen() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleToggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (selectedInterests.length > 0) {
      console.log('Selected interests:', selectedInterests);
      router.push('/auth/complete-profile');
    }
  };

  const handleSkip = () => {
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
            <Pressable onPress={handleSkip}>
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
              ¿Cuáles son tus intereses?
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Selecciona tus intereses para recomendarte eventos personalizados
            </ThemedText>
          </View>

          {}
          <View style={styles.interestsGrid}>
            {interests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <PressableCard
                  key={interest.id}
                  style={[
                    styles.interestCard,
                    isSelected && styles.interestCardSelected,
                    {
                      borderColor: isSelected
                        ? EventuColors.hotPink
                        : EventuColors.lightGray,
                      backgroundColor: isSelected
                        ? EventuColors.hotPink + '10' 
                        : EventuColors.white,
                    },
                  ]}
                  onPress={() => handleToggleInterest(interest.id)}
                  hapticFeedback={true}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: isSelected
                          ? EventuColors.hotPink
                          : EventuColors.hotPink + '15',
                      },
                    ]}
                  >
                    <IconSymbol
                      name={interest.icon as any}
                      size={24}
                      color={isSelected ? EventuColors.white : EventuColors.hotPink}
                    />
                  </View>
                  <ThemedText
                    style={[
                      styles.interestLabel,
                      isSelected && { color: EventuColors.hotPink, fontWeight: '600' },
                    ]}
                  >
                    {interest.label}
                  </ThemedText>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <IconSymbol name="checkmark" size={14} color={EventuColors.hotPink} />
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
              selectedInterests.length === 0 && styles.buttonDisabled,
              { opacity: pressed || selectedInterests.length === 0 ? 0.7 : 1 },
            ]}
            onPress={handleNext}
            disabled={selectedInterests.length === 0}
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
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestCard: {
    width: '47%',
    padding: 20,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    ...Shadows.sm,
  },
  interestCardSelected: {
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66', 
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: EventuColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: EventuColors.hotPink,
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
