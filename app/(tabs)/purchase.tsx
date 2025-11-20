
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePreSale } from '@/contexts/PreSaleContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import WalletConnector from '@/components/WalletConnector';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { sendUSDTPayment, WalletType } from '@/utils/walletConnect';
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  stagePriceInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  stagePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stagePriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stagePriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  verificationCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  hashText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default function PurchaseScreen() {
  const { currentStage, refreshData, isLoading } = usePreSale();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [_walletType, _setWalletType] = useState<WalletType | null>(null);
  const [_provider, _setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const calculateMXI = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !currentStage) return 0;
    return amountNum / currentStage.price;
  };

  const handleWalletConnect = (
    address: string,
    type: WalletType,
    providerInstance: any,
    signerInstance: any
  ) => {
    setWalletAddress(address);
    _setWalletType(type);
    _setProvider(providerInstance);
    setSigner(signerInstance);
    console.log('✅ Wallet connected:', { address, type });
  };

  const handleWalletDisconnect = () => {
    setWalletAddress(null);
    _setWalletType(null);
    _setProvider(null);
    setSigner(null);
    setTransactionHash(null);
    console.log('🔌 Wallet disconnected');
  };

  const verifyTransaction = async (txHash: string, mxiAmount: number, usdtAmount: number) => {
    setVerifying(true);
    try {
      console.log('🔍 Verifying transaction with backend...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/verify-usdt-purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            userId: user?.id,
            wallet: walletAddress,
            txHash: txHash,
            usdtPagados: usdtAmount,
            mxiComprados: mxiAmount,
            stage: currentStage?.stage,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 202) {
          // Transaction needs more confirmations
          Alert.alert(
            t('waitingForConfirmations'),
            `${t('transactionNeedsConfirmations')} ${result.required - result.confirmations} ${t('moreConfirmations')}`,
            [{ text: t('ok') }]
          );
          return;
        }
        throw new Error(result.error || 'Verification failed');
      }

      console.log('✅ Transaction verified:', result);

      Alert.alert(
        t('purchaseConfirmed'),
        `${t('purchaseConfirmedMessage')} ${mxiAmount.toFixed(2)} MXI!\n\n${t('transaction')}: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}\n\n${t('balanceUpdated')}`,
        [
          {
            text: t('ok'),
            onPress: () => {
              setAmount('');
              setTransactionHash(null);
              refreshData();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      Alert.alert(
        t('verificationFailed'),
        error.message || t('verificationFailedMessage')
      );
    } finally {
      setVerifying(false);
    }
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

    if (!walletAddress || !signer) {
      Alert.alert(t('error'), t('connectWalletFirst'));
      return;
    }

    if (!user?.id) {
      Alert.alert(t('error'), t('userNotAuthenticated'));
      return;
    }

    if (!currentStage) {
      Alert.alert(t('error'), t('noActivePresaleStage'));
      return;
    }

    setLoading(true);
    setTransactionHash(null);

    try {
      // Send USDT payment
      console.log('💰 Sending USDT payment...');
      const txHash = await sendUSDTPayment(signer, amountNum);

      console.log('✅ Transaction sent:', txHash);
      setTransactionHash(txHash);

      // Calculate MXI amount
      const mxiAmount = amountNum / currentStage.price;

      // Save transaction to database as pending
      const { error: txError } = await supabase
        .from('metamask_transactions')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress,
          transaction_hash: txHash,
          amount_usd: amountNum,
          mxi_amount: mxiAmount,
          payment_currency: 'USDT',
          stage: currentStage.stage,
          status: 'pending',
        });

      if (txError) {
        console.error('❌ Error saving transaction:', txError);
      }

      Alert.alert(
        t('transactionSubmittedSuccess'),
        `${t('usdtPaymentSubmitted')}\n\n${t('transactionHash')}: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}\n\n${t('verifyTransactionMessage')}`,
        [
          {
            text: t('verifyNow'),
            onPress: () => verifyTransaction(txHash, mxiAmount, amountNum),
          },
          {
            text: t('later'),
            style: 'cancel',
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loadingPurchaseData')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentStage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="warning"
            size={80}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>{t('noActiveStage')}</Text>
          <Text style={styles.emptyText}>{t('noActiveStageMes')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mxiAmount = calculateMXI();
  const canPurchase = mxiAmount > 0 && walletAddress && !loading && !verifying;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('purchaseMXI')}</Text>
          <Text style={styles.subtitle}>{t('buyMXITokens')}</Text>
        </View>

        <View style={styles.stageCard}>
          <Text style={styles.stageTitle}>
            {t('stage')} {currentStage.stage} {t('stageDetails')}
          </Text>
          <View style={styles.stageInfo}>
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

          <View style={styles.stagePriceInfo}>
            <Text style={[styles.infoLabel, { marginBottom: 12, textAlign: 'center' }]}>
              {t('preSaleStagePrices')}
            </Text>
            <View style={styles.stagePriceRow}>
              <Text style={styles.stagePriceLabel}>{t('stage')} 1:</Text>
              <Text style={styles.stagePriceValue}>$0.40 USDT</Text>
            </View>
            <View style={styles.stagePriceRow}>
              <Text style={styles.stagePriceLabel}>{t('stage')} 2:</Text>
              <Text style={styles.stagePriceValue}>$0.70 USDT</Text>
            </View>
            <View style={styles.stagePriceRow}>
              <Text style={styles.stagePriceLabel}>{t('stage')} 3:</Text>
              <Text style={styles.stagePriceValue}>$1.00 USDT</Text>
            </View>
          </View>
        </View>

        <View style={styles.purchaseCard}>
          <WalletConnector
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />

          <Text style={styles.inputLabel}>{t('amount')} (USDT)</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterAmount')}
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading && !verifying && walletAddress !== null}
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
                <Text style={styles.calculationValue}>${currentStage.price.toFixed(2)}</Text>
              </View>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>{t('paymentMethod')}</Text>
                <Text style={styles.calculationValue}>USDT (BEP-20)</Text>
              </View>
            </View>
          )}

          {transactionHash && (
            <View style={styles.verificationCard}>
              <Text style={styles.verificationTitle}>⏳ {t('transactionSubmitted')}</Text>
              <Text style={styles.verificationText}>
                {t('paymentSubmittedToBlockchain')}
              </Text>
              <Text style={styles.verificationText}>{t('transactionHash')}:</Text>
              <Text style={styles.hashText}>{transactionHash}</Text>
              <TouchableOpacity
                style={[styles.purchaseButton, { marginTop: 12 }]}
                onPress={() => {
                  const mxiAmount = calculateMXI();
                  const usdtAmount = parseFloat(amount);
                  verifyTransaction(transactionHash, mxiAmount, usdtAmount);
                }}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.purchaseButtonText}>{t('verifyTransaction')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={canPurchase ? styles.purchaseButton : styles.purchaseButtonDisabled}
            onPress={handlePurchase}
            disabled={!canPurchase}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                {!walletAddress
                  ? t('connectWalletFirst')
                  : `${t('pay')} ${amount || '0'} USDT`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
