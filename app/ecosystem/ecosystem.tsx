
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
    backgroundColor: colors.highlight,
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
    color: colors.highlight,
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
    backgroundColor: colors.sectionPink,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.4)',
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
  componentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  componentIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  componentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  componentDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default function EcosystemDetailsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ecosistema</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="hub" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>Ecosistema MXI</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>🌐 Un Ecosistema Completo</Text>
          <Text style={styles.highlightText}>
            MXI no es solo un token, es un ecosistema completo con múltiples componentes interconectados que crean valor para todos los participantes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏗️ Componentes del Ecosistema</Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>💰</Text>
          <Text style={styles.componentTitle}>1. Sistema de Preventa</Text>
          <Text style={styles.componentDescription}>
            Distribución inicial de 25 millones de MXI en tres fases con precios progresivos. Permite a los inversores tempranos obtener el mejor precio y beneficiarse de la apreciación del token.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>📈</Text>
          <Text style={styles.componentTitle}>2. Sistema de Vesting</Text>
          <Text style={styles.componentDescription}>
            Rendimientos pasivos del 3% mensual sobre MXI comprados, calculados en tiempo real cada segundo. Proporciona ingresos constantes sin requerir acción del usuario.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>🎁</Text>
          <Text style={styles.componentTitle}>3. Programa de Referidos</Text>
          <Text style={styles.componentDescription}>
            Sistema multinivel (5%, 2%, 1%) que recompensa a los usuarios por hacer crecer la comunidad. Cada referido genera comisiones automáticas en tres niveles de profundidad.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>🏆</Text>
          <Text style={styles.componentTitle}>4. Torneos Estándar</Text>
          <Text style={styles.componentDescription}>
            Competencias de 25-50 jugadores con entrada de 3 MXI y premios de 135 MXI. Incluye juegos como Reaction Test, Jump Time, Slide Puzzle, Memory Speed y Snake Retro.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>🔥</Text>
          <Text style={styles.componentTitle}>5. MXI Viral Zone</Text>
          <Text style={styles.componentDescription}>
            Torneos masivos de 100 jugadores con entrada de 1 MXI. Juegos virales como Catch It, Shuriken Aim, Floor is Lava, Number Tracker y Reflex Bomb.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>⚔️</Text>
          <Text style={styles.componentTitle}>6. MXI Mini Battles</Text>
          <Text style={styles.componentDescription}>
            Batallas rápidas entre 2-4 jugadores donde el ganador se lleva todo. Entrada flexible de 5-1000 MXI. Incluye juegos como Beat Bounce, Perfect Distance y Swipe Master.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>🔒</Text>
          <Text style={styles.componentTitle}>7. Sistema KYC</Text>
          <Text style={styles.componentDescription}>
            Verificación robusta de identidad para garantizar la seguridad del ecosistema. Protege contra fraudes y cumple con regulaciones internacionales.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>💳</Text>
          <Text style={styles.componentTitle}>8. Sistema de Pagos</Text>
          <Text style={styles.componentDescription}>
            Integración con PayPal y Binance para compras fáciles y seguras. Soporte para múltiples métodos de pago y retiros.
          </Text>
        </View>

        <View style={styles.componentCard}>
          <Text style={styles.componentIcon}>📊</Text>
          <Text style={styles.componentTitle}>9. Panel de Administración</Text>
          <Text style={styles.componentDescription}>
            Herramientas completas para gestionar el ecosistema, monitorear métricas, ajustar parámetros y garantizar el funcionamiento óptimo de todas las funcionalidades.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Interconexión</Text>
          <Text style={styles.paragraph}>
            Todos estos componentes trabajan juntos de manera sinérgica:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Los MXI comprados en la preventa generan vesting automáticamente
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Las comisiones de referidos se pueden usar en torneos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Los premios de torneos aumentan tu balance total
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Todo el ecosistema está protegido por KYC y seguridad robusta
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Roadmap Futuro</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Q1 2026:</Text> Lanzamiento oficial del token en exchanges
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Q2 2026:</Text> Expansión de juegos y nuevos tipos de torneos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Q3 2026:</Text> Marketplace de NFTs y coleccionables
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Q4 2026:</Text> Asociaciones estratégicas y expansión global
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
