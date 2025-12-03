import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View, Pressable, SafeAreaView } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Política de Privacidad</Text>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Última actualización: 25 de Junio, 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introducción</Text>
            <Text style={styles.sectionText}>
              En Eventu, nos comprometemos a proteger tu privacidad. Esta Política de Privacidad
              explica cómo recopilamos, usamos, divulgamos y protegemos tu información personal
              cuando utilizas nuestra aplicación móvil.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Información que Recopilamos</Text>
            <Text style={styles.sectionText}>
              Recopilamos información que nos proporcionas directamente, como cuando creas una
              cuenta, realizas una compra o te comunicas con nosotros. Esto incluye:
            </Text>
            <Text style={styles.bulletPoint}>• Nombre y información de contacto</Text>
            <Text style={styles.bulletPoint}>• Información de pago</Text>
            <Text style={styles.bulletPoint}>• Preferencias de eventos</Text>
            <Text style={styles.bulletPoint}>• Ubicación (con tu permiso)</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Cómo Usamos tu Información</Text>
            <Text style={styles.sectionText}>
              Utilizamos la información recopilada para:
            </Text>
            <Text style={styles.bulletPoint}>• Procesar tus compras y reservas</Text>
            <Text style={styles.bulletPoint}>• Personalizar tu experiencia</Text>
            <Text style={styles.bulletPoint}>• Enviarte notificaciones sobre eventos</Text>
            <Text style={styles.bulletPoint}>• Mejorar nuestros servicios</Text>
            <Text style={styles.bulletPoint}>• Comunicarnos contigo</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Compartir Información</Text>
            <Text style={styles.sectionText}>
              No vendemos tu información personal. Podemos compartir tu información solo en las
              siguientes circunstancias:
            </Text>
            <Text style={styles.bulletPoint}>• Con organizadores de eventos para procesar tus compras</Text>
            <Text style={styles.bulletPoint}>• Con proveedores de servicios que nos ayudan a operar</Text>
            <Text style={styles.bulletPoint}>• Cuando sea requerido por ley</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Seguridad</Text>
            <Text style={styles.sectionText}>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu
              información personal contra acceso no autorizado, alteración, divulgación o destrucción.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Tus Derechos</Text>
            <Text style={styles.sectionText}>
              Tienes derecho a:
            </Text>
            <Text style={styles.bulletPoint}>• Acceder a tu información personal</Text>
            <Text style={styles.bulletPoint}>• Corregir información inexacta</Text>
            <Text style={styles.bulletPoint}>• Solicitar la eliminación de tus datos</Text>
            <Text style={styles.bulletPoint}>• Oponerte al procesamiento de tus datos</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Contacto</Text>
            <Text style={styles.sectionText}>
              Si tienes preguntas sobre esta Política de Privacidad, contáctanos en:
            </Text>
            <Text style={styles.contactInfo}>Email: privacidad@eventu.app</Text>
            <Text style={styles.contactInfo}>Teléfono: +52 1 555 555 5555</Text>
          </View>
        </View>
      </ScrollView>
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: EventuColors.black,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: EventuColors.black,
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 14,
    color: EventuColors.hotPink,
    fontWeight: '600',
    marginTop: 8,
  },
});
