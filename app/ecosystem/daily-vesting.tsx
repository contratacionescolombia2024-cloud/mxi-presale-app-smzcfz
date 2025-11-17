
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
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
    color: colors.info,
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
    backgroundColor: colors.sectionBlue,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
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
  exampleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  exampleValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  formulaBox: {
    backgroundColor: colors.sectionPurple,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  formulaText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
  },
});

export default function DailyVestingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vesting Diario</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="schedule" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>Vesting Diario</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>⚡ Rendimientos en Tiempo Real</Text>
          <Text style={styles.highlightText}>
            El sistema de vesting de MXI te proporciona un rendimiento del 3% mensual sobre tus MXI comprados, calculado y actualizado cada segundo en tiempo real.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔢 ¿Cómo Funciona?</Text>
          <Text style={styles.paragraph}>
            El vesting es un sistema de recompensas automático que genera rendimientos pasivos sobre tus MXI comprados:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Tasa fija:</Text> 3% mensual sobre tus MXI comprados
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Actualización continua:</Text> Se calcula cada segundo, no tienes que esperar al final del mes
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Automático:</Text> No requiere ninguna acción de tu parte
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Acumulativo:</Text> Los rendimientos se suman a tu balance total
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Fórmula de Cálculo</Text>
          <Text style={styles.paragraph}>
            El cálculo del vesting se realiza de la siguiente manera:
          </Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Rendimiento por segundo = {'\n'}
              (MXI Comprados × 0.03) / (30 × 24 × 60 × 60)
            </Text>
          </View>
          <Text style={styles.paragraph}>
            Esto significa que cada segundo, tu balance aumenta proporcionalmente al 3% mensual.
          </Text>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>💡 Ejemplo Práctico</Text>
          <Text style={[styles.paragraph, { marginBottom: 16 }]}>
            Si compras 1,000 MXI:
          </Text>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Inversión inicial:</Text>
            <Text style={styles.exampleValue}>1,000 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Rendimiento mensual (3%):</Text>
            <Text style={styles.exampleValue}>30 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Rendimiento diario:</Text>
            <Text style={styles.exampleValue}>1 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Rendimiento por hora:</Text>
            <Text style={styles.exampleValue}>0.0417 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Rendimiento por segundo:</Text>
            <Text style={styles.exampleValue}>0.0000116 MXI</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Proyecciones en la App</Text>
          <Text style={styles.paragraph}>
            En la pantalla de Vesting de la app, puedes ver proyecciones de tus ganancias:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>7 días:</Text> Cuánto ganarás en una semana
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>15 días:</Text> Proyección a dos semanas
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>30 días:</Text> Rendimiento mensual completo
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Importante</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              El vesting se calcula SOLO sobre los MXI que compraste directamente, no sobre comisiones de referidos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Los rendimientos se acumulan automáticamente en tu balance de vesting
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Puedes ver tus rendimientos actualizándose en tiempo real en la pantalla principal
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              El porcentaje de vesting puede ser ajustado por los administradores según las condiciones del mercado
            </Text>
          </View>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>🚀 Ejemplo de Crecimiento a Largo Plazo</Text>
          <Text style={[styles.paragraph, { marginBottom: 16 }]}>
            Con 10,000 MXI comprados:
          </Text>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 1:</Text>
            <Text style={styles.exampleValue}>10,300 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 3:</Text>
            <Text style={styles.exampleValue}>10,900 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 6:</Text>
            <Text style={styles.exampleValue}>11,800 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 12:</Text>
            <Text style={styles.exampleValue}>13,600 MXI</Text>
          </View>
          <Text style={[styles.paragraph, { marginTop: 12, fontSize: 13, fontStyle: 'italic' }]}>
            * Estos cálculos asumen que el porcentaje de vesting se mantiene constante al 3% mensual.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
