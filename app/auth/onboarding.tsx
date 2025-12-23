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
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { OptimizedImage } from '@/components/optimized-image';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Almacena tus Entradas',
    description: 'Guarda todas tus entradas de forma segura y accede a ellas desde cualquier lugar',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=800&fit=crop&q=80',
    gradient: [EventuColors.magenta, EventuColors.hotPink],
  },
  {
    id: '2',
    title: 'Visualiza al Instante',
    description: 'Accede a tus boletos digitales con código QR cuando lo necesites',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=800&fit=crop&q=80',
    gradient: [EventuColors.violet, EventuColors.magenta],
  },
  {
    id: '3',
    title: 'Confirma tus Datos',
    description: 'Si ya compraste tus entradas, confirma tus datos para verlas al instante',
    image: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&h=800&fit=crop&q=80',
    gradient: [EventuColors.hotPink, EventuColors.violet],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

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
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <OptimizedImage
          source={{ uri: item.image }}
          style={styles.slideImage}
          contentFit="cover"
          priority="high"
          cachePolicy="memory-disk"
          transition={200}
        />
    <LinearGradient
          colors={[...item.gradient, 'rgba(0,0,0,0.6)']}
      start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.imageOverlay}
        />
      </View>
      <View style={styles.slideContent}>
        <ThemedText type="title" style={styles.title}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    ...Shadows.sm,
  },
  skipText: {
    color: EventuColors.magenta,
    fontSize: 15,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  imageContainer: {
    width: '100%',
    height: '60%',
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: EventuColors.black,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: EventuColors.white,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EventuColors.lightGray,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: EventuColors.magenta,
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: EventuColors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
