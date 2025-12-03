import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';

export default function SecurityScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [biometric, setBiometric] = useState(false);

  const handleChangePassword = () => {
    router.push('/profile/password');
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      
      try {
        
        Alert.alert(
          'Biometría',
          'Por favor, autentícate con tu huella dactilar o Face ID',
          [
            { text: 'Cancelar', onPress: () => setBiometric(false) },
            {
              text: 'Continuar',
              onPress: () => {
                setBiometric(true);
                Alert.alert('Éxito', 'Biometría activada correctamente');
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'No se pudo activar la biometría');
        setBiometric(false);
      }
    } else {
      setBiometric(false);
      Alert.alert('Biometría desactivada', 'Ya no usarás biometría para iniciar sesión');
    }
  };

  const handleDevices = () => {
    Alert.alert('Próximamente', 'Gestión de dispositivos conectados (demo).');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Seguridad</ThemedText>
        <View style={styles.iconBtn} />
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText type="defaultSemiBold">Autenticación</ThemedText>
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <IconSymbol name="faceid" size={18} color={colors.tint} />
            <ThemedText style={styles.rowText}>Uso de biometría</ThemedText>
          </View>
          <Switch 
            value={biometric} 
            onValueChange={handleBiometricToggle}
            trackColor={{ false: '#767577', true: colors.tint }}
            thumbColor={colors.background}
          />
        </View>

        <ThemedText type="defaultSemiBold" style={{ marginTop: 16 }}>Seguridad de la cuenta</ThemedText>
        <Pressable style={styles.action} onPress={handleChangePassword}>
          <IconSymbol name="lock.fill" size={18} color={colors.tint} />
          <ThemedText style={styles.actionText}>Cambiar contraseña</ThemedText>
        </Pressable>
        <Pressable style={styles.action} onPress={handleDevices}>
          <IconSymbol name="arrow.right.square.fill" size={18} color={colors.tint} />
          <ThemedText style={styles.actionText}>Cerrar sesión en todos los dispositivos</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20 },
  iconBtn: { padding: 6 },
  content: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { fontWeight: '500' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  actionText: { fontWeight: '600' },
});
