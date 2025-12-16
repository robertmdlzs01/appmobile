import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function AddCardScreen() {
  const handleAddCard = async () => {
    // Redirigir a la web para agregar tarjeta
    await WebBrowser.openBrowserAsync('https://eventu.co/profile/payment-methods/add', {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Agregar Tarjeta</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.infoCard}>
          <MaterialIcons name="credit-card" size={48} color={EventuColors.hotPink} />
          <Text style={styles.infoTitle}>
            Agregar método de pago
          </Text>
          <Text style={styles.infoText}>
            Para agregar una tarjeta de pago, por favor visita nuestra plataforma web 
            donde podrás gestionar de forma segura tus métodos de pago.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Pressable style={styles.addButton} onPress={handleAddCard}>
          <LinearGradient
            colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <MaterialIcons name="arrow-up-right" size={20} color={EventuColors.white} />
            <Text style={styles.buttonText}>Abrir en la Web</Text>
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
  infoCard: {
    marginHorizontal: 20,
    marginTop: 40,
    padding: 32,
    borderRadius: 20,
    backgroundColor: EventuColors.white,
    alignItems: 'center',
    gap: 16,
    ...Shadows.md,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: EventuColors.black,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
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
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: EventuColors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
