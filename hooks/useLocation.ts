
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

interface LocationData {
  city: string;
  country: string;
  fullAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
}

const FALLBACK_LOCATION: LocationData = {
  city: 'Wallace',
  country: 'Australia',
  fullAddress: 'Wallace, Australia',
  coordinates: {
    latitude: -37.4245,
    longitude: 143.8828,
  },
};

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        setError('Permisos de ubicación denegados');
        return false;
      }

      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          
          console.log('Permisos de ubicación en segundo plano no otorgados');
        }
      }

      return true;
    } catch (err: any) {
      console.error('Error requesting location permissions:', err);
      setError('Error al solicitar permisos de ubicación');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setError('Los servicios de ubicación están desactivados');
        Alert.alert(
          'Ubicación desactivada',
          'Activa el GPS y los servicios de ubicación para obtener tu posición actual.',
          [{ text: 'OK' }]
        );
        setLocation((prev) => prev ?? FALLBACK_LOCATION);
        setLoading(false);
        return;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
          setLoading(false);
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });

      const { latitude, longitude } = currentLocation.coords;

      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocodeResult && geocodeResult.length > 0) {
        const address = geocodeResult[0];
        
        const city = address.city || address.subAdministrativeArea || address.administrativeArea || 'Ciudad desconocida';
        const country = address.country || 'País desconocido';
        const fullAddress = `${city}, ${country}`;

        setLocation({
          city,
          country,
          fullAddress,
          coordinates: {
            latitude,
            longitude,
          },
        });
      } else {
        setError('No se pudo obtener la dirección');
        setLocation((prev) => prev ?? FALLBACK_LOCATION);
      }
    } catch (err: any) {
      
      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';
      
      if (__DEV__ && errorCode !== 'E_LOCATION_UNAVAILABLE' && !errorMessage?.includes('unavailable')) {
        console.log('Location service:', errorMessage || 'Location unavailable');
      }
      
      if (errorCode === 'E_LOCATION_SERVICES_DISABLED') {
        setError('Los servicios de ubicación están desactivados');
        
      } else if (errorCode === 'E_LOCATION_UNAVAILABLE' || errorMessage?.includes('unavailable') || errorMessage?.includes('Current location is unavailable')) {
        
        setError(null); 
        setLocation((prev) => prev ?? FALLBACK_LOCATION);
      } else {
        setError(null); 
        setLocation((prev) => prev ?? FALLBACK_LOCATION);
      }
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (): Promise<void> => {
    await getCurrentLocation();
  };

  useEffect(() => {
    getCurrentLocation();
    
  }, []);

  return {
    location,
    loading,
    error,
    refresh,
    requestPermissions,
    getCurrentLocation,
  };
}
