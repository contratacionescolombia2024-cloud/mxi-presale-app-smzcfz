
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import {
  isMetaMaskInstalled,
  connectMetaMask,
  getNetworkInfo,
  switchToBSC,
  getBNBBalance,
  getUSDTBalance,
  onAccountsChanged,
  onChainChanged,
  BSC_NETWORK_NAME,
} from '@/utils/metamask';

interface MetaMaskConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export default function MetaMaskConnect({ onConnect, onDisconnect }: MetaMaskConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [_chainId, setChainId] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [bnbBalance, setBnbBalance] = useState<string>('0');
  const [usdtBalance, setUsdtBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Check if we're on web platform
  const isWeb = Platform.OS === 'web';

  const loadBalances = useCallback(async (address: string) => {
    if (!isWeb) return;
    
    setBalanceLoading(true);
    try {
      const [bnb, usdt] = await Promise.all([
        getBNBBalance(address),
        getUSDTBalance(address),
      ]);
      setBnbBalance(parseFloat(bnb).toFixed(4));
      setUsdtBalance(parseFloat(usdt).toFixed(2));
    } catch (error) {
      console.error('Error loading balances:', error);
    } finally {
      setBalanceLoading(false);
    }
  }, [isWeb]);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setAccount(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    setBnbBalance('0');
    setUsdtBalance('0');
    onDisconnect();
  }, [onDisconnect]);

  useEffect(() => {
    if (!isWeb) return;

    // Set up event listeners for account and chain changes
    const unsubscribeAccounts = onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        loadBalances(accounts[0]);
      }
    });

    const unsubscribeChain = onChainChanged(async (newChainId) => {
      setChainId(newChainId);
      const networkInfo = await getNetworkInfo();
      setIsCorrectNetwork(networkInfo.isCorrectNetwork);
      
      if (account) {
        loadBalances(account);
      }
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeChain();
    };
  }, [account, isWeb, handleDisconnect, loadBalances]);

  const handleConnect = async () => {
    if (!isWeb) {
      Alert.alert(
        'Web Only Feature',
        'MetaMask integration is only available on web browsers. Please use the web version of this app.'
      );
      return;
    }

    if (!isMetaMaskInstalled()) {
      Alert.alert(
        'MetaMask Not Found',
        'Please install MetaMask extension in your browser to continue.',
        [
          {
            text: 'Install MetaMask',
            onPress: () => {
              if (typeof window !== 'undefined') {
                window.open('https://metamask.io/download/', '_blank');
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      // Connect to MetaMask
      const accounts = await connectMetaMask();
      const userAccount = accounts[0];
      setAccount(userAccount);
      setIsConnected(true);

      // Check network
      const networkInfo = await getNetworkInfo();
      setChainId(networkInfo.chainId);
      setIsCorrectNetwork(networkInfo.isCorrectNetwork);

      // If not on BSC, prompt to switch
      if (!networkInfo.isCorrectNetwork) {
        Alert.alert(
          'Wrong Network',
          `Please switch to ${BSC_NETWORK_NAME} to continue.`,
          [
            {
              text: 'Switch Network',
              onPress: async () => {
                try {
                  await switchToBSC();
                  const updatedNetworkInfo = await getNetworkInfo();
                  setChainId(updatedNetworkInfo.chainId);
                  setIsCorrectNetwork(updatedNetworkInfo.isCorrectNetwork);
                  await loadBalances(userAccount);
                  onConnect(userAccount);
                } catch (error: any) {
                  Alert.alert('Error', error.message);
                }
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        await loadBalances(userAccount);
        onConnect(userAccount);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert('Connection Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchNetwork = async () => {
    setLoading(true);
    try {
      await switchToBSC();
      const networkInfo = await getNetworkInfo();
      setChainId(networkInfo.chainId);
      setIsCorrectNetwork(networkInfo.isCorrectNetwork);
      if (account) {
        await loadBalances(account);
      }
      Alert.alert('Success', `Switched to ${BSC_NETWORK_NAME}`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
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
          MetaMask payments are only available on web browsers
        </Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <TouchableOpacity
        style={styles.connectButton}
        onPress={handleConnect}
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
            <React.Fragment>
              <IconSymbol 
                ios_icon_name="wallet.pass.fill" 
                android_material_icon_name="account_balance_wallet" 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.connectButtonText}>Connect MetaMask</Text>
            </React.Fragment>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.connectedContainer}>
      <View style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Connected Wallet</Text>
            <Text style={styles.accountAddress}>
              {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.networkInfo}>
          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>Network:</Text>
            <View style={[styles.networkBadge, isCorrectNetwork && styles.networkBadgeCorrect]}>
              <Text style={styles.networkBadgeText}>
                {isCorrectNetwork ? BSC_NETWORK_NAME : 'Wrong Network'}
              </Text>
            </View>
          </View>
          {!isCorrectNetwork && (
            <TouchableOpacity
              style={styles.switchNetworkButton}
              onPress={handleSwitchNetwork}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.switchNetworkButtonText}>
                  Switch to {BSC_NETWORK_NAME}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {isCorrectNetwork && (
          <View style={styles.balancesContainer}>
            <Text style={styles.balancesTitle}>Available Balance</Text>
            {balanceLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <React.Fragment>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>BNB:</Text>
                  <Text style={styles.balanceValue}>{bnbBalance}</Text>
                </View>
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceLabel}>USDT:</Text>
                  <Text style={styles.balanceValue}>{usdtBalance}</Text>
                </View>
              </React.Fragment>
            )}
          </View>
        )}
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
  },
  webOnlyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
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
  networkBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.error,
  },
  networkBadgeCorrect: {
    backgroundColor: colors.success,
  },
  networkBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  switchNetworkButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  switchNetworkButtonText: {
    fontSize: 14,
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
