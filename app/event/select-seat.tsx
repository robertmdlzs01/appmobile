import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export default function SelectSeatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { eventId } = useLocalSearchParams();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const eventsData: Record<string, any> = {
    '1': {
      id: '1',
      name: 'SANTALAND 2025',
      basePrice: 85000,
      ticketOptions: [
        {
          id: 'general',
          name: 'General',
          price: 85000,
          availability: 85,
          color: EventuColors.magenta,
          description: 'Entrada general al evento',
        },
        {
          id: 'vip',
          name: 'VIP',
          price: 120000,
          availability: 65,
          color: EventuColors.hotPink,
          description: 'Zona VIP con mejores asientos',
        },
      ],
    },
    '2': {
      id: '2',
      name: 'FESTIVAL NACIONAL DE COMPOSITORES 2025',
      basePrice: 120000,
      ticketOptions: [
        {
          id: 'general',
          name: 'General',
          price: 120000,
          availability: 75,
          color: EventuColors.magenta,
          description: 'Entrada general al festival',
        },
        {
          id: 'vip',
          name: 'VIP',
          price: 180000,
          availability: 55,
          color: EventuColors.hotPink,
          description: 'Zona VIP con acceso preferencial',
        },
      ],
    },
    '3': {
      id: '3',
      name: 'QUIÉN SE LLEVÓ LA NAVIDAD?',
      basePrice: 75000,
      ticketOptions: [
        {
          id: 'general',
          name: 'General',
          price: 75000,
          availability: 80,
          color: EventuColors.magenta,
          description: 'Entrada general al show',
        },
        {
          id: 'vip',
          name: 'VIP',
          price: 110000,
          availability: 70,
          color: EventuColors.hotPink,
          description: 'Zona VIP con mejores vistas',
        },
      ],
    },
  };

  const eventIdStr = Array.isArray(eventId) ? eventId[0] : eventId;
  const eventData = eventsData[eventIdStr || '1'] || eventsData['1'];
  const ticketOptions = eventData.ticketOptions.map((ticket: any) => ({
    ...ticket,
    price: `$${ticket.price.toLocaleString('es-CO')}`,
  }));

  const handleSelectSeat = () => {
    if (!selectedTicket) {
      alert('Por favor selecciona un tipo de entrada');
      return;
    }
    
    const selectedTicketData = ticketOptions.find((t: any) => t.id === selectedTicket);
    router.push({
      pathname: '/booking/details',
      params: {
        eventId: eventIdStr,
        ticketType: selectedTicket,
        ticketPrice: selectedTicketData?.price?.replace('$', '').replace(/\./g, '') || '',
        eventName: eventData.name || '',
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.inlineBackButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
          <ThemedText style={styles.inlineBackText}>Seleccionar evento</ThemedText>
        </Pressable>

        {}
        <ThemedView style={styles.seatDiagramContainer}>
          <ThemedView style={styles.seatDiagram}>
            {}
            <ThemedView style={styles.stageContainer}>
              <ThemedText style={styles.stageText}>ESCENARIO</ThemedText>
            </ThemedView>

            {}
            <ThemedView style={styles.seatSections}>
              {}
              {ticketOptions.map((ticket: any, index: number) => {
                const positions = [
                  styles.seatSectionTop,
                  styles.seatSectionRight,
                  styles.seatSectionBottom,
                  styles.seatSectionLeft,
                ];
                return (
                  <ThemedView
                    key={ticket.id}
                    style={[
                      styles.seatSection,
                      positions[index % positions.length],
                      { backgroundColor: ticket.color + '40' },
                    ]}>
                    <ThemedText style={styles.seatSectionLabel} numberOfLines={2}>
                      {ticket.name}
                    </ThemedText>
                  </ThemedView>
                );
              })}
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.seatDiagramSubtext}>
            Elige tu ubicación ideal y conserva tu boleto.
          </ThemedText>
        </ThemedView>

        {}
        <ThemedView style={styles.ticketsList}>
          {ticketOptions.map((ticket) => {
            const isSelected = selectedTicket === ticket.id;
            return (
              <Pressable
                key={ticket.id}
                onPress={() => setSelectedTicket(ticket.id)}
                style={({ pressed }) => [
                  styles.ticketCard,
                  {
                    backgroundColor: isSelected
                      ? ticket.color + '20'
                      : colorScheme === 'dark'
                        ? '#1f1f1f'
                        : '#ffffff',
                    borderColor: isSelected ? ticket.color : colors.cardBorder,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}>
                <ThemedView style={styles.ticketCardContent}>
                  <ThemedView style={styles.ticketCardLeft}>
                    <ThemedView
                      style={[
                        styles.ticketColorIndicator,
                        { backgroundColor: ticket.color },
                      ]}
                    />
                    <ThemedView style={styles.ticketInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.ticketName}>
                        {ticket.name}
                      </ThemedText>
                      <ThemedText style={styles.ticketDescription}>{ticket.description}</ThemedText>
                      <ThemedView style={styles.ticketMeta}>
                        <ThemedView
                          style={[
                            styles.availabilityBadge,
                            { backgroundColor: ticket.color + '20' },
                          ]}>
                          <ThemedText style={[styles.availabilityText, { color: ticket.color }]}>
                            {ticket.availability}% disponible
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                  <ThemedView style={styles.ticketCardRight}>
                    <ThemedText type="defaultSemiBold" style={[styles.ticketPrice, { color: ticket.color }]}>
                      {ticket.price}
                    </ThemedText>
                    <IconSymbol name="chevron.right" size={18} color={colors.icon} />
                  </ThemedView>
                </ThemedView>
              </Pressable>
            );
          })}
        </ThemedView>
      </ScrollView>

      {}
      <ThemedView style={styles.selectSeatContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.selectSeatButton,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={handleSelectSeat}>
          <ThemedText style={styles.selectSeatText}>Seleccionar Asiento</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inlineBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 52,
    paddingBottom: 24,
  },
  inlineBackText: {
    fontSize: 16,
    fontWeight: '600',
  },
  seatDiagramContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  seatDiagram: {
    width: width * 0.85,
    height: width * 0.85,
    position: 'relative',
    marginBottom: 20,
  },
  stageContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    width: 80,
    height: 80,
    borderRadius: Radius['3xl'],
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stageText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  seatSections: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  seatSection: {
    position: 'absolute',
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  seatSectionTop: {
    top: 0,
    left: '25%',
    width: '50%',
    height: '20%',
  },
  seatSectionRight: {
    right: 0,
    top: '25%',
    width: '20%',
    height: '50%',
  },
  seatSectionBottom: {
    bottom: 0,
    left: '25%',
    width: '50%',
    height: '20%',
  },
  seatSectionLeft: {
    left: 0,
    top: '25%',
    width: '20%',
    height: '50%',
  },
  seatSectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  seatDiagramSubtext: {
    fontSize: 13,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ticketsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
  },
  ticketCard: {
    borderRadius: Radius['2xl'],
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  ticketColorIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
  },
  ticketInfo: {
    flex: 1,
    gap: 6,
  },
  ticketName: {
    fontSize: 15,
  },
  ticketDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  ticketMeta: {
    marginTop: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ticketCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketPrice: {
    fontSize: 18,
  },
  selectSeatContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  selectSeatButton: {
    paddingVertical: 18,
    borderRadius: Radius.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectSeatText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
