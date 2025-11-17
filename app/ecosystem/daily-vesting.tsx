
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
import AppFooter from '@/components/AppFooter';

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
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
    resizeMode: 'cover',
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
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 7, 0.4)',
  },
  successBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.4)',
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

        <Text style={styles.title}>💎 VESTING DIARIO MXI{'\n'}(VERSIÓN TÉCNICA)</Text>

        <Image
          source={require('@/assets/images/bd9bc855-f697-4940-b9a7-58f765498760.png')}
          style={styles.heroImage}
        />

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>🎯 ¿Qué es el Vesting Diario?</Text>
          <Text style={styles.highlightText}>
            El vesting diario de MXI es un mecanismo programado que incrementa automáticamente el saldo total de MXI que posee cada usuario dentro del ecosistema. Su objetivo es incentivar la retención del token y generar un crecimiento progresivo sin afectar la liquidez del proyecto.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ ¿Cómo funciona el vesting?</Text>
          <Text style={styles.paragraph}>
            MXI aplica un rendimiento diario aproximado de 0.12%, equivalente a un 3% mensual sobre el saldo que el usuario mantiene en su wallet dentro del ecosistema. Este rendimiento se calcula de forma automática y se acredita diariamente en MXI adicionales.
          </Text>
          <Text style={styles.paragraph}>
            El vesting no entrega USDT ni divisas externas; únicamente distribuye MXI programado. Esto garantiza que el mecanismo sea sostenible, no genere presión de liquidez y pueda operar a largo plazo sin afectar la estabilidad económica del proyecto.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 Fórmula utilizada</Text>
          
          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text }]}>
            Rendimiento diario estimado:
          </Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Saldo MXI × 0.0012{'\n'}(0.12% diario)
            </Text>
          </View>

          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text, marginTop: 16 }]}>
            Rendimiento mensual estimado:
          </Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Saldo MXI × 0.03{'\n'}(3% mensual)
            </Text>
          </View>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>💡 Ejemplo práctico</Text>
          <Text style={styles.paragraph}>
            Si un usuario adquiere 500 MXI en preventa, el sistema aplicará un crecimiento automático de 3% mensual:
          </Text>
          
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              500 MXI × 0.03 = 15 MXI mensuales
            </Text>
          </View>

          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text, marginTop: 16 }]}>
            En 6 meses:
          </Text>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              500 MXI × 0.18 = 90 MXI adicionales
            </Text>
          </View>

          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text, marginTop: 16 }]}>
            Saldo total después de 6 meses:
          </Text>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Total acumulado:</Text>
            <Text style={[styles.exampleValue, { color: colors.success, fontSize: 18 }]}>590 MXI</Text>
          </View>

          <Text style={[styles.paragraph, { marginTop: 16, fontStyle: 'italic' }]}>
            Este incremento se obtiene únicamente por mantener los MXI dentro del ecosistema, sin bloquearlos y sin necesidad de realizar acciones adicionales.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Beneficio adicional con valorización</Text>
          <Text style={styles.paragraph}>
            El vesting genera crecimiento en cantidad de MXI. Si el precio aumenta después del lanzamiento, el rendimiento acumulado potencia el valor final.
          </Text>

          <View style={styles.successBox}>
            <Text style={[styles.highlightTitle, { marginBottom: 16 }]}>
              💰 Ejemplo con valorización proyectada
            </Text>
            <Text style={[styles.paragraph, { marginBottom: 16 }]}>
              Precio estimado del token post lanzamiento: 3 a 6 USDT
            </Text>
            
            <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text }]}>
              Saldo con vesting (590 MXI):
            </Text>
            <View style={styles.exampleRow}>
              <Text style={styles.exampleLabel}>A 3 USDT:</Text>
              <Text style={[styles.exampleValue, { color: colors.success }]}>1,770 USDT</Text>
            </View>
            <View style={styles.exampleRow}>
              <Text style={styles.exampleLabel}>A 6 USDT:</Text>
              <Text style={[styles.exampleValue, { color: colors.success }]}>3,540 USDT</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ ¿Por qué es sostenible?</Text>
          
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.bulletText}>
              El vesting entrega MXI programado, no dinero externo.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.bulletText}>
              No compromete la liquidez del proyecto ni sus reservas.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.bulletText}>
              Está diseñado para acompañar el crecimiento natural del ecosistema.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.bulletText}>
              Fomenta la retención del token, lo que ayuda a estabilizar el precio.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.bulletText}>
              La generación de MXI está alineada con la adopción progresiva del ecosistema.
            </Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.highlightTitle}>🎯 Objetivo técnico del vesting</Text>
          <Text style={styles.paragraph}>
            El vesting diario existe para:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Premiar la retención del token
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Estabilizar la economía interna
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Fortalecer el precio a mediano plazo
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Crear un incentivo continuo para mantener participación dentro del ecosistema MXI
            </Text>
          </View>
        </View>

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>🚀 Proyección de Crecimiento a Largo Plazo</Text>
          <Text style={[styles.paragraph, { marginBottom: 16 }]}>
            Con una inversión inicial de 500 MXI:
          </Text>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 1:</Text>
            <Text style={styles.exampleValue}>515 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 3:</Text>
            <Text style={styles.exampleValue}>545 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 6:</Text>
            <Text style={styles.exampleValue}>590 MXI</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleLabel}>Mes 12:</Text>
            <Text style={styles.exampleValue}>680 MXI</Text>
          </View>
          <Text style={[styles.paragraph, { marginTop: 12, fontSize: 13, fontStyle: 'italic' }]}>
            * Cálculos basados en un rendimiento constante del 3% mensual sin reinversión de ganancias.
          </Text>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💎 Ventaja Competitiva</Text>
          <Text style={styles.highlightText}>
            El vesting diario de MXI no solo genera rendimientos pasivos, sino que crea un ecosistema donde mantener tus tokens es más rentable que venderlos. Esto reduce la volatilidad, aumenta la estabilidad del precio y beneficia a toda la comunidad a largo plazo.
          </Text>
        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
