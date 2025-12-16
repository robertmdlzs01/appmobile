import { apiService } from '@/services/api';
import { authApi } from '@/services/auth.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  role?: 'user' | 'staff' | 'admin'; // Roles de usuario
  isStaff?: boolean; // Compatibilidad con versión anterior
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  autoLogin: (userData: User) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@eventu_user';
const TOKEN_STORAGE_KEY = '@eventu_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [userData, token] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
      ]);

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        apiService.setToken(token);
        
        // Intentar verificar el token con el backend
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
            await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
          } else {
            // Token inválido, limpiar
            await logout();
          }
        } catch (error) {
          // Error de red o token inválido, mantener usuario local
          console.warn('No se pudo verificar token, usando datos locales');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Guardar usuario y token
        await Promise.all([
          AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user)),
          AsyncStorage.setItem(TOKEN_STORAGE_KEY, token),
        ]);
        
        // Configurar token en el servicio API
        apiService.setToken(token);
        
        // Determinar isStaff basado en el rol
        const userWithStaff = {
          ...user,
          isStaff: user.role === 'staff' || user.role === 'admin',
        };
        
        setUser(userWithStaff);
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Fallback a modo mock para desarrollo si el backend no está disponible
      if (error.message?.includes('Network Error') || error.message?.includes('conexión')) {
        console.warn('Backend no disponible, usando modo mock');
        
        const staffEmails = [
          'staff@eventu.co',
          'admin@eventu.co',
          'staff@eventu.com',
          'admin@eventu.com',
        ];
        
        let role: 'user' | 'staff' | 'admin' = 'user';
        let isStaff = false;
        
        if (staffEmails.includes(email.toLowerCase())) {
          if (email.toLowerCase().includes('admin')) {
            role = 'admin';
            isStaff = true;
          } else {
            role = 'staff';
            isStaff = true;
          }
        }
        
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email: email,
          name: email.split('@')[0] || 'Usuario',
          profileImage: undefined,
          role: role,
          isStaff: isStaff,
        };

        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(USER_STORAGE_KEY),
      AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
    ]);
    apiService.setToken(undefined);
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      // Intentar actualizar en el backend
      try {
        const response = await apiService.put<{ user: User }>('/users/profile', userData);
        if (response.success && response.data) {
          const updatedUser = {
            ...response.data.user,
            isStaff: response.data.user.role === 'staff' || response.data.user.role === 'admin',
          };
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
          setUser(updatedUser);
          return;
        }
      } catch (error) {
        console.warn('Error al actualizar en backend, usando actualización local:', error);
      }
      
      // Fallback a actualización local
      const updatedUser: User = {
        ...user,
        ...userData,
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const autoLogin = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error during auto login:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        autoLogin,
        isAuthenticated: !!user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
