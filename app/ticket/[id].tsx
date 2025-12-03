import { EventuColors } from '@/constants/theme';
import { Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { mockTickets } from '@/services/mockTickets';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Crypto from 'expo-crypto';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

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
  const { isAuthenticated } = useAuth();
  const ticketId = Array.isArray(id) ? id[0] : id;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState<number>(15);
  const [timeRemaining, setTimeRemaining] = useState<number>(15);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const qrRefreshIntervalRef = useRef<number | null>(null);

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

  const isAvailable = ticket ? isEventDay(ticket.date) : false;
  
  useEffect(() => {
    if (ticket && !isAvailable) {
      
    }
  }, [ticket, isAvailable]);

  useEffect(() => {
    const generateQR = async (force = false) => {
      if (!ticket || !isAvailable) return;
      if (!force && qrToken && timeRemaining > 0) return;

      try {
        setQrLoading(true);
        
        const qrData = JSON.stringify({
          ticketId: ticket.id,
          eventId: ticket.eventId,
          eventName: ticket.eventName,
          date: ticket.date,
          timestamp: Date.now(),
        });
        
        const qrHash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          qrData
        );
        
        setQrToken(qrHash);
        setTokens([qrHash]);
        setTimeRemaining(expiresIn);
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

    if (isAvailable) {
      generateQR(true);
    }

    return () => {
      if (qrRefreshIntervalRef.current) {
        clearInterval(qrRefreshIntervalRef.current);
      }
    };
  }, [ticket, isAvailable]);

  useEffect(() => {
    if (!isAvailable || !ticket) return;

    if (qrRefreshIntervalRef.current) {
      clearInterval(qrRefreshIntervalRef.current);
    }

    const interval = setInterval(async () => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          const generateNewQR = async () => {
            setQrLoading(true);
            const qrData = JSON.stringify({
              ticketId: ticket.id,
              eventId: ticket.eventId,
              eventName: ticket.eventName,
              date: ticket.date,
              timestamp: Date.now(),
            });
            
            const qrHash = await Crypto.digestStringAsync(
              Crypto.CryptoDigestAlgorithm.SHA256,
              qrData
            );
            
            setQrToken(qrHash);
            setTokens([qrHash]);
            setQrLoading(false);
          };
          generateNewQR();
          return expiresIn;
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
  }, [isAvailable, ticket, expiresIn]);

  const ticketQuantity = ticket?.quantity || 1;
  
  const individualTickets = useMemo(() => {
    if (!ticket) return [];
    
    return Array.from({ length: ticketQuantity }, (_, index) => ({
      ...ticket,
      ticketNumber: index + 1,
      uniqueId: `${ticket.id}-${index + 1}`,
      image: require('@/assets/images/react-logo.png'), 
    }));
  }, [ticket, ticketQuantity]);

  ScreenCapture.usePreventScreenCapture();

  const generateQRPayload = (ticketIndex: number) => {
    if (!qrToken || !ticket) return '';
    
    return JSON.stringify({
      type: 'eventu_ticket',
      ticketId: ticket.id,
      token: qrToken,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
    });
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

  const renderTicket = (ticketItem: any, index: number) => (
    <View key={ticketItem.uniqueId} style={styles.ticketCardWrapper}>
      <View style={styles.ticketCard}>
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
          <Text style={styles.eventTitle}>{ticketItem.eventName}</Text>
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
                <Text style={styles.detailValue}>{ticketItem.venue}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Asiento</Text>
                <Text style={styles.detailValue}>{ticketItem.seat}</Text>
              </View>
            </View>
          </View>

          {}
          {isAvailable ? (
            <View style={styles.qrContainer}>
              {qrLoading ? (
                <View style={styles.unavailableMessage}>
                  <ActivityIndicator size="large" color={EventuColors.magenta} />
                  <Text style={styles.unavailableText}>
                    Generando código QR...
                  </Text>
                </View>
              ) : qrToken ? (
                <QRCode
                  value={generateQRPayload(index)}
                  size={160}
                  color="#000"
                  backgroundColor="#fff"
                />
              ) : (
                <View style={styles.unavailableMessage}>
                  <MaterialIcons name="error-outline" size={48} color={EventuColors.mediumGray} />
                  <Text style={styles.unavailableText}>
                    No se pudo generar el código QR
                  </Text>
                </View>
              )}
            </View>
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
      </View>
    </View>
  );

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
    borderWidth: 1,
    borderColor: EventuColors.lightGray,
    ...Shadows.lg,
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
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
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
});
