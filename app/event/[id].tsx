import { ErrorState, handleApiError } from '@/components/error-handler';
import { OptimizedImage } from '@/components/optimized-image';
import { PressableCard } from '@/components/pressable-card';
import { SkeletonLoader } from '@/components/skeleton-loader';
import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as Sharing from 'expo-sharing';
import { useState, useMemo } from 'react';
import { Alert, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockTickets } from '@/services/mockTickets';

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

  // Encontrar el ticket correspondiente a este evento
  const ticket = useMemo(() => {
    return mockTickets.find(t => t.eventId === eventId);
  }, [eventId]);

  const handleViewTicket = () => {
    // Redirigir directamente al código QR del ticket
    if (ticket) {
      router.push(`/ticket/${ticket.id}`);
    } else {
      // Si no hay ticket, redirigir a la lista de tickets
    router.push('/(tabs)/tickets');
    }
  };

  const handleTransfer = () => {
    // Redirigir a la pantalla de transferencia
    if (ticket) {
      router.push(`/tickets/transfer?ticketId=${ticket.id}`);
      } else {
      Alert.alert('Error', 'No se encontró un ticket para este evento');
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
              <View style={styles.summaryTitleBlock}>
                <Text style={styles.summaryTitle}>
                  {event.name}
                </Text>
                <Text style={styles.summarySubtitle}>{event.subtitle}</Text>
              </View>
            
            <View style={styles.summaryMetaContainer}>
              <View style={styles.summaryMetaItem}>
                <MaterialIcons name="event" size={20} color={EventuColors.magenta} />
                <View style={styles.metaTextContainer}>
                  <Text style={styles.metaLabel}>Fecha</Text>
                  <Text style={styles.metaValue}>{event.date}</Text>
                </View>
              </View>
              
              <View style={styles.summaryMetaItem}>
                <MaterialIcons name="schedule" size={20} color={EventuColors.magenta} />
                <View style={styles.metaTextContainer}>
                  <Text style={styles.metaLabel}>Hora</Text>
                  <Text style={styles.metaValue}>{event.time}</Text>
            </View>
              </View>
              
              <View style={styles.summaryMetaItem}>
                <MaterialIcons name="place" size={20} color={EventuColors.magenta} />
                <View style={styles.metaTextContainer}>
                  <Text style={styles.metaLabel}>Ubicación</Text>
                  <Text style={styles.metaValue}>{event.location}</Text>
              </View>
              </View>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.summaryPriceLabel}>Desde</Text>
              <Text style={[styles.summaryPriceValue, { color: EventuColors.magenta }]}>
                {event.price}
              </Text>
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
      <View style={styles.buyTicketContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.buyTicketButton, styles.primaryButton]}
            activeOpacity={0.8}
            onPress={handleViewTicket}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <View style={styles.buyTicketButtonContent}>
              <MaterialIcons name="confirmation-number" size={20} color={EventuColors.white} />
              <Text style={styles.buyTicketText}>Ver Boleto</Text>
            </View>
          </TouchableOpacity>
          <PressableCard
            style={[styles.shareButton, styles.secondaryButton]}
            onPress={handleTransfer}
          >
            <MaterialIcons name="swap-horiz" size={20} color={EventuColors.magenta} />
            <Text style={[styles.shareButtonText, { color: EventuColors.magenta }]}>
              Transferir
            </Text>
          </PressableCard>
        </View>
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
    padding: 24,
    gap: 20,
    backgroundColor: EventuColors.white,
    ...Shadows.lg,
  },
  summaryTitleBlock: {
    gap: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray + '40',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: EventuColors.black,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  summarySubtitle: {
    fontSize: 15,
    color: EventuColors.mediumGray,
    lineHeight: 20,
  },
  summaryMetaContainer: {
    gap: 18,
  },
  summaryMetaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaTextContainer: {
    flex: 1,
    gap: 3,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: EventuColors.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '500',
    color: EventuColors.black,
    lineHeight: 22,
  },
  priceContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray + '40',
    alignItems: 'flex-end',
  },
  summaryPriceLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: EventuColors.mediumGray,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryPriceValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: Radius['3xl'],
    padding: 24,
    paddingBottom: 100,
    gap: 28,
    backgroundColor: EventuColors.white,
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    ...Shadows.md,
  },
  eventDetailsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: EventuColors.darkGray,
    letterSpacing: 0.1,
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
    gap: 16,
    paddingTop: 8,
  },
  instructionsList: {
    gap: 14,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 4,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: EventuColors.darkGray,
    fontWeight: '500',
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buyTicketButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  primaryButton: {
    backgroundColor: EventuColors.magenta,
  },
  secondaryButton: {
    backgroundColor: EventuColors.white,
    borderWidth: 2,
    borderColor: EventuColors.magenta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: Radius.xl,
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    flex: 1,
  },
  buyTicketButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buyTicketText: {
    color: EventuColors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  shareButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  skeletonContainer: {
    padding: 0,
  },
  skeletonContent: {
    padding: 20,
  },
});
