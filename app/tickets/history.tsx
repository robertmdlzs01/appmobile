import { AnimatedCard } from '@/components/animated-card';
import { FadeInView } from '@/components/fade-in-view';
import { PressableCard } from '@/components/pressable-card';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mockTickets } from '@/services/mockTickets';

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
  status: 'active' | 'used' | 'cancelled' | 'transferred';
}

function formatDateDisplay(dateString: string): string {
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
    return dateString;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'used':
      return EventuColors.mediumGray;
    case 'transferred':
      return EventuColors.violet;
    case 'cancelled':
      return '#FF3B30';
    default:
      return EventuColors.magenta;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'used':
      return 'Utilizada';
    case 'transferred':
      return 'Transferida';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Activa';
  }
}

export default function TicketHistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used' | 'transferred' | 'cancelled'>('all');

  // Combinar tickets activos con algunos históricos (simulado)
  const allTickets: Ticket[] = useMemo(() => {
    const activeTickets = mockTickets.map(t => ({
      id: t.id,
      eventId: t.eventId,
      eventName: t.eventName,
      date: t.date,
      dateDisplay: t.dateDisplay,
      time: t.time,
      venue: t.venue,
      location: t.location,
      seat: t.seat,
      quantity: t.quantity,
      price: t.price,
      status: t.status as 'active' | 'used' | 'cancelled',
    }));

    // Agregar algunos tickets históricos simulados
    const historicalTickets: Ticket[] = [
      {
        id: 'hist-1',
        eventId: 'hist-1',
        eventName: 'Concierto de Rock 2024',
        date: '2024-11-15',
        dateDisplay: '15 nov 2024',
        time: '20:00',
        venue: 'Coliseo El Campín',
        location: 'Bogotá',
        seat: 'VIP, Fila 1',
        quantity: 2,
        price: 150000,
        status: 'used',
      },
      {
        id: 'hist-2',
        eventId: 'hist-2',
        eventName: 'Festival de Música 2024',
        date: '2024-10-20',
        dateDisplay: '20 oct 2024',
        time: '18:00',
        venue: 'Parque Simón Bolívar',
        location: 'Bogotá',
        seat: 'General',
        quantity: 1,
        price: 80000,
        status: 'transferred',
      },
    ];

    return [...activeTickets, ...historicalTickets];
  }, []);

  const filteredTickets = useMemo(() => {
    let filtered = [...allTickets];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.eventName.toLowerCase().includes(query) ||
        ticket.location.toLowerCase().includes(query) ||
        ticket.venue?.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    // Ordenar por fecha (más recientes primero)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [allTickets, searchQuery, filterStatus]);

  const statusFilters = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'active' as const, label: 'Activas' },
    { value: 'used' as const, label: 'Utilizadas' },
    { value: 'transferred' as const, label: 'Transferidas' },
    { value: 'cancelled' as const, label: 'Canceladas' },
  ];

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialIcons name="lock" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyText}>Inicia sesión para ver tu historial</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <FadeInView delay={100}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={EventuColors.white} />
            </Pressable>
            <Text style={styles.title}>Historial de Entradas</Text>
            <View style={styles.backButton} />
          </View>
        </FadeInView>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FadeInView delay={200}>
            <View style={styles.searchSection}>
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color={EventuColors.mediumGray} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar en historial..."
                  placeholderTextColor={EventuColors.mediumGray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <MaterialIcons name="close" size={18} color={EventuColors.mediumGray} />
                  </Pressable>
                )}
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}
            >
              {statusFilters.map((filter) => (
                <PressableCard
                  key={filter.value}
                  style={[
                    styles.filterChip,
                    filterStatus === filter.value && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterStatus(filter.value)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterStatus === filter.value && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </PressableCard>
              ))}
            </ScrollView>
          </FadeInView>

          {filteredTickets.length === 0 ? (
            <FadeInView delay={300}>
              <View style={styles.emptyState}>
                <MaterialIcons name="history" size={64} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyText}>No se encontraron entradas</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || filterStatus !== 'all'
                    ? 'Intenta ajustar tus filtros'
                    : 'Aún no tienes entradas en tu historial'}
                </Text>
              </View>
            </FadeInView>
          ) : (
            <View style={styles.ticketsContainer}>
              {filteredTickets.map((ticket, index) => {
                const statusColor = getStatusColor(ticket.status);
                const statusLabel = getStatusLabel(ticket.status);

                return (
                  <AnimatedCard key={ticket.id} index={index} delay={index * 50}>
                    <PressableCard
                      style={[styles.ticketCard, { backgroundColor: EventuColors.white }]}
                      onPress={() => {
                        if (ticket.status === 'active') {
                          router.push(`/ticket/${ticket.id}`);
                        }
                      }}
                      disabled={ticket.status !== 'active'}
                    >
                      <View style={styles.ticketHeader}>
                        <View style={styles.ticketInfo}>
                          <Text style={styles.eventName}>{ticket.eventName}</Text>
                          <Text style={styles.eventDate}>
                            {ticket.dateDisplay || formatDateDisplay(ticket.date)} • {ticket.time}
                          </Text>
                          <Text style={styles.eventLocation}>
                            {ticket.venue || ticket.location} • {ticket.location}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: statusColor + '20' },
                          ]}
                        >
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ticketFooter}>
                        <View style={styles.ticketDetails}>
                          <MaterialIcons name="event-seat" size={14} color={EventuColors.mediumGray} />
                          <Text style={styles.detailText}>{ticket.seat}</Text>
                        </View>
                        <Text style={styles.quantityText}>
                          {ticket.quantity} {ticket.quantity === 1 ? 'boleto' : 'boletos'}
                        </Text>
                      </View>
                    </PressableCard>
                  </AnimatedCard>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.violet,
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
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: EventuColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
    borderRadius: Radius.xl,
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
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterChipActive: {
    backgroundColor: EventuColors.magenta,
    borderColor: EventuColors.magenta,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.white,
  },
  filterChipTextActive: {
    color: EventuColors.white,
  },
  ticketsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  ticketCard: {
    borderRadius: Radius['2xl'],
    padding: 20,
    ...Shadows.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
    gap: 6,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '800',
    color: EventuColors.black,
  },
  eventDate: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  eventLocation: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.default,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  ticketDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.black,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.white,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});

