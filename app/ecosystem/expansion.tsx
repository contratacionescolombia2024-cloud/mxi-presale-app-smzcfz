
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
    height: 220,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.highlight,
    marginBottom: 12,
    marginTop: 8,
  },
  phaseDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  benefitsList: {
    marginTop: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  modulesList: {
    marginTop: 8,
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
    marginBottom: 8,
  },
  emphasisText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.light,
    lineHeight: 26,
    marginTop: 4,
  },
  competitionBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  competitionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  competitionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  projectionBox: {
    backgroundColor: colors.sectionPink,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  projectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  projectionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  rangeBullet: {
    fontSize: 16,
    color: colors.success,
    marginRight: 8,
    fontWeight: 'bold',
  },
  rangeText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default function ExpansionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expansión</Text>
        </View>

        <Image
          source={require('@/assets/images/895b839c-da37-466d-ae80-e9ac5095b494.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.title}>🚀 Expansión MXI</Text>

        <Text style={styles.introText}>
          MXI es un ecosistema cripto diseñado para crecer por etapas, comenzando con la preventa y evolucionando hacia soluciones reales para millones de usuarios en Latinoamérica. Su estructura combina utilidad inmediata, expansión comercial, tecnología propia y un modelo económico sostenible.
        </Text>

        <View style={styles.section}>
          <View style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>💎</Text>
              <Text style={styles.phaseTitle}>1. Preventa: El Inicio del Ecosistema</Text>
            </View>
            
            <Text style={styles.phaseDescription}>
              La preventa establece la base económica y comunitaria de MXI:
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>
                  Precios preferenciales (0.40–1.00 USDT)
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>
                  Vesting diario ≈3% mensual en MXI
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>
                  Comisiones por referidos y torneos
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitBullet}>•</Text>
                <Text style={styles.benefitText}>
                  Construcción de la comunidad inicial
                </Text>
              </View>
            </View>

            <Text style={[styles.phaseDescription, { marginTop: 12, fontStyle: 'italic', fontWeight: 'bold', color: colors.text }]}>
              Aquí se crea la liquidez y el impulso inicial necesario para el lanzamiento.
            </Text>
          </View>

          <View style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>⚡</Text>
              <Text style={styles.phaseTitle}>2. Lanzamiento: Activación del Token y las Apps</Text>
            </View>
            
            <Text style={styles.phaseDescription}>
              Con MXI ya en el mercado:
            </Text>

            <View style={styles.modulesList}>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Token disponible en wallets y exchanges compatibles
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Retiros habilitados bajo reglas de sostenibilidad
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Inicio de MXI Pay, MXI Games, MXI Wallet, conversión y servicios
                </Text>
              </View>
            </View>

            <Text style={[styles.phaseDescription, { marginTop: 12, fontStyle: 'italic', fontWeight: 'bold', color: colors.text }]}>
              En esta etapa, MXI pasa de ser una preventa a una criptomoneda funcional con uso real.
            </Text>
          </View>

          <View style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Text style={styles.phaseNumber}>🌍</Text>
              <Text style={styles.phaseTitle}>3. Expansión Global y Comercial</Text>
            </View>
            
            <Text style={styles.phaseDescription}>
              Una vez consolidada la base, el ecosistema crece:
            </Text>

            <View style={styles.modulesList}>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Publicidad masiva en países hispanohablantes
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Integración con comercios pequeños mediante MXI Pay
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Apertura de Tiendas MXI y red de aliados comerciales
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Micropréstamos a través de MXI Loan, accesibles incluso a usuarios no bancarizados
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Evolución hacia MXI ONE (ecosistema integrado)
                </Text>
              </View>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleBullet}>▸</Text>
                <Text style={styles.moduleText}>
                  Desarrollo futuro de MXI Chain, la blockchain propia
                </Text>
              </View>
            </View>

            <Text style={[styles.phaseDescription, { marginTop: 12, fontStyle: 'italic', fontWeight: 'bold', color: colors.text }]}>
              Esta fase impulsa adopción masiva y uso cotidiano del token.
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>🌎 Importancia para Latinoamérica</Text>
          
          <Text style={styles.highlightText}>
            Latinoamérica tiene alta adopción cripto pero pocas soluciones reales.
          </Text>
          
          <Text style={[styles.highlightText, { fontWeight: 'bold', color: colors.text, marginTop: 8 }]}>
            MXI llena ese vacío con:
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Pagos accesibles
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Préstamos simples
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Ingresos mediante juegos y referidos
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Integración con comercios locales
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Herramientas diseñadas para poblaciones sin acceso bancario
              </Text>
            </View>
          </View>

          <Text style={[styles.highlightText, { marginTop: 12, fontStyle: 'italic', fontWeight: 'bold', color: colors.text }]}>
            Es un ecosistema construido para el usuario latino, no adaptado desde mercados externos.
          </Text>
        </View>

        <View style={styles.competitionBox}>
          <Text style={styles.competitionTitle}>🏆 Competencia en la región</Text>
          
          <Text style={styles.competitionText}>
            Muy pocos proyectos combinan:
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                Ecosistema de apps
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                Pagos reales
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                Torneos
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                Préstamos
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                Integración comercial
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                Enfoque hispanohablante
              </Text>
            </View>
          </View>

          <Text style={[styles.competitionText, { marginTop: 12, fontWeight: 'bold', color: colors.text }]}>
            MXI prácticamente no tiene competencia directa en su nicho
          </Text>
        </View>

        <View style={styles.projectionBox}>
          <Text style={styles.projectionTitle}>📈 ¿Es alcanzable la proyección de precio?</Text>
          
          <Text style={[styles.projectionText, { fontWeight: 'bold', color: colors.text }]}>
            Sí. Basada en:
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Supply bajo (50M)
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Adopción masiva potencial
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>
                Utilidad diaria en comercios, pagos, juegos y préstamos
              </Text>
            </View>
          </View>

          <Text style={[styles.projectionText, { marginTop: 16, fontWeight: 'bold', color: colors.text }]}>
            Rangos estimados:
          </Text>

          <View style={styles.benefitsList}>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeBullet}>💰</Text>
              <Text style={styles.rangeText}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Moderado:</Text> 1.5 – 6 USDT
              </Text>
            </View>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeBullet}>🚀</Text>
              <Text style={styles.rangeText}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Optimista:</Text> 3 – 12+ USDT
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.finalMessageBox}>
          <Text style={styles.finalMessageTitle}>💫 Conclusión</Text>
          
          <Text style={styles.finalMessageText}>
            MXI no es solo un token: es un ecosistema completo de pagos, préstamos, juegos, comercios y tecnología.
          </Text>
          
          <Text style={styles.emphasisText}>
            Su crecimiento depende del uso real, no de entradas nuevas.
          </Text>

          <Text style={[styles.finalMessageText, { marginTop: 16, fontSize: 18, fontWeight: 'bold' }]}>
            Está diseñado para convertirse en la criptomoneda líder del mercado hispanohablante. 🌟
          </Text>
        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
