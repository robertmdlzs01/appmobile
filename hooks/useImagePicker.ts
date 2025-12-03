import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

export function useImagePicker() {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos acceso a tu cámara y galería para cambiar tu foto de perfil.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }) => {
    setLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intenta nuevamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async (options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }) => {
    setLoading(true);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const showImagePickerOptions = async (options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<string | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Seleccionar Foto',
        'Elige una opción',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => resolve(null),
          },
          {
            text: 'Tomar Foto',
            onPress: async () => {
              const uri = await takePhoto(options);
              resolve(uri);
            },
          },
          {
            text: 'Elegir de Galería',
            onPress: async () => {
              const uri = await pickImage(options);
              resolve(uri);
            },
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  };

  return {
    pickImage,
    takePhoto,
    showImagePickerOptions,
    loading,
  };
}
