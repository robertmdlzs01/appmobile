import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CompleteProfileScreen() {
  const { user, updateUser } = useAuth();
  const { showImagePickerOptions, loading: imageLoading } = useImagePicker();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const bg = colorScheme === 'dark' ? '#1f1f1f' : '#f5f5f5';
  const border = colorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0';

  useEffect(() => {
    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      if (user) {
        setFullName(user.name || '');
        setProfileImage(user.profileImage || null);
      } else {
        const userData = await AsyncStorage.getItem('@eventu_user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setFullName(parsedUser.name || '');
          setProfileImage(parsedUser.profileImage || null);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSelectImage = async () => {
    const imageUri = await showImagePickerOptions({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (imageUri) {
      setProfileImage(imageUri);
    }
  };

  const handleComplete = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre completo');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: fullName.trim(),
      };

      if (phone.trim()) {
        updateData.phone = phone.trim();
      }

      if (bio.trim()) {
        updateData.bio = bio.trim();
      }

      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      if (user) {
        await updateUser(updateData);
      }

      console.log('Profile completed:', updateData);
      router.replace('/auth/location-access');
    } catch (error) {
      console.error('Error completing profile:', error);
      Alert.alert('Error', 'No se pudo completar el perfil. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

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
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 40) + 20 }]}
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
                Completa tu Perfil
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Cuéntanos más sobre ti
              </ThemedText>
            </View>

            {}
            <Pressable 
              style={styles.imageContainer} 
              onPress={handleSelectImage}
              disabled={imageLoading}
            >
              {imageLoading ? (
                <View style={styles.imagePlaceholder}>
                  <ActivityIndicator size="large" color={EventuColors.hotPink} />
                </View>
              ) : profileImage ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  <View style={styles.editImageBadge}>
                    <IconSymbol 
                      name={imageLoading ? 'hourglass' : 'camera.fill'} 
                      size={16} 
                      color={EventuColors.white} 
                    />
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={[EventuColors.hotPink + '15', EventuColors.magenta + '15']} 
                  style={styles.imagePlaceholder}
                >
                  <View style={styles.imagePlaceholderInner}>
                    <IconSymbol 
                      name={imageLoading ? 'hourglass' : 'camera.fill'} 
                      size={32} 
                      color={EventuColors.hotPink} 
                    />
                    <ThemedText style={styles.imagePlaceholderLabel}>
                      Agregar Foto
                    </ThemedText>
                  </View>
                </LinearGradient>
              )}
            </Pressable>

            {}
            <View style={styles.form}>
              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>
                  Nombre Completo <ThemedText style={styles.required}>*</ThemedText>
                </ThemedText>
                <ThemedView
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: bg,
                      borderColor: border,
                    },
                  ]}
                >
                  <IconSymbol name="person.fill" size={18} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Ingresa tu nombre completo"
                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                    autoCapitalize="words"
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Número de Teléfono</ThemedText>
                <ThemedView
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: bg,
                      borderColor: border,
                    },
                  ]}
                >
                  <IconSymbol name="phone.fill" size={18} color={colors.icon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1 234 567 8900"
                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                    keyboardType="phone-pad"
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText style={styles.label}>Biografía</ThemedText>
                <ThemedView
                  style={[
                    styles.inputWrapper,
                    styles.textAreaWrapper,
                    {
                      backgroundColor: bg,
                      borderColor: border,
                    },
                  ]}
                >
                  <IconSymbol name="text.alignleft" size={18} color={colors.icon} />
                  <TextInput
                    style={[styles.input, styles.textArea, { color: colors.text }]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Cuéntanos sobre ti..."
                    placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </ThemedView>
              </ThemedView>
            </View>

            {}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!fullName.trim() || loading) && styles.buttonDisabled,
                { opacity: pressed || (!fullName.trim() || loading) ? 0.7 : 1 },
              ]}
              onPress={handleComplete}
              disabled={!fullName.trim() || loading}
            >
              <LinearGradient
                colors={[EventuColors.hotPink + 'CC', EventuColors.magenta + 'CC']} 
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={EventuColors.white} />
                ) : (
                  <ThemedText style={styles.buttonText}>Completar Perfil</ThemedText>
                )}
              </LinearGradient>
            </Pressable>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: EventuColors.hotPink,
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
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
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: EventuColors.hotPink,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholderInner: {
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.hotPink,
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
  required: {
    color: EventuColors.error,
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
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 0,
  },
  button: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
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
