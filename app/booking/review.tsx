import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { BookingProgress } from '@/components/booking-progress';
import { ErrorBanner, createError } from '@/components/error-handler';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ReviewTicketSummaryScreen() {
  const params = useLocalSearchParams();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<any>(null);

  const eventsData: Record<string, any> = {
    '1': {
      id: '1',
      name: 'SANTALAND 2025',
      date: '12 diciembre – 14 diciembre 2025',
      time: '6:00 PM',
      image: require('@/assets/images/react-logo.png'),
    },
    '2': {
      id: '2',
      name: 'FESTIVAL NACIONAL DE COMPOSITORES 2025',
      date: '12 diciembre – 14 diciembre 2025',
      time: '7:00 PM',
      image: require('@/assets/images/react-logo.png'),
    },
    '3': {
      id: '3',
      name: 'QUIÉN SE LLEVÓ LA NAVIDAD?',
      date: 'Sábado, 29 Noviembre 2025',
      time: '8:00 PM',
      image: require('@/assets/images/react-logo.png'),
    },
  };

  const eventIdStr = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId || '1';
  const eventData = eventsData[eventIdStr] || eventsData['1'];
  
  const purchaseId = Array.isArray(params.purchaseId) ? params.purchaseId[0] : params.purchaseId;
  
  const totalAmountNum = parseFloat(
    (Array.isArray(params.totalAmount) ? params.totalAmount[0] : params.totalAmount || '0')
      .replace(/[^0-9.]/g, '')
  ) || 0;
  const serviceFeeNum = parseFloat(
    (Array.isArray(params.serviceFee) ? params.serviceFee[0] : params.serviceFee || '0')
      .replace(/[^0-9.]/g, '')
  ) || 0;
  const ticketPriceNum = parseFloat((Array.isArray(params.ticketPrice) ? params.ticketPrice[0] : params.ticketPrice || '0').replace(/[^0-9.]/g, '')) || 0;
  const numberOfTickets = parseInt((Array.isArray(params.numberOfTickets) ? params.numberOfTickets[0] : params.numberOfTickets) || (Array.isArray(params.tickets) ? params.tickets[0] : params.tickets) || '1', 10);
  const subtotal = ticketPriceNum * numberOfTickets;
  const totalAmount = totalAmountNum || (subtotal + serviceFeeNum);
  const serviceFee = serviceFeeNum;

  const summary = {
    eventName: (Array.isArray(params.eventName) ? params.eventName[0] : params.eventName) || eventData.name || 'Evento',
    ticketType: (Array.isArray(params.ticketType) ? params.ticketType[0] : params.ticketType) || 'General',
    numberOfTickets: numberOfTickets.toString(),
    date: (Array.isArray(params.date) ? params.date[0] : params.date) || eventData.date || '',
    time: (Array.isArray(params.time) ? params.time[0] : params.time) || eventData.time || '',
    fullName: (Array.isArray(params.fullName) ? params.fullName[0] : params.fullName) || '',
    email: (Array.isArray(params.email) ? params.email[0] : params.email) || '',
    ticketPrice: ticketPriceNum.toLocaleString('es-CO'),
    serviceFee: serviceFee.toLocaleString('es-CO'),
    totalAmount: totalAmount.toLocaleString('es-CO'),
    image: eventData.image || require('@/assets/images/react-logo.png'),
  };

  const handleConfirm = async () => {
    if (!acceptTerms) {
      setError(createError('validation', 'Por favor acepta los términos y condiciones'));
      return;
    }
    
    setError(null);
    
    // Redirigir a la web para completar la compra
    const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId || '1';
    const ticketType = (Array.isArray(params.ticketType) ? params.ticketType[0] : params.ticketType) || 'General';
    const eventName = (Array.isArray(params.eventName) ? params.eventName[0] : params.eventName) || summary.eventName;
    
    const webUrl = new URL('https://eventu.co/booking');
    webUrl.searchParams.set('eventId', eventId);
    webUrl.searchParams.set('ticketType', ticketType);
    webUrl.searchParams.set('tickets', numberOfTickets.toString());
    webUrl.searchParams.set('totalAmount', totalAmount.toString());
    webUrl.searchParams.set('eventName', eventName);
    webUrl.searchParams.set('date', summary.date);
    webUrl.searchParams.set('time', summary.time);
    webUrl.searchParams.set('fullName', summary.fullName);
    webUrl.searchParams.set('email', summary.email);
    webUrl.searchParams.set('source', 'app');
    
    await WebBrowser.openBrowserAsync(webUrl.toString(), {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBanner error={error} onDismiss={() => setError(null)} autoDismiss />
      <BookingProgress currentStep="review" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Revisar Resumen</Text>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.eventCard}>
          <Image source={summary.image} style={styles.eventImage} />
          <View style={styles.eventOverlay} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{summary.eventName}</Text>
            <Text style={styles.eventDetails}>
              {summary.ticketType} • {summary.numberOfTickets} boleto{summary.numberOfTickets !== '1' ? 's' : ''}
            </Text>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de Reserva</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <MaterialIcons name="person" size={20} color={EventuColors.mediumGray} />
                <Text style={styles.detailLabel}>Nombre Completo</Text>
              </View>
              <Text style={styles.detailValue}>{summary.fullName}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <MaterialIcons name="email" size={20} color={EventuColors.mediumGray} />
                <Text style={styles.detailLabel}>Correo Electrónico</Text>
              </View>
              <Text style={styles.detailValue}>{summary.email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <MaterialIcons name="calendar-today" size={20} color={EventuColors.mediumGray} />
                <Text style={styles.detailLabel}>Fecha</Text>
              </View>
              <Text style={styles.detailValue}>{summary.date}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <MaterialIcons name="access-time" size={20} color={EventuColors.mediumGray} />
                <Text style={styles.detailLabel}>Hora</Text>
              </View>
              <Text style={styles.detailValue}>{summary.time}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Precios</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio del Boleto ({summary.numberOfTickets} x ${summary.ticketPrice})</Text>
              <Text style={styles.priceValue}>${(ticketPriceNum * numberOfTickets).toLocaleString('es-CO')}</Text>
            </View>
            {serviceFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tarifa de Servicio</Text>
                <Text style={styles.priceValue}>${summary.serviceFee}</Text>
              </View>
            )}
            <View style={styles.priceDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Monto Total</Text>
              <Text style={styles.totalValue}>${summary.totalAmount}</Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.termsSection}>
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
              {acceptTerms && (
                <MaterialIcons name="check" size={16} color={EventuColors.white} />
              )}
            </View>
            <Text style={styles.termsText}>
              Acepto los{' '}
              <Text style={styles.termsLink}>Términos y Condiciones</Text> y la{' '}
              <Text style={styles.termsLink}>Política de Privacidad</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomContainer}>
        <Pressable
          style={[styles.confirmButton, !acceptTerms && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!acceptTerms}
        >
          <LinearGradient
            colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Continuar en la Web</Text>
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
  eventCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: EventuColors.white,
    ...Shadows.md,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: EventuColors.mediumGray,
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
  detailsCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 20,
    ...Shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: EventuColors.black,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 4,
  },
  priceCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 20,
    ...Shadows.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: EventuColors.mediumGray,
  },
  priceValue: {
    fontSize: 15,
    color: EventuColors.black,
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: EventuColors.hotPink,
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: EventuColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: EventuColors.hotPink,
    borderColor: EventuColors.hotPink,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: EventuColors.mediumGray,
    lineHeight: 20,
  },
  termsLink: {
    color: EventuColors.hotPink,
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  confirmButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
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
