import { EventuColors } from '@/constants/theme';
import { Radius, Shadows } from '@/constants/theme-extended';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaHeaderPadding } from '@/hooks/useSafeAreaInsets';

export default function HelpCenterScreen() {
  const { paddingTop: safeAreaPaddingTop } = useSafeAreaHeaderPadding();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: '¿Cómo compro un boleto?',
      answer: 'Para comprar un boleto, navega hasta el evento que te interesa, selecciona el tipo de boleto y cantidad, completa tus datos y realiza el pago.',
    },
    {
      id: '2',
      question: '¿Puedo cancelar mi reserva?',
      answer: 'Sí, puedes cancelar tu reserva desde la sección "Mis Boletos". Las políticas de reembolso varían según el evento.',
    },
    {
      id: '3',
      question: '¿Cómo agrego un método de pago?',
      answer: 'Ve a tu perfil > Métodos de Pago y presiona "Agregar Nueva Tarjeta". Ingresa los datos de tu tarjeta de forma segura.',
    },
    {
      id: '4',
      question: '¿Qué hago si no recibo mi boleto?',
      answer: 'Revisa tu correo electrónico, incluyendo la carpeta de spam. Si no lo encuentras, contáctanos y te lo reenviaremos.',
    },
    {
      id: '5',
      question: '¿Puedo transferir mi boleto a otra persona?',
      answer: 'Depende de la política del evento. Algunos eventos permiten transferencias, otros no. Revisa los términos del evento específico.',
    },
  ];

  const contactOptions = [
    {
      id: 'email',
      icon: 'email',
      title: 'Correo Electrónico',
      subtitle: 'soporte@eventu.app',
      action: () => Linking.openURL('mailto:soporte@eventu.app'),
    },
    {
      id: 'phone',
      icon: 'phone',
      title: 'Teléfono',
      subtitle: '+52 1 555 555 5555',
      action: () => Linking.openURL('tel:+5215555555555'),
    },
    {
      id: 'chat',
      icon: 'chat-bubble-outline',
      title: 'Chat en Vivo',
      subtitle: 'Disponible 24/7',
      action: () => {
        
        alert('Chat en vivo próximamente');
      },
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {}
        <View style={[styles.header, { paddingTop: safeAreaPaddingTop + 16 }]}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={EventuColors.black} />
          </Pressable>
          <Text style={styles.headerTitle}>Centro de Ayuda</Text>
          <View style={styles.iconButton} />
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contáctanos</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => (
              <Pressable
                key={option.id}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={styles.contactIconContainer}>
                  <MaterialIcons name={option.icon as any} size={24} color={EventuColors.hotPink} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
          {faqs.map((faq) => (
            <Pressable
              key={faq.id}
              style={styles.faqCard}
              onPress={() => toggleFAQ(faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <MaterialIcons
                  name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={EventuColors.mediumGray}
                />
              </View>
              {expandedFAQ === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </Pressable>
          ))}
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temas de Ayuda</Text>
          {[
            { icon: 'shopping-cart', title: 'Compras y Boletos', route: '/help/purchases' },
            { icon: 'credit-card', title: 'Pagos y Reembolsos', route: '/help/payments' },
            { icon: 'account-circle', title: 'Mi Cuenta', route: '/help/account' },
            { icon: 'event', title: 'Eventos', route: '/help/events' },
          ].map((topic, index) => (
            <Pressable
              key={index}
              style={styles.topicCard}
              onPress={() => {
                
                alert(`${topic.title} - Próximamente`);
              }}
            >
              <View style={styles.topicIconContainer}>
                <MaterialIcons name={topic.icon as any} size={20} color={EventuColors.hotPink} />
              </View>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <MaterialIcons name="chevron-right" size={20} color={EventuColors.mediumGray} />
            </Pressable>
          ))}
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: EventuColors.black,
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Shadows.sm,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: EventuColors.hotPink + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: EventuColors.black,
    marginBottom: 4,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 12,
    color: EventuColors.mediumGray,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: EventuColors.black,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: EventuColors.mediumGray,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: EventuColors.lightGray,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: EventuColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.sm,
  },
  topicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: EventuColors.hotPink + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topicTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: EventuColors.black,
  },
});
