
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { useWallet } from '@/contexts/WalletContext';
import { usePreSale } from '@/contexts/PreSaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
    marginBottom: 24,
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
  },
  walletCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.success,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
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
  purchaseButton: {
    ...buttonStyles.primary,
    marginTop: 16,
  },
  purchaseButtonText: {
    ...buttonStyles.primaryText,
  },
  purchaseButtonDisabled: {
    ...buttonStyles.primary,
    opacity: 0.5,
  },
  notConnectedCard: {
    ...commonStyles.card,
    padding: 40,
    alignItems: 'center',
  },
  notConnectedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notConnectedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  connectButton: {
    ...buttonStyles.primary,
  },
  connectButtonText: {
    ...buttonStyles.primaryText,
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
    marginBottom: 4,
  },
});

export default function PurchaseCryptoScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currentStage, refreshData } = usePreSale();
  const {
    isConnected,
    address,
    usdtBalance,
    sendPayment,
    refreshBalance,
  } = useWallet();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      refreshBalance();
    }
  }, [isConnected, refreshBalance]);

  const calculateMXI = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !currentStage) return 0;
    return amountNum / currentStage.price;
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handlePurchase = async () => {
    const amountNum = parseFloat(amount);

    if (isNaN(amountNum) || amountNum < 20 || amountNum > 50000) {
      Alert.alert(
        t('error'),
        `${t('amountMustBeBetween')} 20 ${t('and')} 50,000 USDT`
      );
      return;
    }

    if (!user?.id) {
      Alert.alert(t('error'), t('userNotAuthenticated'));
      return;
    }

    if (!currentStage) {
      Alert.alert(t('error'), t('noActiveStage'));
      return;
    }

    if (!address) {
      Alert.alert(t('error'), t('walletNotConnected'));
      return;
    }

    // Check USDT balance
    const balance = parseFloat(usdtBalance || '0');
    if (balance < amountNum) {
      Alert.alert(
        t('error'),
        `${t('insufficientUSDTBalance')}. ${t('yourBalance')}: ${balance.toFixed(2)} USDT`
      );
      return;
    }

    setLoading(true);
    try {
      console.log('💳 Starting crypto purchase:', { amount: amountNum, userId: user.id });

      // Send USDT payment
      const txHash = await sendPayment(amountNum);
      console.log('✅ Payment sent, tx hash:', txHash);

      // Calculate MXI amount
      const mxiAmount = calculateMXI();

      // Save transaction to database
      const { data: transaction, error: dbError } = await supabase
        .from('metamask_transactions')
        .insert({
          user_id: user.id,
          wallet_address: address,
          transaction_hash: txHash,
          amount_usd: amountNum,
          mxi_amount: mxiAmount,
          payment_currency: 'USDT',
          stage: currentStage.stage,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error('Failed to save transaction to database');
      }

      console.log('✅ Transaction saved to database:', transaction);

      // Refresh data
      await refreshData();
      await refreshBalance();

      Alert.alert(
        '✅ ' + t('purchaseSuccessful'),
        `${t('transactionHash')}: ${txHash}\n\n${t('purchaseWillBeVerified')}`,
        [
          {
            text: t('ok'),
            onPress: () => {
              setAmount('');
              router.push('/(tabs)/purchase-confirmation');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      Alert.alert(t('purchaseFailed'), error.message || t('pleaseTryAgain'));
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('purchaseMXI')}</Text>
            <Text style={styles.subtitle}>{t('buyMXIWithCrypto')}</Text>
          </View>

          <View style={styles.notConnectedCard}>
            <IconSymbol
              ios_icon_name="wallet.pass"
              android_material_icon_name="account_balance_wallet"
              size={80}
              color={colors.textSecondary}
            />
            <Text style={styles.notConnectedTitle}>{t('walletNotConnected')}</Text>
            <Text style={styles.notConnectedText}>
              {t('connectWalletToPurchase')}
            </Text>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => router.push('/(tabs)/connect-wallet')}
            >
              <Text style={styles.connectButtonText}>{t('connectWallet')}</Text>
            </TouchableOpacity>
          </View>
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
          <Text style={styles.title}>{t('purchaseMXI')}</Text>
          <Text style={styles.subtitle}>{t('buyMXIWithCrypto')}</Text>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={24}
              color={colors.success}
            />
            <Text style={styles.walletTitle}>{t('walletConnected')}</Text>
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
        </View>

        {currentStage && (
          <View style={styles.stageCard}>
            <Text style={styles.stageTitle}>
              {t('stage')} {currentStage.stage} {t('stageDetails')}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('currentPricePerMXI')}</Text>
              <Text style={styles.priceHighlight}>${currentStage.price.toFixed(2)} USDT</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('available')}</Text>
              <Text style={styles.infoValue}>
                {(currentStage.totalMXI - currentStage.soldMXI).toLocaleString()} MXI
              </Text>
            </View>
          </View>
        )}

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

          {mxiAmount > 0 && currentStage && (
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{t('youWillReceive')}</Text>
                <Text style={styles.calculationValue}>{mxiAmount.toFixed(2)} MXI</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{t('pricePerMXI')}</Text>
                <Text style={styles.calculationValue}>${currentStage.price.toFixed(2)}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ {t('paymentProcess')}</Text>
            <Text style={styles.infoText}>• {t('enterAmountToPurchase')}</Text>
            <Text style={styles.infoText}>• {t('clickPurchaseButton')}</Text>
            <Text style={styles.infoText}>• {t('approveTransactionInWallet')}</Text>
            <Text style={styles.infoText}>• {t('waitForConfirmation')}</Text>
            <Text style={styles.infoText}>• {t('mxiCreditedAfterVerification')}</Text>
          </View>

          <TouchableOpacity
            style={canPurchase ? styles.purchaseButton : styles.purchaseButtonDisabled}
            onPress={handlePurchase}
            disabled={!canPurchase}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.purchaseButtonText}>{t('purchaseWithUSDT')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
