import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const bg = colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0';

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    console.log('Password reset successfully');
    Alert.alert('Éxito', 'Tu contraseña ha sido restablecida exitosamente', [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5FB', '#F5F0FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {}
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color={colors.text} />
              </Pressable>
            </View>

            {}
            <View style={styles.titleSection}>
              <ThemedText type="title" style={styles.title}>
                Restablecer Contraseña
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Por favor ingresa tu nueva contraseña
              </ThemedText>
            </View>

            {}
            <View style={styles.form}>
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Nueva Contraseña</ThemedText>
                <ThemedView
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: bg,
                      borderColor: border,
                    },
                  ]}
                >
                  <IconSymbol name="lock.fill" size={18} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, flex: 1 }]}
                    placeholder="Ingresa tu nueva contraseña"
                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <IconSymbol
                      name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={18}
                      color={colors.icon}
                    />
                  </Pressable>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirmar Contraseña</ThemedText>
                <ThemedView
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: bg,
                      borderColor: passwordsMatch
                        ? EventuColors.success
                        : passwordsMatch === false && confirmPassword.length > 0
                          ? EventuColors.error
                          : border,
                    },
                  ]}
                >
                  <IconSymbol name="lock.fill" size={18} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, flex: 1 }]}
                    placeholder="Confirma tu nueva contraseña"
                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <IconSymbol
                      name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={18}
                      color={colors.icon}
                    />
                  </Pressable>
                </ThemedView>
              </ThemedView>

              {}
              <ThemedView
                style={[
                  styles.requirementsContainer,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : '#F7F8FF',
                  },
                ]}
              >
                <ThemedText style={styles.requirementsTitle}>
                  La contraseña debe contener:
                </ThemedText>
                <View style={styles.requirementRow}>
                  <IconSymbol
                    name={hasMinLength ? 'checkmark.circle.fill' : 'circle'}
                    size={16}
                    color={hasMinLength ? EventuColors.success : EventuColors.mediumGray}
                  />
                  <ThemedText
                    style={[
                      styles.requirement,
                      hasMinLength && { color: EventuColors.success },
                    ]}
                  >
                    Al menos 8 caracteres
                  </ThemedText>
                </View>
                <View style={styles.requirementRow}>
                  <IconSymbol
                    name={hasUppercase ? 'checkmark.circle.fill' : 'circle'}
                    size={16}
                    color={hasUppercase ? EventuColors.success : EventuColors.mediumGray}
                  />
                  <ThemedText
                    style={[
                      styles.requirement,
                      hasUppercase && { color: EventuColors.success },
                    ]}
                  >
                    Una letra mayúscula
                  </ThemedText>
                </View>
                <View style={styles.requirementRow}>
                  <IconSymbol
                    name={hasNumber ? 'checkmark.circle.fill' : 'circle'}
                    size={16}
                    color={hasNumber ? EventuColors.success : EventuColors.mediumGray}
                  />
                  <ThemedText
                    style={[
                      styles.requirement,
                      hasNumber && { color: EventuColors.success },
                    ]}
                  >
                    Un número
                  </ThemedText>
                </View>
              </ThemedView>
            </View>
          </ScrollView>

          {}
          <View style={styles.bottomContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                !isPasswordValid && styles.buttonDisabled,
                { opacity: pressed || !isPasswordValid ? 0.7 : 1 },
              ]}
              onPress={handleResetPassword}
              disabled={!isPasswordValid}
            >
              <LinearGradient
                colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <ThemedText style={styles.buttonText}>Restablecer Contraseña</ThemedText>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    gap: 12,
  },
  input: {
    fontSize: 16,
  },
  requirementsContainer: {
    padding: 16,
    borderRadius: Radius.lg,
    marginTop: 8,
    gap: 12,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requirement: {
    fontSize: 14,
    color: EventuColors.mediumGray,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66', 
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
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
