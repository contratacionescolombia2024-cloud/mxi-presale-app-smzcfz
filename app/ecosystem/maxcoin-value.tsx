
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 8,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  highlightBox: {
    backgroundColor: colors.sectionGreen,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  timelineCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  timelineValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 12,
  },
  timelineDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default function MaxcoinValueScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Valor de MXI</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="trending-up" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>💎 ¿A qué valor podría llegar MXI?</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>🚀 Ventaja Única de MXI</Text>
          <Text style={styles.highlightText}>
            MXI nace con una ventaja única: un ecosistema completo, utilidad real desde el día uno y una comunidad hispanohablante en expansión.
          </Text>
          <Text style={[styles.highlightText, { marginTop: 12 }]}>
            Por eso, el escenario optimista no es un sueño; es una proyección basada en datos, demanda potencial y el crecimiento natural de proyectos similares.
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/1969d5bb-be8c-4b63-a53b-ba7fbcc9a30d.png')}
            style={styles.image}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 ¿A qué valor podría llegar MXI?</Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>📅 6 a 12 meses después del lanzamiento:</Text>
          <Text style={styles.timelineValue}>3 – 7 USDT por MXI</Text>
          <Text style={styles.timelineDescription}>
            Un crecimiento impulsado por la adopción temprana, el uso de la app MXI Strategic, torneos, pagos y el sistema de vesting diario.
          </Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>📅 24 meses después del lanzamiento:</Text>
          <Text style={styles.timelineValue}>7 – 12 USDT por MXI</Text>
          <Text style={styles.timelineDescription}>
            A medida que los módulos del ecosistema se integren (MXI Pay, MXI Games, MXI Loan, MXI ONE), la utilidad del token aumenta, y con ella, su precio natural.
          </Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>📅 36 meses después del lanzamiento:</Text>
          <Text style={styles.timelineValue}>12 – 18 USDT por MXI</Text>
          <Text style={styles.timelineDescription}>
            Con la comunidad consolidada, alianzas estratégicas y la futura transición hacia MXI Chain, el token entra en su etapa de madurez y expansión global.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ ¿Por qué este crecimiento es posible?</Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Ecosistema con utilidad real y uso constante</Text>
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Suministro limitado a 50 millones</Text>
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Expansión en países hispanohablantes</Text>
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Integración progresiva de apps y servicios</Text>
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Vesting diario que impulsa la retención</Text>
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Actividad en torneos y sistema de referidos</Text>
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Potencial de viralidad gracias al enfoque simple: ganar, usar, compartir</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 MXI Strategic Holdings Ltd.</Text>
          <Text style={styles.footerText}>
            MAXCOIN (MXI) is a registered trademark of MXI Strategic Holdings Ltd., Cayman Islands.
          </Text>
          <Text style={styles.footerText}>App operated by MXI Technologies Inc. (Panamá).</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
