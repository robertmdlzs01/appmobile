import { EventuColors } from '@/constants/theme';
import { Shadows } from '@/constants/theme-extended';
import { ticketsApi } from '@/services/tickets.api';
import { parseQRCode, QRPayload } from '@/utils/qrCode';
import { extractTicketIdFromBarcode, isValidBarcodeToken } from '@/utils/barcode';
import { useRequireStaff, useStaffPermissions } from '@/hooks/useStaffPermissions';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface ScanResult {
  type: 'qr' | 'barcode';
  data: string;
  ticketId: string | null;
  payload: QRPayload | null;
}

/**
 * Pantalla de escaneo de tickets - EXCLUSIVA PARA STAFF
 * Solo personal autorizado puede acceder a esta funcionalidad
 */
export default function StaffTicketScannerScreen() {
  // Validar permisos de staff - redirige si no tiene acceso
  const isAuthorized = useRequireStaff();
  const { isStaff, user } = useStaffPermissions();

  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;

  // Si no está autorizado, no renderizar nada (el hook ya redirigió)
  if (!isAuthorized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={EventuColors.magenta} />
          <Text style={styles.loadingText}>Verificando permisos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    // Animación del escáner
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleScan = async (data: string) => {
    if (validating || scanning) return;
    
    setScanning(true);
    setScannedData(data);
    
    // Vibración háptica
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Intentar parsear como QR
      const qrPayload = parseQRCode(data);
      
      if (qrPayload) {
        // Es un código QR válido
        setScanResult({
          type: 'qr',
          data,
          ticketId: qrPayload.ticketId,
          payload: qrPayload,
        });
        
        // Validar el ticket
        await validateTicket(qrPayload.ticketId, 'scan');
        return;
      }
      
      // Intentar como código de barras (ahora con token dinámico)
      const barcodeToken = extractTicketIdFromBarcode(data);
      
      if (barcodeToken && isValidBarcodeToken(data)) {
        // El código de barras ahora contiene un token dinámico
        // El backend debe validar este token directamente
        setScanResult({
          type: 'barcode',
          data,
          ticketId: barcodeToken, // Por ahora usamos el token como ID temporal
          payload: null,
        });
        
        // Validar el ticket usando el token del código de barras
        // NOTA: El backend debe actualizarse para validar tokens de código de barras
        await validateTicket(barcodeToken, 'scan');
        return;
      }
      
      // No es un formato válido
      setValidationStatus('error');
      setValidationMessage('Código no reconocido. Por favor escanea un código QR o de barras válido.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
    } catch (error: any) {
      console.error('Error scanning:', error);
      setValidationStatus('error');
      setValidationMessage(error.message || 'Error al escanear el código');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setScanning(false);
      // Resetear después de 3 segundos
      setTimeout(() => {
        setScannedData(null);
        setScanResult(null);
        setValidationStatus('idle');
        setValidationMessage('');
      }, 3000);
    }
  };

  const validateTicket = async (ticketId: string, action: 'scan' | 'validate' | 'reject') => {
    if (!user?.id) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    setValidating(true);
    
    try {
      const response = await ticketsApi.validateTicket(ticketId, user.id, action);
      
      if (response.success && response.data?.validation) {
        setValidationStatus('success');
        
        if (action === 'validate') {
          setValidationMessage('Ticket validado exitosamente');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (action === 'scan') {
          setValidationMessage('Ticket escaneado correctamente');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Animación de éxito
        Animated.sequence([
          Animated.timing(successAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
          Animated.timing(successAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setValidationStatus('error');
        setValidationMessage(response.message || 'Error al validar el ticket');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      console.error('Error validating ticket:', error);
      setValidationStatus('error');
      setValidationMessage(error.message || 'Error al validar el ticket');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setValidating(false);
    }
  };

  const simulateScan = () => {
    // Solo para desarrollo - simular escaneo
    if (__DEV__) {
      handleScan('{"type":"eventu_ticket","ticketId":"ticket-123","token":"mock-token","exp":9999999999,"validated":false}');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {/* Header con badge de staff */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.white} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Escanear Ticket</Text>
            <View style={styles.staffBadge}>
              <MaterialIcons name="verified-user" size={12} color={EventuColors.white} />
              <Text style={styles.staffBadgeText}>STAFF</Text>
            </View>
          </View>
          <Pressable onPress={() => setShowManualInput(true)} style={styles.manualButton}>
            <MaterialIcons name="keyboard" size={24} color={EventuColors.white} />
          </Pressable>
        </View>

        {/* Área de escaneo */}
        <View style={styles.scannerContainer}>
          <View style={styles.scannerFrame}>
            {/* Esquinas del marco */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Línea de escaneo animada */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width - 60],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
          
          <Text style={styles.instructionText}>
            Coloca el código QR o de barras dentro del marco
          </Text>
        </View>

        {/* Botón de simulación (solo para desarrollo) */}
        {__DEV__ && (
          <Pressable style={styles.simulateButton} onPress={simulateScan}>
            <Text style={styles.simulateButtonText}>Simular Escaneo (Dev)</Text>
          </Pressable>
        )}

        {/* Estado de validación */}
        {validationStatus !== 'idle' && (
          <Animated.View
            style={[
              styles.validationContainer,
              {
                opacity: successAnimation,
                transform: [
                  {
                    scale: successAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.validationBox,
                validationStatus === 'success' && styles.validationBoxSuccess,
                validationStatus === 'error' && styles.validationBoxError,
              ]}
            >
              <MaterialIcons
                name={validationStatus === 'success' ? 'check-circle' : 'error'}
                size={48}
                color={validationStatus === 'success' ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.validationText}>{validationMessage}</Text>
              {scanResult && (
                <Text style={styles.ticketIdText}>Ticket: {scanResult.ticketId}</Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Botones de acción */}
        {scanResult && validationStatus === 'success' && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, styles.validateButton]}
              onPress={() => validateTicket(scanResult.ticketId!, 'validate')}
            >
              <MaterialIcons name="check-circle" size={20} color={EventuColors.white} />
              <Text style={styles.actionButtonText}>Validar</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => validateTicket(scanResult.ticketId!, 'reject')}
            >
              <MaterialIcons name="cancel" size={20} color={EventuColors.white} />
              <Text style={styles.actionButtonText}>Rechazar</Text>
            </Pressable>
          </View>
        )}

        {/* Modal de entrada manual */}
        <Modal
          visible={showManualInput}
          transparent
          animationType="slide"
          onRequestClose={() => setShowManualInput(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ingresar Código Manualmente</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Pega el código QR o de barras aquí"
                placeholderTextColor={EventuColors.mediumGray}
                value={manualInput}
                onChangeText={setManualInput}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowManualInput(false);
                    setManualInput('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={() => {
                    if (manualInput.trim()) {
                      handleScan(manualInput.trim());
                      setShowManualInput(false);
                      setManualInput('');
                    }
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: EventuColors.white }]}>
                    Escanear
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Indicador de carga */}
        {validating && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={EventuColors.magenta} />
            <Text style={styles.loadingText}>Validando ticket...</Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: EventuColors.black,
  },
  loadingText: {
    color: EventuColors.white,
    marginTop: 16,
    fontSize: 16,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: EventuColors.white,
  },
  staffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: EventuColors.hotPink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  staffBadgeText: {
    color: EventuColors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  manualButton: {
    padding: 8,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scannerFrame: {
    width: width - 80,
    height: width - 80,
    borderWidth: 2,
    borderColor: EventuColors.magenta,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.lg,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: EventuColors.magenta,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: EventuColors.magenta,
    opacity: 0.8,
  },
  instructionText: {
    color: EventuColors.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    opacity: 0.8,
  },
  simulateButton: {
    backgroundColor: EventuColors.magenta,
    padding: 12,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: EventuColors.white,
    fontWeight: '600',
  },
  validationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  validationBox: {
    backgroundColor: EventuColors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: width - 80,
    ...Shadows.xl,
  },
  validationBoxSuccess: {
    backgroundColor: '#10B981',
  },
  validationBoxError: {
    backgroundColor: '#EF4444',
  },
  validationText: {
    fontSize: 18,
    fontWeight: '600',
    color: EventuColors.white,
    marginTop: 16,
    textAlign: 'center',
  },
  ticketIdText: {
    fontSize: 14,
    color: EventuColors.white,
    marginTop: 8,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  validateButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: EventuColors.black,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: EventuColors.lightGray,
  },
  modalButtonConfirm: {
    backgroundColor: EventuColors.magenta,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.black,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

