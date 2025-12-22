import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';
import { useLocation } from '@/hooks/useLocation';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  ActivityIndicator,
} from 'react-native';

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, updateUser } = useAuth();
  const { showImagePickerOptions, loading: imageLoading } = useImagePicker();
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();
  const { location: userLocation } = useLocation();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
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
      // @ts-ignore - phone and bio might exist in user
      if (user.phone) setPhone(user.phone);
      // @ts-ignore
      if (user.bio) setBio(user.bio);
      // @ts-ignore
      if (user.location) setLocation(user.location);
    }
  }, [user]);

  // Cargar ubicación automáticamente desde el hook de ubicación
  useEffect(() => {
    if (userLocation?.fullAddress && !location) {
      setLocation(userLocation.fullAddress);
    }
  }, [userLocation, location]);

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
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        profileImage: profileImage || null,
      };

      if (phone.trim()) {
        updateData.phone = phone.trim();
      }

      if (bio.trim()) {
        updateData.bio = bio.trim();
      }

      if (location.trim()) {
        updateData.location = location.trim();
      }

      if (documentId.trim()) {
        updateData.documentId = documentId.trim();
      }

      if (birthDate.trim()) {
        updateData.birthDate = birthDate.trim();
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
          <View style={styles.avatarSection}>
            <Pressable
              onPress={handleAvatarPress}
              disabled={imageLoading}
              style={styles.avatarPressable}
            >
              {imageLoading ? (
                <View style={styles.profileImageContainer}>
                  <ActivityIndicator size="large" color={EventuColors.hotPink} />
                </View>
              ) : profileImage ? (
                <View style={styles.profileImageContainer}>
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.imageOverlay}
                  />
                  <View style={styles.editImageBadge}>
                    <MaterialIcons 
                      name="camera-alt" 
                      size={18} 
                      color={EventuColors.white} 
                    />
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={[EventuColors.hotPink, EventuColors.magenta]}
                  style={styles.profileImageContainer}
                >
                  <MaterialIcons 
                    name="person" 
                    size={56} 
                    color={EventuColors.white} 
                  />
                  <View style={styles.editImageBadge}>
                    <MaterialIcons 
                      name="camera-alt" 
                      size={18} 
                      color={EventuColors.white} 
                    />
                  </View>
                </LinearGradient>
              )}
            </Pressable>

            <View style={styles.imageActionsContainer}>
              <Pressable
                style={styles.imageActionButton}
                onPress={handleAvatarPress}
                disabled={imageLoading}
              >
                <LinearGradient
                  colors={[EventuColors.hotPink, EventuColors.magenta]}
                  style={styles.imageActionGradient}
                >
                  <MaterialIcons 
                    name={imageLoading ? 'hourglass-empty' : 'camera-alt'} 
                    size={20} 
                    color={EventuColors.white} 
                  />
                  <ThemedText style={styles.imageActionText}>
                    {profileImage ? 'Cambiar' : 'Agregar'}
                  </ThemedText>
                </LinearGradient>
              </Pressable>

              {profileImage && (
                <Pressable
                  style={styles.removeImageButton}
                  onPress={() => {
                    Alert.alert(
                      'Eliminar foto de perfil',
                      '¿Estás seguro de que deseas eliminar tu foto de perfil?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => setProfileImage(null),
                        },
                      ]
                    );
                  }}
                  disabled={imageLoading}
                >
                  <MaterialIcons 
                    name="delete-outline" 
                    size={20} 
                    color={EventuColors.error} 
                  />
                  <ThemedText style={styles.removeImageText}>
                    Eliminar
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <ThemedText style={styles.imageHint}>
              {imageLoading 
                ? 'Procesando imagen...' 
                : profileImage 
                ? 'Toca la foto para cambiarla' 
                : 'Agrega una foto de perfil para personalizar tu cuenta'
              }
            </ThemedText>
          </View>

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
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: EventuColors.white,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Shadows.lg,
    shadowColor: EventuColors.hotPink + '66',
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: EventuColors.hotPink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: EventuColors.white,
    ...Shadows.md,
  },
  imageActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imageActionButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  imageActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  imageActionText: {
    color: EventuColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: EventuColors.error + '40',
    backgroundColor: EventuColors.white,
    gap: 8,
    ...Shadows.sm,
  },
  removeImageText: {
    color: EventuColors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  imageHint: {
    fontSize: 13,
    color: EventuColors.mediumGray,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
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
