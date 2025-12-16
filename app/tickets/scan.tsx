import { EventuColors } from '@/constants/theme';
import { Shadows } from '@/constants/theme-extended';
import { ticketsApi } from '@/services/tickets.api';
import { parseQRCode, QRPayload } from '@/utils/qrCode';
import { extractTicketIdFromBarcode, isValidBarcodeToken } from '@/utils/barcode';
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

export default function TicketScannerScreen() {
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
    setValidating(true);
    setValidationStatus('idle');
    
    try {
      const response = await ticketsApi.validateTicket(ticketId, action);
      
      if (response.success && response.data) {
        setValidationStatus('success');
        setValidationMessage(
          action === 'validate' 
            ? 'Ticket validado exitosamente' 
            : action === 'scan'
            ? 'Ticket escaneado correctamente'
            : 'Ticket rechazado'
        );
        
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
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(response.message || 'Error al validar el ticket');
      }
    } catch (error: any) {
      setValidationStatus('error');
      setValidationMessage(error.message || 'Error al validar el ticket');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setValidating(false);
    }
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código');
      return;
    }
    
    handleScan(manualInput.trim());
    setManualInput('');
    setShowManualInput(false);
  };

  // Simulación de escaneo (en producción usarías expo-camera o expo-barcode-scanner)
  const simulateScan = () => {
    // Para desarrollo: simular escaneo de un código
    const mockQR = JSON.stringify({
      type: 'eventu_ticket',
      ticketId: 'ticket-1',
      token: 'mock-token',
      exp: Math.floor(Date.now() / 1000) + 300,
      validated: false,
    });
    
    handleScan(mockQR);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>Escanear Ticket</Text>
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
              disabled={validating}
            >
              {validating ? (
                <ActivityIndicator color={EventuColors.white} />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={20} color={EventuColors.white} />
                  <Text style={styles.actionButtonText}>Validar</Text>
                </>
              )}
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => validateTicket(scanResult.ticketId!, 'reject')}
              disabled={validating}
            >
              <MaterialIcons name="close" size={20} color={EventuColors.white} />
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
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ingresar Código Manualmente</Text>
              <TextInput
                style={styles.input}
                value={manualInput}
                onChangeText={setManualInput}
                placeholder="Código QR o de barras"
                placeholderTextColor={EventuColors.mediumGray}
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowManualInput(false);
                    setManualInput('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleManualInput}
                >
                  <Text style={[styles.modalButtonText, { color: EventuColors.white }]}>
                    Escanear
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: EventuColors.white,
  },
  manualButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: EventuColors.hotPink,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: EventuColors.hotPink,
    ...Shadows.lg,
  },
  instructionText: {
    marginTop: 30,
    fontSize: 16,
    color: EventuColors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  simulateButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: EventuColors.hotPink,
    borderRadius: 12,
    alignItems: 'center',
  },
  simulateButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  validationContainer: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  validationBox: {
    backgroundColor: EventuColors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Shadows.lg,
    minWidth: 280,
  },
  validationBoxSuccess: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  validationBoxError: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  validationText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.black,
    textAlign: 'center',
  },
  ticketIdText: {
    marginTop: 8,
    fontSize: 12,
    color: EventuColors.mediumGray,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    ...Shadows.md,
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
  modalContainer: {
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
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: EventuColors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: EventuColors.black,
    marginBottom: 20,
    fontFamily: 'monospace',
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
  cancelButton: {
    backgroundColor: EventuColors.lightGray,
  },
  confirmButton: {
    backgroundColor: EventuColors.hotPink,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.black,
  },
});

