
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
  reasonTitleContainer: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  reasonSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  reasonDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
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
          source={require('@/assets/images/e9a564bd-2dc1-4b93-a02c-984fe8befd7b.png')}
          style={styles.heroImage}
        />

        <Text style={styles.title}>¿POR QUÉ DEBERÍAS COMPRAR MXI? 💎</Text>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>🚀</Text>
            <View style={styles.reasonTitleContainer}>
              <Text style={styles.reasonTitle}>1. Entras antes que la mayoría</Text>
              <Text style={styles.reasonSubtitle}>(Ventaja del pionero)</Text>
            </View>
          </View>
          <Text style={styles.reasonDescription}>
            Al comprar MXI en preventa, accedes a un precio único que no volverá a repetirse. Es la posición donde comienzan las grandes oportunidades de crecimiento. Entrar temprano siempre ha sido la clave en los proyectos que luego multiplican su valor. 📈
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>💰</Text>
            <View style={styles.reasonTitleContainer}>
              <Text style={styles.reasonTitle}>2. Tu dinero trabaja por ti todos los días</Text>
              <Text style={styles.reasonSubtitle}>(Recompensa continua)</Text>
            </View>
          </View>
          <Text style={styles.reasonDescription}>
            MXI ofrece vesting diario. Tu saldo aumenta automáticamente sin necesidad de mover fondos o bloquearlos. Es un sistema diseñado para generar una sensación constante de progreso y beneficio real desde el primer día. ⏰✨
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>🤝</Text>
            <View style={styles.reasonTitleContainer}>
              <Text style={styles.reasonTitle}>3. Ganas más cuando compartes</Text>
              <Text style={styles.reasonSubtitle}>(Efecto comunidad)</Text>
            </View>
          </View>
          <Text style={styles.reasonDescription}>
            El sistema de referidos de MXI permite obtener comisiones cuando recomiendas el proyecto y también cuando tus invitados recomiendan a otros. El crecimiento se multiplica gracias al efecto de red y la reciprocidad: si tú ganas, tus contactos también ganan. 🌐🎁
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>🏗️</Text>
            <View style={styles.reasonTitleContainer}>
              <Text style={styles.reasonTitle}>4. Ecosistema con utilidad real</Text>
              <Text style={styles.reasonSubtitle}>(Valor sostenido)</Text>
            </View>
          </View>
          <Text style={styles.reasonDescription}>
            MXI no depende únicamente de la especulación. Tiene un ecosistema completo que incluye torneos 🎮, aplicaciones integradas 📱, recompensas 🎁, vesting diario 📊, futuros mecanismos de staking 🔒, comercio interno 💼 y una expansión proyectada en toda América Latina 🌎. A más adopción, mayor valor del token.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>💵</Text>
            <View style={styles.reasonTitleContainer}>
              <Text style={styles.reasonTitle}>5. Accesible para todos</Text>
              <Text style={styles.reasonSubtitle}>(Barrera de entrada baja)</Text>
            </View>
          </View>
          <Text style={styles.reasonDescription}>
            Puedes iniciar con un monto mínimo y aun así participar de la valorización, las comisiones, los torneos y el crecimiento del ecosistema. Esto reduce la percepción de riesgo y aumenta el potencial de beneficio. ✅
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <Text style={styles.reasonIcon}>⏰</Text>
            <View style={styles.reasonTitleContainer}>
              <Text style={styles.reasonTitle}>6. Estás en el momento correcto</Text>
              <Text style={styles.reasonSubtitle}>(Ventana de oportunidad)</Text>
            </View>
          </View>
          <Text style={styles.reasonDescription}>
            MXI se encuentra en su fase temprana de expansión. El valor aún no ha explotado 💥, los mercados aún no lo han descubierto 🔍 y la competencia no ha reaccionado 🏃. Este tipo de ventanas no se repite.
          </Text>
        </View>

        <View style={styles.finalMessage}>
          <Text style={styles.finalMessageTitle}>
            💡 Mensaje final
          </Text>
          <Text style={styles.finalMessageText}>
            MXI ofrece valor real, crecimiento diario y la posibilidad de multiplicar resultados desde el inicio. Es una oportunidad accesible, clara y con visión de largo plazo para quienes actúan a tiempo.
          </Text>
          <Text style={[styles.finalMessageText, { marginTop: 16, fontWeight: 'bold' }]}>
            Aquí no solo compras un token: tomas posición en un ecosistema completo preparado para crecer de manera sostenida. 🚀⭐
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
