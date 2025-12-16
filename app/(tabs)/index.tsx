import { AnimatedCard } from '@/components/animated-card';
import { ErrorState, handleApiError } from '@/components/error-handler';
import { FadeInView } from '@/components/fade-in-view';
import { OptimizedImage } from '@/components/optimized-image';
import { PressableCard } from '@/components/pressable-card';
import { SkeletonEventCard, SkeletonLoader } from '@/components/skeleton-loader';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { Event } from '@/constants/types';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocation } from '@/hooks/useLocation';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { mockTickets } from '@/services/mockTickets';
import { mockEvents } from '@/services/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, isAuthenticated } = useAuth();
  const { location: currentLocation, loading: locationLoading } = useLocation();
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNotifications] = useState(false);

  // Obtener eventos de los tickets comprados
  const purchasedEvents = useMemo(() => {
    if (!isAuthenticated) return [];

    // Obtener eventIds únicos de los tickets comprados
    const eventIds = [...new Set(mockTickets.map(ticket => ticket.eventId))];
    
    // Filtrar eventos que coincidan con los eventIds de los tickets
    const events = mockEvents
      .filter(event => eventIds.includes(event.id))
      .map(event => ({
        id: event.id,
        title: event.name,
        description: event.description || event.subtitle || '',
        date: event.date,
        time: event.time,
        venue: event.location,
        location: event.location,
        price: event.price,
        category: event.category,
        imageUrl: event.images && event.images.length > 0 ? event.images[0] : '',
        images: event.images || [],
        videoUrl: event.videoUrl,
        promoter: event.promoter,
        instructions: event.instructions || [],
        availableTickets: event.availableTickets || 0,
        soldTickets: event.soldTickets || 0,
        status: (event.status === 'draft' || event.status === 'cancelled' || event.status === 'published' 
          ? (event.status as 'draft' | 'published' | 'cancelled')
          : 'published') as 'draft' | 'published' | 'cancelled',
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      })) as Event[];

    return events;
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(false);
  }, []); 

  const handleOpenEventuWebsite = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://eventu.co');
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  };


  const renderEventCard = (event: Event, index = 0) => {
    const eventDate = new Date(event.date);
    const day = eventDate.getDate();
    const month = eventDate.toLocaleDateString('es-CO', { month: 'short' });
    
    return (
      <AnimatedCard key={event.id} index={index} delay={index * 50}>
        <PressableCard
          style={styles.eventCard}
          onPress={() => router.push(`/event/${event.id}`)}
          hapticFeedback={true}
        >
          <View style={styles.eventImageContainer}>
            <OptimizedImage
              source={event.imageUrl || 'https://example.com/image.jpg'}
              style={styles.eventImage}
              contentFit="cover"
              priority="normal"
              cachePolicy="memory-disk"
              transition={200}
            />
            <View style={styles.imageOverlay} />
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeDay}>{day}</Text>
              <Text style={styles.dateBadgeMonth}>{month}</Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{event.category}</Text>
            </View>
          </View>
          
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            
            <View style={styles.eventMeta}>
              <View style={styles.eventMetaItem}>
                <MaterialIcons name="place" size={16} color={EventuColors.magenta} />
                <Text style={styles.eventMetaText} numberOfLines={1}>
                  {event.venue}
                </Text>
              </View>
              <View style={styles.eventMetaItem}>
                <MaterialIcons name="schedule" size={16} color={EventuColors.violet} />
                <Text style={styles.eventMetaText}>{event.time}</Text>
              </View>
            </View>
            
            <View style={styles.eventFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Desde</Text>
                <Text style={styles.eventPrice}>${event.price.toLocaleString('es-CO')}</Text>
              </View>
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>Ver detalles</Text>
                <MaterialIcons name="arrow-forward" size={18} color={EventuColors.magenta} />
              </View>
            </View>
          </View>
        </PressableCard>
      </AnimatedCard>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.backgroundGradient, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { paddingTop: safeAreaPaddingTop + 16 }]}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <View style={[
                styles.notificationIconContainer,
                hasNotifications && styles.notificationIconContainerFilled
              ]}>
                <MaterialIcons 
                  name={hasNotifications ? "notifications" : "notifications-none"} 
                  size={24} 
                  color={hasNotifications ? EventuColors.white : EventuColors.violet} 
                />
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Mis Eventos</Text>
              {currentLocation && !locationLoading && (
                <View style={styles.headerLocationContainer}>
                  <MaterialIcons name="location-on" size={16} color={EventuColors.violet} />
                  <Text style={styles.headerLocationText} numberOfLines={1}>
                    {currentLocation.fullAddress}
                  </Text>
                </View>
              )}
              {locationLoading && (
                <View style={styles.headerLocationContainer}>
                  <ActivityIndicator size="small" color={EventuColors.violet} />
                  <Text style={styles.headerLocationText}>Obteniendo ubicación...</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              {user?.profileImage ? (
                <Image 
                  source={{ uri: user.profileImage }} 
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileIcon}>
                  <MaterialIcons 
                    name="account-circle" 
                    size={32} 
                    color={EventuColors.violet} 
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Mensaje de bienvenida */}
          {isAuthenticated && (
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                ¡Hola, {user?.name || 'Usuario'}! 👋
              </Text>
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <View style={styles.skeletonContainer}>
                <View style={styles.skeletonSection}>
                  <SkeletonLoader variant="text" width="40%" height={20} />
                  <View style={styles.skeletonGrid}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonEventCard key={i} style={{ marginBottom: 16 }} />
                    ))}
                  </View>
                </View>
              </View>
            ) : error ? (
              <ErrorState
                error={handleApiError({ message: error })}
                onRetry={() => setError(null)}
                title="Error al cargar eventos"
                message={error}
              />
            ) : !isAuthenticated ? (
              <FadeInView delay={50}>
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="event" size={64} color={colors.secondaryText} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>Inicia sesión para ver tus eventos</Text>
                  <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                    Los eventos para los cuales tienes boletos comprados aparecerán aquí
                  </Text>
                  <PressableCard
                    style={[styles.actionButton, { backgroundColor: EventuColors.magenta }]}
                    onPress={() => router.push('/login')}
                  >
                    <Text style={styles.actionButtonText}>Iniciar Sesión</Text>
                  </PressableCard>
                </View>
              </FadeInView>
            ) : purchasedEvents.length === 0 ? (
              <FadeInView delay={100}>
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="event-busy" size={64} color={colors.secondaryText} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>No tienes eventos aún</Text>
                  <Text style={[styles.emptySubtext, { color: colors.secondaryText }]}>
                    Compra tus entradas en Eventu.co y aparecerán aquí
                  </Text>
                </View>
              </FadeInView>
            ) : (
              <FadeInView delay={100}>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Eventos con Boletos Comprados
                    </Text>
                    <Text style={[styles.eventCount, { color: colors.secondaryText }]}>
                      {purchasedEvents.length} {purchasedEvents.length === 1 ? 'evento' : 'eventos'}
                    </Text>
                  </View>
                  <View style={styles.eventsGrid}>
                    {purchasedEvents.map((event, index) => renderEventCard(event, index))}
                  </View>
                </View>
              </FadeInView>
            )}
          </ScrollView>

          {}
          <View style={styles.floatingButtonContainer}>
            <PressableCard
              style={styles.floatingButton}
              onPress={handleOpenEventuWebsite}
              hapticFeedback={true}
            >
              <LinearGradient
                colors={[EventuColors.magenta, EventuColors.hotPink]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.floatingButtonGradient}
              >
                <MaterialIcons name="shopping-cart" size={24} color={EventuColors.white} />
                <Text style={styles.floatingButtonText}>Compra tus entradas aquí</Text>
              </LinearGradient>
            </PressableCard>
          </View>

        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: EventuColors.black,
    marginBottom: 4,
  },
  headerLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(164, 46, 255, 0.08)',
    borderRadius: 12,
  },
  headerLocationText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: EventuColors.violet,
    maxWidth: 180,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: EventuColors.black,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: EventuColors.violet,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconContainerFilled: {
    backgroundColor: EventuColors.magenta,
    borderWidth: 0,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(164, 46, 255, 0.08)',
    borderRadius: 20,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: EventuColors.violet,
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: EventuColors.white,
    ...Shadows.sm,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 220 : 200, // Espacio suficiente para el botón flotante y la barra de navegación
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    gap: 12,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    borderRadius: Radius.xl,
    marginTop: 4,
    maxHeight: 300,
    borderWidth: 1,
    ...Shadows.lg,
    overflow: 'hidden',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearHistoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  },
  noSuggestions: {
    padding: 20,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  filterButton: {
    padding: 4,
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.default,
  },
  activeFilterText: {
    color: EventuColors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  upcomingSection: {
    marginBottom: 20,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: EventuColors.black,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: EventuColors.violet,
    opacity: 0.8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: EventuColors.white,
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    ...Shadows.sm,
  },
  categoryChipActive: {
    backgroundColor: EventuColors.magenta,
    borderColor: EventuColors.magenta,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: EventuColors.mediumGray,
  },
  categoryChipTextActive: {
    color: EventuColors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  eventCount: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  featuredScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
  eventsGrid: {
    paddingHorizontal: 20,
    gap: 20,
  },
  eventCard: {
    width: CARD_WIDTH,
    backgroundColor: EventuColors.white,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
  },
  eventImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: EventuColors.white,
    borderRadius: Radius.lg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 50,
    ...Shadows.md,
  },
  dateBadgeDay: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: EventuColors.magenta,
    lineHeight: 22,
  },
  dateBadgeMonth: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: EventuColors.violet,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: EventuColors.magenta + '20',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: EventuColors.magenta + '40',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: EventuColors.magenta,
    textTransform: 'capitalize',
  },
  eventContent: {
    padding: 16,
    gap: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: EventuColors.black,
    lineHeight: 26,
  },
  eventMeta: {
    gap: 8,
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventMetaText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: EventuColors.darkGray,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  priceContainer: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: EventuColors.mediumGray,
    textTransform: 'uppercase',
  },
  eventPrice: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: EventuColors.magenta,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: EventuColors.magenta + '10',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: EventuColors.magenta,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  locationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  currentLocationOption: {
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  locationOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  locationOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  locationDivider: {
    height: 1,
    marginVertical: 12,
  },
  locationSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.xl,
    marginTop: 8,
  },
  retryButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  skeletonSection: {
    marginBottom: 32,
  },
  skeletonCards: {
    flexDirection: 'row',
    marginTop: 16,
  },
  skeletonGrid: {
    gap: 16,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 100, // Espacio sobre la barra de navegación (70px altura + 30px bottom en iOS = 100px, más 10px de margen)
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  floatingButton: {
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  floatingButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    marginTop: 16,
    ...Shadows.md,
  },
  actionButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
