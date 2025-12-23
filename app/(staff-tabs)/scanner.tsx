import { EventuColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const SCANNER_SIZE = Math.min(width * 0.8, 300); // Tamaño cuadrado y proporcionado

interface QRScanResult {
  id: string;
  ticketId: string;
  qrToken: string;
  scannedAt: string;
  status: 'valid' | 'invalid' | 'already_used';
  eventName?: string;
  userName?: string;
}

// Caché en memoria (RAM) para acceso ultra-rápido
const memoryCache = {
  scans: new Map<string, QRScanResult>(), // Map para búsqueda O(1)
  recentScans: [] as QRScanResult[], // Array para los últimos escaneos
  maxCacheSize: 500, // Máximo de escaneos en memoria
  lastSync: 0, // Timestamp de última sincronización con AsyncStorage
  syncInterval: 5000, // Sincronizar cada 5 segundos
};

export default function StaffScannerScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrDetected, setQrDetected] = useState(false);
  const [stats, setStats] = useState({
    validToday: 0,
    totalScans: 0,
  });
  const scannerOpacity = useSharedValue(1);
  const detectionScale = useSharedValue(1);
  const detectionOpacity = useSharedValue(0);

  useEffect(() => {
    loadStats();
    loadMemoryCache(); // Cargar caché en memoria al iniciar
  }, []);

  // Cargar caché en memoria desde AsyncStorage (solo una vez al inicio)
  const loadMemoryCache = async () => {
    try {
      const scansData = await AsyncStorage.getItem('@staff_qr_scans');
      if (scansData) {
        const scans: QRScanResult[] = JSON.parse(scansData);
        // Cargar los últimos 500 escaneos en memoria
        const recentScans = scans.slice(0, memoryCache.maxCacheSize);
        recentScans.forEach(scan => {
          memoryCache.scans.set(scan.qrToken, scan);
        });
        memoryCache.recentScans = recentScans;
        memoryCache.lastSync = Date.now();
      }
    } catch (error) {
      console.error('Error loading memory cache:', error);
    }
  };

  // Sincronizar caché con AsyncStorage de forma asíncrona (no bloquea)
  const syncToStorage = async (newScan: QRScanResult) => {
    try {
      // Agregar a caché en memoria primero (instantáneo)
      memoryCache.scans.set(newScan.qrToken, newScan);
      memoryCache.recentScans.unshift(newScan);
      
      // Limitar tamaño del caché
      if (memoryCache.recentScans.length > memoryCache.maxCacheSize) {
        const removed = memoryCache.recentScans.pop();
        if (removed) {
          memoryCache.scans.delete(removed.qrToken);
        }
      }

      // Sincronizar con AsyncStorage en background (no bloquea)
      const existingScans = await AsyncStorage.getItem('@staff_qr_scans');
      const scans: QRScanResult[] = existingScans ? JSON.parse(existingScans) : [];
      scans.unshift(newScan);
      const limitedScans = scans.slice(0, 1000);
      await AsyncStorage.setItem('@staff_qr_scans', JSON.stringify(limitedScans));
      memoryCache.lastSync = Date.now();
    } catch (error) {
      console.error('Error syncing to storage:', error);
    }
  };

  const loadStats = async () => {
    try {
      const scansData = await AsyncStorage.getItem('@staff_qr_scans');
      if (scansData) {
        const scans: QRScanResult[] = JSON.parse(scansData);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayScans = scans.filter((scan) => {
          const scanDate = new Date(scan.scannedAt);
          scanDate.setHours(0, 0, 0, 0);
          return scanDate.getTime() === today.getTime() && scan.status === 'valid';
        });

        setStats({
          validToday: todayScans.length,
          totalScans: scans.length,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || processing) return;

    // Vibración inmediata al detectar código
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Mostrar recuadro verde de detección
    setQrDetected(true);
    detectionOpacity.value = withTiming(1, { duration: 200 });
    detectionScale.value = withTiming(1.05, { duration: 200 });

    setScanned(true);
    setProcessing(true);
    scannerOpacity.value = withTiming(0.3, { duration: 100 });

    try {
      // Validación rápida usando caché en memoria
      const result = await validateTicket(data);
      
      const scanResult: QRScanResult = {
        id: `scan-${Date.now()}`,
        ticketId: result.ticketId || 'unknown',
        qrToken: data,
        scannedAt: new Date().toISOString(),
        status: result.status,
        eventName: result.eventName,
        userName: result.userName,
      };

      // Guardar en memoria primero (instantáneo), luego sincronizar en background
      syncToStorage(scanResult);

      // Vibración diferente según el resultado
      if (result.status === 'valid') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.status === 'already_used') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Mostrar resultado inmediatamente
      showScanResult(result);
      
      // Actualizar stats en background (no bloquea)
      loadStats();

      // Reset rápido para permitir siguiente escaneo (500ms en lugar de 2000ms)
      setTimeout(() => {
        setScanned(false);
        setProcessing(false);
        setQrDetected(false);
        scannerOpacity.value = withTiming(1, { duration: 100 });
        detectionOpacity.value = withTiming(0, { duration: 300 });
        detectionScale.value = withTiming(1, { duration: 300 });
      }, 500);
    } catch (error: any) {
      console.error('Error scanning QR:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo procesar el código QR',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
              setQrDetected(false);
              scannerOpacity.value = withTiming(1, { duration: 100 });
              detectionOpacity.value = withTiming(0, { duration: 300 });
              detectionScale.value = withTiming(1, { duration: 300 });
            },
          },
        ]
      );
    }
  };

  const handleValidate = async () => {
    if (!qrCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código QR');
      return;
    }

    setProcessing(true);

    try {
      const result = await validateTicket(qrCode.trim());
      
      await saveScanResult({
        id: `scan-${Date.now()}`,
        ticketId: result.ticketId || 'unknown',
        qrToken: qrCode.trim(),
        scannedAt: new Date().toISOString(),
        status: result.status,
        eventName: result.eventName,
        userName: result.userName,
      });

      showScanResult(result);
      setQrCode('');
      await loadStats();
    } catch (error: any) {
      console.error('Error validating QR:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo procesar el código QR'
      );
    } finally {
      setProcessing(false);
    }
  };

  const validateTicket = async (qrToken: string): Promise<{
    ticketId: string;
    status: 'valid' | 'invalid' | 'already_used';
    eventName?: string;
    userName?: string;
  }> => {
    const parts = qrToken.split('|');
    const ticketId = parts[0] || 'unknown';

    // Verificación ULTRA-RÁPIDA en memoria RAM (O(1) con Map)
    const existingScan = memoryCache.scans.get(qrToken);
    if (existingScan && existingScan.status === 'valid') {
      return {
        ticketId,
        status: 'already_used',
        eventName: existingScan.eventName,
        userName: existingScan.userName,
      };
    }

    // Validación instantánea (sin delay artificial para eventos masivos)
    // En producción, aquí harías la llamada a la API real
    // Por ahora, validación mock instantánea
    const random = Math.random();
    if (random > 0.3) {
      return {
        ticketId,
        status: 'valid',
        eventName: 'Evento',
        userName: 'Usuario',
      };
    } else {
      return {
        ticketId,
        status: 'invalid',
      };
    }
  };

  // Esta función ya no se usa directamente, se usa syncToStorage
  // Pero la mantenemos por compatibilidad
  const saveScanResult = async (result: QRScanResult) => {
    await syncToStorage(result);
  };

  const showScanResult = (result: {
    status: 'valid' | 'invalid' | 'already_used';
    eventName?: string;
    userName?: string;
  }) => {
    if (result.status === 'valid') {
      Alert.alert(
        '✅ Ticket Válido',
        `Evento: ${result.eventName || 'N/A'}\nUsuario: ${result.userName || 'N/A'}\n\nTicket validado exitosamente.`,
        [{ text: 'OK' }]
      );
    } else if (result.status === 'already_used') {
      Alert.alert(
        '⚠️ Ticket Ya Usado',
        `Evento: ${result.eventName || 'N/A'}\nUsuario: ${result.userName || 'N/A'}\n\nEste ticket ya fue validado anteriormente.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        '❌ Ticket Inválido',
        'El código QR no es válido o no corresponde a un ticket activo.',
        [{ text: 'OK' }]
      );
    }
  };

  const animatedScannerStyle = useAnimatedStyle(() => ({
    opacity: scannerOpacity.value,
  }));

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={EventuColors.magenta} />
              <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.backgroundGradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.errorContainer}>
              <MaterialIcons name="camera-alt" size={64} color={EventuColors.mediumGray} />
              <Text style={styles.errorTitle}>Acceso a Cámara Denegado</Text>
              <Text style={styles.errorText}>
                Necesitas permitir el acceso a la cámara para escanear códigos QR.
              </Text>
              <Pressable
                style={styles.permissionButton}
                onPress={requestPermission}
              >
                <Text style={styles.permissionButtonText}>Permitir Cámara</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft} />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Lector QR</Text>
              <Text style={styles.headerSubtitle}>{user?.name || 'Staff'}</Text>
            </View>
            <Pressable
              style={styles.modeButton}
              onPress={() => setManualMode(!manualMode)}
            >
              <MaterialIcons
                name={manualMode ? 'camera-alt' : 'keyboard'}
                size={24}
                color={EventuColors.magenta}
              />
            </Pressable>
          </View>

          {!manualMode ? (
            /* Scanner con Cámara */
            <View style={styles.scannerContainer}>
              <View style={styles.scannerCard}>
                <Animated.View style={[styles.scannerWrapper, animatedScannerStyle]}>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                  />
                </Animated.View>

                {/* Overlay con marco de escaneo */}
                <View style={styles.overlay}>
                  <View style={styles.overlayTop} />
                  <View style={styles.overlayMiddle}>
                    <View style={styles.overlaySide} />
                    <View style={styles.scanFrame}>
                      {/* Recuadro verde de detección */}
                      {qrDetected && (
                        <Animated.View
                          style={[
                            styles.detectionBox,
                            {
                              opacity: detectionOpacity,
                              transform: [{ scale: detectionScale }],
                            },
                          ]}
                        />
                      )}
                      <View style={[styles.corner, styles.cornerTopLeft]} />
                      <View style={[styles.corner, styles.cornerTopRight]} />
                      <View style={[styles.corner, styles.cornerBottomLeft]} />
                      <View style={[styles.corner, styles.cornerBottomRight]} />
                    </View>
                    <View style={styles.overlaySide} />
                  </View>
                  <View style={styles.overlayBottom} />
                </View>

                {/* Indicador de procesamiento */}
                {processing && (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="large" color={EventuColors.magenta} />
                    <Text style={styles.processingText}>Validando ticket...</Text>
                  </View>
                )}
              </View>

              {/* Instrucciones */}
              <View style={styles.instructionsContainer}>
                <MaterialIcons name="qr-code-scanner" size={24} color={EventuColors.magenta} />
                <Text style={styles.instructionsText}>
                  {processing
                    ? 'Procesando...'
                    : scanned
                    ? 'Escaneado exitosamente'
                    : 'Apunta la cámara al código QR del ticket'}
                </Text>
              </View>
            </View>
          ) : (
            /* Modo Manual */
            <View style={styles.manualContainer}>
              <View style={styles.inputWrapper}>
                <MaterialIcons 
                  name="qr-code" 
                  size={24} 
                  color={EventuColors.magenta} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={qrCode}
                  onChangeText={setQrCode}
                  placeholder="Ingresa o pega el código QR del ticket"
                  placeholderTextColor={EventuColors.mediumGray}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                  numberOfLines={3}
                  editable={!processing}
                />
              </View>

              <Pressable
                style={[styles.validateButton, processing && styles.validateButtonDisabled]}
                onPress={handleValidate}
                disabled={processing || !qrCode.trim()}
              >
                {processing ? (
                  <ActivityIndicator size="small" color={EventuColors.white} />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={24} color={EventuColors.white} />
                    <Text style={styles.validateButtonText}>Validar Ticket</Text>
                  </>
                )}
              </Pressable>

              <View style={styles.instructionsContainerManual}>
                <MaterialIcons name="info-outline" size={24} color={EventuColors.mediumGray} />
                <Text style={styles.instructionsTextManual}>
                  Ingresa el código QR del ticket para validarlo. Puedes copiar y pegar el código directamente.
                </Text>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="check-circle" size={24} color={EventuColors.magenta} />
              <Text style={styles.statNumber}>{stats.validToday}</Text>
              <Text style={styles.statLabel}>Válidos hoy</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="history" size={24} color={EventuColors.violet} />
              <Text style={styles.statNumber}>{stats.totalScans}</Text>
              <Text style={styles.statLabel}>Total escaneos</Text>
            </View>
          </View>
        </SafeAreaView>
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
    backgroundColor: '#FAFBFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
  },
  headerLeft: {
    width: 40,
    height: 40,
  },
  modeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(228, 0, 111, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    marginTop: 4,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scannerCard: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: EventuColors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scannerWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: (SCANNER_SIZE - SCANNER_SIZE * 0.75) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    position: 'absolute',
    top: (SCANNER_SIZE - SCANNER_SIZE * 0.75) / 2,
    left: 0,
    right: 0,
    height: SCANNER_SIZE * 0.75,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlaySide: {
    width: (SCANNER_SIZE - SCANNER_SIZE * 0.75) / 2,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    width: SCANNER_SIZE * 0.75,
    height: SCANNER_SIZE * 0.75,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionBox: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 4,
    borderColor: '#10B981',
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: EventuColors.magenta,
    borderWidth: 3.5,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: (SCANNER_SIZE - SCANNER_SIZE * 0.75) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  instructionsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: EventuColors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  instructionsText: {
    fontSize: 15,
    color: EventuColors.black,
    textAlign: 'center',
    fontWeight: '600',
    flex: 1,
  },
  instructionsContainerManual: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  instructionsTextManual: {
    flex: 1,
    fontSize: 14,
    color: EventuColors.mediumGray,
    lineHeight: 20,
  },
  processingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  processingText: {
    color: EventuColors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  manualContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    minHeight: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: EventuColors.black,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: EventuColors.magenta,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: EventuColors.magenta,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  validateButtonDisabled: {
    opacity: 0.6,
  },
  validateButtonText: {
    color: EventuColors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: EventuColors.black,
  },
  statLabel: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: EventuColors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: EventuColors.black,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: EventuColors.magenta,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  permissionButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
