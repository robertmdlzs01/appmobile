import { AnimatedCard } from '@/components/animated-card';
import { ErrorState, handleApiError } from '@/components/error-handler';
import { FadeInView } from '@/components/fade-in-view';
import { OptimizedImage } from '@/components/optimized-image';
import { PressableCard } from '@/components/pressable-card';
import { SkeletonEventCard, SkeletonLoader } from '@/components/skeleton-loader';
import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { Event } from '@/constants/types';
import { useEvents } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, featuredEvents, loading, error } = useEvents();
  const { location: currentLocation, loading: locationLoading, refresh: refreshLocation } = useLocation();
  const { history, addToHistory, clearHistory, removeFromHistory } = useSearchHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Detectando ubicación...');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [hasNotifications, setHasNotifications] = useState(false); 

  useEffect(() => {
    if (currentLocation?.fullAddress) {
      setSelectedLocation(currentLocation.fullAddress);
    }
  }, [currentLocation]);


  const searchSuggestions = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return history.slice(0, 5);
    }

    const queryLower = searchQuery.toLowerCase();
    const eventSuggestions = events
      .filter((event) =>
        event.title.toLowerCase().includes(queryLower) ||
        event.venue.toLowerCase().includes(queryLower) ||
        event.location.toLowerCase().includes(queryLower)
      )
      .slice(0, 5)
      .map((event) => event.title);

    const historyMatches = history.filter((item) =>
      item.includes(queryLower)
    ).slice(0, 3);

    return [...new Set([...historyMatches, ...eventSuggestions])].slice(0, 5);
  }, [searchQuery, events, history]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (priceFilter === 'low') matchesPrice = event.price < 50;
    else if (priceFilter === 'medium') matchesPrice = event.price >= 50 && event.price < 100;
    else if (priceFilter === 'high') matchesPrice = event.price >= 100;
    
    return matchesSearch && matchesPrice;
  });

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addToHistory(searchQuery);
      setShowSearchSuggestions(false);
    }
  };

  const locations = currentLocation?.fullAddress 
    ? [currentLocation.fullAddress, 'New York, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, AUS']
    : ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, AUS'];


  const renderEventCard = (event: Event, featured = false, index = 0) => (
    <AnimatedCard key={event.id} index={index} delay={featured ? index * 100 : 0}>
      <PressableCard
        style={[styles.eventCard, featured && styles.featuredCard]}
        onPress={() => router.push(`/event/${event.id}`)}
        hapticFeedback={true}
      >
        <OptimizedImage
          source={event.imageUrl || 'https://example.com/image.jpg'}
          style={styles.eventImage}
          contentFit="cover"
          priority={featured ? 'high' : 'normal'}
          cachePolicy="memory-disk"
          transition={200}
        />
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeDay}>
            {new Date(event.date).getDate()}
          </Text>
          <Text style={styles.dateBadgeMonth}>
            {new Date(event.date).toLocaleDateString('en-US', {
              month: 'short',
            })}
          </Text>
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.95)']}
          style={styles.eventGradient}
        >
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.eventDetails}>
              <MaterialIcons name="place" size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.eventVenue} numberOfLines={1}>
                {event.venue} • {event.time}
              </Text>
            </View>
            <View style={styles.eventFooter}>
              <View style={styles.priceTag}>
                <Text style={styles.eventPrice}>
                  ${event.price.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </PressableCard>
    </AnimatedCard>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.backgroundGradient}>
          <View style={styles.header}>
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
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={() => {
                if (locationLoading) {
                  refreshLocation();
                } else {
                  setShowLocationModal(true);
                }
              }}
            >
              <MaterialIcons 
                name={locationLoading ? "my-location" : "place"} 
                size={16} 
                color={EventuColors.magenta} 
              />
              <Text style={styles.locationText}>
                {locationLoading ? 'Detectando...' : selectedLocation}
              </Text>
            </TouchableOpacity>
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

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <FadeInView delay={100}>
              <View style={styles.searchSection}>
                <View style={styles.searchWrapper}>
                  <PressableCard style={styles.searchContainer} hapticFeedback={false}>
                    <MaterialIcons name="search" size={20} color={EventuColors.mediumGray} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar todos los eventos..."
                      placeholderTextColor="rgba(0,0,0,0.5)"
                      value={searchQuery}
                      onChangeText={(text) => {
                        setSearchQuery(text);
                        setShowSearchSuggestions(text.length > 0 || history.length > 0);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                      onSubmitEditing={handleSearchSubmit}
                      returnKeyType="search"
                    />
                    {searchQuery && (
                      <TouchableOpacity 
                        onPress={() => {
                          setSearchQuery('');
                          setShowSearchSuggestions(false);
                        }}
                      >
                        <MaterialIcons name="close" size={18} color={EventuColors.mediumGray} />
                      </TouchableOpacity>
                    )}
                    {priceFilter !== 'all' && (
                      <TouchableOpacity 
                        onPress={() => {
                          setPriceFilter('all');
                          setShowFilterModal(false);
                        }}
                        style={styles.activeFilterBadge}
                      >
                        <Text style={styles.activeFilterText}>
                          {priceFilter === 'low' ? '<$50' : priceFilter === 'medium' ? '$50-$100' : '>$100'}
                        </Text>
                        <MaterialIcons name="close" size={14} color={EventuColors.white} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.filterButton}
                      onPress={() => setShowFilterModal(true)}
                    >
                      <MaterialIcons name="tune" size={20} color={EventuColors.mediumGray} />
                    </TouchableOpacity>
                  </PressableCard>

                  {}
                  {showSearchSuggestions && (searchQuery.length > 0 || history.length > 0) && (
                    <View style={styles.suggestionsContainer}>
                      {searchQuery.length === 0 && history.length > 0 && (
                        <View style={styles.suggestionsHeader}>
                          <Text style={styles.suggestionsTitle}>Búsquedas recientes</Text>
                          <TouchableOpacity onPress={clearHistory}>
                            <Text style={styles.clearHistoryText}>Limpiar</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {searchSuggestions.length > 0 ? (
                        searchSuggestions.map((suggestion, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            onPress={() => {
                              setSearchQuery(suggestion);
                              addToHistory(suggestion);
                              setShowSearchSuggestions(false);
                            }}
                          >
                            <MaterialIcons 
                              name={history.includes(suggestion.toLowerCase()) ? 'history' : 'search'} 
                              size={18} 
                              color={EventuColors.mediumGray} 
                            />
                            <Text style={styles.suggestionText}>{suggestion}</Text>
                            {history.includes(suggestion.toLowerCase()) && (
                              <TouchableOpacity
                                onPress={(e) => {
                                  e.stopPropagation();
                                  removeFromHistory(suggestion.toLowerCase());
                                }}
                              >
                                <MaterialIcons name="close" size={16} color={EventuColors.mediumGray} />
                              </TouchableOpacity>
                            )}
                          </TouchableOpacity>
                        ))
                      ) : searchQuery.length > 0 ? (
                        <View style={styles.noSuggestions}>
                          <Text style={styles.noSuggestionsText}>
                            No se encontraron sugerencias para "{searchQuery}"
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </View>
              </View>
            </FadeInView>


            {loading ? (
              <View style={styles.skeletonContainer}>
                <View style={styles.skeletonSection}>
                  <SkeletonLoader variant="text" width="40%" height={20} />
                  <View style={styles.skeletonCards}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonEventCard key={i} style={{ marginRight: 16 }} />
                    ))}
                  </View>
                </View>
                <View style={styles.skeletonSection}>
                  <SkeletonLoader variant="text" width="50%" height={20} style={{ marginBottom: 16 }} />
                  <View style={styles.skeletonGrid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonEventCard key={i} style={{ marginBottom: 16 }} />
                    ))}
                  </View>
                </View>
              </View>
            ) : error ? (
              <ErrorState
                error={handleApiError({ message: error })}
                onRetry={() => router.replace('/(tabs)')}
                title="Error al cargar eventos"
                message={error}
              />
            ) : (
              <>
                {!searchQuery && featuredEvents.length > 0 && (
                  <FadeInView delay={300}>
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Eventos destacados</Text>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredScroll}
                      >
                        {featuredEvents.map((event, index) => renderEventCard(event, true, index))}
                      </ScrollView>
                    </View>
                  </FadeInView>
                )}

                <FadeInView delay={400}>
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        {searchQuery ? 'Resultados de búsqueda' : 'Todos los eventos'}
                      </Text>
                      <Text style={styles.eventCount}>{filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}</Text>
                    </View>
                    {filteredEvents.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <MaterialIcons name="event-busy" size={64} color={EventuColors.mediumGray} />
                        <Text style={styles.emptyText}>No se encontraron eventos</Text>
                        <Text style={styles.emptySubtext}>
                          {searchQuery || priceFilter !== 'all'
                            ? 'Intenta ajustar tus filtros'
                            : 'Vuelve más tarde para nuevos eventos'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.eventsGrid}>
                        {filteredEvents.map((event, index) => renderEventCard(event, false, index))}
                      </View>
                    )}
                  </View>
                </FadeInView>
              </>
            )}
          </ScrollView>

          <Modal
            visible={showLocationModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowLocationModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Seleccionar Ubicación</Text>
                  <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                    <MaterialIcons name="close" size={24} color={EventuColors.black} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.locationOption, styles.currentLocationOption]}
                  onPress={async () => {
                    await refreshLocation();
                    if (currentLocation?.fullAddress) {
                      setSelectedLocation(currentLocation.fullAddress);
                    }
                  }}
                  disabled={locationLoading}
                >
                  <View style={styles.locationOptionLeft}>
                    <MaterialIcons 
                      name={locationLoading ? "hourglass-empty" : "my-location"} 
                      size={20} 
                      color={locationLoading ? EventuColors.mediumGray : EventuColors.magenta} 
                    />
                    <Text style={styles.locationOptionText}>
                      {locationLoading ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
                    </Text>
                  </View>
                  {locationLoading && (
                    <ActivityIndicator size="small" color={EventuColors.magenta} />
                  )}
                </TouchableOpacity>
                <View style={styles.locationDivider} />
                <Text style={styles.locationSectionTitle}>Otras ubicaciones</Text>
                {locations.map((location) => (
                  <TouchableOpacity
                    key={location}
                    style={styles.locationOption}
                    onPress={() => {
                      setSelectedLocation(location);
                      setShowLocationModal(false);
                    }}
                  >
                    <Text style={styles.locationOptionText}>{location}</Text>
                    {selectedLocation === location && (
                      <MaterialIcons name="check" size={20} color={EventuColors.violet} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          <Modal
            visible={showFilterModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFilterModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filtrar por precio</Text>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <MaterialIcons name="close" size={24} color={EventuColors.black} />
                  </TouchableOpacity>
                </View>
                {[{ key: 'all', label: 'Todos los precios' }, { key: 'low', label: 'Menos de $50' }, { key: 'medium', label: '$50 - $100' }, { key: 'high', label: 'Más de $100' }].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.filterOption}
                    onPress={() => {
                      setPriceFilter(option.key as any);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>{option.label}</Text>
                    {priceFilter === option.key && (
                      <MaterialIcons name="check" size={20} color={EventuColors.violet} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
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
    paddingBottom: 20,
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
    backgroundColor: EventuColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    gap: 12,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: EventuColors.black,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: EventuColors.white,
    borderRadius: Radius.xl,
    marginTop: 4,
    maxHeight: 300,
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
    borderBottomColor: EventuColors.lightGray,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.mediumGray,
  },
  clearHistoryText: {
    fontSize: 14,
    color: EventuColors.magenta,
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray + '50',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: EventuColors.black,
  },
  noSuggestions: {
    padding: 20,
    alignItems: 'center',
  },
  noSuggestionsText: {
    fontSize: 14,
    color: EventuColors.mediumGray,
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
    color: EventuColors.black,
  },
  eventCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: EventuColors.mediumGray,
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
    height: 340,
    borderRadius: Radius['3xl'],
    overflow: 'hidden',
    backgroundColor: EventuColors.black,
    ...Shadows.lg,
  },
  featuredCard: {
    width: width * 0.8,
    height: 340,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  dateBadgeDay: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: EventuColors.white,
    lineHeight: 24,
  },
  dateBadgeMonth: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: EventuColors.white,
    textTransform: 'uppercase',
  },
  eventGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  eventInfo: {
    gap: 10,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: EventuColors.white,
    lineHeight: 28,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventVenue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: EventuColors.white,
    opacity: 0.8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  priceTag: {
    backgroundColor: EventuColors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: EventuColors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: EventuColors.white,
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
    color: EventuColors.black,
  },
  locationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray,
  },
  currentLocationOption: {
    backgroundColor: 'rgba(164, 46, 255, 0.05)',
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
    color: EventuColors.black,
  },
  locationDivider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 12,
  },
  locationSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: EventuColors.mediumGray,
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
    borderBottomColor: EventuColors.lightGray,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: EventuColors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    color: EventuColors.mediumGray,
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
    color: EventuColors.black,
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
    color: EventuColors.black,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptySubtext: {
    color: EventuColors.mediumGray,
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
});
