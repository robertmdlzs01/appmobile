import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function PaymentMethodsScreen() {
  const [selectedCard, setSelectedCard] = useState('visa');

  const paymentCards = [
    {
      id: 'visa',
      type: 'VISA',
      name: 'Alex Parkinson',
      lastDigits: '8756',
      expiryDate: '12/25',
      isPrimary: true,
    },
    {
      id: 'mastercard',
      type: 'Mastercard',
      name: 'Alex Parkinson',
      lastDigits: '8756',
      expiryDate: '09/24',
      isPrimary: false,
    },
  ];

  const handleSetPrimary = (cardId: string) => {
    
    console.log('Set primary:', cardId);
  };

  const handleDeleteCard = (cardId: string) => {
    
    console.log('Delete card:', cardId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Métodos de Pago</Text>
          <Pressable style={styles.iconButton} onPress={() => router.push('/profile/add-card')}>
            <MaterialIcons name="add" size={24} color={EventuColors.hotPink} />
          </Pressable>
        </View>

        {}
        <View style={styles.section}>
          {paymentCards.map((card) => (
            <View key={card.id} style={styles.cardContainer}>
              <Pressable
                style={[
                  styles.paymentCard,
                  selectedCard === card.id && styles.paymentCardSelected,
                ]}
                onPress={() => setSelectedCard(card.id)}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.cardLogo}>
                    {card.type === 'VISA' ? (
                      <Text style={styles.visaText}>VISA</Text>
                    ) : (
                      <View style={styles.mastercardLogo}>
                        <View style={styles.mastercardCircle1} />
                        <View style={styles.mastercardCircle2} />
                      </View>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardNumber}>**** {card.lastDigits}</Text>
                    <Text style={styles.cardExpiry}>Exp. {card.expiryDate}</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  {card.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>Principal</Text>
                    </View>
                  )}
                  {selectedCard === card.id && (
                    <View style={styles.checkCircle}>
                      <MaterialIcons name="check" size={16} color={EventuColors.white} />
                    </View>
                  )}
                </View>
              </Pressable>

              {}
              <View style={styles.cardActions}>
                {!card.isPrimary && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleSetPrimary(card.id)}
                  >
                    <MaterialIcons name="star-outline" size={18} color={EventuColors.mediumGray} />
                    <Text style={styles.actionText}>Establecer como principal</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleDeleteCard(card.id)}
                >
                  <MaterialIcons name="delete-outline" size={18} color={EventuColors.error} />
                  <Text style={[styles.actionText, { color: EventuColors.error }]}>
                    Eliminar tarjeta
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {}
        <View style={styles.addCardSection}>
          <Pressable
            style={styles.addCardButton}
            onPress={() => router.push('/profile/add-card')}
          >
            <LinearGradient
              colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addCardGradient}
            >
              <MaterialIcons name="add" size={24} color={EventuColors.white} />
              <Text style={styles.addCardText}>Agregar Nueva Tarjeta</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {}
        <View style={styles.securityMessage}>
          <MaterialIcons name="lock" size={20} color={EventuColors.success} />
          <Text style={styles.securityText}>
            Tus métodos de pago están protegidos y encriptados
          </Text>
        </View>
      </ScrollView>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cardContainer: {
    marginBottom: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: EventuColors.white,
    ...Shadows.sm,
  },
  paymentCardSelected: {
    borderColor: EventuColors.hotPink,
    backgroundColor: EventuColors.hotPink + '08',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardLogo: {
    width: 50,
    height: 36,
    backgroundColor: EventuColors.black,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visaText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  mastercardLogo: {
    width: 50,
    height: 36,
    backgroundColor: EventuColors.black,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  mastercardCircle1: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EB001B',
    position: 'absolute',
    left: 10,
  },
  mastercardCircle2: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5F00',
    position: 'absolute',
    right: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: EventuColors.mediumGray,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 11,
    color: EventuColors.success,
    fontWeight: '600',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: EventuColors.hotPink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    fontWeight: '500',
  },
  addCardSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addCardButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66',
  },
  addCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addCardText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  securityMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginBottom: 100,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: EventuColors.success,
    lineHeight: 18,
  },
});
