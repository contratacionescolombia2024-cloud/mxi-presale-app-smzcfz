
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWallet } from '@/contexts/WalletContext';
import { usePreSale } from '@/contexts/PreSaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';

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
  stageCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  stageInfo: {
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
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  priceHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  purchaseCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  calculationCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  calculationValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  button: {
    ...buttonStyles.primary,
    marginTop: 16,
  },
  buttonText: {
    ...buttonStyles.primaryText,
  },
  buttonDisabled: {
    ...buttonStyles.primary,
    opacity: 0.5,
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
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
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
});

export default function PurchaseCryptoScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, address, usdtBalance, sendPayment } = useWallet();
  const { currentStage } = usePreSale();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!isWeb) {
      Alert.alert(
        t('webOnlyFeature'),
        t('cryptoWalletWebOnly'),
        [{ text: t('ok'), onPress: () => router.back() }]
      );
    }
  }, [isWeb]);

  const calculateMXI = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !currentStage) return 0;
    return amountNum / currentStage.price;
  };

  const handlePurchase = async () => {
    if (!isConnected || !address) {
      Alert.alert(t('error'), 'Please connect your wallet first');
      router.push('/connect-wallet');
      return;
    }

    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum < 20 || amountNum > 50000) {
      Alert.alert(
        t('error'),
        `${t('amountMustBeBetween')} 20 ${t('and')} 50,000 USDT`
      );
      return;
    }

    // Check USDT balance
    const balance = parseFloat(usdtBalance || '0');
    if (balance < amountNum) {
      Alert.alert(
        t('error'),
        `Insufficient USDT balance. You have ${balance.toFixed(2)} USDT but need ${amountNum.toFixed(2)} USDT.`
      );
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Starting USDT payment...');
      
      // Send USDT payment
      const txHash = await sendPayment(amountNum);
      console.log('✅ Payment sent, tx hash:', txHash);

      // Calculate MXI amount
      const mxiAmount = calculateMXI();

      // Submit transaction to backend for validation
      console.log('📤 Submitting transaction to backend...');
      const { data, error } = await supabase.functions.invoke('validate-usdt-payment', {
        body: {
          userId: user?.id,
          walletAddress: address,
          txHash,
          usdtAmount: amountNum,
          mxiAmount,
          stage: currentStage?.stage,
        },
      });

      if (error) {
        console.error('❌ Backend validation error:', error);
        throw new Error('Failed to validate transaction. Please contact support with your transaction hash: ' + txHash);
      }

      console.log('✅ Transaction validated:', data);

      // Navigate to confirmation screen
      router.push({
        pathname: '/purchase-confirmation',
        params: {
          txHash,
          usdtAmount: amountNum.toString(),
          mxiAmount: mxiAmount.toString(),
          status: 'pending',
        },
      });

      Alert.alert(
        t('success'),
        `Payment sent successfully! Transaction hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}\n\nYour MXI tokens will be credited after 3 confirmations.`,
        [{ text: t('ok') }]
      );

      setAmount('');
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      Alert.alert(t('error'), error.message || t('pleaseTryAgain'));
    } finally {
      setLoading(false);
    }
  };

  if (!isWeb) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ {t('webOnlyFeature')}</Text>
          <Text style={styles.warningText}>
            {t('cryptoWalletWebOnly')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Purchase MXI with Crypto</Text>
            <Text style={styles.subtitle}>
              Connect your wallet to purchase MXI with USDT
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Wallet Not Connected</Text>
            <Text style={styles.warningText}>
              Please connect your wallet to continue with crypto payment.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/connect-wallet')}
          >
            <Text style={styles.buttonText}>{t('connectWallet')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const mxiAmount = calculateMXI();
  const canPurchase = mxiAmount > 0 && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Purchase MXI with USDT</Text>
          <Text style={styles.subtitle}>
            Pay with USDT BEP20 on Binance Smart Chain
          </Text>
        </View>

        {/* Wallet Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💼 Connected Wallet</Text>
          <Text style={styles.infoText}>
            Address: {address?.slice(0, 10)}...{address?.slice(-8)}
          </Text>
          <Text style={styles.infoText}>
            USDT Balance: {parseFloat(usdtBalance || '0').toFixed(2)} USDT
          </Text>
        </View>

        {/* Stage Info */}
        <View style={styles.stageCard}>
          <Text style={styles.stageTitle}>{t('stage')} {currentStage?.stage} {t('stageDetails')}</Text>
          <View style={styles.stageInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('currentPricePerMXI')}</Text>
              <Text style={styles.priceHighlight}>${currentStage?.price.toFixed(2)} USDT</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('available')}</Text>
              <Text style={styles.infoValue}>
                {((currentStage?.totalMXI || 0) - (currentStage?.soldMXI || 0)).toLocaleString()} MXI
              </Text>
            </View>
          </View>
        </View>

        {/* Purchase Form */}
        <View style={styles.purchaseCard}>
          <Text style={styles.inputLabel}>{t('amount')} (USDT)</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterAmount')}
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <Text style={styles.helperText}>
            {t('minimum')}: 20 USDT • {t('maximum')}: 50,000 USDT
          </Text>

          {mxiAmount > 0 && (
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{t('youWillReceive')}</Text>
                <Text style={styles.calculationValue}>{mxiAmount.toFixed(2)} MXI</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{t('pricePerMXI')}</Text>
                <Text style={styles.calculationValue}>${currentStage?.price.toFixed(2)}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ Payment Process</Text>
            <Text style={styles.infoText}>
              1. Enter the amount of USDT you want to spend
            </Text>
            <Text style={styles.infoText}>
              2. Click &quot;Pay with USDT&quot; button
            </Text>
            <Text style={styles.infoText}>
              3. Confirm the transaction in your wallet
            </Text>
            <Text style={styles.infoText}>
              4. Wait for 3 blockchain confirmations
            </Text>
            <Text style={styles.infoText}>
              5. Your MXI tokens will be credited automatically
            </Text>
          </View>

          <TouchableOpacity
            style={canPurchase ? styles.button : styles.buttonDisabled}
            onPress={handlePurchase}
            disabled={!canPurchase}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Pay {amount || '0'} USDT
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
