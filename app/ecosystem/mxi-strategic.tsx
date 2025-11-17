
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 18,
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
    backgroundColor: colors.sectionPurple,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  highlightText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 8,
  },
  emphasizedText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 26,
    marginBottom: 12,
  },
});

export default function MXIStrategicScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MAXCOIN</Text>
        </View>

        <Image 
          source={require('@/assets/images/00d63eef-73e1-4d9c-8c72-31c0dd08499f.jpeg')}
          style={styles.heroImage}
        />

        <Text style={styles.title}>💎 MAXCOIN</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            <Text style={styles.emphasizedText}>MAXCOIN es mucho más que una criptomoneda.</Text>
          </Text>
          <Text style={styles.highlightText}>
            Será un ecosistema financiero global, creado para unir tecnología, rendimiento y comunidad en una misma red.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            🚀 Nace bajo la visión de transformar la blockchain en una herramienta de crecimiento real.
          </Text>
          <Text style={styles.paragraph}>
            Cada token representa un fragmento de una economía digital en expansión, donde tu inversión impulsa utilidad, liquidez y adopción global.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.emphasizedText}>
            💪 MAXCOIN no busca especulación: construye valor real con productos reales.
          </Text>
          <Text style={styles.paragraph}>
            Pagos, préstamos, staking, minería y recompensas por participación, todo en un entorno seguro y auditable.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🔍 ¿Cómo se diferencia de otras criptomonedas?
          </Text>
          <Text style={styles.paragraph}>
            Mientras la mayoría de proyectos se limitan a prometer, MAXCOIN entrega estructura, propósito y utilidad.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✅</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Modelo financiero real</Text> con proyección cuantificable (de 0.40 a 12 USDT).
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🔗</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Ecosistema completo:</Text> MXI Chain, MXI Pay, MXI Loan, MXI Strategic App.
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>⚙️</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Transparencia total:</Text> contratos inteligentes auditados, sin fondos ocultos.
            </Text>
          </View>

          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🧩</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Diseño sostenible:</Text> basado en participación, minería y liquidez programada.
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.emphasizedText}>
            🌟 No es solo un token, es un sistema vivo que genera valor por diseño, no por especulación.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
