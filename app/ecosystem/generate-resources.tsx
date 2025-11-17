
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
    backgroundColor: colors.success,
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
    color: colors.success,
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
  methodCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  methodNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  methodDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default function GenerateResourcesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Generar Recursos</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="attach-money" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>¿Cómo generar recursos con MXI en preventa?</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💰 Múltiples Fuentes de Ingresos</Text>
          <Text style={styles.highlightText}>
            Durante la preventa de MXI, tienes acceso a tres formas principales de generar recursos de manera simultánea.
          </Text>
        </View>

        <View style={styles.methodCard}>
          <Text style={styles.methodNumber}>1</Text>
          <Text style={styles.methodTitle}>🎁 Sistema de Referidos Multinivel</Text>
          <Text style={styles.methodDescription}>
            Gana comisiones por cada persona que se registre usando tu código o enlace de referido:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Nivel 1:</Text> 5% de todas las compras de tus referidos directos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Nivel 2:</Text> 2% de las compras de los referidos de tus referidos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Nivel 3:</Text> 1% de las compras del tercer nivel
            </Text>
          </View>
        </View>

        <View style={styles.methodCard}>
          <Text style={styles.methodNumber}>2</Text>
          <Text style={styles.methodTitle}>📈 Vesting Diario (3% Mensual)</Text>
          <Text style={styles.methodDescription}>
            Todos los MXI que compres generan rendimientos automáticos:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Rendimiento del 3% mensual sobre tus MXI comprados
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Se calcula y actualiza en tiempo real (cada segundo)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Los rendimientos se acumulan automáticamente en tu balance
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Puedes ver proyecciones a 7, 15 y 30 días en la app
            </Text>
          </View>
        </View>

        <View style={styles.methodCard}>
          <Text style={styles.methodNumber}>3</Text>
          <Text style={styles.methodTitle}>🏆 Torneos y Competencias</Text>
          <Text style={styles.methodDescription}>
            Participa en juegos y competencias para ganar premios en MXI:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Torneos estándar con premios de hasta 135 MXI
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              MXI Viral Zone con 100 jugadores y premios de 100 MXI
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Mini Battles entre 2-4 jugadores donde el ganador se lleva todo
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Estrategia Recomendada</Text>
          <Text style={styles.paragraph}>
            Para maximizar tus ganancias durante la preventa:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>1.</Text>
            <Text style={styles.bulletText}>
              Compra MXI en las primeras etapas para obtener el mejor precio
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>2.</Text>
            <Text style={styles.bulletText}>
              Comparte tu código de referido con amigos y familiares
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>3.</Text>
            <Text style={styles.bulletText}>
              Deja que el vesting trabaje para ti generando rendimientos pasivos
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>4.</Text>
            <Text style={styles.bulletText}>
              Participa en torneos para aumentar tu balance de MXI
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Ejemplo Práctico</Text>
          <Text style={styles.paragraph}>
            Si compras 1,000 MXI en la Fase 1 (0.4 USDT):
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Inversión inicial: 400 USDT
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Vesting mensual: 30 MXI (3% de 1,000)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Si 5 referidos compran 1,000 MXI cada uno: 250 MXI en comisiones (5% de 5,000)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Total en 30 días: 1,280 MXI (sin contar torneos)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
