
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useWallet } from '@/contexts/WalletContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { WalletType } from '@/utils/walletConnection';

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
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  walletIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  walletDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  connectedCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.success,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  connectedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '60%',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    ...buttonStyles.primary,
  },
  buttonSecondary: {
    flex: 1,
    ...buttonStyles.primary,
    backgroundColor: colors.card,
  },
  buttonText: {
    ...buttonStyles.primaryText,
  },
  buttonTextSecondary: {
    ...buttonStyles.primaryText,
    color: colors.text,
  },
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  infoTitle: {
    fontSize: 16,
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
});

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    isConnected,
    walletType,
    address,
    usdtBalance,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  } = useWallet();

  const [connecting, setConnecting] = useState(false);

  const handleConnect = async (type: WalletType) => {
    setConnecting(true);
    try {
      await connectWallet(type);
      Alert.alert(
        '✅ ' + t('success'),
        t('walletConnectedSuccessfully'),
        [
          {
            text: t('ok'),
            onPress: () => {
              // Navigate to purchase screen
              router.push('/(tabs)/purchase-crypto');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert(t('error'), error.message || t('failedToConnectWallet'));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      t('disconnectWallet'),
      t('areYouSureDisconnect'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('disconnect'),
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectWallet();
              Alert.alert('✅ ' + t('success'), t('walletDisconnected'));
            } catch (error: any) {
              Alert.alert(t('error'), error.message || t('failedToDisconnect'));
            }
          },
        },
      ]
    );
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
      Alert.alert('✅ ' + t('success'), t('balanceRefreshed'));
    } catch (error: any) {
      Alert.alert(t('error'), error.message || t('failedToRefreshBalance'));
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('connectWallet')}</Text>
          <Text style={styles.subtitle}>
            {t('connectWalletDescription')}
          </Text>
        </View>

        {isConnected && address ? (
          <View style={styles.connectedCard}>
            <View style={styles.connectedHeader}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={32}
                color={colors.success}
              />
              <Text style={styles.connectedTitle}>{t('walletConnected')}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('walletType')}:</Text>
              <Text style={styles.infoValue}>
                {walletType === 'metamask' ? 'MetaMask' : 'WalletConnect'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('address')}:</Text>
              <Text style={styles.infoValue}>{formatAddress(address)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('usdtBalance')}:</Text>
              <Text style={styles.balanceValue}>
                {usdtBalance ? `${parseFloat(usdtBalance).toFixed(2)} USDT` : t('loading')}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={handleRefreshBalance}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.buttonTextSecondary}>{t('refresh')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(tabs)/purchase-crypto')}
              >
                <Text style={styles.buttonText}>{t('buyMXI')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, { marginTop: 12, backgroundColor: colors.error }]}
              onPress={handleDisconnect}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{t('disconnect')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <React.Fragment>
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>⚠️ {t('important')}</Text>
              <Text style={styles.warningText}>
                {t('walletWarning')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.walletCard}
              onPress={() => handleConnect('metamask')}
              disabled={connecting || isLoading}
            >
              <View style={styles.walletIcon}>
                <IconSymbol
                  ios_icon_name="wallet.pass"
                  android_material_icon_name="account_balance_wallet"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>MetaMask</Text>
                <Text style={styles.walletDescription}>
                  {t('metamaskDescription')}
                </Text>
              </View>
              {connecting ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={24}
                  color={colors.textSecondary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletCard}
              onPress={() => handleConnect('walletconnect')}
              disabled={connecting || isLoading}
            >
              <View style={styles.walletIcon}>
                <IconSymbol
                  ios_icon_name="link"
                  android_material_icon_name="link"
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>WalletConnect</Text>
                <Text style={styles.walletDescription}>
                  {t('walletconnectDescription')}
                </Text>
              </View>
              {connecting ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <IconSymbol
                  ios_icon_name="chevron.right"
                  android_material_icon_name="chevron_right"
                  size={24}
                  color={colors.textSecondary}
                />
              )}
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>ℹ️ {t('howToConnect')}</Text>
              <Text style={styles.infoText}>
                • {t('selectWalletType')}
              </Text>
              <Text style={styles.infoText}>
                • {t('approveConnection')}
              </Text>
              <Text style={styles.infoText}>
                • {t('ensureBSCNetwork')}
              </Text>
              <Text style={styles.infoText}>
                • {t('haveUSDTAndBNB')}
              </Text>
            </View>
          </React.Fragment>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
