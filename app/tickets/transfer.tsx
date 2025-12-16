import { FadeInView } from '@/components/fade-in-view';
import { PressableCard } from '@/components/pressable-card';
import { ValidatedInput, validations } from '@/components/validated-input';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type TransferStep = 'initiate' | 'confirm' | 'receive' | 'pending';

export default function TransferTicketScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { ticketId } = useLocalSearchParams();
  const [step, setStep] = useState<TransferStep>('initiate');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInitiateTransfer = async () => {
    if (!receiverEmail.trim()) {
      Alert.alert('Error', 'Por favor ingresa el correo del receptor');
      return;
    }

    if (!validations.email().test(receiverEmail)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);
    // Simular proceso de transferencia
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setStep('pending');
    Alert.alert(
      'Solicitud enviada',
      `Se ha enviado una solicitud de transferencia a ${receiverEmail}. El receptor debe confirmar para completar la transferencia.`
    );
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    Alert.alert('Transferencia completada', 'La entrada ha sido transferida exitosamente.');
    router.back();
  };

  const renderInitiateStep = () => (
    <View style={styles.stepContainer}>
      <FadeInView delay={100}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[EventuColors.magenta, EventuColors.hotPink]}
            style={styles.iconGradient}
          >
            <MaterialIcons name="send" size={32} color={EventuColors.white} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>Iniciar Transferencia</Text>
        <Text style={styles.stepDescription}>
          Ingresa el correo electrónico de la persona a quien deseas transferir esta entrada.
          El receptor recibirá una notificación para confirmar la transferencia.
        </Text>
      </FadeInView>

      <FadeInView delay={200}>
        <ValidatedInput
          label="Correo del receptor"
          icon="email"
          value={receiverEmail}
          onChangeText={setReceiverEmail}
          placeholder="usuario@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          validationRules={[validations.required(), validations.email()]}
          required
          containerStyle={styles.inputContainer}
        />
      </FadeInView>

      <FadeInView delay={300}>
        <PressableCard
          style={[styles.actionButton, { backgroundColor: EventuColors.magenta }]}
          onPress={handleInitiateTransfer}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </Text>
        </PressableCard>
      </FadeInView>
    </View>
  );

  const renderPendingStep = () => (
    <View style={styles.stepContainer}>
      <FadeInView delay={100}>
        <View style={styles.iconContainer}>
          <View style={styles.iconGradient}>
            <MaterialIcons name="hourglass-empty" size={32} color={EventuColors.white} />
          </View>
        </View>
        <Text style={styles.stepTitle}>Solicitud Pendiente</Text>
        <Text style={styles.stepDescription}>
          La solicitud de transferencia ha sido enviada a {receiverEmail}. Esperando confirmación del receptor.
        </Text>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={20} color={EventuColors.magenta} />
          <Text style={styles.infoText}>
            El receptor recibirá una notificación y podrá aceptar o rechazar la transferencia.
            Te notificaremos cuando se complete el proceso.
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={300}>
        <PressableCard
          style={[styles.actionButton, styles.secondaryButton, { borderColor: EventuColors.magenta }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.actionButtonText, { color: EventuColors.magenta }]}>
            Volver
          </Text>
        </PressableCard>
      </FadeInView>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <FadeInView delay={100}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[EventuColors.magenta, EventuColors.hotPink]}
            style={styles.iconGradient}
          >
            <MaterialIcons name="check-circle" size={32} color={EventuColors.white} />
          </LinearGradient>
        </View>
        <Text style={styles.stepTitle}>Confirmar Transferencia</Text>
        <Text style={styles.stepDescription}>
          Has recibido una solicitud de transferencia. ¿Deseas aceptar esta entrada?
        </Text>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Detalles de la transferencia:</Text>
          <Text style={styles.infoText}>• Evento: Concierto de Rock Nacional</Text>
          <Text style={styles.infoText}>• Fecha: 20 dic 2025</Text>
          <Text style={styles.infoText}>• Transferido por: usuario@ejemplo.com</Text>
        </View>
      </FadeInView>

      <FadeInView delay={300}>
        <View style={styles.buttonRow}>
          <PressableCard
            style={[styles.actionButton, styles.secondaryButton, { borderColor: EventuColors.mediumGray }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.actionButtonText, { color: EventuColors.mediumGray }]}>
              Rechazar
            </Text>
          </PressableCard>
          <PressableCard
            style={[styles.actionButton, { backgroundColor: EventuColors.magenta }]}
            onPress={handleConfirmTransfer}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? 'Confirmando...' : 'Aceptar'}
            </Text>
          </PressableCard>
        </View>
      </FadeInView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <View style={styles.backButtonInner}>
                <MaterialIcons name="arrow-back" size={24} color={EventuColors.magenta} />
              </View>
            </Pressable>
            <Text style={styles.headerTitle}>Transferir Entrada</Text>
            <View style={styles.backButton} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 'initiate' && renderInitiateStep()}
            {step === 'pending' && renderPendingStep()}
            {step === 'confirm' && renderConfirmStep()}
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: EventuColors.white,
  },
  keyboardView: {
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(228, 0, 111, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: EventuColors.black,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    gap: 10,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    ...Shadows.md,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: EventuColors.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    backgroundColor: EventuColors.veryLightGray,
    borderRadius: Radius.xl,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: EventuColors.black,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    lineHeight: 20,
  },
});

