
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWallet } from '@/contexts/WalletContext';
import { useAccount } from 'wagmi';

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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  walletCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  connectedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  addressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  warningCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  button: {
    ...buttonStyles.primary,
    marginTop: 16,
  },
  buttonText: {
    ...buttonStyles.primaryText,
  },
  disconnectButton: {
    ...buttonStyles.primary,
    backgroundColor: colors.error,
    marginTop: 16,
  },
  web3ModalContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  walletOptionsCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
  },
  walletOptionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  walletOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  walletOptionText: {
    flex: 1,
  },
  walletOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  walletOptionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, address, usdtBalance, walletType, disconnectWallet, refreshBalance } = useWallet();
  const { chain } = useAccount();

  // Check if we're on web
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isConnected && address) {
      refreshBalance();
    }
  }, [isConnected, address]);

  const handleDisconnect = async () => {
    Alert.alert(
      t('disconnect'),
      'Are you sure you want to disconnect your wallet?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('disconnect'),
          style: 'destructive',
          onPress: async () => {
            await disconnectWallet();
            Alert.alert(t('success'), 'Wallet disconnected successfully');
          },
        },
      ]
    );
  };

  const handlePurchase = () => {
    if (!isConnected) {
      Alert.alert(t('error'), 'Please connect your wallet first');
      return;
    }
    router.push('/purchase-crypto');
  };

  // Show warning on native platforms
  if (!isWeb) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('connectWallet')}</Text>
            <Text style={styles.subtitle}>
              {t('cryptoWalletWebOnly')}
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ {t('webOnlyFeature')}</Text>
            <Text style={styles.warningText}>
              {t('pleaseUseWebVersion')}
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name="wallet.pass"
              android_material_icon_name="account_balance_wallet"
              size={80}
              color={colors.textSecondary}
            />
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ {t('howToPurchase')}</Text>
            <Text style={styles.infoText}>
              • Open this app in a web browser
            </Text>
            <Text style={styles.infoText}>
              • Connect your MetaMask, Trust Wallet, or WalletConnect
            </Text>
            <Text style={styles.infoText}>
              • Purchase MXI with USDT BEP20
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('connectWallet')}</Text>
          <Text style={styles.subtitle}>
            {isConnected ? 'Your wallet is connected' : t('chooseWalletToConnect')}
          </Text>
        </View>

        {isConnected && address ? (
          <>
            {/* Connected Wallet Info */}
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.walletTitle}>Wallet Connected</Text>
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedBadgeText}>{t('live')}</Text>
                </View>
              </View>

              <View style={styles.walletInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Wallet Type:</Text>
                  <Text style={styles.infoValue}>
                    {walletType === 'metamask' ? 'MetaMask' : 
                     walletType === 'trustwallet' ? 'Trust Wallet' : 
                     'WalletConnect'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('network')}:</Text>
                  <Text style={styles.infoValue}>{chain?.name || 'BSC'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text style={styles.addressValue}>
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>USDT Balance:</Text>
                  <Text style={styles.balanceValue}>
                    {usdtBalance ? `${parseFloat(usdtBalance).toFixed(2)} USDT` : 'Loading...'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handlePurchase}
              >
                <Text style={styles.buttonText}>Purchase MXI with USDT</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={handleDisconnect}
              >
                <Text style={styles.buttonText}>{t('disconnect')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Web3Modal Connect Button */}
            <View style={styles.walletOptionsCard}>
              <Text style={styles.walletOptionsTitle}>
                Connect Your Wallet
              </Text>
              
              <View style={styles.web3ModalContainer}>
                {/* Web3Modal button - this is a web component */}
                <w3m-button />
              </View>
            </View>

            {/* Wallet Options Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Supported Wallets</Text>
              
              <View style={styles.walletOption}>
                <IconSymbol
                  ios_icon_name="wallet.pass"
                  android_material_icon_name="account_balance_wallet"
                  size={32}
                  color={colors.primary}
                />
                <View style={styles.walletOptionText}>
                  <Text style={styles.walletOptionTitle}>MetaMask</Text>
                  <Text style={styles.walletOptionSubtitle}>
                    {t('browserExtensionWallet')}
                  </Text>
                </View>
              </View>

              <View style={styles.walletOption}>
                <IconSymbol
                  ios_icon_name="wallet.pass"
                  android_material_icon_name="account_balance_wallet"
                  size={32}
                  color={colors.secondary}
                />
                <View style={styles.walletOptionText}>
                  <Text style={styles.walletOptionTitle}>Trust Wallet</Text>
                  <Text style={styles.walletOptionSubtitle}>
                    Mobile & Desktop wallet
                  </Text>
                </View>
              </View>

              <View style={styles.walletOption}>
                <IconSymbol
                  ios_icon_name="link"
                  android_material_icon_name="link"
                  size={32}
                  color={colors.info}
                />
                <View style={styles.walletOptionText}>
                  <Text style={styles.walletOptionTitle}>WalletConnect</Text>
                  <Text style={styles.walletOptionSubtitle}>
                    {t('trustWalletAndMore')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Important Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>ℹ️ Important Information</Text>
              <Text style={styles.infoText}>
                • Make sure you&apos;re connected to Binance Smart Chain (BSC)
              </Text>
              <Text style={styles.infoText}>
                • You&apos;ll need USDT BEP20 tokens to purchase MXI
              </Text>
              <Text style={styles.infoText}>
                • Keep some BNB for gas fees
              </Text>
              <Text style={styles.infoText}>
                • Transactions are verified on the blockchain
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
