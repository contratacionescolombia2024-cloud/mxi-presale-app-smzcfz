
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/contexts/WalletContext';
import { colors } from '@/styles/commonStyles';
import { useTranslation } from '@/contexts/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isConnected, address, walletType, usdtBalance, isLoading, disconnectWallet, refreshBalance } = useWallet();

  useEffect(() => {
    if (isConnected) {
      refreshBalance();
    }
  }, [isConnected]);

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  const handlePurchase = () => {
    router.push('/purchase-crypto');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

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
        <Text style={styles.headerSubtitle}>{t('connectWalletDescription')}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {!isConnected ? (
          <View style={styles.connectSection}>
            <Text style={styles.sectionTitle}>{t('chooseWallet')}</Text>
            <Text style={styles.sectionDescription}>
              {t('connectWalletInstructions')}
            </Text>

            {/* Web3Modal Button */}
            <View style={styles.web3ModalContainer}>
              <w3m-button />
            </View>

            <View style={styles.infoBox}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                {t('supportedWallets')}: MetaMask, Trust Wallet, WalletConnect
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.connectedSection}>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={32}
                  color="#10B981"
                />
                <Text style={styles.statusTitle}>{t('walletConnected')}</Text>
              </View>

              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>{t('walletType')}:</Text>
                <Text style={styles.walletValue}>
                  {walletType === 'metamask' ? 'MetaMask' : 
                   walletType === 'trustwallet' ? 'Trust Wallet' : 
                   'WalletConnect'}
                </Text>
              </View>

              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>{t('address')}:</Text>
                <Text style={styles.addressValue}>
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </Text>
              </View>

              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>{t('usdtBalance')}</Text>
                <Text style={styles.balanceValue}>
                  {usdtBalance ? parseFloat(usdtBalance).toFixed(2) : '0.00'} USDT
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={handlePurchase}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.purchaseButtonGradient}
              >
                <IconSymbol
                  ios_icon_name="cart.fill"
                  android_material_icon_name="shopping_cart"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.purchaseButtonText}>{t('purchaseMXI')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectButtonText}>{t('disconnectWallet')}</Text>
            </TouchableOpacity>
          </View>
        )}
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
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  connectSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  web3ModalContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  connectedSection: {
    marginTop: 20,
  },
  statusCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  walletValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  balanceCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  disconnectButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disconnectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
});
