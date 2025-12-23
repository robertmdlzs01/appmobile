import { AnimatedCard } from '@/components/animated-card';
import { FadeInView } from '@/components/fade-in-view';
import { PressableCard } from '@/components/pressable-card';
import { SkeletonLoader, SkeletonCard } from '@/components/skeleton-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors, EventuGradients } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useMemo, useEffect } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View, Modal, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  dateDisplay?: string;
  time: string;
  venue?: string;
  location: string;
  seat: string;
  quantity?: number;
  price: number;
  status: 'active' | 'used' | 'cancelled';
}
import { useAuth } from '@/contexts/AuthContext';
import { mockTickets } from '@/services/mockTickets';
import { mockEvents } from '@/services/mockData';

function parseEventDate(eventDate: string): Date | null {
  try {
    let eventDateObj: Date;
    
    if (eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = eventDate.split('-').map(Number);
      eventDateObj = new Date(year, month - 1, day); 
    } else {
      eventDateObj = new Date(eventDate);
    }
    
    return eventDateObj;
  } catch (error) {
    console.error('Error parsing event date:', error);
    return null;
  }
}

function isEventPast(eventDate: string): boolean {
  const eventDateObj = parseEventDate(eventDate);
  if (!eventDateObj) return false;
  
  const today = new Date();
  
  const eventDateOnly = new Date(
    eventDateObj.getFullYear(), 
    eventDateObj.getMonth(), 
    eventDateObj.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(), 
    today.getMonth(), 
    today.getDate()
  );
  
  return eventDateOnly.getTime() < todayOnly.getTime();
}

function isEventDay(eventDate: string): boolean {
  const eventDateObj = parseEventDate(eventDate);
  if (!eventDateObj) return false;
  
  const today = new Date();
  
  const eventDateOnly = new Date(
    eventDateObj.getFullYear(), 
    eventDateObj.getMonth(), 
    eventDateObj.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(), 
    today.getMonth(), 
    today.getDate()
  );
  
  const isSameDay = eventDateOnly.getTime() === todayOnly.getTime();
  
  return isSameDay;
}

