
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface TermsAndConditionsProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export default function TermsAndConditions({
  visible,
  onClose,
  onAccept,
  showAcceptButton = false,
}: TermsAndConditionsProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>TÉRMINOS Y CONDICIONES DE USO</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark.circle.fill"
                android_material_icon_name="close"
                size={28}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>MXI STRATEGIC</Text>
            
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Aceptación Automática:</Text> Al descargar, registrarse o usar la app MXI Strategic, el usuario declara aceptar totalmente estos Términos. Si no está de acuerdo, debe suspender su uso.
            </Text>

            <Text style={styles.sectionHeader}>1. Naturaleza del Proyecto</Text>
            <Text style={styles.paragraph}>
              MXI es un activo digital de uso dentro del ecosistema MXI. No es un valor, acción, producto financiero regulado, ni garantía de rentabilidad. Su precio puede variar según mercado, adopción y demanda.
            </Text>

            <Text style={styles.sectionHeader}>2. Descargo de Responsabilidad Financiera</Text>
            <Text style={styles.paragraph}>
              MXI Strategic no ofrece asesoría financiera. Las compras son voluntarias y bajo riesgo del usuario. Los desarrolladores no son responsables por pérdidas, fluctuaciones, decisiones de inversión o expectativas no cumplidas.
            </Text>

            <Text style={styles.sectionHeader}>3. Recompensas, Referidos y Vesting</Text>
            <Text style={styles.paragraph}>
              Los sistemas de vesting diario, referidos y torneos son mecanismos internos de recompensa, no productos de inversión. No se garantiza ganancia. MXI puede modificar reglas, porcentajes o disponibilidad para proteger la estabilidad del ecosistema.
            </Text>

            <Text style={styles.sectionHeader}>4. Juegos y Torneos (No Apuestas)</Text>
            <Text style={styles.paragraph}>
              Los torneos son actividades de habilidad, no juegos de azar, no apuestas ni concursos regulados. Los premios dependen del desempeño del usuario. MXI puede pausar o modificar juegos sin responsabilidad.
            </Text>

            <Text style={styles.sectionHeader}>5. Retiros</Text>
            <Text style={styles.paragraph}>
              Antes del lanzamiento oficial del token solo son retirables comisiones y premios de torneos. Para retirar se requiere cumplir condiciones como referidos activos y montos mínimos.
            </Text>
            <Text style={styles.paragraph}>
              El vesting será retirado únicamente cuando MXI esté en circulación y se cumplan los requisitos establecidos. Los tiempos pueden variar por razones técnicas o legales.
            </Text>

            <Text style={styles.sectionHeader}>6. Uso Permitido</Text>
            <Text style={styles.paragraph}>
              El usuario no debe usar la app para actividades ilícitas, fraude, bots, multicuentas o manipulación de referidos. MXI puede suspender o eliminar cuentas que incumplan estas normas.
            </Text>

            <Text style={styles.sectionHeader}>7. Ajustes Operativos</Text>
            <Text style={styles.paragraph}>
              MXI podrá actualizar reglas, porcentajes, retiros, juegos, contratos inteligentes o funciones para mantener estabilidad, seguridad y crecimiento del ecosistema. El uso continuo implica aceptación automática.
            </Text>

            <Text style={styles.sectionHeader}>8. Responsabilidad Técnica</Text>
            <Text style={styles.paragraph}>
              No se garantiza funcionamiento ininterrumpido, ausencia de errores o compatibilidad universal. MXI no es responsable por fallos técnicos, ataques cibernéticos o errores de terceros.
            </Text>

            <Text style={styles.sectionHeader}>9. Limitación de Responsabilidad</Text>
            <Text style={styles.paragraph}>
              MXI no será responsable por pérdidas económicas, decisiones de inversión, errores del usuario, fluctuaciones del mercado, fallas de proveedores externos o fuerza mayor.
            </Text>

            <Text style={styles.sectionHeader}>10. Propiedad Intelectual</Text>
            <Text style={styles.paragraph}>
              Todo contenido y estructura de MXI pertenece exclusivamente al proyecto. Queda prohibida su reproducción o modificación sin autorización.
            </Text>

            <Text style={styles.sectionHeader}>11. Ley Aplicable</Text>
            <Text style={styles.paragraph}>
              Los presentes términos se rigen por las leyes del país donde opera la empresa desarrolladora. Cualquier disputa se resolverá bajo dicho marco legal.
            </Text>

            <Text style={styles.sectionHeader}>ACEPTACIÓN FINAL</Text>
            <Text style={styles.paragraph}>
              Al usar MXI Strategic, el usuario confirma que entiende los riesgos del mercado cripto, la naturaleza del token MXI y acepta totalmente estos Términos y Condiciones.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            {showAcceptButton && onAccept ? (
              <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                <Text style={styles.acceptButtonText}>Aceptar y Continuar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  paragraph: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify',
  },
  bold: {
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButtonBottom: {
    backgroundColor: colors.textSecondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
