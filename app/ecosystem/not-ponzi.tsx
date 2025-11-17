
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
    backgroundColor: '#14B8A6',
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
    color: '#14B8A6',
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
    backgroundColor: colors.sectionTeal,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.4)',
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
  comparisonCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  comparisonLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
  },
  comparisonPonzi: {
    flex: 1,
    fontSize: 15,
    color: colors.error,
    fontWeight: 'bold',
  },
  comparisonMXI: {
    flex: 1,
    fontSize: 15,
    color: colors.success,
    fontWeight: 'bold',
  },
});

export default function NotPonziScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>No es Ponzi</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="verified" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>¿Porque MXI no es un esquema Ponzi?</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>✅ Transparencia Total</Text>
          <Text style={styles.highlightText}>
            MXI opera con total transparencia y tiene múltiples fuentes de ingresos reales, a diferencia de los esquemas Ponzi que dependen únicamente de nuevos inversores.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 ¿Qué es un Esquema Ponzi?</Text>
          <Text style={styles.paragraph}>
            Un esquema Ponzi es un fraude de inversión que paga rendimientos a los inversores existentes con fondos aportados por nuevos inversores, sin generar valor real. Características típicas:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Promesas de rendimientos extraordinariamente altos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              No hay producto o servicio real que genere ingresos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Depende completamente de nuevos inversores para pagar a los antiguos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Falta de transparencia en las operaciones
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Colapsa cuando no hay suficientes nuevos inversores
            </Text>
          </View>
        </View>

        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>📊 Comparación: Ponzi vs MXI</Text>
          
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>Fuentes de ingreso:</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonPonzi}>❌ Solo nuevos inversores</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMXI}>✅ Torneos, comisiones, actividad</Text>
          </View>

          <View style={[styles.comparisonRow, { marginTop: 12 }]}>
            <Text style={styles.comparisonLabel}>Producto real:</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonPonzi}>❌ No existe</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMXI}>✅ Ecosistema de juegos y torneos</Text>
          </View>

          <View style={[styles.comparisonRow, { marginTop: 12 }]}>
            <Text style={styles.comparisonLabel}>Transparencia:</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonPonzi}>❌ Opaco y secreto</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMXI}>✅ Blockchain público</Text>
          </View>

          <View style={[styles.comparisonRow, { marginTop: 12 }]}>
            <Text style={styles.comparisonLabel}>Sostenibilidad:</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonPonzi}>❌ Colapsa inevitablemente</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonMXI}>✅ Modelo sostenible a largo plazo</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Por Qué MXI es Diferente</Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>1.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Ingresos Reales:</Text> Los torneos generan comisiones (10% de cada premio) que sostienen el ecosistema
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>2.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Utilidad Real:</Text> MXI se usa para participar en juegos, torneos y competencias
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>3.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Transparencia:</Text> Todas las transacciones están en blockchain y son verificables
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>4.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>KYC Obligatorio:</Text> Verificación de identidad para prevenir fraudes
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>5.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Múltiples Fuentes:</Text> Vesting, referidos, torneos - no depende solo de nuevos inversores
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>6.</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Rendimientos Realistas:</Text> 3% mensual es sostenible, no promesas irreales del 10-20% diario
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Protecciones Implementadas</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Límites de compra (10-50,000 USDT) para prevenir manipulación
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Fondo de reserva para garantizar pagos en períodos de baja actividad
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Auditorías regulares de la salud financiera del ecosistema
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Sistema de retiros verificado y transparente
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Modelo de Negocio Legítimo</Text>
          <Text style={styles.paragraph}>
            MXI opera como un ecosistema de entretenimiento digital donde:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Los usuarios pagan para participar en juegos y torneos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              El ecosistema toma una pequeña comisión de cada actividad
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Estas comisiones sostienen el vesting y las operaciones
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              El valor del token crece con la adopción y uso real
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Conclusión</Text>
          <Text style={styles.paragraph}>
            MXI no es un esquema Ponzi porque tiene un producto real (ecosistema de juegos), genera ingresos reales (comisiones de torneos), opera con transparencia total (blockchain), y no depende únicamente de nuevos inversores para pagar a los existentes. Es un modelo de negocio legítimo y sostenible.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
