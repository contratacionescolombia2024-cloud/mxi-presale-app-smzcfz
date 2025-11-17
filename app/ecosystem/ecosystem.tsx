
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
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  phaseCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  phaseNumber: {
    fontSize: 32,
  },
  phaseTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  phaseSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.highlight,
    marginBottom: 12,
  },
  phaseDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  benefitsList: {
    marginTop: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  benefitBullet: {
    fontSize: 16,
    color: colors.highlight,
    marginRight: 8,
    fontWeight: 'bold',
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
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
  modulesList: {
    marginTop: 12,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingLeft: 8,
  },
  moduleBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    fontWeight: 'bold',
  },
  moduleText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  moduleName: {
    fontWeight: 'bold',
    color: colors.text,
  },
  finalMessageBox: {
    backgroundColor: colors.highlight,
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    marginBottom: 24,
  },
  finalMessageTitle: {
    fontSize: 22,
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
    marginBottom: 8,
  },
  emphasisText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.light,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 8,
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

        <Image
          source={require('@/assets/images/e3ef372d-4f76-414b-8444-ccd518ba2807.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.title}>🌐 Ecosistema MXI</Text>

        <Text style={styles.introText}>
          MXI es un ecosistema diseñado para crecer por etapas, iniciando hoy con la preventa y expandiéndose progresivamente a medida que la comunidad crece. Su valor no nace de promesas, sino de utilidad real y desarrollo tecnológico planificado.
        </Text>

        <View style={styles.section}>
          <View style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>🚀</Text>
              <Text style={styles.phaseTitle}>1. Fase actual: Preventa y crecimiento inicial</Text>
            </View>
            
            <Text style={styles.phaseDescription}>
              La preventa define el precio base, la liquidez inicial y permite que los primeros participantes entren antes que el mercado general.
            </Text>
            
            <Text style={styles.phaseDescription}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Sin preventa no hay liquidez, sin liquidez no hay ecosistema.</Text>
              {'\n'}Por eso, el éxito de MXI comienza con esta etapa.
            </Text>

            <Text style={styles.phaseSubtitle}>💎 Aquí nacen tres beneficios inmediatos:</Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>
                  Compra anticipada a precios preferenciales
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>
                  Acceso al vesting diario (≈3% mensual en MXI)
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>
                  Comisiones por referidos para quienes promueven el proyecto
                </Text>
              </View>
            </View>

            <Text style={[styles.phaseDescription, { marginTop: 12, fontStyle: 'italic' }]}>
              Esta es la etapa donde los primeros usuarios construyen las bases del valor futuro.
            </Text>
          </View>

          <View style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>⚡</Text>
              <Text style={styles.phaseTitle}>2. Fase de Activación: Después del lanzamiento</Text>
            </View>
            
            <Text style={styles.phaseDescription}>
              Cuando MXI entre oficialmente al mercado, comenzarán a desplegarse los módulos del ecosistema:
            </Text>

            <View style={styles.modulesList}>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  <Text style={styles.moduleName}>MXI Pay:</Text> pagos rápidos con MXI, conversión y billetera.
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  <Text style={styles.moduleName}>MXI Games y Torneos:</Text> competencia con premios reales.
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  <Text style={styles.moduleName}>MXI Loan:</Text> acceso a liquidez usando MXI como garantía.
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  <Text style={styles.moduleName}>Staking y sistemas de quema:</Text> soporte al precio y estabilidad.
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  <Text style={styles.moduleName}>MXI ONE:</Text> una app unificada donde todo se integra.
                </Text>
              </View>
            </View>

            <Text style={[styles.phaseDescription, { marginTop: 12, fontStyle: 'italic' }]}>
              Cada módulo aumenta la utilidad del token y la demanda real dentro de la comunidad.
            </Text>
          </View>

          <View style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>🌍</Text>
              <Text style={styles.phaseTitle}>3. Fase de Expansión: Crecimiento global</Text>
            </View>
            
            <Text style={styles.phaseDescription}>
              Con la comunidad ya activa, los procesos técnicos avanzan:
            </Text>

            <View style={styles.modulesList}>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Integración de comercios
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Alianzas internacionales
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Ampliación de torneos y servicios
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Transición hacia una blockchain propia (MXI Chain)
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Futura gobernanza descentralizada (DAO MXI)
                </Text>
              </View>
            </View>

            <Text style={[styles.phaseDescription, { marginTop: 12, fontStyle: 'italic' }]}>
              Cada paso está diseñado para fortalecer el valor del token y construir un ecosistema que evoluciona con sus usuarios.
            </Text>
          </View>

          <View style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>♻️</Text>
              <Text style={styles.phaseTitle}>4. ¿Por qué MXI es sostenible?</Text>
            </View>
            
            <Text style={styles.phaseDescription}>
              Porque su crecimiento depende de factores reales:
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>
                  Utilidad dentro de las aplicaciones
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>
                  Actividad de transacciones
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>
                  Vesting gestionado en MXI, no en dinero externo
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>
                  Torneos y comisiones financiados por la actividad interna
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>✓</Text>
                <Text style={styles.benefitText}>
                  Adopción progresiva en países hispanohablantes
                </Text>
              </View>
            </View>

            <Text style={[styles.phaseDescription, { marginTop: 12, fontWeight: 'bold', color: colors.text }]}>
              No se sostiene por entradas nuevas, sino por uso real.
            </Text>
          </View>
        </View>

        <View style={styles.finalMessageBox}>
          <Text style={styles.finalMessageTitle}>💫 Mensaje Final</Text>
          
          <Text style={styles.finalMessageText}>
            MXI es un ecosistema en construcción inteligente.
          </Text>
          
          <Text style={styles.finalMessageText}>
            Hoy estás en la preventa; mañana serás parte del lanzamiento; después formarás parte de la expansión global.
          </Text>

          <Text style={styles.emphasisText}>
            Cada etapa construye valor.
          </Text>
          <Text style={styles.emphasisText}>
            Cada usuario que entra fortalece el sistema.
          </Text>
          <Text style={styles.emphasisText}>
            Y cada avance del ecosistema hace más valiosos los MXI que ya tienes.
          </Text>

          <Text style={[styles.finalMessageText, { marginTop: 16, fontSize: 18, fontWeight: 'bold' }]}>
            Este es el momento. El crecimiento comienza Hoy. 🚀
          </Text>
        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
