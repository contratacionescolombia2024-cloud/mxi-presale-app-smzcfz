
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
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
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
  boldText: {
    fontWeight: 'bold',
    color: colors.text,
  },
  quoteBox: {
    backgroundColor: colors.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 24,
  },
  summaryBox: {
    backgroundColor: colors.sectionGreen,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  summaryBullet: {
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
    fontWeight: 'bold',
  },
  summaryText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
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

        <Text style={styles.title}>🌱 Sostenibilidad MAXCOIN</Text>

        <Image
          source={require('@/assets/images/9dbef4be-d2ff-4097-83be-1b962b9d36a0.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💡 Valor Real, No Especulación</Text>
          <Text style={styles.highlightText}>
            La sostenibilidad de MAXCOIN no se basa en la especulación, sino en la creación constante de valor y utilidad real.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Ecosistema Circular</Text>
          <Text style={styles.paragraph}>
            Cada componente del ecosistema ha sido diseñado para alimentar al otro:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>🎯</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>MXI Strategic</Text> gestiona preventivas y usuarios.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>💳</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>MXI Pay</Text> impulsa el uso cotidiano del token.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>💰</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>MXI Loan</Text> democratiza el acceso al crédito.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>⛓️</Text>
            <Text style={styles.bulletText}>
              <Text style={styles.boldText}>MXI Chain</Text> garantiza transparencia y trazabilidad.
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Este modelo circular genera una economía autosuficiente, donde las recompensas provienen de actividad real dentro del ecosistema, no de la entrada de nuevos usuarios.
        </Text>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            💬 "MAXCOIN es sostenibilidad digital: un sistema que crece, se adapta y perdura."
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Además, el proyecto integra criterios <Text style={styles.boldText}>ESG (Ambientales, Sociales y de Gobernanza)</Text> en sus procesos, contribuyendo a una adopción responsable, ética y escalable.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 POR QUÉ EL ECOSISTEMA MXI ES SOSTENIBLE</Text>
          <Text style={styles.paragraph}>
            MXI es sostenible porque su modelo se basa en algo simple: <Text style={styles.boldText}>El crecimiento depende del esfuerzo inicial de la comunidad y de la adopción temprana.</Text>
          </Text>
          <Text style={styles.paragraph}>
            No es magia, es economía. 📊
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>💎 El valor nace en la preventa</Text>
          <Text style={styles.pillarDescription}>
            La preventa define la liquidez inicial, el precio base y el respaldo del token.
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}Si la comunidad participa, el proyecto arranca con fuerza.
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}Si no hay preventa, no existe un valor sólido para construir el ecosistema.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>⚡ El ecosistema genera utilidad real</Text>
          <Text style={styles.pillarDescription}>
            MXI crece por el uso: juegos, torneos, comisiones, vesting y transacciones internas.
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}📈 A mayor actividad, mayor volumen.
          </Text>
          <Text style={styles.pillarDescription}>
            📊 A mayor volumen, mayor valoración.
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}No depende de "entradas nuevas", sino del movimiento dentro del sistema.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>🔒 El vesting y los premios no afectan la liquidez</Text>
          <Text style={styles.pillarDescription}>
            El vesting genera MXI, no USDT.
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}Los torneos se pagan con comisiones internas, no con fondos del proyecto. Esto hace que las recompensas no destruyan la economía.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>🚀 El sistema de referidos impulsa la adopción, no la descapitalización</Text>
          <Text style={styles.pillarDescription}>
            Son solo 3 niveles y porcentajes bajos.
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}Estimula la expansión y el volumen sin poner en riesgo el fondo principal.
          </Text>
        </View>

        <View style={styles.pillarCard}>
          <Text style={styles.pillarTitle}>🤝 Todo depende del trabajo conjunto</Text>
          <Text style={styles.pillarDescription}>
            MXI no ofrece ganancias pasivas "mágicas".
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}La valorización sucede cuando la comunidad comparte, participa, juega y promueve.
          </Text>
          <Text style={styles.pillarDescription}>
            {'\n'}Cuanto más fuerte sea la preventa y la participación, mayor será el valor final del token.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>✅ RESUMEN CLAVE PARA EL USUARIO</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.boldText}>MXI es sostenible porque:</Text>
          </Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>–</Text>
            <Text style={styles.summaryText}>El valor nace con la preventa</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>–</Text>
            <Text style={styles.summaryText}>La comunidad es el motor</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>–</Text>
            <Text style={styles.summaryText}>Las recompensas no afectan la liquidez</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>–</Text>
            <Text style={styles.summaryText}>La utilidad real del ecosistema genera crecimiento</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryBullet}>–</Text>
            <Text style={styles.summaryText}>El precio sube cuando hay adopción, no promesas</Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            ✅ Si hay trabajo y preventa, todos ganan.
          </Text>
          <Text style={styles.highlightText}>
            {'\n'}❌ Si no hay preventa ni participación, no hay crecimiento.
          </Text>
          <Text style={styles.highlightText}>
            {'\n'}🌟 <Text style={styles.boldText}>MXI es un ecosistema impulsado por la comunidad, no por la especulación.</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
