import { EventuColors } from '@/constants/theme';
import { Shadows } from '@/constants/theme-extended';
import { useRequireStaff, useStaffPermissions } from '@/hooks/useStaffPermissions';
import { ticketsApi } from '@/services/tickets.api';
import { extractTicketIdFromBarcode, isValidBarcodeToken } from '@/utils/barcode';
import { parseQRCode, QRPayload } from '@/utils/qrCode';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ScanResult {
  type: 'qr' | 'barcode';
  data: string;
  ticketId: string | null;
  payload: QRPayload | null;
}

interface ValidationHistoryItem {
  ticketId: string;
  eventName?: string;
  validated: boolean;
  validatedAt?: string;
  validatedBy?: string;
  scannedAt?: string;
  scannedBy?: string;
  validationStatus: 'pending' | 'scanned' | 'validated' | 'rejected';
  rejectionReason?: string;
}

type TabType = 'scanner' | 'history' | 'user';

/**
 * Pantalla principal de Staff
 * Muestra el escáner y el historial completo de lecturas
 */
export default function StaffMainScreen() {
  const isAuthorized = useRequireStaff();
  const { isStaff, user } = useStaffPermissions();
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  
  // Permisos de cámara
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  
  // Estados del escáner
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  
  // Estados del historial
  const [history, setHistory] = useState<ValidationHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;

  // Función para cargar historial (declarada antes de los useEffect)
  const loadHistory = React.useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await ticketsApi.getValidationHistory({ limit: 100 });
      
      if (response.success && response.data?.history) {
        setHistory(response.data.history);
      } else {
        // Fallback a datos mock si el backend no está disponible
        const mockHistory: ValidationHistoryItem[] = [
          {
            ticketId: 'ticket-1',
            eventName: 'Concierto de Rock 2024',
            validated: true,
            validatedAt: new Date(Date.now() - 3600000).toISOString(),
            validatedBy: user?.id || 'staff-1',
            scannedAt: new Date(Date.now() - 3605000).toISOString(),
            scannedBy: user?.id || 'staff-1',
            validationStatus: 'validated',
          },
          {
            ticketId: 'ticket-2',
            eventName: 'Festival de Música 2024',
            validated: false,
            scannedAt: new Date(Date.now() - 7200000).toISOString(),
            scannedBy: user?.id || 'staff-1',
            validationStatus: 'scanned',
          },
          {
            ticketId: 'ticket-3',
            eventName: 'Evento Deportivo 2024',
            validated: false,
            scannedAt: new Date(Date.now() - 10800000).toISOString(),
            scannedBy: user?.id || 'staff-1',
            validationStatus: 'rejected',
            rejectionReason: 'Ticket duplicado',
          },
        ];
        setHistory(mockHistory);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      // En caso de error, mostrar lista vacía
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]);

  // Cargar historial al montar y cuando cambia el tab
  useEffect(() => {
    if (activeTab === 'history' && isAuthorized) {
      loadHistory();
    }
  }, [activeTab, isAuthorized, loadHistory]);

  // Animación del escáner
  useEffect(() => {
    if (activeTab === 'scanner' && isAuthorized) {
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
    }
  }, [activeTab, isAuthorized, scanAnimation]);

  // Si no está autorizado, mostrar loading
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleScan = async (data: string) => {
    if (validating || scanning) return;
    
    setScanning(true);
    setScannedData(data);
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const qrPayload = parseQRCode(data);
      
      if (qrPayload) {
        setScanResult({
          type: 'qr',
          data,
          ticketId: qrPayload.ticketId,
          payload: qrPayload,
        });
        
        await validateTicket(qrPayload.ticketId, 'scan');
        return;
      }
      
      const barcodeToken = extractTicketIdFromBarcode(data);
      
      if (barcodeToken && isValidBarcodeToken(data)) {
        setScanResult({
          type: 'barcode',
          data,
          ticketId: barcodeToken,
          payload: null,
        });
        
        await validateTicket(barcodeToken, 'scan');
        return;
      }
      
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
      return;
    }

    setValidating(true);
    
    try {
      const response = await ticketsApi.validateTicket(ticketId, action);
      
      if (response.success && response.data?.validation) {
        setValidationStatus('success');
        
        if (action === 'validate') {
          setValidationMessage('Ticket validado exitosamente');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (action === 'scan') {
          setValidationMessage('Ticket escaneado correctamente');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
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
        
        // Recargar historial después de validar
        if (activeTab === 'history') {
          loadHistory();
        }
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

  const filteredHistory = history.filter(item => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.ticketId.toLowerCase().includes(query) ||
      item.eventName?.toLowerCase().includes(query) ||
      item.validatedBy?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return '#10B981';
      case 'scanned':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return EventuColors.mediumGray;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated':
        return 'Validado';
      case 'scanned':
        return 'Escaneado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.white} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Panel Staff</Text>
            <View style={styles.staffBadge}>
              <MaterialIcons name="verified-user" size={12} color={EventuColors.white} />
              <Text style={styles.staffBadgeText}>STAFF</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'scanner' && styles.tabActive]}
            onPress={() => setActiveTab('scanner')}
          >
            <MaterialIcons
              name="qr-code-scanner"
              size={20}
              color={activeTab === 'scanner' ? EventuColors.white : EventuColors.mediumGray}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'scanner' && styles.tabTextActive,
              ]}
            >
              Escáner
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <MaterialIcons
              name="history"
              size={20}
              color={activeTab === 'history' ? EventuColors.white : EventuColors.mediumGray}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'history' && styles.tabTextActive,
              ]}
            >
              Historial
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'user' && styles.tabActive]}
            onPress={() => setActiveTab('user')}
          >
            <MaterialIcons
              name="person"
              size={20}
              color={activeTab === 'user' ? EventuColors.white : EventuColors.mediumGray}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'user' && styles.tabTextActive,
              ]}
            >
              Usuario
            </Text>
          </Pressable>
        </View>

        {/* Contenido del Tab */}
        {activeTab === 'scanner' ? (
          <View style={styles.scannerContent}>
            {/* Verificar permisos de cámara */}
            {!permission ? (
              <View style={styles.cameraPermissionContainer}>
                <ActivityIndicator size="large" color={EventuColors.magenta} />
                <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
              </View>
            ) : !permission.granted ? (
              <View style={styles.cameraPermissionContainer}>
                <MaterialIcons name="camera-alt" size={64} color={EventuColors.mediumGray} />
                <Text style={styles.permissionText}>
                  Necesitamos acceso a la cámara para escanear códigos
                </Text>
                <Pressable
                  style={styles.permissionButton}
                  onPress={requestPermission}
                >
                  <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Cámara real con escáner */}
                <View style={styles.cameraContainer}>
                  <CameraView
                    style={styles.camera}
                    facing={facing}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code93', 'code128', 'pdf417', 'itf14', 'datamatrix'],
                    }}
                    onBarcodeScanned={scanning ? undefined : (event) => {
                      if (event.data) {
                        handleScan(event.data);
                      }
                    }}
                  >
                    {/* Overlay con marco de escaneo */}
                    <View style={styles.cameraOverlay}>
                      <View style={styles.overlayTop} />
                      <View style={styles.overlayMiddle}>
                        <View style={styles.overlaySide} />
                        <View style={styles.scanArea}>
                          <View style={[styles.corner, styles.topLeft]} />
                          <View style={[styles.corner, styles.topRight]} />
                          <View style={[styles.corner, styles.bottomLeft]} />
                          <View style={[styles.corner, styles.bottomRight]} />
                          <Animated.View
                            style={[
                              styles.scanLine,
                              {
                                transform: [
                                  {
                                    translateY: scanAnimation.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0, width - 100],
                                    }),
                                  },
                                ],
                              },
                            ]}
                          />
                        </View>
                        <View style={styles.overlaySide} />
                      </View>
                      <View style={styles.overlayBottom} />
                    </View>
                  </CameraView>
                  
                  {/* Botón para cambiar cámara */}
                  <Pressable
                    style={styles.flipButton}
                    onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                  >
                    <MaterialIcons name="flip-camera-ios" size={24} color={EventuColors.white} />
                  </Pressable>
                </View>
                
                <Text style={styles.instructionText}>
                  Coloca el código QR o de barras dentro del marco
                </Text>
              </>
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

            {/* Botón de entrada manual */}
            <Pressable
              style={styles.manualButton}
              onPress={() => setShowManualInput(true)}
            >
              <MaterialIcons name="keyboard" size={20} color={EventuColors.white} />
              <Text style={styles.manualButtonText}>Ingresar código manualmente</Text>
            </Pressable>
          </View>
        ) : activeTab === 'history' ? (
          <ScrollView
            style={styles.historyContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Búsqueda */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color={EventuColors.mediumGray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por ticket, evento o staff..."
                placeholderTextColor={EventuColors.mediumGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <MaterialIcons name="close" size={20} color={EventuColors.mediumGray} />
                </Pressable>
              )}
            </View>

            {/* Lista de historial */}
            {loadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={EventuColors.magenta} />
              </View>
            ) : filteredHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="history" size={64} color={EventuColors.mediumGray} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No se encontraron resultados' : 'No hay lecturas registradas'}
                </Text>
              </View>
            ) : (
              filteredHistory.map((item, index) => (
                <View key={item.ticketId} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <View style={styles.historyItemLeft}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.validationStatus) + '20' },
                        ]}
                      >
                        <MaterialIcons
                          name={
                            item.validationStatus === 'validated'
                              ? 'check-circle'
                              : item.validationStatus === 'rejected'
                              ? 'cancel'
                              : 'qr-code-scanner'
                          }
                          size={16}
                          color={getStatusColor(item.validationStatus)}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(item.validationStatus) },
                          ]}
                        >
                          {getStatusLabel(item.validationStatus)}
                        </Text>
                      </View>
                      <Text style={styles.ticketIdText}>{item.ticketId}</Text>
                    </View>
                  </View>
                  
                  {item.eventName && (
                    <Text style={styles.eventName}>{item.eventName}</Text>
                  )}
                  
                  <View style={styles.historyItemDetails}>
                    {item.scannedAt && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="qr-code-scanner" size={14} color={EventuColors.mediumGray} />
                        <Text style={styles.detailText}>
                          Escaneado: {formatDate(item.scannedAt)}
                        </Text>
                      </View>
                    )}
                    {item.validatedAt && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="check-circle" size={14} color="#10B981" />
                        <Text style={styles.detailText}>
                          Validado: {formatDate(item.validatedAt)}
                        </Text>
                      </View>
                    )}
                    {item.validatedBy && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="person" size={14} color={EventuColors.mediumGray} />
                        <Text style={styles.detailText}>
                          Por: {item.validatedBy}
                        </Text>
                      </View>
                    )}
                    {item.rejectionReason && (
                      <View style={styles.detailRow}>
                        <MaterialIcons name="error" size={14} color="#EF4444" />
                        <Text style={[styles.detailText, { color: '#EF4444' }]}>
                          {item.rejectionReason}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView style={styles.userContent}>
            {/* Información del usuario */}
            <View style={styles.userSection}>
              <View style={styles.userAvatarContainer}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <LinearGradient
                    colors={[EventuColors.magenta, EventuColors.violet]}
                    style={styles.userAvatarPlaceholder}
                  >
                    <MaterialIcons name="person" size={40} color={EventuColors.white} />
                  </LinearGradient>
                )}
                <View style={styles.staffBadgeLarge}>
                  <MaterialIcons name="verified-user" size={16} color={EventuColors.white} />
                  <Text style={styles.staffBadgeTextLarge}>STAFF</Text>
                </View>
              </View>
              
              <Text style={styles.userName}>{user?.name || 'Usuario Staff'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'staff@eventu.co'}</Text>
              <Text style={styles.userRole}>
                {user?.role === 'admin' ? 'Administrador' : 'Personal Autorizado'}
              </Text>
            </View>

            {/* Opciones de gestión */}
            <View style={styles.userOptionsSection}>
              <Text style={styles.sectionTitle}>Gestión de Usuario</Text>
              
              <Pressable
                style={styles.optionItem}
                onPress={() => router.push('/profile/edit')}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: EventuColors.magenta + '20' }]}>
                    <MaterialIcons name="edit" size={20} color={EventuColors.magenta} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Editar Perfil</Text>
                    <Text style={styles.optionSubtitle}>Actualizar información personal</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={EventuColors.mediumGray} />
              </Pressable>

              <Pressable
                style={styles.optionItem}
                onPress={() => router.push('/settings/security')}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: EventuColors.violet + '20' }]}>
                    <MaterialIcons name="lock" size={20} color={EventuColors.violet} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Seguridad</Text>
                    <Text style={styles.optionSubtitle}>Contraseña y autenticación</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={EventuColors.mediumGray} />
              </Pressable>

              <Pressable
                style={styles.optionItem}
                onPress={() => router.push('/settings/notifications')}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: EventuColors.hotPink + '20' }]}>
                    <MaterialIcons name="notifications" size={20} color={EventuColors.hotPink} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Notificaciones</Text>
                    <Text style={styles.optionSubtitle}>Configurar alertas</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={EventuColors.mediumGray} />
              </Pressable>

              <Pressable
                style={styles.optionItem}
                onPress={() => router.push('/help')}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.optionIcon, { backgroundColor: EventuColors.mediumGray + '20' }]}>
                    <MaterialIcons name="help-outline" size={20} color={EventuColors.mediumGray} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Ayuda y Soporte</Text>
                    <Text style={styles.optionSubtitle}>Centro de ayuda</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={EventuColors.mediumGray} />
              </Pressable>
            </View>

            {/* Estadísticas del staff */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Estadísticas de Hoy</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialIcons name="qr-code-scanner" size={24} color={EventuColors.magenta} />
                  <Text style={styles.statValue}>
                    {history.filter(h => h.scannedAt && new Date(h.scannedAt).toDateString() === new Date().toDateString()).length}
                  </Text>
                  <Text style={styles.statLabel}>Escaneados</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  <Text style={styles.statValue}>
                    {history.filter(h => h.validated && h.validatedAt && new Date(h.validatedAt).toDateString() === new Date().toDateString()).length}
                  </Text>
                  <Text style={styles.statLabel}>Validados</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialIcons name="cancel" size={24} color="#EF4444" />
                  <Text style={styles.statValue}>
                    {history.filter(h => h.validationStatus === 'rejected' && h.scannedAt && new Date(h.scannedAt).toDateString() === new Date().toDateString()).length}
                  </Text>
                  <Text style={styles.statLabel}>Rechazados</Text>
                </View>
              </View>
            </View>
          </ScrollView>
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
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: EventuColors.magenta,
  },
  tabText: {
    color: EventuColors.mediumGray,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: EventuColors.white,
  },
  scannerContent: {
    flex: 1,
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 24,
  },
  permissionText: {
    color: EventuColors.white,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  permissionButton: {
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: width - 80,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: width - 80,
    height: width - 80,
    position: 'relative',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  flipButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 20,
    opacity: 0.9,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 20,
  },
  manualButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  historyContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: EventuColors.white,
    fontSize: 16,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyItemLeft: {
    flex: 1,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventName: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyItemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: EventuColors.mediumGray,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: EventuColors.mediumGray,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
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
  userContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  userAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  userAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: EventuColors.magenta,
  },
  userAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffBadgeLarge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: EventuColors.hotPink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: EventuColors.black,
  },
  staffBadgeTextLarge: {
    color: EventuColors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  userName: {
    color: EventuColors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: EventuColors.mediumGray,
    fontSize: 16,
    marginBottom: 8,
  },
  userRole: {
    color: EventuColors.magenta,
    fontSize: 14,
    fontWeight: '600',
  },
  userOptionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: EventuColors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    color: EventuColors.mediumGray,
    fontSize: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    color: EventuColors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: EventuColors.mediumGray,
    fontSize: 12,
    textAlign: 'center',
  },
});

