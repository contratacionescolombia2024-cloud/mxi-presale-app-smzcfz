
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import {
  connectMetaMask,
  connectWalletConnect,
  getUSDTBalance,
  disconnectWalletConnect,
  WalletType,
  BSC_NETWORK_NAME,
} from '@/utils/walletConnect';
import { getBNBBalance } from '@/utils/metamask';
import { useLanguage } from '@/contexts/LanguageContext';

interface WalletConnectorProps {
  onConnect: (address: string, walletType: WalletType, provider: any, signer: any) => void;
  onDisconnect: () => void;
}

export default function WalletConnector({ onConnect, onDisconnect }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [_walletType, setWalletType] = useState<WalletType | null>(null);
  const [bnbBalance, setBnbBalance] = useState<string>('0');
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [_signer, setSigner] = useState<any>(null);
  const { t } = useLanguage();

  const isWeb = Platform.OS === 'web';

  const loadBalances = async (address: string, providerInstance: any) => {
    if (!isWeb) return;

    setBalanceLoading(true);
    try {
      const [bnb, usdt] = await Promise.all([
        getBNBBalance(address),
        getUSDTBalance(address, providerInstance),
      ]);
      setBnbBalance(parseFloat(bnb).toFixed(4));
      setUsdtBalance(parseFloat(usdt).toFixed(2));
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleConnectWallet = async (type: WalletType) => {
    if (!isWeb) {
      Alert.alert(
        t('webOnlyFeature'),
        t('cryptoWalletWebOnly')
      );
      return;
    }

    setLoading(true);
    setShowWalletModal(false);

    try {
      let result;

      if (type === 'metamask') {
        result = await connectMetaMask();
      } else {
        // WalletConnect works for Trust Wallet and other wallets
        result = await connectWalletConnect();
      }

      setAccount(result.address);
      setWalletType(type);
      setProvider(result.provider);
      setSigner(result.signer);
      setIsConnected(true);

      await loadBalances(result.address, result.provider);
      onConnect(result.address, type, result.provider, result.signer);

      Alert.alert(
        t('walletConnectedSuccess'),
        `${t('successfullyConnectedTo')} ${type === 'metamask' ? 'MetaMask' : 'WalletConnect'}\n\n${t('address')}: ${result.address.substring(0, 6)}...${result.address.substring(result.address.length - 4)}`
      );
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert(t('connectionFailed'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (_walletType === 'walletconnect' && provider) {
      await disconnectWalletConnect(provider);
    }

    setIsConnected(false);
    setAccount(null);
    setWalletType(null);
    setProvider(null);
    setSigner(null);
    setBnbBalance('0');
    setUsdtBalance('0');
    onDisconnect();
  };

  if (!isWeb) {
    return (
      <View style={styles.webOnlyContainer}>
        <IconSymbol
          ios_icon_name="globe"
          android_material_icon_name="language"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={styles.webOnlyText}>
          {t('cryptoWalletWebOnly')}
        </Text>
        <Text style={styles.webOnlySubtext}>
          {t('pleaseUseWebVersion')}
        </Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => setShowWalletModal(true)}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#F6851B', '#E2761B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.connectGradient}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="wallet.pass.fill"
                  android_material_icon_name="account_balance_wallet"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.connectButtonText}>{t('connectWallet')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Modal
          visible={showWalletModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWalletModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('connectWallet')}</Text>
                <TouchableOpacity
                  onPress={() => setShowWalletModal(false)}
                  style={styles.closeButton}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                {t('chooseWalletToConnect')}
              </Text>

              <View style={styles.walletOptions}>
                <TouchableOpacity
                  style={styles.walletOption}
                  onPress={() => handleConnectWallet('metamask')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#F6851B', '#E2761B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.walletOptionGradient}
                  >
                    <View style={styles.walletIconContainer}>
                      <IconSymbol
                        ios_icon_name="wallet.pass.fill"
                        android_material_icon_name="account_balance_wallet"
                        size={32}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.walletOptionInfo}>
                      <Text style={styles.walletOptionName}>MetaMask</Text>
                      <Text style={styles.walletOptionDescription}>
                        {t('browserExtensionWallet')}
                      </Text>
                    </View>
                    <IconSymbol
                      ios_icon_name="chevron.right"
                      android_material_icon_name="chevron_right"
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.walletOption}
                  onPress={() => handleConnectWallet('walletconnect')}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#3B99FC', '#2E7FD8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.walletOptionGradient}
                  >
                    <View style={styles.walletIconContainer}>
                      <IconSymbol
                        ios_icon_name="qrcode"
                        android_material_icon_name="qr_code"
                        size={32}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.walletOptionInfo}>
                      <Text style={styles.walletOptionName}>WalletConnect</Text>
                      <Text style={styles.walletOptionDescription}>
                        {t('trustWalletAndMore')}
                      </Text>
                    </View>
                    <IconSymbol
                      ios_icon_name="chevron.right"
                      android_material_icon_name="chevron_right"
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.connectedContainer}>
      <View style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>
              {_walletType === 'metamask' ? 'MetaMask' : 'WalletConnect'}
            </Text>
            <Text style={styles.accountAddress}>
              {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
            </Text>
          </View>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.disconnectButtonText}>{t('disconnect')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.networkInfo}>
          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>{t('network')}:</Text>
            <View style={styles.networkBadgeCorrect}>
              <Text style={styles.networkBadgeText}>{BSC_NETWORK_NAME}</Text>
            </View>
          </View>
        </View>

        <View style={styles.balancesContainer}>
          <Text style={styles.balancesTitle}>{t('availableBalance')}</Text>
          {balanceLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>BNB:</Text>
                <Text style={styles.balanceValue}>{bnbBalance}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>USDT:</Text>
                <Text style={styles.balanceValue}>{usdtBalance}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webOnlyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  webOnlyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
  },
  webOnlySubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  connectButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  connectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 12,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  walletOptions: {
    gap: 16,
    marginBottom: 24,
  },
  walletOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  walletOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletOptionInfo: {
    flex: 1,
  },
  walletOptionName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  walletOptionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  connectedContainer: {
    marginBottom: 16,
  },
  accountCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  accountAddress: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  networkInfo: {
    marginBottom: 16,
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  networkBadgeCorrect: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.success,
  },
  networkBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  balancesContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  balancesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
