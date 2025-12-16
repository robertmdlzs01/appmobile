import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '@/constants/theme';
import { Radius } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function WalletScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleManagePaymentMethods = async () => {
    // Redirigir a la web para gestionar métodos de pago
    await WebBrowser.openBrowserAsync('https://eventu.co/profile/payment-methods', {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Métodos de Pago</ThemedText>
        <ThemedView style={styles.iconBtn} />
      </ThemedView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={48} color={colors.tint} />
          <ThemedText type="title" style={styles.infoTitle}>
            Gestiona tus métodos de pago
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Los métodos de pago se gestionan en nuestra plataforma web. 
            Haz clic en el botón para abrir la configuración de métodos de pago.
          </ThemedText>
        </ThemedView>

        <Pressable 
          style={({ pressed }) => [
            styles.manageButton, 
            { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }
          ]} 
          onPress={handleManagePaymentMethods}
        >
          <IconSymbol name="arrow.up.right.square" size={18} color="#ffffff" />
          <ThemedText style={styles.manageButtonText}>Abrir en la Web</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20 },
  iconBtn: { padding: 6 },
  infoCard: { 
    marginHorizontal: 20, 
    marginTop: 20, 
    padding: 32, 
    borderRadius: Radius.lg, 
    alignItems: 'center',
    gap: 16,
  },
  infoTitle: { fontSize: 20, textAlign: 'center' },
  infoText: { fontSize: 15, textAlign: 'center', opacity: 0.7, lineHeight: 22 },
  manageButton: { 
    marginHorizontal: 20, 
    marginTop: 24, 
    paddingVertical: 16, 
    borderRadius: Radius.lg, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  manageButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
});
