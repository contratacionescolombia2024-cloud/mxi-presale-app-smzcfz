
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
    backgroundColor: colors.accent,
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
    color: colors.accent,
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
  reasonCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  reasonIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  reasonDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default function WhyBuyMaxcoinScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Por qué comprar MAXCOIN</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="trending-up" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>¿Por qué debería comprar MAXCOIN?</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💎 Oportunidad de Inversión</Text>
          <Text style={styles.highlightText}>
            MAXCOIN (MXI) representa una oportunidad única de inversión en un ecosistema digital completo con múltiples fuentes de valor.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>📈</Text>
          <Text style={styles.reasonTitle}>Apreciación del Valor</Text>
          <Text style={styles.reasonDescription}>
            El precio de MXI aumenta progresivamente durante la preventa (0.4 → 0.7 → 1.0 USDT). Los compradores tempranos obtienen el mejor precio y pueden beneficiarse de la apreciación inmediata cuando el token pase a la siguiente fase.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>💰</Text>
          <Text style={styles.reasonTitle}>Rendimientos Pasivos Garantizados</Text>
          <Text style={styles.reasonDescription}>
            El sistema de vesting te garantiza un 3% mensual sobre tus MXI comprados. Esto significa que tu inversión genera rendimientos automáticos sin que tengas que hacer nada, calculados y actualizados en tiempo real.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🎁</Text>
          <Text style={styles.reasonTitle}>Programa de Referidos Lucrativo</Text>
          <Text style={styles.reasonDescription}>
            Gana comisiones en tres niveles (5%, 2%, 1%) por cada persona que se una usando tu código. Esto crea un efecto multiplicador donde tu red puede generar ingresos significativos de manera pasiva.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🏆</Text>
          <Text style={styles.reasonTitle}>Ecosistema de Juegos y Torneos</Text>
          <Text style={styles.reasonDescription}>
            A diferencia de otros tokens, MXI tiene un ecosistema completo de juegos donde puedes ganar más tokens. Los torneos ofrecen premios sustanciales y añaden una dimensión de entretenimiento a tu inversión.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🔒</Text>
          <Text style={styles.reasonTitle}>Seguridad y Transparencia</Text>
          <Text style={styles.reasonDescription}>
            Sistema KYC robusto, verificación de usuarios, y procesos transparentes. Todos los movimientos están registrados en blockchain, garantizando la seguridad de tu inversión.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🌱</Text>
          <Text style={styles.reasonTitle}>Modelo Sostenible</Text>
          <Text style={styles.reasonDescription}>
            A diferencia de esquemas Ponzi, MXI tiene múltiples fuentes de ingresos reales: torneos, comisiones de transacción, y un ecosistema de juegos que genera valor genuino.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🚀</Text>
          <Text style={styles.reasonTitle}>Potencial de Crecimiento</Text>
          <Text style={styles.reasonDescription}>
            Con solo 25 millones de tokens en circulación durante la preventa, la oferta limitada combinada con la demanda creciente puede impulsar el valor significativamente después del lanzamiento oficial.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Ventajas Competitivas</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Precio de entrada bajo durante la preventa
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Múltiples formas de generar ingresos simultáneamente
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Comunidad activa y en crecimiento
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Roadmap claro y equipo comprometido
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Utilidad real más allá de la especulación
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ El Momento es Ahora</Text>
          <Text style={styles.paragraph}>
            La preventa es el momento ideal para entrar. Cada fase tiene un precio más alto, por lo que comprar ahora significa obtener el mejor precio posible. Además, cuanto antes entres, más tiempo tendrás para acumular rendimientos de vesting y construir tu red de referidos.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
