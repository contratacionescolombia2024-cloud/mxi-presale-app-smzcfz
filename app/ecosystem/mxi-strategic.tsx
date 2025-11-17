
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
    backgroundColor: colors.primary,
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
    color: colors.primary,
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
    backgroundColor: colors.sectionPurple,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
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
});

export default function MXIStrategicScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MXI Strategic</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="lightbulb" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>MXI Strategic</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💡 Visión Estratégica</Text>
          <Text style={styles.highlightText}>
            MXI representa una nueva era en la tokenización de activos digitales, combinando innovación tecnológica con un modelo de negocio sostenible y transparente.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Objetivos Estratégicos</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Crear un ecosistema financiero descentralizado que beneficie a todos los participantes
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Implementar un sistema de recompensas justo y transparente a través del vesting diario
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Fomentar el crecimiento orgánico mediante un programa de referidos multinivel
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Garantizar la seguridad y verificación de todos los usuarios mediante KYC robusto
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Fases del Proyecto</Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Fase 1 - Preventa:</Text> Distribución inicial de 25 millones de MXI en tres etapas con precios progresivos (0.4, 0.7 y 1.0 USDT).
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Fase 2 - Lanzamiento:</Text> Listado en exchanges y activación completa del ecosistema de juegos y torneos.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Fase 3 - Expansión:</Text> Desarrollo de nuevas funcionalidades y asociaciones estratégicas.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💎 Propuesta de Valor</Text>
          <Text style={styles.paragraph}>
            MXI no es solo un token, es un ecosistema completo que ofrece múltiples formas de generar valor:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Rendimientos pasivos a través del sistema de vesting (3% mensual)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Comisiones por referidos en tres niveles (5%, 2%, 1%)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Oportunidades de ganar en torneos y competencias
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Apreciación del valor del token en el mercado
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Seguridad y Transparencia</Text>
          <Text style={styles.paragraph}>
            La estrategia de MXI se basa en la confianza y la transparencia. Todos los procesos están auditados y verificados, garantizando la seguridad de los fondos de nuestros usuarios.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
