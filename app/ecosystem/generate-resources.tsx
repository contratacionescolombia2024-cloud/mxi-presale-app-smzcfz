
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
  heroImage: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 24,
    resizeMode: 'cover',
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
  boldText: {
    fontWeight: 'bold',
    color: colors.text,
  },
  highlightBox: {
    backgroundColor: colors.sectionGreen,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  highlightText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  phaseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  phaseHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 12,
  },
  phasePrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  phaseBenefit: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  quoteBox: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 17,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 26,
    textAlign: 'center',
  },
  growthCard: {
    backgroundColor: colors.sectionGreen,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  growthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  growthItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  exampleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 16,
    textAlign: 'center',
  },
  exampleSubtitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    marginTop: 12,
  },
  calculationText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  resultBox: {
    backgroundColor: colors.sectionGreen,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  finalResultBox: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  finalResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: 12,
  },
  finalResultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: 4,
  },
  finalResultSubtext: {
    fontSize: 15,
    color: colors.light,
    opacity: 0.9,
  },
});

export default function GenerateResourcesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generar Recursos</Text>
        </View>

        <Image
          source={require('@/assets/images/5c71087c-e9d8-472d-9687-a6930f294549.png')}
          style={styles.heroImage}
        />

        <Text style={styles.title}>💰 ¿Cómo generar recursos con MXI en preventa?</Text>

        <View style={styles.section}>
          <Text style={styles.paragraph}>
            La preventa oficial de MAXCOIN es la puerta de entrada a su ecosistema. 🚀
          </Text>
          <Text style={styles.paragraph}>
            Está dividido en tres fases, cada una con beneficios progresivos y exclusivos:
          </Text>
        </View>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseHeader}>1️⃣ Primera fase</Text>
          <Text style={styles.phasePrice}>0.40 USDT</Text>
          <Text style={styles.phaseBenefit}>✅ Participación en staking anticipado</Text>
          <Text style={styles.phaseBenefit}>✅ Acceso prioritario</Text>
          <Text style={styles.phaseBenefit}>✅ Bonificación en referidos</Text>
          <Text style={styles.phaseBenefit}>✅ Minería temprana</Text>
        </View>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseHeader}>2️⃣ Segunda fase</Text>
          <Text style={styles.phasePrice}>0.70 USDT</Text>
          <Text style={styles.phaseBenefit}>✅ Participación en staking anticipado</Text>
          <Text style={styles.phaseBenefit}>✅ Acceso prioritario</Text>
          <Text style={styles.phaseBenefit}>✅ Bonificación en referidos</Text>
          <Text style={styles.phaseBenefit}>✅ Minería temprana</Text>
        </View>

        <View style={styles.phaseCard}>
          <Text style={styles.phaseHeader}>3️⃣ Tercera fase</Text>
          <Text style={styles.phasePrice}>1.00 USDT</Text>
          <Text style={styles.phaseBenefit}>✅ Acceso a MXI Strategic</Text>
          <Text style={styles.phaseBenefit}>✅ Minería</Text>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            🤝 Además, cada participante puede ganar comisiones con el sistema de referidos, creando una red que crece contigo.
          </Text>
          <Text style={styles.highlightText}>
            💡 No necesitas experiencia previa - solo visión.
          </Text>
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            💬 &quot;Quien entendió Bitcoin en 2011, hoy entiende MAXCOIN&quot;
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Tres Vías de Crecimiento</Text>
          <Text style={styles.paragraph}>
            MXI ofrece tres vías simultáneas de crecimiento incluso antes del lanzamiento oficial:
          </Text>
        </View>

        <View style={styles.growthCard}>
          <Text style={styles.growthTitle}>🚀 Valorización temprana del token</Text>
          <Text style={styles.growthItem}>Preventa → Mercado</Text>
        </View>

        <View style={styles.growthCard}>
          <Text style={styles.growthTitle}>💸 Comisiones por referidos</Text>
          <Text style={styles.growthItem}>Sistema multinivel corto y sostenible</Text>
        </View>

        <View style={styles.growthCard}>
          <Text style={styles.growthTitle}>📊 Vesting diario</Text>
          <Text style={styles.growthItem}>Aprox. 3% mensual</Text>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            ⚡ Esto combina ganancias activas y pasivas, sin necesidad de grandes inversiones.
          </Text>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>💵 Ejemplo Práctico Completo</Text>
          
          <Text style={styles.exampleSubtitle}>1️⃣ Ganancia por Valorización Temprana</Text>
          <Text style={styles.calculationText}>
            <Text style={styles.boldText}>Compra:</Text> 200 USDT en Fase 1 (0.40 USDT)
          </Text>
          <Text style={styles.calculationText}>
            <Text style={styles.boldText}>MXI recibidos:</Text> 200 / 0.40 = 500 MXI
          </Text>
          <Text style={[styles.calculationText, { marginTop: 8 }]}>
            Si luego MXI vale entre 3 y 6 USDT:
          </Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>📈 A 3 USDT → 1.500 USDT</Text>
            <Text style={styles.resultText}>📈 A 6 USDT → 3.000 USDT</Text>
          </View>

          <Text style={styles.exampleSubtitle}>2️⃣ Ganancia por Referidos (3 niveles)</Text>
          <Text style={styles.calculationText}>Ejemplo moderado:</Text>
          <Text style={styles.calculationText}>• 10 invitados directos → generan 25 USDT</Text>
          <Text style={styles.calculationText}>• Sus invitados → generan 60 USDT</Text>
          <Text style={styles.calculationText}>• Tercer nivel → 100 USDT</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>💰 Total solo por referidos: 185 USDT</Text>
          </View>

          <Text style={styles.exampleSubtitle}>3️⃣ Ganancia por Vesting (≈3% mensual)</Text>
          <Text style={styles.calculationText}>Sobre 500 MXI, en 6 meses:</Text>
          <Text style={styles.calculationText}>500 × 0.18 = 90 MXI extra</Text>
          <Text style={[styles.calculationText, { marginTop: 8 }]}>
            Si MXI vale entre 3 y 6 USDT:
          </Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>📊 90 × 3 = 270 USDT</Text>
            <Text style={styles.resultText}>📊 90 × 6 = 540 USDT</Text>
          </View>

          <Text style={styles.exampleSubtitle}>🎯 Resumen Total</Text>
          <Text style={styles.calculationText}>
            <Text style={styles.boldText}>MXI totales con vesting:</Text> 500 + 90 = 590 MXI
          </Text>
          <Text style={[styles.calculationText, { marginTop: 8 }]}>
            Valor futuro:
          </Text>
          <Text style={styles.calculationText}>• A 3 USDT → 590 × 3 = 1.770 USDT</Text>
          <Text style={styles.calculationText}>• A 6 USDT → 590 × 6 = 3.540 USDT</Text>
          <Text style={[styles.calculationText, { marginTop: 8 }]}>
            <Text style={styles.boldText}>Suma de referidos:</Text> +185 USDT
          </Text>

          <View style={styles.finalResultBox}>
            <Text style={styles.finalResultTitle}>🏆 Resultado Total (Completo)</Text>
            <Text style={styles.finalResultValue}>1.955 USDT</Text>
            <Text style={styles.finalResultSubtext}>
              (escenario 3 USD)
            </Text>
            <Text style={[styles.finalResultValue, { marginTop: 12 }]}>
              3.725 USDT
            </Text>
            <Text style={styles.finalResultSubtext}>
              (escenario 6 USD)
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            ✨ Este ejemplo demuestra cómo una inversión inicial de 200 USDT puede multiplicarse significativamente combinando las tres vías de crecimiento: valorización, referidos y vesting.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
