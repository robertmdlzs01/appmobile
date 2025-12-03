import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useRef } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Animated,
} from 'react-native';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 40;

export default function GalleryScreen() {
  const { id, eventName } = useLocalSearchParams<{ id: string; eventName: string }>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const images = [
    require('@/assets/images/react-logo.png'),
    require('@/assets/images/react-logo.png'),
    require('@/assets/images/react-logo.png'),
    require('@/assets/images/react-logo.png'),
    require('@/assets/images/react-logo.png'),
  ];

  const eventTitle = eventName || 'Galería del Evento';

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setSelectedIndex(index);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setSelectedIndex(index);
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  };

  const closeFullscreen = () => {
    setFullscreenIndex(null);
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        scale.setOffset(scale._value);
        translateX.setOffset(translateX._value);
        translateY.setOffset(translateY._value);
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        scale.flattenOffset();
        translateX.flattenOffset();
        translateY.flattenOffset();
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {eventTitle}
          </Text>
          <Text style={styles.headerSubtitle}>
            {selectedIndex + 1} de {images.length}
          </Text>
        </View>
        <Pressable style={styles.iconButton}>
          <MaterialIcons name="share" size={24} color={EventuColors.hotPink} />
        </Pressable>
      </View>

      {}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
      >
        {images.map((image, index) => (
          <Pressable
            key={index}
            style={styles.imageWrapper}
            onPress={() => openFullscreen(index)}
            onLongPress={() => openFullscreen(index)}
          >
            <Image source={image} style={styles.image} resizeMode="contain" />
            <View style={styles.imageOverlay}>
              <View style={styles.zoomHint}>
                <MaterialIcons name="zoom-in" size={24} color={EventuColors.white} />
                <Text style={styles.zoomHintText}>Toca para ampliar</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {}
      <View style={styles.thumbnailContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailScroll}
        >
          {images.map((image, index) => (
            <Pressable
              key={index}
              style={[
                styles.thumbnail,
                selectedIndex === index && styles.thumbnailActive,
              ]}
              onPress={() => scrollToIndex(index)}
            >
              <Image source={image} style={styles.thumbnailImage} />
              {selectedIndex === index && (
                <View style={styles.thumbnailOverlay} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <MaterialIcons name="photo-library" size={20} color={EventuColors.hotPink} />
          <Text style={styles.infoText}>
            {images.length} {images.length === 1 ? 'imagen' : 'imágenes'} en la galería
          </Text>
        </View>
        <Text style={styles.infoHint}>
          Desliza para ver más imágenes
        </Text>
      </View>

      {}
      <Modal
        visible={fullscreenIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <SafeAreaView style={styles.fullscreenSafeArea}>
            <View style={styles.fullscreenHeader}>
              <Pressable style={styles.fullscreenButton} onPress={closeFullscreen}>
                <MaterialIcons name="close" size={24} color={EventuColors.white} />
              </Pressable>
              <Text style={styles.fullscreenTitle}>
                {fullscreenIndex !== null ? fullscreenIndex + 1 : 0} de {images.length}
              </Text>
              <Pressable style={styles.fullscreenButton}>
                <MaterialIcons name="share" size={24} color={EventuColors.white} />
              </Pressable>
            </View>

            <ScrollView
              ref={fullscreenScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / width);
                setFullscreenIndex(index);
                setSelectedIndex(index);
              }}
              contentOffset={fullscreenIndex !== null ? { x: fullscreenIndex * width, y: 0 } : undefined}
            >
              {images.map((image, index) => (
                <View key={index} style={styles.fullscreenImageWrapper}>
                  <Animated.Image
                    source={image}
                    style={[
                      styles.fullscreenImage,
                      {
                        transform: [
                          { scale: scale },
                          { translateX: translateX },
                          { translateY: translateY },
                        ],
                      },
                    ]}
                    resizeMode="contain"
                    {...panResponder.panHandlers}
                  />
                </View>
              ))}
            </ScrollView>

            <View style={styles.fullscreenThumbnails}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((image, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.fullscreenThumbnail,
                      fullscreenIndex === index && styles.fullscreenThumbnailActive,
                    ]}
                    onPress={() => {
                      setFullscreenIndex(index);
                      fullscreenScrollRef.current?.scrollTo({
                        x: index * width,
                        animated: true,
                      });
                    }}
                  >
                    <Image source={image} style={styles.fullscreenThumbnailImage} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EventuColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: EventuColors.mediumGray,
  },
  carousel: {
    flex: 1,
  },
  imageWrapper: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  thumbnailContainer: {
    paddingVertical: 16,
    backgroundColor: EventuColors.white,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  thumbnailScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: EventuColors.hotPink,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(228, 0, 111, 0.3)',
  },
  infoCard: {
    backgroundColor: EventuColors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: EventuColors.black,
  },
  infoHint: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    fontStyle: 'italic',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    opacity: 0,
  },
  zoomHint: {
    alignItems: 'center',
    gap: 8,
  },
  zoomHintText: {
    color: EventuColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenSafeArea: {
    flex: 1,
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullscreenButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.white,
  },
  fullscreenImageWrapper: {
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: '100%',
  },
  fullscreenThumbnails: {
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  fullscreenThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  fullscreenThumbnailActive: {
    borderColor: EventuColors.hotPink,
  },
  fullscreenThumbnailImage: {
    width: '100%',
    height: '100%',
  },
});
