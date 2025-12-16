import { ThemedText } from '@/components/themed-text';
import { EventuColors, EventuGradients } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Almacena tus Entradas',
    description: 'Guarda todas tus entradas en un solo lugar',
    emoji: '🎫',
    gradient: [EventuColors.violet + 'AA', EventuColors.magenta + 'AA'], 
  },
  {
    id: '2',
    title: 'Visualiza al Instante',
    description: 'Accede a tus entradas en cualquier momento',
    emoji: '📱',
    gradient: [EventuColors.hotPink + 'AA', EventuColors.fuchsia + 'AA'], 
  },
  {
    id: '3',
    title: 'Confirma tus Datos',
    description: 'Si ya compraste, solo confirma tus datos para ver tus entradas',
    emoji: '✅',
    gradient: [EventuColors.magenta + 'AA', EventuColors.violet + 'AA'], 
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace('/auth/preferences-gender');
    }
  };

  const handleSkip = () => {
    router.replace('/auth/preferences-gender');
  };

  const renderItem = ({ item }: any) => (
    <LinearGradient
      colors={item.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.slide}
    >
      <View style={styles.slideContent}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <ThemedText type="title" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <ThemedText style={styles.skipText}>Omitir</ThemedText>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        onScrollToIndexFailed={(info) => {
          
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleNext}
        >
              <LinearGradient
                colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
            <ThemedText style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: EventuColors.white,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 40,
  },
  description: {
    fontSize: 18,
    color: EventuColors.white,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 26,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EventuColors.white,
    opacity: 0.4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: EventuColors.white,
    opacity: 1,
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
    shadowColor: EventuColors.hotPink + '66', 
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
