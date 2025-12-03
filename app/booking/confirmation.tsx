import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { BookingProgress } from '@/components/booking-progress';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams();
  
  const totalAmountParam = Array.isArray(params.totalAmount) ? params.totalAmount[0] : params.totalAmount || '0';
  const totalAmount = parseFloat(totalAmountParam.replace(/[^0-9.]/g, '')) || 0;
  const eventName = (Array.isArray(params.eventName) ? params.eventName[0] : params.eventName) || 'Evento';
  
  const orderNumber = (Array.isArray(params.orderNumber) ? params.orderNumber[0] : params.orderNumber) || 
    `#EVT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  
  const purchaseDate = new Date().toLocaleDateString('es-CO', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  const ticketIds = Array.isArray(params.ticketIds) ? params.ticketIds[0] : params.ticketIds;

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  const handleViewTicket = () => {
    
    if (ticketIds) {
      const firstTicketId = ticketIds.split(',')[0];
      router.push(`/ticket/${firstTicketId}`);
    } else {
      router.push('/(tabs)/tickets');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BookingProgress currentStep="confirmation" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.iconContainer}>
          <View style={styles.successBadge}>
            <LinearGradient
              colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeGradient}
            >
              <MaterialIcons name="check" size={48} color={EventuColors.white} />
            </LinearGradient>
          </View>
          <View style={styles.successRing} />
        </View>

        {}
        <Text style={styles.title}>¡Confirmado!</Text>
        <Text style={styles.subtitle}>Tu orden se ha completado exitosamente</Text>
        <Text style={styles.description}>
          Hemos enviado los detalles de tu reserva por correo electrónico. 
          ¡Trae tu emoción y nosotros nos encargamos del resto!
        </Text>

        {}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de la Orden</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Evento</Text>
            <Text style={styles.summaryValue} numberOfLines={2}>{eventName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Número de orden</Text>
            <Text style={styles.summaryValue}>{orderNumber}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fecha de compra</Text>
            <Text style={styles.summaryValue}>{purchaseDate}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total pagado</Text>
            <Text style={styles.summaryTotal}>${totalAmount.toLocaleString('es-CO')}</Text>
          </View>
        </View>

        {}
        <View style={styles.actionsContainer}>
          <Pressable style={styles.secondaryButton} onPress={handleViewTicket}>
            <MaterialIcons name="confirmation-number" size={20} color={EventuColors.hotPink} />
            <Text style={styles.secondaryButtonText}>Ver Mis Boletos</Text>
          </Pressable>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomContainer}>
        <Pressable style={styles.homeButton} onPress={handleBackToHome}>
          <LinearGradient
            colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Volver al Inicio</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    shadowColor: EventuColors.hotPink + '66',
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: EventuColors.hotPink + '30',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: EventuColors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    ...Shadows.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 15,
    color: EventuColors.mediumGray,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.hotPink,
  },
  divider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 12,
  },
  actionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: EventuColors.white,
    borderWidth: 2,
    borderColor: EventuColors.hotPink,
    ...Shadows.sm,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.hotPink,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  homeButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66',
  },
  gradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: EventuColors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
