import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { BookingProgress } from '@/components/booking-progress';
import { ErrorBanner, createError, handleApiError } from '@/components/error-handler';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

export default function PaymentMethodScreen() {
  const params = useLocalSearchParams();
  const [selectedCard, setSelectedCard] = useState('visa');
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const eventsData: Record<string, any> = {
    '1': {
      id: '1',
      name: 'SANTALAND 2025',
    },
    '2': {
      id: '2',
      name: 'FESTIVAL NACIONAL DE COMPOSITORES 2025',
    },
    '3': {
      id: '3',
      name: 'QUIÉN SE LLEVÓ LA NAVIDAD?',
    },
  };

  const eventIdStr = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId || '1';
  const eventData = eventsData[eventIdStr] || eventsData['1'];
  
  const totalAmountParam = Array.isArray(params.totalAmount) ? params.totalAmount[0] : params.totalAmount || '0';
  const totalAmount = parseFloat(totalAmountParam.replace(/[^0-9.]/g, '')) || 0;
  const numberOfTickets = Array.isArray(params.tickets) ? params.tickets[0] : params.tickets || '1';
  const ticketType = Array.isArray(params.ticketType) ? params.ticketType[0] : params.ticketType || 'General';
  const eventName = (Array.isArray(params.eventName) ? params.eventName[0] : params.eventName) || eventData.name || 'Evento';

  const paymentCards = [
    {
      id: 'visa',
      type: 'VISA',
      name: 'Alex Parkinson',
      lastDigits: '8756',
      isPrimary: true,
    },
    {
      id: 'mastercard',
      type: 'Mastercard',
      name: 'Alex Parkinson',
      lastDigits: '8756',
      isPrimary: false,
    },
  ];

  const handleBuyTicket = async () => {
    if (!selectedCard) {
      setError(createError('validation', 'Por favor selecciona un método de pago'));
      return;
    }

    const purchaseId = Array.isArray(params.purchaseId) ? params.purchaseId[0] : params.purchaseId;
    
    if (!purchaseId) {
      setError(createError('validation', 'ID de compra no encontrado. Por favor vuelve a intentar.'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const paymentResult = { success: true, purchaseId, ticketIds: ['mock-ticket-1'], orderNumber: `ORD-${Date.now()}` };

      if (paymentResult.success) {
        router.push({
          pathname: '/booking/confirmation',
          params: {
            ...params,
            purchaseId: paymentResult.purchaseId,
            ticketIds: paymentResult.ticketIds.join(','),
            orderNumber: paymentResult.orderNumber,
            totalAmount: totalAmount.toString(),
            eventName: eventName,
          },
        });
      } else {
        
        router.push({
          pathname: '/booking/payment-rejected',
          params: {
            ...params,
            totalAmount: totalAmount.toString(),
            eventName: eventName,
            errorReason: 'El pago no pudo ser procesado',
          },
        });
      }
    } catch (err: any) {
      console.error('Error processing payment:', err);
      
      if (err.code === 'PAYMENT_FAILED' || err.status === 402 || err.code === 'INSUFFICIENT_FUNDS') {
        router.push({
          pathname: '/booking/payment-rejected',
          params: {
            ...params,
            totalAmount: totalAmount.toString(),
            eventName: eventName,
            errorReason: err.message || 'El pago fue rechazado',
          },
        });
      } else {
        const appError = handleApiError(err);
        setError(appError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBanner error={error} onDismiss={() => setError(null)} autoDismiss />
      <BookingProgress currentStep="payment" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Método de Pago</Text>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="info-outline" size={24} color={EventuColors.black} />
          </Pressable>
        </View>

        {}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Monto total</Text>
          <Text style={styles.totalAmount}>${totalAmount.toLocaleString('es-CO')}</Text>
          <View style={styles.secureRow}>
            <View style={styles.secureIcon}>
              <MaterialIcons name="check" size={12} color={EventuColors.success} />
            </View>
            <Text style={styles.secureText}>Pago Seguro</Text>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de la orden</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryTitle} numberOfLines={2}>{eventName}</Text>
                <Text style={styles.summarySubtitle}>
                  {ticketType} | {numberOfTickets} boleto{numberOfTickets !== '1' ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.summaryPrice}>${totalAmount.toLocaleString('es-CO')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalPrice}>${totalAmount.toLocaleString('es-CO')}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Elegir método de pago</Text>
            <Pressable onPress={() => router.push('/booking/add-card')}>
              <Text style={styles.addCardText}>+ Agregar Tarjeta</Text>
            </Pressable>
          </View>

          {}
          <Pressable
            style={[
              styles.paymentCard,
              selectedCard === 'visa' && styles.paymentCardSelected,
            ]}
            onPress={() => setSelectedCard('visa')}
          >
            <View style={styles.cardLeft}>
              <View style={styles.cardLogo}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
              <View>
                <Text style={styles.cardName}>Alex Parkinson</Text>
                <Text style={styles.cardNumber}>**** {paymentCards[0].lastDigits}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Principal</Text>
              </View>
              {selectedCard === 'visa' && (
                <View style={styles.checkCircle}>
                  <MaterialIcons name="check" size={16} color={EventuColors.white} />
                </View>
              )}
            </View>
          </Pressable>

          {}
          <Pressable
            style={[
              styles.paymentCard,
              selectedCard === 'mastercard' && styles.paymentCardSelected,
            ]}
            onPress={() => setSelectedCard('mastercard')}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.cardLogo, styles.mastercardLogo]}>
                <View style={styles.mastercardCircle1} />
                <View style={styles.mastercardCircle2} />
              </View>
              <View>
                <Text style={styles.cardName}>Alex Parkinson</Text>
                <Text style={styles.cardNumber}>**** {paymentCards[1].lastDigits}</Text>
              </View>
            </View>
            {selectedCard === 'mastercard' && (
              <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={16} color={EventuColors.white} />
              </View>
            )}
          </Pressable>

          {}
          <View style={styles.securityMessage}>
            <View style={styles.securityIcon}>
              <MaterialIcons name="check" size={14} color={EventuColors.success} />
            </View>
            <Text style={styles.securityText}>
              Cumplimos completamente con los estándares de seguridad de datos de la industria de tarjetas de pago
            </Text>
          </View>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={[styles.buyButton, loading && styles.buyButtonDisabled]} 
          onPress={handleBuyTicket}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? [EventuColors.mediumGray, EventuColors.mediumGray] : [EventuColors.hotPink, EventuColors.magenta]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={EventuColors.white} />
                <Text style={styles.buttonText}>Procesando pago...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Comprar Boleto</Text>
            )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.black,
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFF5F0',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 12,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secureText: {
    fontSize: 13,
    color: EventuColors.success,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCardText: {
    fontSize: 14,
    color: EventuColors.hotPink,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 20,
    ...Shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    color: EventuColors.mediumGray,
  },
  summaryPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
  },
  divider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 12,
  },
  othersText: {
    fontSize: 15,
    color: EventuColors.mediumGray,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: EventuColors.white,
    ...Shadows.sm,
  },
  paymentCardSelected: {
    borderColor: EventuColors.success,
    backgroundColor: '#F0FFF4',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLogo: {
    width: 50,
    height: 36,
    backgroundColor: EventuColors.black,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visaText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mastercardLogo: {
    backgroundColor: EventuColors.black,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  mastercardCircle1: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EB001B',
    position: 'absolute',
    left: 10,
  },
  mastercardCircle2: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5F00',
    position: 'absolute',
    right: 10,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 13,
    color: EventuColors.mediumGray,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 11,
    color: EventuColors.success,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: EventuColors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityMessage: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  securityIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: EventuColors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: EventuColors.success,
    lineHeight: 18,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  buyButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink,
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
  buyButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
