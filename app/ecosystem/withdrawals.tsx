
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
    backgroundColor: '#8B5CF6',
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
    color: '#8B5CF6',
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
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: colors.sectionOrangeStrong,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.4)',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: colors.sectionBlue,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default function WithdrawalsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Retiros</Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol name="account-balance-wallet" size={40} color={colors.light} />
        </View>

        <Text style={styles.title}>Retiros</Text>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightTitle}>💰 Sistema de Retiros</Text>
          <Text style={styles.highlightText}>
            Puedes retirar tus ganancias de comisiones de referidos y premios de torneos de manera segura y transparente.
          </Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Importante</Text>
          <Text style={styles.warningText}>
            Los MXI comprados directamente y los rendimientos de vesting NO se pueden retirar hasta el lanzamiento oficial del token (20 de febrero de 2026). Solo puedes retirar comisiones de referidos y premios de torneos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💵 ¿Qué Puedes Retirar?</Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>✅</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Comisiones de Referidos:</Text> MXI ganados por referir nuevos usuarios (5%, 2%, 1%)
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>✅</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Premios de Torneos:</Text> MXI ganados en torneos, Viral Zone y Mini Battles
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>❌</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>MXI Comprados:</Text> Bloqueados hasta el lanzamiento oficial
          </Text>
        </View>

        <View style={styles.bulletPoint}>
          <Text style={styles.bullet}>❌</Text>
          <Text style={styles.bulletText}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Rendimientos de Vesting:</Text> Bloqueados hasta el lanzamiento oficial
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Proceso de Retiro</Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepTitle}>Verificación KYC</Text>
          <Text style={styles.stepDescription}>
            Debes tener tu cuenta verificada con KYC aprobado. Sin verificación KYC no se pueden procesar retiros.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepTitle}>Accede a tu Perfil</Text>
          <Text style={styles.stepDescription}>
            Ve a la sección de Perfil en la app y selecciona la opción "Gestión de Balance" o "Retiros".
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepTitle}>Selecciona el Monto</Text>
          <Text style={styles.stepDescription}>
            Ingresa la cantidad de MXI que deseas retirar de tu balance de comisiones o torneos. Verifica que tienes suficiente balance disponible.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>4</Text>
          <Text style={styles.stepTitle}>Elige el Método de Pago</Text>
          <Text style={styles.stepDescription}>
            Selecciona si deseas recibir el pago en PayPal, Binance, o transferencia bancaria. Proporciona los datos necesarios.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>5</Text>
          <Text style={styles.stepTitle}>Confirma la Solicitud</Text>
          <Text style={styles.stepDescription}>
            Revisa todos los detalles y confirma tu solicitud de retiro. Recibirás una notificación de confirmación.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>6</Text>
          <Text style={styles.stepTitle}>Espera la Aprobación</Text>
          <Text style={styles.stepDescription}>
            Los administradores revisarán tu solicitud. El proceso puede tomar de 24 a 72 horas hábiles.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>7</Text>
          <Text style={styles.stepTitle}>Recibe tu Pago</Text>
          <Text style={styles.stepDescription}>
            Una vez aprobado, recibirás el pago en el método seleccionado. Recibirás una notificación cuando el pago se haya procesado.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Métodos de Pago Disponibles</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>PayPal:</Text> Retiros en USDT o USD
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Binance:</Text> Retiros en USDT o BNB
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              <Text style={{ fontWeight: 'bold', color: colors.text }}>Transferencia Bancaria:</Text> Disponible según tu país
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📊 Límites y Comisiones</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Retiro mínimo: 50 MXI
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Retiro máximo: Sin límite (sujeto a verificación)
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Comisión de procesamiento: 2% del monto retirado
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Tiempo de procesamiento: 24-72 horas hábiles
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Seguridad</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Todas las solicitudes de retiro son revisadas manualmente
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Se requiere verificación de identidad (KYC) para procesar retiros
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Los retiros sospechosos pueden requerir verificación adicional
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Todas las transacciones quedan registradas en blockchain
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Preguntas Frecuentes</Text>
          
          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text, marginTop: 12 }]}>
            ¿Cuándo puedo retirar mis MXI comprados?
          </Text>
          <Text style={styles.paragraph}>
            Los MXI comprados directamente estarán disponibles para retiro después del lanzamiento oficial del token el 20 de febrero de 2026.
          </Text>

          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text, marginTop: 12 }]}>
            ¿Puedo cancelar una solicitud de retiro?
          </Text>
          <Text style={styles.paragraph}>
            Sí, puedes cancelar una solicitud de retiro mientras esté en estado "Pendiente". Una vez aprobada y procesada, no se puede cancelar.
          </Text>

          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text, marginTop: 12 }]}>
            ¿Qué pasa si mi retiro es rechazado?
          </Text>
          <Text style={styles.paragraph}>
            Si tu retiro es rechazado, recibirás una notificación con el motivo. Los MXI volverán a tu balance disponible y podrás intentar nuevamente.
          </Text>

          <Text style={[styles.paragraph, { fontWeight: 'bold', color: colors.text, marginTop: 12 }]}>
            ¿Hay límite de retiros por mes?
          </Text>
          <Text style={styles.paragraph}>
            No hay límite en la cantidad de retiros que puedes hacer, pero cada retiro está sujeto a la comisión de procesamiento del 2%.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
