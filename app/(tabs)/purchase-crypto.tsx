
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';

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
    padding: 32,
    paddingTop: Platform.OS === 'android' ? 48 : 32,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  content: {
    padding: 20,
  },
  warningCard: {
    ...commonStyles.card,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.warning,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.warning,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 16,
    color: colors.textSecondary,
    marginVertical: 4,
  },
});

export default function PurchaseCryptoScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
        >
          <IconSymbol
            ios_icon_name="creditcard.fill"
            android_material_icon_name="payment"
            size={48}
            color="#FFFFFF"
          />
          <Text style={styles.headerTitle}>{t('purchaseWithCrypto')}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.warningCard}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle.fill"
              android_material_icon_name="warning"
              size={48}
              color={colors.warning}
            />
            <Text style={styles.warningTitle}>{t('featureRemoved')}</Text>
            <Text style={styles.warningText}>
              {t('cryptoPaymentFeatureRemoved')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>{t('availablePaymentMethods')}:</Text>
            <Text style={styles.infoItem}>• {t('contactAdministrator')}</Text>
            <Text style={styles.infoItem}>• {t('manualPaymentProcess')}</Text>
            <Text style={styles.infoItem}>• {t('useRegularPurchaseScreen')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
