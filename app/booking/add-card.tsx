import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router, useLocalSearchParams } from 'expo-router';
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
  TextInput,
  View,
} from 'react-native';

export default function AddCardScreen() {
  const params = useLocalSearchParams();
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleAddCard = () => {
    
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert('Por favor completa todos los campos');
      return;
    }

    router.back();
  };

  const formatCardNumber = (text: string) => {
    
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      setCvv(cleaned);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Agregar Tarjeta</Text>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.cardPreview}>
          <LinearGradient
            colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <View style={styles.chipIcon}>
                  <MaterialIcons name="credit-card" size={32} color={EventuColors.white} />
                </View>
                <MaterialIcons name="wifi" size={24} color={EventuColors.white} />
              </View>
              <View style={styles.cardMiddle}>
                <Text style={styles.cardNumberPreview}>
                  {cardNumber || '•••• •••• •••• ••••'}
                </Text>
              </View>
              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardLabel}>Titular</Text>
                  <Text style={styles.cardNamePreview}>
                    {cardName || 'TU NOMBRE'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>Vence</Text>
                  <Text style={styles.cardExpiryPreview}>
                    {expiryDate || 'MM/YY'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Tarjeta</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={EventuColors.mediumGray}
                keyboardType="number-pad"
                maxLength={19}
              />
              <MaterialIcons name="credit-card" size={20} color={EventuColors.mediumGray} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Titular</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={cardName}
                onChangeText={setCardName}
                placeholder="John Doe"
                placeholderTextColor={EventuColors.mediumGray}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Fecha de Vencimiento</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  placeholder="MM/YY"
                  placeholderTextColor={EventuColors.mediumGray}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="123"
                  placeholderTextColor={EventuColors.mediumGray}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => setIsDefault(!isDefault)}
          >
            <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
              {isDefault && (
                <MaterialIcons name="check" size={16} color={EventuColors.white} />
              )}
            </View>
            <Text style={styles.checkboxText}>Establecer como método de pago predeterminado</Text>
          </Pressable>
        </View>

        {}
        <View style={styles.securityMessage}>
          <MaterialIcons name="lock" size={20} color={EventuColors.success} />
          <Text style={styles.securityText}>
            Tu información de pago está segura y encriptada
          </Text>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomContainer}>
        <Pressable style={styles.addButton} onPress={handleAddCard}>
          <LinearGradient
            colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Agregar Tarjeta</Text>
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
  cardPreview: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  cardGradient: {
    padding: 24,
    minHeight: 200,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipIcon: {
    width: 48,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMiddle: {
    marginVertical: 20,
  },
  cardNumberPreview: {
    fontSize: 24,
    fontWeight: 'bold',
    color: EventuColors.white,
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  cardNamePreview: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.white,
    textTransform: 'uppercase',
  },
  cardExpiryPreview: {
    fontSize: 16,
    fontWeight: '600',
    color: EventuColors.white,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...Shadows.sm,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: EventuColors.black,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: EventuColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: EventuColors.hotPink,
    borderColor: EventuColors.hotPink,
  },
  checkboxText: {
    fontSize: 14,
    color: EventuColors.black,
    fontWeight: '500',
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
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  addButton: {
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
