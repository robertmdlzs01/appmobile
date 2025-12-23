import { EventuColors } from '@/constants/theme';
import { Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useTicketValidation } from '@/hooks/useTicketValidation';
import { mockTickets } from '@/services/mockTickets';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Crypto from 'expo-crypto';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { QRCodeDisplay } from '@/components/qr-code-display';
import { generateQRPayload, generateDynamicQR, QRPayload } from '@/utils/qrCode';

interface Ticket {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  time: string;
  venue?: string;
  location: string;
  seat: string;
  quantity?: number;
  price: number;
  status: 'active' | 'used' | 'cancelled';
  qrToken?: string;
}

const { width } = Dimensions.get('window');

function isEventDay(eventDate: string): boolean {
  try {
    
    let eventDateObj: Date;
    
    if (eventDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = eventDate.split('-').map(Number);
      eventDateObj = new Date(year, month - 1, day); 
    } else {
      eventDateObj = new Date(eventDate);
    }
    
    const today = new Date();
    
    const eventDateOnly = new Date(
      eventDateObj.getFullYear(), 
      eventDateObj.getMonth(), 
      eventDateObj.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(), 
      today.getMonth(), 
      today.getDate()
    );
    
    return eventDateOnly.getTime() === todayOnly.getTime();
  } catch (error) {
    console.error('Error parsing event date:', error);
    return false;
  }
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const { isAuthenticated, user } = useAuth();
  const ticketId = Array.isArray(id) ? id[0] : id;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState<number>(10); 
  const [timeRemaining, setTimeRemaining] = useState<number>(10); 
  const [isQRStatic, setIsQRStatic] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const qrRefreshIntervalRef = useRef<number | null>(null);
  const generatedQRTokensRef = useRef<Set<string>>(new Set()); 
  
  
  const isAvailable = ticket ? isEventDay(ticket.date) : false;
  const { validation, loading: validationLoading } = useTicketValidation(ticketId, isAvailable);
  const validationAnimation = useRef(new Animated.Value(0)).current;
  const [wasValidated, setWasValidated] = useState(false);
  
  
  
  
  
  const generateUniqueQR = (): string => {
    if (!ticket) return '';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const counter = generatedQRTokensRef.current.size;
    let uniqueToken = `${ticket.id}|${timestamp}|${random}|${counter}`;
    let attempts = 0;
    while (generatedQRTokensRef.current.has(uniqueToken) && attempts < 10) {
      const extraRandom = Math.random().toString(36).substring(2, 9);
      uniqueToken = `${ticket.id}|${timestamp}|${random}|${counter}|${extraRandom}|${attempts}`;
      attempts++;
    }
    generatedQRTokensRef.current.add(uniqueToken);
    if (generatedQRTokensRef.current.size > 1000) {
      const tokensArray = Array.from(generatedQRTokensRef.current);
      const tokensToKeep = tokensArray.slice(-500); 
      generatedQRTokensRef.current = new Set(tokensToKeep);
    }  
    return uniqueToken;
  };
  
  useEffect(() => {
    const loadTicket = async () => {
      if (!isAuthenticated || !ticketId) {
        setLoading(false);
        setError('ID de ticket no válido');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        const foundTicket = mockTickets.find(t => t.id === ticketId);
        if (foundTicket) {
          setTicket({
            id: foundTicket.id,
            eventId: foundTicket.eventId,
            eventName: foundTicket.eventName,
            date: foundTicket.date,
            time: foundTicket.time,
            venue: foundTicket.venue,
            location: foundTicket.location,
            seat: foundTicket.seat,
            quantity: foundTicket.quantity,
            price: foundTicket.price,
            status: foundTicket.status,
          });
        } else {
          setError('Ticket no encontrado');
        }
      } catch (err: any) {
        console.error('Error loading ticket:', err);
        setError(err.message || 'Error al cargar el ticket');
        
        const foundTicket = mockTickets.find(t => t.id === ticketId);
        if (foundTicket) {
          setTicket({
            id: foundTicket.id,
            eventId: foundTicket.eventId,
            eventName: foundTicket.eventName,
            date: foundTicket.date,
            time: foundTicket.time,
            venue: foundTicket.venue,
            location: foundTicket.location,
            seat: foundTicket.seat,
            quantity: foundTicket.quantity,
            price: foundTicket.price,
            status: foundTicket.status,
          });
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId, isAuthenticated]);

  
  useEffect(() => {
    if (validation?.validated && !wasValidated) {
      setWasValidated(true);
      setIsQRStatic(true);
      
      if (qrRefreshIntervalRef.current) {
        clearInterval(qrRefreshIntervalRef.current);
        qrRefreshIntervalRef.current = null;
      }
      
      Animated.sequence([
        Animated.timing(validationAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(validationAnimation, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(validationAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      
      Alert.alert(
        '✅ Ticket Validado',
        'Tu ticket ha sido validado exitosamente. Ya puedes ingresar al evento.',
        [{ text: 'Entendido', style: 'default' }],
        { cancelable: false }
      );
    }
  }, [validation?.validated, wasValidated]);

  useEffect(() => {
    const generateQR = async (force = false) => {
      if (!ticket || !isAvailable) return;
      
      if (validation?.validated) return;
      if (!force && qrToken && timeRemaining > 0) return;

      try {
        setQrLoading(true);
        
        
        const uniqueQR = generateUniqueQR();
        setQrToken(uniqueQR);
        setTokens([uniqueQR]);
        setTimeRemaining(10); 
        setError(null);
      } catch (err: any) {
        console.error('Error generating QR:', err);
        if (err.code !== 'TICKET_NOT_AVAILABLE_YET') {
          Alert.alert('Error', err.message || 'No se pudo generar el código QR');
        }
      } finally {
        setQrLoading(false);
      }
    };

    if (isAvailable && !validation?.validated) {
      generateQR(true);
    }

    return () => {
      if (qrRefreshIntervalRef.current) {
        clearInterval(qrRefreshIntervalRef.current);
      }
    };
  }, [ticket, isAvailable, validation?.validated]);

  
  useEffect(() => {
    
    if (validation?.validated) {
      if (qrRefreshIntervalRef.current) {
        clearInterval(qrRefreshIntervalRef.current);
        qrRefreshIntervalRef.current = null;
      }
      return;
    }

    if (!isAvailable || !ticket) return;

    if (qrRefreshIntervalRef.current) {
      clearInterval(qrRefreshIntervalRef.current);
    }

    const interval = setInterval(async () => {
      
      if (validation?.validated) {
        clearInterval(interval);
        qrRefreshIntervalRef.current = null;
        return;
      }

      
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          
          const uniqueQR = generateUniqueQR();
          setQrToken(uniqueQR);
          setTokens([uniqueQR]);
          return 10; 
        }
        return prev - 1;
      });
    }, 1000); 

    qrRefreshIntervalRef.current = interval;

    return () => {
      if (qrRefreshIntervalRef.current) {
        clearInterval(qrRefreshIntervalRef.current);
      }
    };
  }, [isAvailable, ticket, validation?.validated]);

  const ticketQuantity = ticket?.quantity || 1;
  
  const parseSeatNumber = (seatString: string, ticketIndex: number, totalQuantity: number): string => {
    if (!seatString || totalQuantity <= 1) return seatString;
    
    const rangePatterns = [
      { pattern: /Asiento\s+(\d+)\s*[-–]\s*(\d+)/i, replace: 'Asiento' },
      { pattern: /Asiento\s+(\d+)\s+al\s+(\d+)/i, replace: 'Asiento' },
      { pattern: /(\d+)\s*[-–]\s*(\d+)(?!\s*[a-zA-Z])/, replace: '' }, 
    ];
    
    for (const { pattern, replace } of rangePatterns) {
      const match = seatString.match(pattern);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        if (!isNaN(start) && !isNaN(end) && start <= end && ticketIndex < (end - start + 1)) {
          const seatNumber = start + ticketIndex;
          
          if (replace) {
            return seatString.replace(pattern, `${replace} ${seatNumber}`);
          } else {
            return seatString.replace(pattern, `${seatNumber}`);
          }
        }
      }
    }
    
    return seatString;
  };
  
  const individualTickets = useMemo(() => {
    if (!ticket) return [];
    
    return Array.from({ length: ticketQuantity }, (_, index) => {
      const individualSeat = parseSeatNumber(ticket.seat, index, ticketQuantity);
      const entranceGate = (ticket as any).entranceGate || 'Principal';
      
      return {
        ...ticket,
        ticketNumber: index + 1,
        uniqueId: `${ticket.id}-${index + 1}`,
        seat: individualSeat,
        entranceGate,
        image: require('@/assets/images/react-logo.png'), 
      };
    });
  }, [ticket, ticketQuantity]);

  
  
  useScreenCapture(true);

  const getQRPayload = (ticketIndex: number): string => {
    if (!qrToken || !ticket) return '';
    
    
    
    
    
    return qrToken;
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / (width - 40));
    setCurrentTicketIndex(pageIndex);
  };

  const formatTicketDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatTicketTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const formatValidationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Hace unos segundos';
      if (diffMins === 1) return 'Hace 1 minuto';
      if (diffMins < 60) return `Hace ${diffMins} minutos`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) return 'Hace 1 hora';
      return `Hace ${diffHours} horas`;
    } catch {
      return dateStr;
    }
  };

  const handleShareImage = async () => {
    if (!ticket) return;
    
    try {
      const currentTicket = individualTickets[currentTicketIndex];
      const venueName = (ticket as any).venue || ticket.location || 'No especificado';
      const shareMessage = `Ticket ${currentTicket?.ticketNumber || 1} de ${ticketQuantity} - ${ticket.eventName}\nFecha: ${formatTicketDate(ticket.date)}\nHora: ${ticket.time}\nLugar: ${venueName}`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareMessage);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderTicket = (ticketItem: any, index: number) => {
    const isValidated = validation?.validated || false;
    const isScanned = validation?.validationStatus === 'scanned' || validation?.validationStatus === 'validated';
    const validationStatus = validation?.validationStatus || 'pending';
    
    return (
      <View key={ticketItem.uniqueId} style={styles.ticketCardWrapper}>
        <Animated.View 
          style={[
            styles.ticketCard,
            isValidated && {
              borderColor: '#10B981',
              borderWidth: 2,
              transform: [{
                scale: validationAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02],
                }),
              }],
            },
            isScanned && !isValidated && {
              borderColor: '#F59E0B',
              borderWidth: 2,
            },
          ]}
        >
          {}
          {isValidated && (
            <Animated.View 
              style={[
                styles.validationBadge,
                {
                  opacity: validationAnimation,
                  transform: [{
                    scale: validationAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  }],
                },
              ]}
            >
              <MaterialIcons name="check-circle" size={24} color="#10B981" />
              <Text style={styles.validationBadgeText}>Validado</Text>
            </Animated.View>
          )}
          
          {isScanned && !isValidated && (
            <View style={styles.scannedBadge}>
              <MaterialIcons name="qr-code-scanner" size={20} color="#F59E0B" />
              <Text style={styles.scannedBadgeText}>Escaneado</Text>
            </View>
          )}

          {}
          <View style={styles.imageContainer}>
            <View style={styles.artistImageWrapper}>
              <View style={styles.artistImage}>
                <Image 
                  source={ticketItem.image} 
                  style={styles.artistImageContent}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {}
          <View style={styles.ticketInfo}>
            <Text style={styles.eventTitle} numberOfLines={2} ellipsizeMode="tail">
              {ticketItem.eventName}
            </Text>
            {ticketQuantity > 1 && (
              <Text style={styles.ticketNumber}>Boleto {ticketItem.ticketNumber} de {ticketQuantity}</Text>
            )}
            <View style={styles.dateTimeRow}>
              <Text style={styles.eventDate}>{formatTicketDate(ticketItem.date)}</Text>
              <Text style={styles.eventTime}>{formatTicketTime(ticketItem.time)}</Text>
            </View>

            {}
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Lugar</Text>
                  <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="tail">
                    {ticketItem.venue || ticketItem.location}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Asiento</Text>
                  <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="tail">
                    {ticketItem.seat}
                  </Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Puerta de Entrada</Text>
                  <Text style={styles.detailValue}>
                    {(ticketItem as any).entranceGate || 'Principal'}
                  </Text>
                </View>
              </View>
            </View>

            {}
            {isAvailable && validation && (
              <View style={styles.validationStatusContainer}>
                {validationStatus === 'validated' && validation.validatedAt && (
                  <View style={styles.validationStatusRow}>
                    <MaterialIcons name="verified" size={18} color="#10B981" />
                    <Text style={styles.validationStatusText}>
                      Validado {formatValidationTime(validation.validatedAt)}
                    </Text>
                  </View>
                )}
                {validationStatus === 'scanned' && validation.scannedAt && (
                  <View style={styles.validationStatusRow}>
                    <MaterialIcons name="qr-code-scanner" size={18} color="#F59E0B" />
                    <Text style={styles.validationStatusText}>
                      Escaneado {formatValidationTime(validation.scannedAt)} - En validación
                    </Text>
                  </View>
                )}
                {validationStatus === 'pending' && (
                  <View style={styles.validationStatusRow}>
                    <MaterialIcons name="schedule" size={18} color={EventuColors.mediumGray} />
                    <Text style={styles.validationStatusText}>
                      Esperando validación
                    </Text>
                  </View>
                )}
              </View>
            )}

            {}
            {isValidated && (
              <View style={styles.validatedBanner}>
                <MaterialIcons name="verified" size={24} color="#10B981" />
                <View style={styles.validatedBannerText}>
                  <Text style={styles.validatedBannerTitle}>Ticket Validado</Text>
                  <Text style={styles.validatedBannerSubtitle}>
                    Este código ya fue escaneado y validado
                  </Text>
                </View>
              </View>
            )}

            {}
            {isAvailable ? (
              <>
                <View style={[
                  styles.qrContainer,
                  isValidated && styles.qrContainerValidated,
                  isScanned && !isValidated && styles.qrContainerScanned,
                ]}>
                  {qrLoading ? (
                    <View style={styles.unavailableMessage}>
                      <ActivityIndicator size="large" color={EventuColors.magenta} />
                      <Text style={styles.unavailableText}>
                        Generando código QR...
                      </Text>
                    </View>
                  ) : qrToken ? (
                    <View style={styles.qrWrapper}>
                      <Animated.View
                        style={[
                          styles.qrCodeContainer,
                          isValidated && {
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderColor: '#10B981',
                            borderWidth: 3,
                            borderRadius: 16,
                            padding: 8,
                            transform: [{
                              scale: validationAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.05],
                              }),
                            }],
                          },
                          isScanned && !isValidated && {
                            borderColor: '#F59E0B',
                            borderWidth: 2,
                            borderRadius: 16,
                            padding: 4,
                          },
                        ]}
                      >
                        {isValidated && (
                          <Animated.View 
                            style={[
                              styles.qrOverlay,
                              {
                                opacity: validationAnimation,
                                transform: [{
                                  scale: validationAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.9, 1],
                                  }),
                                }],
                              }
                            ]}
                          >
                            <View style={styles.qrOverlayContent}>
                              <MaterialIcons name="check-circle" size={56} color="#10B981" />
                              <Text style={styles.qrOverlayText}>Validado</Text>
                              <Text style={styles.qrOverlaySubtext}>Este código ya fue usado</Text>
                            </View>
                            {}
                            <Animated.View 
                              style={[
                                styles.qrDiagonalLine,
                                {
                                  opacity: validationAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.6],
                                  }),
                                }
                              ]}
                            />
                          </Animated.View>
                        )}
                        <View style={isValidated && styles.qrDisabledContainer}>
                          <QRCodeDisplay
                            payload={getQRPayload(index) || ''}
                            size={160}
                            validated={isValidated}
                            scanned={isScanned && !isValidated}
                          />
                          {isValidated && (
                            <Animated.View 
                              style={[
                                styles.qrDisabledOverlay,
                                {
                                  opacity: validationAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 0.4],
                                  }),
                                }
                              ]}
                            />
                          )}
                        </View>
                      </Animated.View>
                    </View>
                  ) : (
                    <View style={styles.unavailableMessage}>
                      <MaterialIcons name="error-outline" size={48} color={EventuColors.mediumGray} />
                      <Text style={styles.unavailableText}>
                        No se pudo generar el código QR
                      </Text>
                    </View>
                  )}
                </View>
                
              </>
            ) : (
              <View style={styles.qrContainer}>
                <View style={styles.unavailableMessage}>
                  <MaterialIcons name="schedule" size={48} color={EventuColors.mediumGray} />
                  <Text style={styles.unavailableText}>
                    Disponible el día del evento
                  </Text>
                  <Text style={styles.unavailableSubtext}>
                    {formatTicketDate(ticketItem.date)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {}
          <View style={styles.circleLeft} />
          <View style={styles.circleRight} />
        </Animated.View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#FFF5FB', '#F5F0FF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <View style={styles.iconButtonInner}>
                <MaterialIcons name="arrow-back" size={24} color={EventuColors.magenta} />
              </View>
            </Pressable>
            <Text style={styles.headerTitle}>Tickets</Text>
            <View style={styles.iconButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={EventuColors.magenta} />
            <Text style={styles.loadingText}>Cargando ticket...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#FFF5FB', '#F5F0FF', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <View style={styles.iconButtonInner}>
                <MaterialIcons name="arrow-back" size={24} color={EventuColors.magenta} />
              </View>
            </Pressable>
            <Text style={styles.headerTitle}>Tickets</Text>
            <View style={styles.iconButton} />
          </View>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={64} color={EventuColors.mediumGray} />
            <Text style={styles.errorText}>{error || 'Ticket no encontrado'}</Text>
            <Pressable style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>Volver</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5FB', '#F5F0FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <View style={styles.iconButtonInner}>
              <MaterialIcons name="arrow-back" size={24} color={EventuColors.magenta} />
            </View>
          </Pressable>
          <Text style={styles.headerTitle}>Tickets</Text>
          <View style={styles.iconButton} />
        </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        {ticketQuantity > 1 ? (
          <>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              style={styles.carouselContainer}
              contentContainerStyle={styles.carouselContent}
            >
              {individualTickets.map((ticketItem, index) => renderTicket(ticketItem, index))}
            </ScrollView>
            
            {}
            <View style={styles.paginationContainer}>
              {individualTickets.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentTicketIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          individualTickets.length > 0 && renderTicket(individualTickets[0], 0)
        )}

        {}
        {individualTickets.length > 0 && (
          <Pressable style={styles.shareButton} onPress={handleShareImage}>
            <MaterialIcons name="share" size={20} color={EventuColors.white} />
            <Text style={styles.shareButtonText}>Compartir Boleto</Text>
          </Pressable>
        )}
      </ScrollView>
      </LinearGradient>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconButtonInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(228, 0, 111, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: EventuColors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 100,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  carouselContainer: {
    marginBottom: 16,
  },
  carouselContent: {
    paddingHorizontal: 0,
  },
  ticketCardWrapper: {
    width: width - 40,
    paddingHorizontal: 0,
  },
  ticketCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadows.lg,
    shadowColor: EventuColors.magenta,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 10,
  },
  imageContainer: {
    backgroundColor: 'rgba(228, 0, 111, 0.05)',
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistImageWrapper: {
    width: 180,
    height: 180,
    borderRadius: 20,
    backgroundColor: EventuColors.white,
    padding: 4,
    transform: [{ rotate: '-3deg' }],
    ...Shadows.lg,
  },
  artistImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: EventuColors.lightGray,
    overflow: 'hidden',
  },
  artistImageContent: {
    width: '100%',
    height: '100%',
  },
  ticketInfo: {
    padding: 24,
    paddingTop: 28,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: EventuColors.black,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
    lineHeight: 26,
  },
  ticketNumber: {
    fontSize: 12,
    color: EventuColors.hotPink,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  eventDate: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  eventTime: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  detailsGrid: {
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 120,
    maxWidth: 160,
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    marginBottom: 6,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    textAlign: 'center',
  },
  qrContainer: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unavailableMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.mediumGray,
    textAlign: 'center',
  },
  unavailableSubtext: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    textAlign: 'center',
  },
  circleLeft: {
    position: 'absolute',
    left: -15,
    top: '52%',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF5FB',
  },
  circleRight: {
    position: 'absolute',
    right: -15,
    top: '52%',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF5FB',
  },
  shareButton: {
    width: '100%',
    backgroundColor: EventuColors.error,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Shadows.md,
  },
  shareButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: EventuColors.lightGray,
  },
  paginationDotActive: {
    backgroundColor: EventuColors.hotPink,
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: EventuColors.mediumGray,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: EventuColors.magenta,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  validationBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    ...Shadows.md,
  },
  validationBadgeText: {
    color: EventuColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  scannedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    ...Shadows.md,
  },
  scannedBadgeText: {
    color: EventuColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  validationStatusContainer: {
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  validationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationStatusText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  qrContainerValidated: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  qrContainerScanned: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  qrWrapper: {
    position: 'relative',
  },
  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    zIndex: 2,
    overflow: 'hidden',
  },
  qrOverlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 3,
  },
  qrOverlayText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  qrOverlaySubtext: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.8,
  },
  qrDiagonalLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 3,
    borderTopColor: '#10B981',
    borderRightWidth: 3,
    borderRightColor: '#10B981',
    transform: [{ rotate: '45deg' }, { scaleX: 1.5 }],
    zIndex: 1,
  },
  qrDisabledContainer: {
    position: 'relative',
  },
  qrDisabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    zIndex: 1,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  validatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  validatedBannerText: {
    flex: 1,
  },
  validatedBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  validatedBannerSubtitle: {
    fontSize: 13,
    color: '#10B981',
    opacity: 0.8,
  },
});
