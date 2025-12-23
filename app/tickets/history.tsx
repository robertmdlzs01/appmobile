import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { mockTickets } from '@/services/mockTickets';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';

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

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case 'used':
      return { bg: '#E8F5E9', text: EventuColors.success };
    case 'transferred':
      return { bg: '#E3F2FD', text: '#2196F3' };
    case 'cancelled':
      return { bg: '#FFEBEE', text: EventuColors.error };
    default:
      return { bg: '#F3E5F5', text: EventuColors.violet };
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function TicketHistoryScreen() {
  const { isAuthenticated } = useAuth();
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used' | 'transferred' | 'cancelled'>('all');

  
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
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialIcons name="lock" size={64} color={EventuColors.mediumGray} />
          <Text style={styles.emptyTitle}>Inicia sesión para ver tu historial</Text>
          <Text style={styles.emptySubtitle}>
            Los tickets que hayas comprado aparecerán aquí
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
          <View style={[styles.header, { paddingTop: safeAreaPaddingTop + 16 }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
            </Pressable>
          <Text style={styles.headerTitle}>Historial de Entradas</Text>
          <View style={styles.iconButton} />
          </View>

        {}
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

        {}
        <View style={styles.filtersContainer}>
              {statusFilters.map((filter) => (
            <Pressable
                  key={filter.value}
                  style={[
                styles.filterButton,
                filterStatus === filter.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterStatus(filter.value)}
                >
                  <Text
                    style={[
                  styles.filterText,
                  filterStatus === filter.value && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
            </Pressable>
              ))}
        </View>

        {}
        <View style={styles.ticketsSection}>
          {filteredTickets.length === 0 ? (
              <View style={styles.emptyState}>
              <MaterialIcons name="history" size={64} color={EventuColors.mediumGray} />
              <Text style={styles.emptyTitle}>No se encontraron entradas</Text>
              <Text style={styles.emptySubtitle}>
                  {searchQuery || filterStatus !== 'all'
                    ? 'Intenta ajustar tus filtros'
                    : 'Aún no tienes entradas en tu historial'}
                </Text>
              </View>
          ) : (
            filteredTickets.map((ticket) => {
              const statusColors = getStatusColor(ticket.status);
                const statusLabel = getStatusLabel(ticket.status);

                return (
                <Pressable
                  key={ticket.id}
                  style={styles.ticketCard}
                      onPress={() => {
                        if (ticket.status === 'active') {
                          router.push(`/ticket/${ticket.id}`);
                        }
                      }}
                      disabled={ticket.status !== 'active'}
                    >
                      <View style={styles.ticketHeader}>
                        <View style={styles.ticketInfo}>
                      <Text style={styles.ticketNumber}>
                        {ticket.id.toUpperCase()}
                          </Text>
                      <Text style={styles.ticketDate}>
                        {ticket.dateDisplay || formatDateDisplay(ticket.date)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                        { backgroundColor: statusColors.bg },
                          ]}
                        >
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {statusLabel}
                          </Text>
                        </View>
                      </View>

                  <View style={styles.ticketContent}>
                    <Text style={styles.eventName}>{ticket.eventName}</Text>
                        <View style={styles.ticketDetails}>
                      <View style={styles.detailRow}>
                        <MaterialIcons
                          name="place"
                          size={16}
                          color={EventuColors.mediumGray}
                        />
                        <Text style={styles.detailText}>
                          {ticket.venue || ticket.location}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialIcons
                          name="schedule"
                          size={16}
                          color={EventuColors.mediumGray}
                        />
                        <Text style={styles.detailText}>{ticket.time}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialIcons
                          name="event-seat"
                          size={16}
                          color={EventuColors.mediumGray}
                        />
                        <Text style={styles.detailText}>{ticket.seat}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.ticketFooter}>
                    <View>
                      <Text style={styles.quantityLabel}>Cantidad</Text>
                      <Text style={styles.quantityValue}>
                        {ticket.quantity} {ticket.quantity === 1 ? 'boleto' : 'boletos'}
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Total</Text>
                      <Text style={styles.priceValue}>
                        {formatCurrency(ticket.price * (ticket.quantity || 1))}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
        </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: EventuColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: EventuColors.lightGray,
    ...Shadows.sm,
    minHeight: 40,
  },
  filterButtonActive: {
    backgroundColor: EventuColors.hotPink,
    borderColor: EventuColors.hotPink,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: EventuColors.mediumGray,
    textAlign: 'center',
  },
  filterTextActive: {
    color: EventuColors.white,
  },
  ticketsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: EventuColors.black,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ticketCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadows.md,
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: EventuColors.mediumGray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketContent: {
    marginBottom: 16,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 12,
  },
  ticketDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  quantityLabel: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    marginBottom: 4,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.black,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: EventuColors.hotPink,
  },
});

