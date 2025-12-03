import { AnimatedCard } from '@/components/animated-card';
import { FadeInView } from '@/components/fade-in-view';
import { PressableCard } from '@/components/pressable-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Colors, { EventuColors, EventuGradients } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImagePicker } from '@/hooks/useImagePicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout, updateUser } = useAuth();
  const { showImagePickerOptions, loading: imageLoading } = useImagePicker();

  const isLoggedIn = !!user;

  const handleAvatarPress = async () => {
    const imageUri = await showImagePickerOptions({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (imageUri) {
      try {
        await updateUser({ profileImage: imageUri });
      } catch (error) {
        Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
      }
    }
  };

  const menuItems = [
    { id: '1', icon: 'shopping-cart', title: 'Mis Compras', subtitle: 'Ver historial de compras' },
    { id: '2', icon: 'receipt', title: 'Facturación', subtitle: 'Ver facturas de eventos' },
    { id: '3', icon: 'credit-card', title: 'Métodos de Pago', subtitle: 'Gestionar tarjetas' },
    { id: '4', icon: 'settings', title: 'Configuración de Notificaciones', subtitle: 'Gestionar alertas y preferencias' },
    { id: '5', icon: 'lock', title: 'Privacidad y Seguridad', subtitle: 'Contraseña y 2FA' },
    { id: '6', icon: 'help-outline', title: 'Ayuda y Soporte', subtitle: 'Centro de ayuda' },
    { id: '7', icon: 'description', title: 'Política de Privacidad', subtitle: 'Leer política' },
  ];

  const handleMenuPress = (id: string) => {
    switch (id) {
      case '1':
        router.push('/(tabs)/tickets');
        break;
      case '2':
        router.push('/profile/billing');
        break;
      case '3':
        router.push('/profile/payment-methods');
        break;
      case '4':
        router.push('/settings/notifications');
        break;
      case '5':
        router.push('/settings/security');
        break;
      case '6':
        router.push('/help');
        break;
      case '7':
        router.push('/profile/privacy');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FadeInView delay={100}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Perfil
              </Text>
            </View>
          </FadeInView>

          {!isLoggedIn ? (
            <FadeInView delay={200}>
              <View style={styles.loginSection}>
                <MaterialIcons name="account-circle" size={80} color="rgba(255,255,255,0.3)" />
                <Text style={styles.loginTitle}>
                  Inicia sesión para continuar
                </Text>
                <Text style={styles.loginSubtitle}>
                  Accede a tu cuenta para gestionar tickets y más
                </Text>
                <PressableCard
                  style={styles.loginButton}
                  onPress={() => router.push('/login')}
                >
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </PressableCard>
                <PressableCard
                  style={[styles.signupButton, { borderColor: EventuColors.magenta }]}
                  onPress={() => router.push('/register')}
                >
                  <Text style={[styles.signupButtonText, { color: EventuColors.magenta }]}>
                    Crear Cuenta
                  </Text>
                </PressableCard>
              </View>
            </FadeInView>
          ) : (
            <>
              <FadeInView delay={200}>
                <View style={styles.userSection}>
                  <Pressable
                    onPress={handleAvatarPress}
                    disabled={imageLoading}
                    style={styles.avatarPressable}
                  >
                    {user.profileImage ? (
                      <View style={styles.avatarImageContainer}>
                        <Image
                          source={{ uri: user.profileImage }}
                          style={styles.avatarImage}
                        />
                        <View style={styles.avatarEditBadge}>
                          <MaterialIcons
                            name={imageLoading ? 'hourglass-empty' : 'camera-alt'}
                            size={16}
                            color={EventuColors.white}
                          />
                        </View>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={[EventuColors.magenta + 'CC', EventuColors.violet + 'CC']}
                        style={styles.avatarContainer}
                      >
                        <MaterialIcons name="person" size={40} color={EventuColors.white} />
                        <View style={styles.avatarEditBadge}>
                          <MaterialIcons
                            name={imageLoading ? 'hourglass-empty' : 'camera-alt'}
                            size={16}
                            color={EventuColors.white}
                          />
                        </View>
                      </LinearGradient>
                    )}
                  </Pressable>
                  <Text style={styles.userName}>
                    {user.name}
                  </Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <PressableCard
                    style={styles.editButton}
                    onPress={() => router.push('/profile/edit')}
                    hapticFeedback={true}
                  >
                    <MaterialIcons name="edit" size={18} color={EventuColors.magenta} />
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                  </PressableCard>
                </View>
              </FadeInView>

              <FadeInView delay={300}>
                <View style={styles.menuSection}>
                  {menuItems.map((item, index) => (
                    <AnimatedCard key={item.id} index={index} delay={index * 50}>
                      <PressableCard
                        style={[
                          styles.menuItem,
                          {
                            backgroundColor: EventuColors.white,
                            borderWidth: 1,
                            borderColor: EventuColors.lightGray,
                          },
                        ]}
                        onPress={() => handleMenuPress(item.id)}
                        hapticFeedback={true}
                      >
                        <View style={styles.menuItemLeft}>
                          <View
                            style={[
                              styles.iconContainer,
                              { backgroundColor: EventuColors.magenta + '20' },
                            ]}>
                            <MaterialIcons 
                              name={item.icon as any} 
                              size={20} 
                              color={EventuColors.magenta} 
                            />
                          </View>
                          <View style={styles.menuItemText}>
                            <Text style={styles.menuItemTitle}>
                              {item.title}
                            </Text>
                            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                          </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color={EventuColors.mediumGray} />
                      </PressableCard>
                    </AnimatedCard>
                  ))}
                </View>
              </FadeInView>

              <FadeInView delay={400}>
                <PressableCard
                  style={[
                    styles.logoutButton,
                    {
                      backgroundColor: EventuColors.error + '20',
                    },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      'Cerrar sesión',
                      '¿Seguro que deseas cerrar sesión?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Cerrar sesión',
                          style: 'destructive',
                          onPress: async () => {
                            await logout();
                            router.replace('/welcome');
                          },
                        },
                      ],
                    );
                  }}
                >
                  <MaterialIcons name="logout" size={20} color={EventuColors.error} />
                  <Text style={[styles.logoutButtonText, { color: EventuColors.error }]}>
                    Cerrar Sesión
                  </Text>
                </PressableCard>
              </FadeInView>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: EventuColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 8,
    fontSize: 32,
    fontWeight: '800' as const,
    color: EventuColors.black,
  },
  loginSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    gap: 12,
  },
  loginTitle: {
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: EventuColors.black,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  loginSubtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: EventuColors.mediumGray,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: EventuColors.magenta,
  },
  loginButtonText: {
    color: EventuColors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  signupButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  userSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  avatarPressable: {
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    position: 'relative',
  },
  avatarImageContainer: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadows.md,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: EventuColors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: EventuColors.white,
    ...Shadows.sm,
  },
  userName: {
    marginBottom: 4,
    color: EventuColors.black,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  userEmail: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.xl,
    backgroundColor: EventuColors.white,
    borderWidth: 1.5,
    borderColor: EventuColors.magenta,
    gap: 8,
    marginTop: 8,
    ...Shadows.sm,
  },
  editButtonText: {
    color: EventuColors.magenta,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  menuSection: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: Radius.xl,
    marginBottom: 8,
    ...Shadows.md,
    shadowColor: EventuColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    color: EventuColors.black,
    fontSize: 16,
  },
  menuItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
    color: EventuColors.mediumGray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: Radius.xl,
    gap: 8,
    borderWidth: 1.5,
    borderColor: EventuColors.error + '40',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
