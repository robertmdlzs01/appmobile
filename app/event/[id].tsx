import { ErrorState, handleApiError } from '@/components/error-handler';
import { OptimizedImage } from '@/components/optimized-image';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState } from 'react';
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function VideoSection({ videoUrl }: { videoUrl: string }) {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = false;
  });

  return (
    <View style={styles.videoSection}>
      <Text style={styles.sectionTitle}>
        Video promocional
      </Text>
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls
          contentFit="contain"
        />
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const eventsData: Record<string, any> = {
    '1': {
      id: '1',
      name: 'SANTALAND 2025',
      subtitle: 'Evento navideño inolvidable en Barranquilla',
      date: '12 diciembre – 14 diciembre 2025',
      time: 'a las 6:00 PM',
      location: 'Barranquilla',
      price: '$85.000',
      category: 'Música',
      description:
        'Celebra la Navidad en el evento más mágico del año. SANTALAND 2025 te espera con sorpresas, música y diversión para toda la familia.',
      fullDescription:
        'SANTALAND 2025 es el evento navideño más esperado del año en Barranquilla. Disfruta de tres días llenos de magia, música en vivo, actividades para niños, shows especiales y la presencia de Papá Noel. Un espacio único para crear recuerdos inolvidables con tus seres queridos durante la temporada navideña.',
      image: require('@/assets/images/react-logo.png'),
      images: [
        require('@/assets/images/react-logo.png'),
        require('@/assets/images/react-logo.png'),
        require('@/assets/images/react-logo.png'),
      ],
      videoUrl: null,
      promoter: 'Eventu',
      instructions: [
        'Llegar con 30 minutos de anticipación',
        'Presentar identificación al ingreso',
        'Evento familiar, recomendado para todas las edades',
        'Se permiten cámaras y celulares',
        'Prohibido ingresar con alimentos o bebidas',
        'Respetar las medidas de seguridad',
      ],
    },
    '2': {
      id: '2',
      name: 'FESTIVAL NACIONAL DE COMPOSITORES 2025',
      subtitle: 'El festival más importante de la música colombiana',
      date: '12 diciembre – 14 diciembre 2025',
      time: 'a las 7:00 PM',
      location: 'San Juan del Cesar – La Guajira',
      price: '$120.000',
      category: 'Música',
      description:
        'Celebra la música colombiana con los mejores compositores del país en San Juan del Cesar.',
      fullDescription:
        'El Festival Nacional de Compositores es un evento único que reúne a los mejores compositores y músicos de Colombia. Durante tres días, disfrutarás de conciertos, talleres, conversatorios y presentaciones especiales. Un espacio para honrar la riqueza musical de nuestro país y descubrir nuevos talentos en el corazón de La Guajira.',
      image: require('@/assets/images/react-logo.png'),
      images: [
        require('@/assets/images/react-logo.png'),
        require('@/assets/images/react-logo.png'),
        require('@/assets/images/react-logo.png'),
      ],
      videoUrl: null,
      promoter: 'Eventu',
      instructions: [
        'Llegar con anticipación debido al aforo esperado',
        'Presentar identificación al ingreso',
        'Se permiten cámaras para uso personal',
        'Espacio al aire libre, traer protección solar',
        'No se permite el ingreso de alimentos',
        'El evento dura 3 días',
      ],
    },
    '3': {
      id: '3',
      name: 'QUIÉN SE LLEVÓ LA NAVIDAD?',
      subtitle: 'Comedia navideña en vivo',
      date: 'Sábado, 29 Noviembre 2025',
      time: 'a las 8:00 PM',
      location: 'Barranquilla',
      price: '$75.000',
      category: 'Comedia',
      description:
        'Una noche llena de risas y diversión navideña. La comedia más esperada de la temporada en Barranquilla.',
      fullDescription:
        'QUIÉN SE LLEVÓ LA NAVIDAD? es un espectáculo cómico navideño que promete hacerte reír durante toda la función. Con un elenco de reconocidos comediantes, esta obra combina humor, música y momentos emotivos para toda la familia. Una experiencia única que hará que tu temporada navideña sea aún más especial.',
      image: require('@/assets/images/react-logo.png'),
      images: [
        require('@/assets/images/react-logo.png'),
        require('@/assets/images/react-logo.png'),
      ],
      videoUrl: null,
      promoter: 'Eventu',
      instructions: [
        'Llegar con 30 minutos de anticipación',
        'Presentar identificación al ingreso',
        'Evento apto para toda la familia',
        'No se permiten grabaciones durante la función',
        'Prohibido ingresar con alimentos o bebidas',
        'Duración aproximada: 90 minutos',
      ],
    },
  };

  const eventId = Array.isArray(id) ? id[0] : id;
  const event = eventsData[eventId ?? '1'] || eventsData['1'];

  const handleBuy = () => {
    console.log('=== handleBuy llamado ===');
    console.log('Event:', event);
    console.log('Platform:', Platform.OS);
    
    if (!event?.id) {
      console.error('No hay event.id');
      return;
    }
    
    const eventId = String(event.id);
    console.log('EventId a navegar:', eventId);
    
    try {
      console.log('Intentando navegar...');
    router.push({
      pathname: '/event/select-seat',
        params: { eventId },
    });
      console.log('Navegación exitosa');
    } catch (error) {
      console.error('Error en navegación:', error);
      
      router.push(`/event/select-seat?eventId=${eventId}` as any);
    }
  };

  const displayedDescription = showFullDescription ? event.fullDescription : event.description;
  const heroGradientColors = ['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.75)'];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backgroundGradient}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {loading ? (
            <View style={styles.skeletonContainer}>
              <SkeletonLoader variant="rectangular" height={350} borderRadius={0} />
              <View style={styles.skeletonContent}>
                <SkeletonLoader variant="text" width="70%" height={28} style={{ marginBottom: 12 }} />
                <SkeletonLoader variant="text" width="50%" height={20} style={{ marginBottom: 24 }} />
                <SkeletonLoader variant="text" width="100%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonLoader variant="text" width="90%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonLoader variant="text" width="80%" height={16} style={{ marginBottom: 24 }} />
                <SkeletonLoader variant="rectangular" height={200} borderRadius={Radius.xl} />
              </View>
            </View>
          ) : error ? (
            <ErrorState
              error={handleApiError({ message: error })}
              onRetry={() => setError(null)}
              title="Error al cargar el evento"
              message={error}
            />
          ) : (
            <>
              {}
              <View style={styles.imageContainer}>
                <OptimizedImage
                  source={event.image}
                  style={styles.eventImage}
                  contentFit="cover"
                  priority="high"
                  cachePolicy="memory-disk"
                  transition={200}
                />
            <LinearGradient
              colors={heroGradientColors as any}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.imageOverlay}
            />
            <View style={styles.heroTopControls}>
              <Pressable 
                style={styles.heroControlButton} 
                onPress={() => router.back()}
              >
                <View style={styles.heroControlButtonBackground}>
                  <MaterialIcons name="arrow-back" size={20} color={EventuColors.black} />
                </View>
              </Pressable>
              <Pressable 
                style={styles.heroControlButton} 
                onPress={() => setIsBookmarked(!isBookmarked)}
              >
                <View style={styles.heroControlButtonBackground}>
                  <MaterialIcons 
                    name={isBookmarked ? 'bookmark' : 'bookmark-border'} 
                    size={20} 
                    color={isBookmarked ? EventuColors.magenta : EventuColors.black} 
                  />
                </View>
              </Pressable>
            </View>
          </View>

        {}
        <View style={styles.summaryWrapper}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryTitleBlock}>
                <Text style={styles.summaryTitle}>
                  {event.name}
                </Text>
                <Text style={styles.summarySubtitle}>{event.subtitle}</Text>
              </View>
              <View style={styles.summaryPriceBlock}>
                <Text style={styles.summaryPriceLabel}>Desde</Text>
                <Text style={[styles.summaryPriceValue, { color: EventuColors.magenta }]}>
                  {event.price}
                </Text>
              </View>
            </View>
            <View style={styles.summaryMetaRow}>
              <View style={styles.summaryMetaChip}>
                <MaterialIcons name="event" size={14} color={EventuColors.magenta} />
                <Text style={styles.summaryMetaText}>{event.date}</Text>
              </View>
              <View style={styles.summaryMetaChip}>
                <MaterialIcons name="schedule" size={14} color={EventuColors.magenta} />
                <Text style={styles.summaryMetaText}>{event.time}</Text>
              </View>
              <View style={styles.summaryMetaChip}>
                <MaterialIcons name="place" size={14} color={EventuColors.magenta} />
                <Text style={styles.summaryMetaText}>{event.location}</Text>
              </View>
            </View>
          </View>
        </View>

        {}
        <View style={styles.infoCard}>
          <View style={styles.eventDetailsSection}>
            <Text style={styles.sectionTitle}>
              Detalles del evento
            </Text>
            <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 4}>
              {displayedDescription}
            </Text>
            <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={[styles.showMore, { color: EventuColors.magenta }]}>
                {showFullDescription ? 'MOSTRAR MENOS' : 'MOSTRAR MÁS'}
              </Text>
            </Pressable>
          </View>

          {event.videoUrl && (
            <View style={styles.videoSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Video promocional</Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/event/video',
                      params: {
                        id: event.id,
                        videoUrl: event.videoUrl,
                        eventName: event.name,
                      },
                    })
                  }
                >
                  <View style={styles.fullscreenButton}>
                    <MaterialIcons name="fullscreen" size={20} color={EventuColors.hotPink} />
                    <Text style={styles.fullscreenText}>Pantalla completa</Text>
                  </View>
                </Pressable>
              </View>
              <VideoSection videoUrl={event.videoUrl} />
            </View>
          )}

          {event.images && event.images.length > 0 && (
            <View style={styles.gallerySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Galería</Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/event/gallery',
                      params: {
                        id: event.id,
                        eventName: event.name,
                      },
                    })
                  }
                >
                  <View style={styles.viewAllButton}>
                    <Text style={styles.viewAllText}>Ver todas</Text>
                    <MaterialIcons name="chevron-right" size={20} color={EventuColors.hotPink} />
                  </View>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                {event.images.slice(0, 3).map((img: any, index: number) => (
                  <Pressable
                    key={index}
                    onPress={() =>
                      router.push({
                        pathname: '/event/gallery',
                        params: {
                          id: event.id,
                          eventName: event.name,
                        },
                      })
                    }
                  >
                    <OptimizedImage
                      source={img}
                      style={styles.galleryImage}
                      contentFit="cover"
                      priority="normal"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  </Pressable>
                ))}
                {event.images.length > 3 && (
                  <Pressable
                    style={styles.moreImagesButton}
                    onPress={() =>
                      router.push({
                        pathname: '/event/gallery',
                        params: {
                          id: event.id,
                          eventName: event.name,
                        },
                      })
                    }
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                      style={styles.moreImagesGradient}
                    >
                      <Text style={styles.moreImagesText}>
                        +{event.images.length - 3} más
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          )}

          {event.instructions && event.instructions.length > 0 && (
            <View style={styles.instructionsSection}>
              <Text style={styles.sectionTitle}>
                Indicaciones importantes
              </Text>
              <View style={styles.instructionsList}>
                {event.instructions.map((instruction: string, index: number) => (
                  <View key={index} style={styles.instructionItem}>
                    <MaterialIcons name="check-circle" size={18} color={EventuColors.magenta} />
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
            </>
          )}
        </ScrollView>
      </View>

        {}
      <View 
        style={styles.buyTicketContainer}
        onStartShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}>
        <TouchableOpacity
          style={styles.buyTicketButton}
          activeOpacity={0.8}
          onPress={handleBuy}
          onPressIn={() => console.log('onPressIn disparado')}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <Text style={styles.buyTicketText}>Comprar Boleto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  imageContainer: {
    position: 'relative',
    height: 350,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e5e5',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopControls: {
    position: 'absolute',
    top: 44,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroControlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroControlButtonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EventuColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  summaryWrapper: {
    marginHorizontal: 20,
    marginTop: -46,
  },
  summaryCard: {
    borderRadius: Radius['3xl'],
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
    backgroundColor: EventuColors.white,
    ...Shadows.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  summaryTitleBlock: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: EventuColors.black,
  },
  summarySubtitle: {
    fontSize: 13,
    color: EventuColors.mediumGray,
  },
  summaryPriceBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  summaryPriceLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: EventuColors.mediumGray,
  },
  summaryPriceValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(164, 46, 255, 0.08)',
  },
  summaryMetaText: {
    fontSize: 13,
    fontWeight: '600',
    color: EventuColors.black,
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: Radius['3xl'],
    padding: 24,
    paddingBottom: 100,
    gap: 24,
    backgroundColor: EventuColors.white,
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    ...Shadows.md,
  },
  eventDetailsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: EventuColors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: EventuColors.mediumGray,
  },
  showMore: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fullscreenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: EventuColors.violet + '15',
  },
  fullscreenText: {
    fontSize: 12,
    fontWeight: '600',
    color: EventuColors.violet,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.violet,
  },
  videoSection: {
    marginBottom: 24,
  },
  videoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: 200,
  },
  gallerySection: {
    marginBottom: 24,
  },
  galleryScroll: {
    marginTop: 12,
  },
  galleryImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  moreImagesButton: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.white,
  },
  instructionsSection: {
    gap: 12,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: EventuColors.mediumGray,
  },
  buyTicketContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: 'transparent',
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 1000 : 0,
  },
  buyTicketButton: {
    paddingVertical: 18,
    borderRadius: Radius.xl,
    alignItems: 'center',
    backgroundColor: EventuColors.magenta,
    ...Shadows.lg,
  },
  buyTicketText: {
    color: EventuColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  skeletonContainer: {
    padding: 0,
  },
  skeletonContent: {
    padding: 20,
  },
});
