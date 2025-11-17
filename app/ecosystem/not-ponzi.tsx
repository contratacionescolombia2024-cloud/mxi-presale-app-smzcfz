
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 34,
  },
  introText: {
    fontSize: 17,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  sectionNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#14B8A6',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  sectionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  highlightBox: {
    backgroundColor: colors.sectionTeal,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },
  highlightTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  highlightText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: '#14B8A6',
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 16,
    color: colors.light,
    lineHeight: 24,
    textAlign: 'center',
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
          <Text style={styles.headerTitle}>¿Por qué no es Ponzi?</Text>
        </View>

        <Image
          source={require('@/assets/images/5e9bf3a6-c091-4433-b527-721b81d35998.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.iconContainer}>
          <IconSymbol name="verified" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>
          🛡️ ¿Por qué MXI no es un esquema Ponzi?
        </Text>

        <Text style={styles.introText}>
          MXI es un ecosistema real en desarrollo, no un sistema que depende del dinero de nuevos participantes. Su funcionamiento es totalmente distinto a cualquier esquema Ponzi o estafa.
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>1️⃣</Text>
          <Text style={styles.sectionTitle}>
            Compras un activo real, no una promesa
          </Text>
          <Text style={styles.sectionText}>
            En MXI, el usuario recibe un token con suministro limitado, precio definido y utilidad dentro de apps, juegos, pagos y servicios. No se promete un retorno fijo en dinero.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>2️⃣</Text>
          <Text style={styles.sectionTitle}>
            Las recompensas no se pagan con dinero de nuevos usuarios
          </Text>
          <Text style={styles.sectionText}>
            El vesting se entrega únicamente en MXI programado y los torneos se financian con comisiones internas, no con fondos de la preventa. Nada depende de "entradas nuevas".
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>3️⃣</Text>
          <Text style={styles.sectionTitle}>
            Existe un ecosistema funcional
          </Text>
          <Text style={styles.sectionText}>
            Pagos, torneos, billetera, staking, conversión, y futura MXI Chain. Un Ponzi no tiene producto; MXI sí.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>4️⃣</Text>
          <Text style={styles.sectionTitle}>
            Todo es transparente y verificable
          </Text>
          <Text style={styles.sectionText}>
            Supply fijo, contratos auditables, liquidez pública. No hay manejos ocultos.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>5️⃣</Text>
          <Text style={styles.sectionTitle}>
            Ningún usuario está obligado a traer personas
          </Text>
          <Text style={styles.sectionText}>
            Las ganancias dependen del uso del token y del crecimiento del ecosistema, no de reclutar gente.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>
            ✅ En resumen
          </Text>
          <Text style={styles.summaryText}>
            MXI es un proyecto real, transparente y con utilidad. No es un Ponzi porque no necesita nuevos participantes para funcionar; necesita adopción, uso y crecimiento tecnológico, como cualquier criptomoneda legítima.
          </Text>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>
            💎 MXI = Ecosistema Real
          </Text>
          <Text style={styles.highlightText}>
            Un proyecto construido sobre tecnología blockchain, con utilidad real, transparencia total y un modelo de negocio sostenible a largo plazo.
          </Text>
        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
