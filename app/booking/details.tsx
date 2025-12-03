import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { ValidatedInput, validations } from '@/components/validated-input';
import { ErrorBanner, createError, handleApiError } from '@/components/error-handler';
import { BookingProgress } from '@/components/booking-progress';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams();
  const { eventId, ticketType, ticketPrice: ticketPriceParam, eventName: eventNameParam } = params;
  const { user } = useAuth();

  const eventsData: Record<string, any> = {
    '1': {
      id: '1',
      name: 'SANTALAND 2025',
      date: '12 diciembre – 14 diciembre 2025',
      time: '6:00 PM',
      location: 'Barranquilla',
      image: require('@/assets/images/react-logo.png'),
      
      availableDates: [
        { date: '2025-12-12', display: 'Viernes, 12 de Diciembre 2025' },
        { date: '2025-12-13', display: 'Sábado, 13 de Diciembre 2025' },
        { date: '2025-12-14', display: 'Domingo, 14 de Diciembre 2025' },
      ],
      isMultiDay: true,
      ticketTypes: {
        general: { name: 'General', price: 85000 },
        vip: { name: 'VIP', price: 120000 },
      },
    },
    '2': {
      id: '2',
      name: 'FESTIVAL NACIONAL DE COMPOSITORES 2025',
      date: '12 diciembre – 14 diciembre 2025',
      time: '7:00 PM',
      location: 'San Juan del Cesar – La Guajira',
      image: require('@/assets/images/react-logo.png'),
      
      availableDates: [
        { date: '2025-12-12', display: 'Viernes, 12 de Diciembre 2025' },
        { date: '2025-12-13', display: 'Sábado, 13 de Diciembre 2025' },
        { date: '2025-12-14', display: 'Domingo, 14 de Diciembre 2025' },
      ],
      isMultiDay: true,
      ticketTypes: {
        general: { name: 'General', price: 120000 },
        vip: { name: 'VIP', price: 180000 },
      },
    },
    '3': {
      id: '3',
      name: 'QUIÉN SE LLEVÓ LA NAVIDAD?',
      date: 'Sábado, 29 Noviembre 2025',
      time: '8:00 PM',
      location: 'Barranquilla',
      image: require('@/assets/images/react-logo.png'),
      
      availableDates: [
        { date: '2025-11-29', display: 'Sábado, 29 de Noviembre 2025' },
      ],
      isMultiDay: false,
      ticketTypes: {
        general: { name: 'General', price: 75000 },
        vip: { name: 'VIP', price: 110000 },
      },
    },
  };

  const eventIdStr = Array.isArray(eventId) ? eventId[0] : eventId;
  const eventData = eventsData[eventIdStr || '1'] || eventsData['1'];
  const ticketTypeId = Array.isArray(ticketType) ? ticketType[0] : ticketType;
  const selectedTicketType = eventData.ticketTypes[ticketTypeId as keyof typeof eventData.ticketTypes] || eventData.ticketTypes.general;
  
  const ticketPriceStr = Array.isArray(ticketPriceParam) ? ticketPriceParam[0] : ticketPriceParam || '';
  const ticketPrice = ticketPriceStr ? parseInt(ticketPriceStr.replace(/[^0-9]/g, ''), 10) : selectedTicketType.price;
  const eventName = Array.isArray(eventNameParam) ? eventNameParam[0] : eventNameParam || eventData.name || 'Evento';

  const ticketInfo = {
    type: selectedTicketType.name,
    subtitle: ticketTypeId === 'vip' ? 'Zona VIP con mejores beneficios' : 'Entrada general',
    price: `$${ticketPrice.toLocaleString('es-CO')}`,
    availability: 75,
    eventName: eventName,
    image: eventData.image || require('@/assets/images/react-logo.png'),
  };

  const initialDate = eventData.availableDates && eventData.availableDates.length > 0 
    ? eventData.availableDates[0].display 
    : eventData.date || 'Jun 25, 2025';
  
  const initialDateValue = eventData.availableDates && eventData.availableDates.length > 0 
    ? eventData.availableDates[0].date 
    : '';

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    tickets: '1',
    date: initialDate,
    time: eventData.time || '6:00 PM',
  });
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateValue, setSelectedDateValue] = useState(
    eventData.availableDates && eventData.availableDates.length > 0 
      ? eventData.availableDates[0].date 
      : ''
  );

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleNext = async () => {
    
    if (!formData.fullName.trim()) {
      setError(createError('validation', 'Por favor ingresa tu nombre completo'));
      return;
    }

    if (!formData.email.trim()) {
      setError(createError('validation', 'Por favor ingresa tu correo electrónico'));
      return;
    }

    const ticketsNum = parseInt(formData.tickets, 10);
    if (isNaN(ticketsNum) || ticketsNum < 1) {
      setError(createError('validation', 'La cantidad de boletos debe ser al menos 1'));
      return;
    }

    setError(null);
    
    if (eventData.isMultiDay && !selectedDateValue) {
      setError(createError('validation', 'Por favor selecciona una fecha para el evento'));
      return;
    }

    if (!eventIdStr) {
      setError(createError('validation', 'ID de evento no válido'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const backendTicketType = selectedTicketType.name || 'General';

      router.push({
        pathname: '/booking/review',
        params: {
          purchaseId: 'mock-purchase-id',
          eventId: eventIdStr,
          ticketType: ticketTypeId || '',
          ticketPrice: ticketPrice.toString(),
          totalAmount: (ticketPrice * ticketsNum + 5000).toString(),
          serviceFee: '5000',
          numberOfTickets: ticketsNum.toString(),
          eventName: ticketInfo.eventName,
          selectedDate: selectedDateValue || formData.date,
          fullName: formData.fullName,
          email: formData.email,
          date: formData.date,
          time: formData.time,
          tickets: formData.tickets,
        },
      });
    } catch (err: any) {
      console.error('Error creating purchase:', err);
      const appError = handleApiError(err);
      setError(appError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBanner error={error} onDismiss={() => setError(null)} autoDismiss />
      <BookingProgress currentStep="details" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Detalles de Reserva</Text>
          <Pressable style={styles.iconButton}>
            <MaterialIcons name="info-outline" size={24} color={EventuColors.black} />
          </Pressable>
        </View>

        {}
        <View style={styles.eventCard}>
          <Image source={ticketInfo.image} style={styles.eventImage} />
          <View style={styles.eventOverlay} />

          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{ticketInfo.availability}%</Text>
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.ticketType}>{ticketInfo.type}</Text>
            <Text style={styles.ticketSubtitle}>{ticketInfo.subtitle}</Text>
            <Text style={styles.price}>{ticketInfo.price}</Text>
          </View>

          <Pressable style={styles.arrowButton}>
            <MaterialIcons name="arrow-forward" size={20} color={EventuColors.white} />
          </Pressable>
        </View>

        {}
        <View style={styles.form}>
          <View style={styles.row}>
            <ValidatedInput
              label="Nombre Completo"
              icon="person.fill"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              placeholder="Tu nombre completo"
              autoCapitalize="words"
              validationRules={[validations.required(), validations.minLength(2)]}
              required
              containerStyle={[styles.inputContainer, { flex: 1 }]}
            />
            <ValidatedInput
              label="Cantidad de boletos"
              value={formData.tickets}
              onChangeText={(text) => {
                
                const numericValue = text.replace(/[^0-9]/g, '');
                if (numericValue === '' || parseInt(numericValue, 10) > 0) {
                  setFormData({ ...formData, tickets: numericValue || '1' });
                }
              }}
              placeholder="1"
              keyboardType="number-pad"
              validationRules={[
                validations.required(),
                {
                  test: (value) => parseInt(value, 10) >= 1,
                  message: 'Debe ser al menos 1',
                },
              ]}
              required
              containerStyle={[styles.inputContainer, { flex: 0.4 }]}
            />
          </View>

          <ValidatedInput
            label="Correo Electrónico"
            icon="envelope.fill"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            validationRules={[validations.required(), validations.email()]}
            required
            containerStyle={styles.inputContainer}
          />

          <View style={styles.row}>
            {eventData.isMultiDay ? (
              <Pressable
                style={[styles.inputContainer, styles.datePickerContainer]}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.inputLabelContainer}>
                  <MaterialIcons name="calendar-today" size={18} color={EventuColors.mediumGray} />
                  <Text style={styles.inputLabel}>Fecha *</Text>
                </View>
                <View style={styles.datePickerValue}>
                  <Text style={styles.datePickerText}>{formData.date}</Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={EventuColors.mediumGray} />
                </View>
              </Pressable>
            ) : (
              <ValidatedInput
                label="Fecha"
                icon="calendar-today"
                value={formData.date}
                onChangeText={() => {}}
                placeholder="Jun 25, 2025"
                validationRules={[validations.required()]}
                required
                editable={false}
                containerStyle={styles.inputContainer}
                style={styles.disabledInput}
              />
            )}
            <ValidatedInput
              label="Hora"
              icon="access-time"
              value={formData.time}
              onChangeText={() => {}}
              placeholder="6:00 PM"
              validationRules={[validations.required()]}
              required
              editable={false}
              containerStyle={styles.inputContainer}
              style={styles.disabledInput}
            />
          </View>
        </View>
      </ScrollView>

      {}
      {eventData.isMultiDay && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <MaterialIcons name="close" size={24} color={EventuColors.black} />
                </Pressable>
              </View>
              <ScrollView style={styles.dateList}>
                {eventData.availableDates.map((dateOption: any) => (
                  <Pressable
                    key={dateOption.date}
                    style={[
                      styles.dateOption,
                      selectedDateValue === dateOption.date && styles.dateOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedDateValue(dateOption.date);
                      setFormData({ ...formData, date: dateOption.display });
                      setShowDatePicker(false);
                    }}
                  >
                    <View style={styles.dateOptionLeft}>
                      <MaterialIcons 
                        name="event" 
                        size={20} 
                        color={selectedDateValue === dateOption.date ? EventuColors.magenta : EventuColors.mediumGray} 
                      />
                      <Text
                        style={[
                          styles.dateOptionText,
                          selectedDateValue === dateOption.date && styles.dateOptionTextSelected,
                        ]}
                      >
                        {dateOption.display}
                      </Text>
                    </View>
                    {selectedDateValue === dateOption.date && (
                      <MaterialIcons name="check-circle" size={24} color={EventuColors.magenta} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={[styles.nextButton, loading && styles.nextButtonDisabled]} 
          onPress={handleNext}
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
                <Text style={styles.buttonText}>Creando compra...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Siguiente</Text>
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
  eventCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: EventuColors.white,
    ...Shadows.lg,
  },
  eventImage: {
    width: '100%',
    height: 280,
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  progressBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: EventuColors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: EventuColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  ticketType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 4,
  },
  ticketSubtitle: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  arrowButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: EventuColors.hotPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: EventuColors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: EventuColors.black,
    fontWeight: '500',
    ...Shadows.sm,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Shadows.sm,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: EventuColors.black,
    fontWeight: '500',
    padding: 0,
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  iconInputText: {
    flex: 1,
    fontSize: 15,
    color: EventuColors.black,
    fontWeight: '500',
    padding: 0,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  nextButton: {
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
  nextButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: EventuColors.lightGray + '40',
  },
  datePickerContainer: {
    backgroundColor: EventuColors.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    ...Shadows.sm,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: EventuColors.mediumGray,
  },
  datePickerValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
  },
  dateList: {
    maxHeight: 400,
  },
  dateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: EventuColors.white,
    borderWidth: 2,
    borderColor: EventuColors.lightGray,
  },
  dateOptionSelected: {
    backgroundColor: 'rgba(164, 46, 255, 0.08)',
    borderColor: EventuColors.magenta,
  },
  dateOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
  },
  dateOptionTextSelected: {
    color: EventuColors.magenta,
  },
});
