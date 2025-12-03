import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function PasswordManagerScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Error',
        'La contraseña debe contener al menos una mayúscula y un número'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Éxito', 'Tu contraseña ha sido actualizada', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={24} color={EventuColors.hotPink} />
          <Text style={styles.infoText}>
            Tu contraseña debe tener al menos 8 caracteres, incluir una mayúscula y un número
          </Text>
        </View>

        {}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña Actual</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor={EventuColors.mediumGray}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <MaterialIcons
                  name={showCurrentPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={EventuColors.mediumGray}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva Contraseña</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor={EventuColors.mediumGray}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                <MaterialIcons
                  name={showNewPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={EventuColors.mediumGray}
                />
              </Pressable>
            </View>
            {newPassword.length > 0 && (
              <View style={styles.validationContainer}>
                <View style={styles.validationRow}>
                  <MaterialIcons
                    name={newPassword.length >= 8 ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={newPassword.length >= 8 ? EventuColors.success : EventuColors.mediumGray}
                  />
                  <Text
                    style={[
                      styles.validationText,
                      newPassword.length >= 8 && styles.validationTextSuccess,
                    ]}
                  >
                    Al menos 8 caracteres
                  </Text>
                </View>
                <View style={styles.validationRow}>
                  <MaterialIcons
                    name={/[A-Z]/.test(newPassword) ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={/[A-Z]/.test(newPassword) ? EventuColors.success : EventuColors.mediumGray}
                  />
                  <Text
                    style={[
                      styles.validationText,
                      /[A-Z]/.test(newPassword) && styles.validationTextSuccess,
                    ]}
                  >
                    Una mayúscula
                  </Text>
                </View>
                <View style={styles.validationRow}>
                  <MaterialIcons
                    name={/[0-9]/.test(newPassword) ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={/[0-9]/.test(newPassword) ? EventuColors.success : EventuColors.mediumGray}
                  />
                  <Text
                    style={[
                      styles.validationText,
                      /[0-9]/.test(newPassword) && styles.validationTextSuccess,
                    ]}
                  >
                    Un número
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor={EventuColors.mediumGray}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={EventuColors.mediumGray}
                />
              </Pressable>
            </View>
            {confirmPassword.length > 0 && (
              <View style={styles.matchContainer}>
                <MaterialIcons
                  name={passwordsMatch ? 'check-circle' : 'error'}
                  size={16}
                  color={passwordsMatch ? EventuColors.success : EventuColors.error}
                />
                <Text
                  style={[
                    styles.matchText,
                    passwordsMatch ? styles.matchTextSuccess : styles.matchTextError,
                  ]}
                >
                  {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomContainer}>
        <Pressable
          style={[
            styles.saveButton,
            (!isPasswordValid || !passwordsMatch || !currentPassword || loading) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleChangePassword}
          disabled={!isPasswordValid || !passwordsMatch || !currentPassword || loading}
        >
          <LinearGradient
            colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Text>
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
    flexDirection: 'row',
    backgroundColor: EventuColors.hotPink + '10',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: EventuColors.black,
    lineHeight: 18,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 24,
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
  validationContainer: {
    marginTop: 12,
    gap: 8,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationText: {
    fontSize: 13,
    color: EventuColors.mediumGray,
  },
  validationTextSuccess: {
    color: EventuColors.success,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  matchText: {
    fontSize: 13,
  },
  matchTextSuccess: {
    color: EventuColors.success,
  },
  matchTextError: {
    color: EventuColors.error,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  saveButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Shadows.md,
    shadowColor: EventuColors.hotPink + '66',
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
