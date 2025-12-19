

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';


export function useStaffPermissions() {
  const { user, isAuthenticated } = useAuth();
  
  const isStaff = user?.role === 'staff' || user?.role === 'admin' || user?.isStaff === true;
  const isAdmin = user?.role === 'admin';
  
  return {
    isStaff,
    isAdmin,
    isAuthenticated,
    user,
  };
}


export function useRequireStaff() {
  const { isStaff, isAuthenticated } = useStaffPermissions();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Acceso Restringido',
        'Debes iniciar sesión para acceder a esta sección.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar Sesión', onPress: () => router.replace('/login') },
        ]
      );
      router.replace('/login');
      return;
    }

    if (!isStaff) {
      Alert.alert(
        'Acceso Restringido',
        'Esta sección es exclusiva para personal autorizado. Si eres parte del equipo, contacta al administrador para obtener acceso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      router.back();
      return;
    }

    setIsAuthorized(true);
  }, [isStaff, isAuthenticated, router]);

  return isAuthorized;
}

