
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { useTranslation } from '@/contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';

export default function ConnectWalletScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <IconSymbol
          ios_icon_name="wallet.pass.fill"
          android_material_icon_name="account_balance_wallet"
          size={48}
          color="#FFFFFF"
        />
        <Text style={styles.headerTitle}>{t('connectWallet')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.messageCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={48}
            color={colors.primary}
          />
          <Text style={styles.messageTitle}>{t('webOnlyFeature')}</Text>
          <Text style={styles.messageText}>
            {t('walletConnectionWebOnly')}
          </Text>
          <Text style={styles.messageSubtext}>
            {t('pleaseUseWebVersion')}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t('supportedWallets')}:</Text>
          <Text style={styles.infoItem}>• MetaMask</Text>
          <Text style={styles.infoItem}>• Trust Wallet</Text>
          <Text style={styles.infoItem}>• WalletConnect</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    padding: 32,
    paddingTop: 48,
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
  messageCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  messageSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
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