function formatEventDate(dateString: string): string {
  try {
    let date: Date;
    
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'available';
type FilterOption = 'all' | 'available' | 'upcoming';

type TicketDisplay = {
  id: string;
  eventName: string;
  date: string;
  dateDisplay: string;
  time: string;
  venue: string;
  seat: string;
  location: string;
  quantity: number;
  status: 'activo' | 'usado' | 'cancelado';
  eventId?: string;
  imageUrl?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TicketsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketDisplay[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatDateDisplay = (dateString: string): string => {
    try {
      let date: Date;
      
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const mapStatus = (status: string): 'activo' | 'usado' | 'cancelado' => {
    switch (status) {
      case 'active':
        return 'activo';
      case 'used':
        return 'usado';
      case 'cancelled':
        return 'cancelado';
      default:
        return 'activo';
    }
  };

  useEffect(() => {
    const loadTickets = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setTickets([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const apiTickets: Ticket[] = mockTickets.map(ticket => ({
          id: ticket.id,
          eventId: ticket.eventId,
          eventName: ticket.eventName,
          date: ticket.date,
          dateDisplay: ticket.dateDisplay,
          time: ticket.time,
          venue: ticket.venue,
          location: ticket.location,
          seat: ticket.seat,
          quantity: ticket.quantity,
          price: ticket.price,
          status: ticket.status,
        }));
        
        const formattedTickets: TicketDisplay[] = apiTickets.map((ticket: Ticket) => {
          const event = mockEvents.find(e => e.id === ticket.eventId);
          const imageUrl = event?.images && event.images.length > 0 ? event.images[0] : undefined;
          
          return {
          id: ticket.id,
            eventId: ticket.eventId,
          eventName: ticket.eventName,
          date: ticket.date,
          dateDisplay: ticket.dateDisplay || formatDateDisplay(ticket.date),
          time: ticket.time,
          venue: ticket.venue || ticket.location || 'No especificado',
          seat: ticket.seat,
          location: ticket.location,
          quantity: ticket.quantity || 1,
          status: mapStatus(ticket.status),
            imageUrl,
          };
        });

        const futureTickets = formattedTickets.filter((ticket) => {
          const isPast = isEventPast(ticket.date);
          return !isPast;
        });

        setTickets(futureTickets);
      } catch (err: any) {
        
        if (__DEV__ && !err.isNetworkError) {
          console.warn('Error loading tickets:', err.message || err);
        }
        
        if (err.isNetworkError || err.code === 'NETWORK_ERROR') {
          setError('No se pudo cargar los tickets. Verifica tu conexión.');
        } else {
          setError(err.message || 'Error al cargar tickets');
        }
        
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [isAuthenticated]);

  const filteredAndSortedTickets = useMemo(() => {
    
    let result = [...tickets];

    if (searchQuery.trim()) {
      result = result.filter((ticket) =>
        ticket.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterBy === 'available') {
      result = result.filter((ticket) => isEventDay(ticket.date));
    } else if (filterBy === 'upcoming') {
      result = result.filter((ticket) => !isEventDay(ticket.date));
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'name-asc':
          return a.eventName.localeCompare(b.eventName);
        case 'name-desc':
          return b.eventName.localeCompare(a.eventName);
        case 'available':
          const aAvailable = isEventDay(a.date);
          const bAvailable = isEventDay(b.date);
          if (aAvailable === bAvailable) return 0;
          return aAvailable ? -1 : 1;
        default:
          return 0;
      }
    });

    return result;
  }, [tickets, searchQuery, filterBy, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'date-asc', label: 'Fecha (más cercano)' },
    { value: 'date-desc', label: 'Fecha (más lejano)' },
    { value: 'name-asc', label: 'Nombre (A-Z)' },
    { value: 'name-desc', label: 'Nombre (Z-A)' },
    { value: 'available', label: 'Disponibles primero' },
  ];

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'available', label: 'Disponibles hoy' },
    { value: 'upcoming', label: 'Próximos' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FadeInView delay={50}>
            <View style={[styles.header, { paddingTop: safeAreaPaddingTop + 16 }]}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.title}>
                    Mis Entradas
                  </Text>
                  <Text style={styles.subtitle}>
                    {filteredAndSortedTickets.length} {filteredAndSortedTickets.length === 1 ? 'entrada' : 'entradas'} {filterBy === 'all' ? 'disponible' : filterBy === 'available' ? 'disponible hoy' : 'próxima'}{filteredAndSortedTickets.length === 1 ? '' : 's'}
                  </Text>
                </View>
                <View style={styles.headerActions}>
                  <PressableCard
                    style={styles.headerButton}
                    onPress={() => router.push('/tickets/history')}
                    hapticFeedback={true}
                  >
                    <MaterialIcons name="history" size={20} color={EventuColors.magenta} />
                  </PressableCard>
                  <PressableCard
                    style={styles.filterButton}
                    onPress={() => setShowFilters(true)}
                    hapticFeedback={true}
                  >
                    <MaterialIcons name="tune" size={20} color={EventuColors.magenta} />
                  </PressableCard>
                </View>
              </View>
              {searchQuery || filterBy !== 'all' || sortBy !== 'date-asc' ? (
                <View style={styles.activeFilters}>
                  {searchQuery && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>{searchQuery}</Text>
                      <Pressable onPress={() => setSearchQuery('')}>
                        <MaterialIcons name="close" size={14} color={EventuColors.white} />
                      </Pressable>
                    </View>
                  )}
                  {filterBy !== 'all' && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>
                        {filterOptions.find((f) => f.value === filterBy)?.label}
                      </Text>
                      <Pressable onPress={() => setFilterBy('all')}>
                        <MaterialIcons name="close" size={14} color={EventuColors.white} />
                      </Pressable>
                    </View>
                  )}
                  {sortBy !== 'date-asc' && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>
                        {sortOptions.find((s) => s.value === sortBy)?.label}
                      </Text>
                      <Pressable onPress={() => setSortBy('date-asc')}>
                        <MaterialIcons name="close" size={14} color={EventuColors.white} />
                      </Pressable>
                    </View>
                  )}
                  <Pressable
                    style={styles.clearAllButton}
                    onPress={() => {
                      setSearchQuery('');
                      setFilterBy('all');
                      setSortBy('date-asc');
                    }}
                  >
                    <Text style={styles.clearAllText}>Limpiar todo</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </FadeInView>

          {loading ? (
            <View style={styles.skeletonContainer}>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} style={{ marginBottom: 20 }} />
              ))}
            </View>
          ) : error && tickets.length === 0 ? (
            <FadeInView delay={100}>
              <View style={styles.emptyState}>
                <MaterialIcons name="error-outline" size={64} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>
                  Error al cargar tickets
                </Text>
                <Text style={styles.emptySubtext}>
                  {error}
                </Text>
                <PressableCard
                  style={styles.exploreButton}
                  onPress={() => {
                    setError(null);
                    
                    const loadTickets = async () => {
                      if (!isAuthenticated) return;
                      try {
                        setLoading(true);
                        const apiTickets: Ticket[] = mockTickets.map(ticket => ({
                          id: ticket.id,
                          eventId: ticket.eventId,
                          eventName: ticket.eventName,
                          date: ticket.date,
                          dateDisplay: ticket.dateDisplay,
                          time: ticket.time,
                          venue: ticket.venue,
                          location: ticket.location,
                          seat: ticket.seat,
                          quantity: ticket.quantity,
                          price: ticket.price,
                          status: ticket.status,
                        }));
                        const formattedTickets: TicketDisplay[] = apiTickets.map((ticket: Ticket) => {
                          const event = mockEvents.find(e => e.id === ticket.eventId);
                          const imageUrl = event?.images && event.images.length > 0 ? event.images[0] : undefined;
                          
                          return {
                          id: ticket.id,
                            eventId: ticket.eventId,
                          eventName: ticket.eventName,
                          date: ticket.date,
                          dateDisplay: ticket.dateDisplay || formatDateDisplay(ticket.date),
                          time: ticket.time,
                          venue: ticket.venue || ticket.location || 'No especificado',
                          seat: ticket.seat,
                          location: ticket.location,
                          quantity: ticket.quantity || 1,
                          status: mapStatus(ticket.status),
                            imageUrl,
                          };
                        });
                        const futureTickets = formattedTickets.filter((ticket) => !isEventPast(ticket.date));
                        setTickets(futureTickets);
                      } catch (err: any) {
                        setError(err.message || 'Error al cargar tickets');
                      } finally {
                        setLoading(false);
                      }
                    };
                    loadTickets();
                  }}
                >
                  <Text style={styles.exploreButtonText}>Reintentar</Text>
                </PressableCard>
              </View>
            </FadeInView>
          ) : tickets.length === 0 ? (
            <FadeInView delay={100}>
              <View style={styles.emptyState}>
                <MaterialIcons name="confirmation-number" size={64} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>
                  No tienes entradas aún
                </Text>
                <Text style={styles.emptySubtext}>
                  Si ya compraste en nuestros canales autorizados, confirma tus datos para ver tus entradas al instante
                </Text>
                <PressableCard
                  style={styles.exploreButton}
                  onPress={() => router.push('/(tabs)')}
                >
                  <Text style={styles.exploreButtonText}>Explorar Eventos</Text>
                </PressableCard>
              </View>
            </FadeInView>
          ) : (
            <View style={styles.ticketsContainer}>
              {filteredAndSortedTickets.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialIcons name="search-off" size={64} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>
                    No se encontraron tickets
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Intenta ajustar tus filtros o búsqueda
                  </Text>
                </View>
              ) : (
                filteredAndSortedTickets.map((ticket, index) => {
                const isAvailable = isEventDay(ticket.date);
                const defaultImageUri = 'https://via.placeholder.com/400x300?text=Evento';
                const imageUri = ticket.imageUrl || defaultImageUri;
                
                return (
                  <AnimatedCard key={ticket.id} index={index} delay={index * 50}>
                    <PressableCard
                      style={styles.ticketCard}
                      onPress={() => {
                        if (isAvailable) {
                          router.push(`/ticket/${ticket.id}`);
                        }
                      }}
                      disabled={!isAvailable}
                      hapticFeedback={true}
                    >
                      <View style={styles.ticketImageContainer}>
                        <Image 
                          source={{ uri: imageUri }} 
                          style={styles.ticketImage}
                          resizeMode="cover"
                        />
                        <LinearGradient
                          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                          style={styles.ticketImageOverlay}
                        />
                        
                        {/* Status Badge - Top Right */}
                        {isAvailable && (
                          <View style={styles.confirmedBadge}>
                            <MaterialIcons name="check-circle" size={12} color={EventuColors.white} />
                            <Text style={styles.confirmedBadgeText}>Confirmado</Text>
                          </View>
                        )}

                        {/* Ticket Count Badge - Top Right */}
                        <View style={styles.ticketCountBadge}>
                          <MaterialIcons name="confirmation-number" size={14} color={EventuColors.white} />
                          <Text style={styles.ticketCountText}>{ticket.quantity}</Text>
                        </View>

                        {/* Event Info Overlay */}
                        <View style={styles.ticketImageContent}>
                          <Text style={styles.eventNameImage} numberOfLines={2}>
                            {ticket.eventName}
                          </Text>
                          <View style={styles.eventMetaRow}>
                            <View style={styles.eventMetaItem}>
                              <MaterialIcons name="event" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.eventMetaText}>{ticket.dateDisplay}</Text>
                            </View>
                            <View style={styles.eventMetaItem}>
                              <MaterialIcons name="place" size={14} color="rgba(255,255,255,0.9)" />
                              <Text style={styles.eventMetaText} numberOfLines={1}>{ticket.location}</Text>
                            </View>
                            </View>
                        </View>
                      </View>

                      {/* Quick Actions */}
                      <View style={styles.ticketActions}>
                        <PressableCard
                          style={[
                            styles.primaryActionButton,
                            !isAvailable && styles.disabledActionButton,
                          ]}
                          disabled={!isAvailable}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/ticket/${ticket.id}`);
                          }}
                        >
                          <MaterialIcons 
                            name="qr-code-2" 
                            size={18} 
                            color={isAvailable ? EventuColors.white : EventuColors.mediumGray} 
                          />
                          <Text style={[
                            styles.primaryActionText,
                            !isAvailable && styles.disabledActionText,
                          ]}>
                            {isAvailable ? 'Mostrar QR' : 'No disponible'}
                          </Text>
                        </PressableCard>
                        <PressableCard
                          style={styles.secondaryActionButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/tickets/transfer?ticketId=${ticket.id}`);
                          }}
                        >
                          <Text style={styles.secondaryActionText}>Transferir</Text>
                        </PressableCard>
                      </View>
                    </PressableCard>
                  </AnimatedCard>
                );
              }))}
            </View>
          )}
        </ScrollView>

        {}
        <Modal
          visible={showFilters}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtros y Ordenamiento</Text>
                <Pressable onPress={() => setShowFilters(false)}>
                  <MaterialIcons name="close" size={24} color={EventuColors.black} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Buscar</Text>
                  <View style={styles.searchInputContainer}>
                    <MaterialIcons name="search" size={20} color={EventuColors.mediumGray} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Buscar por evento, lugar..."
                      placeholderTextColor={EventuColors.mediumGray}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                    />
                    {searchQuery && (
                      <Pressable onPress={() => setSearchQuery('')}>
                        <MaterialIcons name="close" size={18} color={EventuColors.mediumGray} />
                      </Pressable>
                    )}
                  </View>
                </View>

                {}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Filtrar por</Text>
                  {filterOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        filterBy === option.value && styles.filterOptionActive,
                      ]}
                      onPress={() => setFilterBy(option.value)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          filterBy === option.value && styles.filterOptionTextActive,
                        ]}>
                        {option.label}
                      </Text>
                      {filterBy === option.value && (
                        <MaterialIcons name="check" size={20} color={EventuColors.magenta} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Ordenar por</Text>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        sortBy === option.value && styles.filterOptionActive,
                      ]}
                      onPress={() => setSortBy(option.value)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          sortBy === option.value && styles.filterOptionTextActive,
                        ]}>
                        {option.label}
                      </Text>
                      {sortBy === option.value && (
                        <MaterialIcons name="check" size={20} color={EventuColors.magenta} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <PressableCard
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                </PressableCard>
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: EventuColors.black,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: EventuColors.mediumGray,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    marginTop: 24,
    marginBottom: 8,
    color: EventuColors.black,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  emptySubtext: {
    textAlign: 'center',
    color: EventuColors.mediumGray,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    marginTop: 8,
  },
  exploreButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  ticketsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 20,
  },
  ticketCard: {
    borderRadius: Radius['2xl'],
    backgroundColor: EventuColors.white,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadows.md,
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 4,
  },
  ticketImageContainer: {
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  ticketImage: {
    width: '100%',
    height: '100%',
  },
  ticketImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ticketImageContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  eventNameImage: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: EventuColors.white,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventMetaRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  confirmedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  confirmedBadgeText: {
    color: EventuColors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  ticketCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  ticketCountText: {
    color: EventuColors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  ticketActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: EventuColors.magenta,
  },
  disabledActionButton: {
    backgroundColor: EventuColors.lightGray,
  },
  primaryActionText: {
    color: EventuColors.white,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  disabledActionText: {
    color: EventuColors.mediumGray,
  },
  secondaryActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: Radius.lg,
    backgroundColor: 'transparent',
  },
  secondaryActionText: {
    color: EventuColors.magenta,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EventuColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: EventuColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  filterChipText: {
    color: EventuColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    color: EventuColors.magenta,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: EventuColors.white,
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: EventuColors.lightGray,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: EventuColors.black,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: EventuColors.lightGray + '30',
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: EventuColors.mediumGray,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    marginBottom: 8,
    backgroundColor: EventuColors.lightGray + '20',
  },
  filterOptionActive: {
    backgroundColor: EventuColors.magenta + '15',
  },
  filterOptionText: {
    fontSize: 15,
    color: EventuColors.black,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: EventuColors.magenta,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  applyButton: {
    backgroundColor: EventuColors.magenta,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
  },
  applyButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
