import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, updateUser } = useAuth();
  const { showImagePickerOptions, loading: imageLoading } = useImagePicker();
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const bg = colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0';

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa los campos obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email inválido', 'Por favor ingresa un email válido');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No hay una sesión activa. Por favor inicia sesión.');
      router.replace('/login');
      return;
    }

    setLoading(true);
    try {
      const updateData: { name: string; email: string; profileImage?: string } = {
        name: name.trim(),
        email: email.trim(),
      };

      if (profileImage && profileImage.trim()) {
        updateData.profileImage = profileImage;
      }

      await updateUser(updateData);
      
      Alert.alert('Éxito', 'Tu información ha sido actualizada', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error?.message || 'No se pudo actualizar la información. Intenta nuevamente.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarPress = async () => {
    const imageUri = await showImagePickerOptions({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (imageUri) {
      setProfileImage(imageUri);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      Alert.alert('Sesión requerida', 'Por favor inicia sesión para editar tu perfil', [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]);
    }
  }, [user, loading]);

  if (!user) {
    return null; 
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {}
        <ThemedView style={[styles.header, { paddingTop: safeAreaPaddingTop + 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Actualizar Datos
          </ThemedText>
          <View style={styles.backButton} />
        </ThemedView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {}
          <ThemedView style={styles.avatarSection}>
            <Pressable
              onPress={handleAvatarPress}
              disabled={imageLoading}
              style={styles.avatarPressable}
            >
              {profileImage ? (
                <View style={styles.avatarImageContainer}>
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  <View style={styles.editAvatarButton}>
                    <View style={styles.editAvatarIcon}>
                      <IconSymbol
                        name={imageLoading ? 'hourglass' : 'camera.fill'}
                        size={16}
                        color={EventuColors.white}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  <LinearGradient
                    colors={[EventuColors.hotPink, EventuColors.magenta]}
                    style={styles.avatarContainer}>
                    <IconSymbol name="person.fill" size={40} color={EventuColors.white} />
                  </LinearGradient>
                  <View style={styles.editAvatarButton}>
                    <View style={styles.editAvatarIcon}>
                      <IconSymbol
                        name={imageLoading ? 'hourglass' : 'camera.fill'}
                        size={16}
                        color={EventuColors.white}
                      />
                    </View>
                  </View>
                </>
              )}
            </Pressable>
            <ThemedText style={styles.avatarHint}>
              {imageLoading ? 'Procesando...' : 'Toca para cambiar foto'}
            </ThemedText>
          </ThemedView>

          {}
          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                Nombre completo <Text style={styles.required}>*</Text>
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: EventuColors.lightGray,
                  },
                ]}>
                <IconSymbol name="person.fill" size={18} color={EventuColors.mediumGray} />
                <TextInput
                  style={[styles.input, { color: EventuColors.black }]}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={EventuColors.mediumGray}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                Nombre de usuario <Text style={styles.required}>*</Text>
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: EventuColors.lightGray,
                  },
                ]}>
                <Text style={styles.usernamePrefix}>@</Text>
                <TextInput
                  style={[styles.input, { color: EventuColors.black }]}
                  placeholder="username"
                  placeholderTextColor={EventuColors.mediumGray}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoComplete="username"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                Correo electrónico <Text style={styles.required}>*</Text>
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: EventuColors.lightGray,
                  },
                ]}>
                <IconSymbol name="envelope.fill" size={18} color={EventuColors.mediumGray} />
                <TextInput
                  style={[styles.input, { color: EventuColors.black }]}
                  placeholder="tu@correo.com"
                  placeholderTextColor={EventuColors.mediumGray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Número de teléfono</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: EventuColors.lightGray,
                  },
                ]}>
                <IconSymbol name="phone.fill" size={18} color={EventuColors.mediumGray} />
                <TextInput
                  style={[styles.input, { color: EventuColors.black }]}
                  placeholder="+57 300 123 4567"
                  placeholderTextColor={EventuColors.mediumGray}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                Documento de Identidad <Text style={styles.required}>*</Text>
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: border,
                  },
                ]}>
                <IconSymbol name="person.text.rectangle.fill" size={18} color={EventuColors.mediumGray} />
                <TextInput
                  style={[styles.input, { color: EventuColors.black }]}
                  placeholder="C.C. o C.E."
                  placeholderTextColor={EventuColors.mediumGray}
                  value={documentId}
                  onChangeText={setDocumentId}
                  keyboardType="numeric"
                  autoComplete="off"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Fecha de nacimiento</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: EventuColors.lightGray,
                  },
                ]}>
                <IconSymbol name="calendar" size={18} color={EventuColors.mediumGray} />
                <TextInput
                  style={[styles.input, { color: EventuColors.black }]}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={EventuColors.mediumGray}
                  value={birthDate}
                  onChangeText={setBirthDate}
                  keyboardType="numeric"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Ubicación</ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: EventuColors.lightGray,
                  },
                ]}>
                <IconSymbol name="location.fill" size={18} color={EventuColors.mediumGray} />
                <TextInput
                  style={[styles.input, { color: EventuColors.black }]}
                  placeholder="Ciudad, País"
                  placeholderTextColor={EventuColors.mediumGray}
                  value={location}
                  onChangeText={setLocation}
                  autoCapitalize="words"
                />
              </View>
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Biografía</ThemedText>
              <View
                style={[
                  styles.textAreaWrapper,
                  {
                    backgroundColor: EventuColors.white,
                    borderColor: EventuColors.lightGray,
                  },
                ]}>
                <TextInput
                  style={[styles.textArea, { color: EventuColors.black }]}
                  placeholder="Cuéntanos sobre ti..."
                  placeholderTextColor={EventuColors.mediumGray}
                  value={bio}
                  onChangeText={(text) => {
                    if (text.length <= 200) {
                      setBio(text);
                    }
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={200}
                />
              </View>
              <ThemedText style={styles.charCount}>{bio.length}/200</ThemedText>
            </ThemedView>

            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: colors.tint,
                  opacity: pressed || loading ? 0.8 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={loading}>
              <LinearGradient
                colors={[EventuColors.hotPink, EventuColors.magenta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}>
                <ThemedText style={styles.saveButtonText}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </ThemedText>
              </LinearGradient>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarPressable: {
    marginBottom: 12,
    position: 'relative',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  avatarImageContainer: {
    width: 120,
    height: 120,
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadows.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '50%',
    marginRight: -60,
  },
  editAvatarIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: EventuColors.hotPink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: EventuColors.white,
    ...Shadows.sm,
  },
  avatarHint: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: EventuColors.black,
  },
  required: {
    color: EventuColors.error,
  },
  usernamePrefix: {
    fontSize: 16,
    color: EventuColors.mediumGray,
    fontWeight: '500',
    marginRight: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  textAreaWrapper: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    fontWeight: '500',
    minHeight: 80,
  },
  charCount: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginTop: 8,
    ...Shadows.md,
    shadowColor: EventuColors.hotPink,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
