
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
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26,
  },
  reasonCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  reasonIcon: {
    fontSize: 32,
  },
  reasonTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  reasonSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
  },
  reasonDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 6,
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
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '600',
  },
  finalMessage: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  finalMessageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: 12,
    textAlign: 'center',
  },
  finalMessageText: {
    fontSize: 16,
    color: colors.light,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  finalMessageHighlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light,
    textAlign: 'center',
    lineHeight: 26,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
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
          <Text style={styles.headerTitle}>Por qué comprar MXI</Text>
        </View>

        <Image
          source={require('@/assets/images/effa8fd0-8607-4a97-b8f0-88a8462f2535.png')}
          style={styles.heroImage}
        />

        <Text style={styles.title}>¿Por qué deberías comprar MXI? 💎</Text>

        <Text style={styles.subtitle}>
          Porque las mejores oportunidades no se esperan, se toman. ⚡
        </Text>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>🚀</Text>
            <Text style={styles.reasonTitle}>Entras antes que la mayoría</Text>
          </View>
          <Text style={styles.reasonSubtitle}>(Ventaja del pionero)</Text>
          <Text style={styles.reasonDescription}>
            Cuando compras MXI en preventa, accedes a un precio que NUNCA volverá a repetirse.
          </Text>
          <Text style={styles.reasonDescription}>
            Eso te coloca en la misma posición en la que estuvieron los primeros compradores de los grandes proyectos que luego multiplicaron su valor.
          </Text>
          <Text style={styles.reasonDescription}>
            Es el lugar donde comienzan las grandes historias de crecimiento. 📈
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>💰</Text>
            <Text style={styles.reasonTitle}>Tu dinero trabaja por ti todos los días</Text>
          </View>
          <Text style={styles.reasonSubtitle}>(Recompensa continua)</Text>
          <Text style={styles.reasonDescription}>
            MXI te da vesting diario.
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>No necesitas mover nada.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>No necesitas bloquear nada.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>No necesitas hacer nada.</Text>
          </View>
          <Text style={styles.reasonDescription}>
            Tu saldo crece automáticamente, incluso mientras duermes. 😴
          </Text>
          <Text style={styles.reasonDescription}>
            Esto activa en tu cerebro el sesgo de recompensa inmediata, aumentando tu sensación de seguridad y progreso. 🧠✨
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>🤝</Text>
            <Text style={styles.reasonTitle}>Ganas más cuando compartes</Text>
          </View>
          <Text style={styles.reasonSubtitle}>(Efecto comunidad)</Text>
          <Text style={styles.reasonDescription}>
            MXI tiene uno de los sistemas de referidos más fáciles y poderosos.
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>→</Text>
            <Text style={styles.bulletText}>Invitas a alguien → ganas.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>→</Text>
            <Text style={styles.bulletText}>Tu invitado invita a otro → también ganas.</Text>
          </View>
          <Text style={styles.reasonDescription}>
            Es un crecimiento orgánico que se expande solo.
          </Text>
          <Text style={styles.reasonDescription}>
            Tu red se multiplica sin esfuerzo gracias al sesgo de reciprocidad: 🌐
          </Text>
          <Text style={styles.quoteText}>
            "Si yo gano, tú también ganas." 🎁
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>🏗️</Text>
            <Text style={styles.reasonTitle}>Tiene un ecosistema real detrás</Text>
          </View>
          <Text style={styles.reasonSubtitle}>(Utilidad = Valor)</Text>
          <Text style={styles.reasonDescription}>
            MXI no es una moneda vacía.
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✗</Text>
            <Text style={styles.bulletText}>No depende de emociones del mercado.</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>✗</Text>
            <Text style={styles.bulletText}>No depende de entradas nuevas para sostenerse.</Text>
          </View>
          <Text style={styles.reasonDescription}>
            Tiene:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🎮</Text>
            <Text style={styles.bulletText}>Torneos</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>📱</Text>
            <Text style={styles.bulletText}>Apps interconectadas</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🎁</Text>
            <Text style={styles.bulletText}>Recompensas</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>📊</Text>
            <Text style={styles.bulletText}>Vesting</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🔒</Text>
            <Text style={styles.bulletText}>Staking</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>💼</Text>
            <Text style={styles.bulletText}>Comercio</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🌎</Text>
            <Text style={styles.bulletText}>Expansión en LATAM</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>⛓️</Text>
            <Text style={styles.bulletText}>Migración futura a su propia cadena</Text>
          </View>
          <Text style={styles.reasonDescription}>
            Cuanta más gente lo usa, más vale.
          </Text>
          <Text style={styles.reasonDescription}>
            Esto activa el sesgo de prueba social: 👥
          </Text>
          <Text style={styles.quoteText}>
            "Si todos lo usan, es por algo."
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>💵</Text>
            <Text style={styles.reasonTitle}>Te permite empezar con muy poco</Text>
          </View>
          <Text style={styles.reasonSubtitle}>(Accesible)</Text>
          <Text style={styles.reasonDescription}>
            No necesitas miles de dólares.
          </Text>
          <Text style={styles.reasonDescription}>
            Con una inversión mínima, ya participas de:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>📈</Text>
            <Text style={styles.bulletText}>Valorización</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>💰</Text>
            <Text style={styles.bulletText}>Vesting diario</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🤝</Text>
            <Text style={styles.bulletText}>Referidos</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🏆</Text>
            <Text style={styles.bulletText}>Torneos</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🌱</Text>
            <Text style={styles.bulletText}>Crecimiento de la red</Text>
          </View>
          <Text style={styles.reasonDescription}>
            El cerebro interpreta esto como riesgo bajo y alta recompensa potencial, el escenario perfecto para decidir. ✅
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>⏰</Text>
            <Text style={styles.reasonTitle}>Estás en el momento correcto</Text>
          </View>
          <Text style={styles.reasonSubtitle}>(Sin saturación)</Text>
          <Text style={styles.reasonDescription}>
            MXI está entrando en su fase de expansión.
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>El valor aún no explotó. 💥</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>La competencia aún no reaccionó. 🏃</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Los mercados aún no lo descubrieron. 🔍</Text>
          </View>
          <Text style={styles.reasonDescription}>
            Los grandes movimientos se toman antes de que aparezcan en los titulares. 📰
          </Text>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💡 Mensaje final (PNL + Neuromarketing)</Text>
          <Text style={styles.highlightText}>
            MXI te ofrece algo que pocas oportunidades en el mundo cripto te dan:
          </Text>
          <Text style={styles.highlightText}>
            valor real, crecimiento diario y la posibilidad de multiplicar tus resultados desde el inicio. 🚀
          </Text>
        </View>

        <View style={styles.finalMessage}>
          <Text style={styles.finalMessageTitle}>
            Si buscas una oportunidad clara, accesible y con visión de futuro… 🎯
          </Text>
          <Text style={styles.finalMessageHighlight}>
            Hoy es el momento. MXI es el vehículo.
          </Text>
          <Text style={styles.finalMessageHighlight}>
            Tú eres el protagonista. ⭐
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
