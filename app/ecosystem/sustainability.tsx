
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react';
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
    backgroundColor: colors.secondary,
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
    color: colors.secondary,
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
  pillarCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pillarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  pillarDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default function SustainabilityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sostenibilidad</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="eco" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>Sostenibilidad</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>🌱 Modelo Sostenible</Text>
          <Text style={styles.highlightText}>
            La sostenibilidad de MXI se basa en múltiples fuentes de ingresos reales y un modelo económico equilibrado que beneficia a todos los participantes a largo plazo.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Fuentes de Ingresos del Ecosistema</Text>
          <Text style={styles.paragraph}>
            A diferencia de modelos insostenibles, MXI genera valor real a través de:
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>1. 🎮 Comisiones de Torneos</Text>
          <Text style={styles.pillarDescription}>
            El 10% de cada premio de torneo va al fondo de premios del ecosistema. Con miles de torneos activos, esto genera un flujo constante de ingresos que sostiene el sistema de recompensas.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>2. 💱 Comisiones de Transacción</Text>
          <Text style={styles.pillarDescription}>
            Pequeñas comisiones en las transacciones de compra, venta y transferencia de MXI generan ingresos que se reinvierten en el ecosistema y en el desarrollo de nuevas funcionalidades.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>3. 🎯 Actividad del Ecosistema</Text>
          <Text style={styles.pillarDescription}>
            Los juegos, torneos y competencias crean un ecosistema activo donde los usuarios intercambian valor constantemente, generando liquidez y demanda orgánica para el token.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>4. 📈 Apreciación del Token</Text>
          <Text style={styles.pillarDescription}>
            Con oferta limitada (25 millones en preventa) y demanda creciente, el valor del token aumenta naturalmente, beneficiando a todos los holders sin depender de nuevos inversores.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚖️ Balance Económico</Text>
          <Text style={styles.paragraph}>
            El sistema está diseñado para mantener un balance saludable:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Vesting controlado:</Text> El 3% mensual es sostenible y está respaldado por los ingresos del ecosistema
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Comisiones equilibradas:</Text> Las comisiones de referidos (5%, 2%, 1%) incentivan el crecimiento sin comprometer la estabilidad
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Fondo de reserva:</Text> Parte de los ingresos se destina a un fondo de reserva para garantizar pagos incluso en períodos de baja actividad
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Ciclo Virtuoso</Text>
          <Text style={styles.paragraph}>
            MXI crea un ciclo virtuoso de crecimiento:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>1.</Text>
            <Text style={styles.bulletText}>
              Usuarios compran MXI y participan en el ecosistema
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>2.</Text>
            <Text style={styles.bulletText}>
              La actividad genera ingresos reales (torneos, comisiones)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>3.</Text>
            <Text style={styles.bulletText}>
              Los ingresos sostienen el vesting y las recompensas
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>4.</Text>
            <Text style={styles.bulletText}>
              Los usuarios satisfechos atraen más participantes
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>5.</Text>
            <Text style={styles.bulletText}>
              El ciclo se repite, fortaleciendo el ecosistema
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Protecciones Implementadas</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Límites de compra:</Text> Mínimo 10 USDT, máximo 50,000 USDT por transacción
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>KYC obligatorio:</Text> Verificación de identidad para prevenir fraudes
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Auditorías regulares:</Text> Revisión constante de la salud financiera del ecosistema
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Transparencia total:</Text> Todos los movimientos registrados en blockchain
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Visión a Largo Plazo</Text>
          <Text style={styles.paragraph}>
            MXI no es un proyecto de corto plazo. Nuestra visión es construir un ecosistema digital sostenible que:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Genere valor real para todos los participantes
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Se mantenga activo y rentable durante años
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Evolucione con nuevas funcionalidades y mejoras
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Beneficie tanto a inversores tempranos como tardíos
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
