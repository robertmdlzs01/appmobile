import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { BookingProgress } from '@/components/booking-progress';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PaymentRejectedScreen() {
  const params = useLocalSearchParams();
  
  const totalAmountParam = Array.isArray(params.totalAmount) ? params.totalAmount[0] : params.totalAmount || '0';
  const totalAmount = parseFloat(totalAmountParam.replace(/[^0-9.]/g, '')) || 0;
  const eventName = (Array.isArray(params.eventName) ? params.eventName[0] : params.eventName) || 'Evento';
  const errorReason = (Array.isArray(params.errorReason) ? params.errorReason[0] : params.errorReason) || 'Fondos insuficientes';
  
  const rejectionDate = new Date().toLocaleDateString('es-CO', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleRetryPayment = () => {
    
    router.back();
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)');
  };

  const handleContactSupport = () => {
    
    console.log('Contactar soporte');
  };

  return (
    <SafeAreaView style={styles.container}>
      <BookingProgress currentStep="payment" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.iconContainer}>
          <View style={styles.errorBadge}>
            <LinearGradient
              colors={['#FF6B6B', '#FF5252']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeGradient}
            >
              <MaterialIcons name="close" size={48} color={EventuColors.white} />
            </LinearGradient>
          </View>
          <View style={styles.errorRing} />
        </View>

        {}
        <Text style={styles.title}>Pago Rechazado</Text>
        <Text style={styles.subtitle}>No pudimos procesar tu pago</Text>
        <Text style={styles.description}>
          Tu pago no pudo ser procesado. Por favor verifica la información de tu tarjeta o intenta con otro método de pago.
        </Text>

        {}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalles del Rechazo</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Evento</Text>
            <Text style={styles.detailsValue} numberOfLines={2}>{eventName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Monto</Text>
            <Text style={styles.detailsValue}>${totalAmount.toLocaleString('es-CO')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Razón</Text>
            <Text style={styles.detailsError}>{errorReason}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Fecha</Text>
            <Text style={styles.detailsValue}>{rejectionDate}</Text>
          </View>
        </View>

        {}
        <View style={styles.helpCard}>
          <View style={styles.helpHeader}>
            <MaterialIcons name="help-outline" size={24} color={EventuColors.hotPink} />
            <Text style={styles.helpTitle}>¿Necesitas ayuda?</Text>
          </View>
          <Text style={styles.helpText}>
            Verifica que la información de tu tarjeta sea correcta, que tengas fondos suficientes, o intenta con otra tarjeta.
          </Text>
          <Pressable style={styles.supportButton} onPress={handleContactSupport}>
            <Text style={styles.supportButtonText}>Contactar Soporte</Text>
          </Pressable>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <Pressable style={styles.secondaryButton} onPress={handleRetryPayment}>
            <MaterialIcons name="refresh" size={20} color={EventuColors.hotPink} />
            <Text style={styles.secondaryButtonText}>Intentar Nuevamente</Text>
          </Pressable>
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
  errorBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    shadowColor: '#FF6B6B66',
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#FF6B6B30',
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
  detailsCard: {
    width: '100%',
    backgroundColor: EventuColors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    ...Shadows.md,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsLabel: {
    fontSize: 15,
    color: EventuColors.mediumGray,
    flex: 1,
  },
  detailsValue: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    flex: 1,
    textAlign: 'right',
  },
  detailsError: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: EventuColors.lightGray,
    marginVertical: 12,
  },
  helpCard: {
    width: '100%',
    backgroundColor: '#FFF5F0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: EventuColors.hotPink + '20',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: EventuColors.black,
  },
  helpText: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: EventuColors.white,
    borderWidth: 1,
    borderColor: EventuColors.hotPink,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 14,
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
  buttonRow: {
    gap: 12,
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
