
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
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
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
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
    color: '#F59E0B',
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
    backgroundColor: colors.sectionOrange,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
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
  scenarioCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  scenarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scenarioLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  scenarioValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  scenarioHighlight: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  warningBox: {
    backgroundColor: colors.sectionOrangeStrong,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.4)',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
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
          <Text style={styles.headerTitle}>Valor de MAXCOIN</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="show-chart" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>¿Qué valor puede alcanzar MAXCOIN?</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>📈 Potencial de Crecimiento</Text>
          <Text style={styles.highlightText}>
            El valor de MAXCOIN dependerá de múltiples factores, incluyendo adopción, utilidad, demanda del mercado y desarrollo del ecosistema.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Aviso Importante</Text>
          <Text style={styles.warningText}>
            Las proyecciones de valor son estimaciones basadas en análisis de mercado y no constituyen garantías. El valor de cualquier criptomoneda puede fluctuar significativamente. Invierte solo lo que puedas permitirte perder.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Precio de Preventa</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Fase 1:</Text> 0.4 USDT por MXI
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Fase 2:</Text> 0.7 USDT por MXI (75% de aumento)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Fase 3:</Text> 1.0 USDT por MXI (150% desde Fase 1)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Factores que Influyen en el Valor</Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>1.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Oferta Limitada:</Text> Solo 25 millones de MXI en circulación durante la preventa
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>2.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Utilidad Real:</Text> MXI se usa activamente en torneos, juegos y competencias
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>3.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Demanda Creciente:</Text> Más usuarios = más demanda = mayor valor
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>4.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Listado en Exchanges:</Text> Mayor liquidez y accesibilidad aumentan el valor
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>5.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Ecosistema Activo:</Text> Torneos constantes crean demanda continua
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>6.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Vesting Atractivo:</Text> 3% mensual incentiva a mantener (hold) el token
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 Escenarios de Proyección</Text>
        </View>

        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioTitle}>📉 Escenario Conservador</Text>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>Al lanzamiento (Feb 2026):</Text>
            <Text style={styles.scenarioValue}>1.5 - 2.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>6 meses después:</Text>
            <Text style={styles.scenarioValue}>2.5 - 3.5 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>1 año después:</Text>
            <Text style={styles.scenarioValue}>4.0 - 6.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>ROI desde Fase 1:</Text>
            <Text style={styles.scenarioHighlight}>10x - 15x</Text>
          </View>
        </View>

        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioTitle}>📊 Escenario Moderado</Text>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>Al lanzamiento (Feb 2026):</Text>
            <Text style={styles.scenarioValue}>2.5 - 4.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>6 meses después:</Text>
            <Text style={styles.scenarioValue}>5.0 - 8.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>1 año después:</Text>
            <Text style={styles.scenarioValue}>10.0 - 15.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>ROI desde Fase 1:</Text>
            <Text style={styles.scenarioHighlight}>25x - 37x</Text>
          </View>
        </View>

        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioTitle}>📈 Escenario Optimista</Text>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>Al lanzamiento (Feb 2026):</Text>
            <Text style={styles.scenarioValue}>5.0 - 8.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>6 meses después:</Text>
            <Text style={styles.scenarioValue}>12.0 - 20.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>1 año después:</Text>
            <Text style={styles.scenarioValue}>25.0 - 50.0 USDT</Text>
          </View>
          <View style={styles.scenarioRow}>
            <Text style={styles.scenarioLabel}>ROI desde Fase 1:</Text>
            <Text style={styles.scenarioHighlight}>62x - 125x</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Ejemplo de Inversión</Text>
          <Text style={styles.paragraph}>
            Si inviertes 1,000 USDT en la Fase 1 (0.4 USDT):
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Obtienes: 2,500 MXI
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Escenario conservador (6 USDT): 15,000 USDT
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Escenario moderado (15 USDT): 37,500 USDT
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Escenario optimista (50 USDT): 125,000 USDT
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Catalizadores de Valor</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Listado en exchanges principales (Binance, Coinbase, etc.)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Asociaciones estratégicas con marcas reconocidas
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Expansión del ecosistema de juegos y torneos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Adopción masiva de usuarios
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Desarrollo de nuevas funcionalidades (NFTs, marketplace, etc.)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Gestión de Riesgos</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Diversifica tu portafolio, no inviertas todo en un solo activo
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Invierte solo lo que puedas permitirte perder
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Considera el vesting como ingreso pasivo adicional
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Mantén una perspectiva a largo plazo
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
