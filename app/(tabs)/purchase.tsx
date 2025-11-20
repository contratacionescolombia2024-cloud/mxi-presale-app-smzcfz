
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePreSale } from '@/contexts/PreSaleContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import MetaMaskConnect from '@/components/MetaMaskConnect';
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
import { LinearGradient } from 'expo-linear-gradient';
import {
  sendBNBPayment,
  sendUSDTPayment,
  getBNBPriceInUSD,
  isMetaMaskInstalled,
} from '@/utils/metamask';
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
  paymentMethodsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentMethods: {
    gap: 16,
  },
  paymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  paymentButtonSelected: {
    borderColor: colors.primary,
  },
  paymentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  paymentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  paymentPrice: {
    alignItems: 'flex-end',
  },
  paymentPriceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  paymentPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
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
  metamaskInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metamaskInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  metamaskInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  confirmationCard: {
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  hashText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  bnbPriceInfo: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  bnbPriceText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default function PurchaseScreen() {
  const { currentStage, refreshData, isLoading } = usePreSale();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'USDT' | 'BNB' | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [bnbPrice, setBnbPrice] = useState<number>(600);

  const isWeb = Platform.OS === 'web';

  // Load BNB price
  React.useEffect(() => {
    if (isWeb && isMetaMaskInstalled()) {
      getBNBPriceInUSD().then(setBnbPrice).catch(console.error);
    }
  }, [isWeb]);

  const calculateMXI = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !currentStage) return 0;
    return amountNum / currentStage.price;
  };

  const calculateBNBAmount = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !bnbPrice) return 0;
    return amountNum / bnbPrice;
  };

  const handleMetaMaskConnect = (address: string) => {
    setWalletAddress(address);
    console.log('✅ MetaMask connected:', address);
  };

  const handleMetaMaskDisconnect = () => {
    setWalletAddress(null);
    setTransactionHash(null);
    console.log('🔌 MetaMask disconnected');
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

    if (!paymentMethod) {
      Alert.alert(t('selectPaymentMethodAlert'), t('pleaseSelectPaymentMethod'));
      return;
    }

    if (!walletAddress) {
      Alert.alert(t('error'), 'Please connect your MetaMask wallet first');
      return;
    }

    if (!user?.id) {
      Alert.alert(t('error'), 'User not authenticated');
      return;
    }

    if (!currentStage) {
      Alert.alert(t('error'), 'No active presale stage');
      return;
    }

    setLoading(true);
    setTransactionHash(null);

    try {
      let txHash: string;

      // Send payment based on selected method
      if (paymentMethod === 'BNB') {
        txHash = await sendBNBPayment(walletAddress, amountNum, bnbPrice);
      } else {
        txHash = await sendUSDTPayment(walletAddress, amountNum);
      }

      console.log('✅ Transaction sent:', txHash);
      setTransactionHash(txHash);

      // Calculate MXI amount
      const mxiAmount = amountNum / currentStage.price;

      // Save transaction to database
      const { error: txError } = await supabase
        .from('metamask_transactions')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress,
          transaction_hash: txHash,
          amount_usd: amountNum,
          mxi_amount: mxiAmount,
          payment_currency: paymentMethod,
          stage: currentStage.stage,
          status: 'pending',
        });

      if (txError) {
        console.error('❌ Error saving transaction:', txError);
        throw new Error('Failed to save transaction to database');
      }

      // Update vesting record
      const { data: existingVesting } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVesting) {
        const newTotal = (parseFloat(existingVesting.total_mxi) || 0) + mxiAmount;
        const newPurchased = (parseFloat(existingVesting.purchased_mxi) || 0) + mxiAmount;
        
        const { error: vestingError } = await supabase
          .from('vesting')
          .update({
            total_mxi: newTotal,
            purchased_mxi: newPurchased,
            last_update: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (vestingError) {
          console.error('❌ Vesting update error:', vestingError);
        }
      } else {
        const { error: vestingError } = await supabase
          .from('vesting')
          .insert({
            user_id: user.id,
            total_mxi: mxiAmount,
            purchased_mxi: mxiAmount,
            current_rewards: 0,
            monthly_rate: 0.03,
            last_update: new Date().toISOString(),
          });

        if (vestingError) {
          console.error('❌ Vesting creation error:', vestingError);
        }
      }

      // Update presale stage sold amount
      const { error: stageError } = await supabase
        .from('presale_stages')
        .update({
          sold_mxi: currentStage.soldMXI + mxiAmount,
        })
        .eq('stage', currentStage.stage);

      if (stageError) {
        console.error('❌ Stage update error:', stageError);
      }

      Alert.alert(
        '✅ Purchase Successful!',
        `Transaction Hash: ${txHash.substring(0, 10)}...${txHash.substring(txHash.length - 8)}\n\nYou will receive ${mxiAmount.toFixed(2)} MXI once the transaction is confirmed on the blockchain.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setPaymentMethod(null);
              refreshData();
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
  const bnbAmount = calculateBNBAmount();
  const canPurchase = mxiAmount > 0 && paymentMethod && walletAddress && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('purchaseMXI')}</Text>
          <Text style={styles.subtitle}>{t('buyMXITokens')}</Text>
        </View>

        <View style={styles.stageCard}>
          <Text style={styles.stageTitle}>{t('stage')} {currentStage.stage} {t('stageDetails')}</Text>
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
          <MetaMaskConnect
            onConnect={handleMetaMaskConnect}
            onDisconnect={handleMetaMaskDisconnect}
          />

          <Text style={styles.inputLabel}>{t('amount')} (USDT)</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterAmount')}
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading && walletAddress !== null}
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
            </View>
          )}

          {walletAddress && (
            <React.Fragment>
              <Text style={styles.paymentMethodsTitle}>{t('selectPaymentMethod')}</Text>
              <View style={styles.paymentMethods}>
                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    paymentMethod === 'USDT' && styles.paymentButtonSelected,
                  ]}
                  onPress={() => setPaymentMethod('USDT')}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#26A17B', '#50AF95']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.paymentGradient}
                  >
                    <View style={styles.paymentLeft}>
                      <View style={styles.paymentIconContainer}>
                        <IconSymbol 
                          ios_icon_name="dollarsign.circle.fill" 
                          android_material_icon_name="attach_money" 
                          size={28} 
                          color="#FFFFFF" 
                        />
                      </View>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentName}>USDT (BEP-20)</Text>
                        <Text style={styles.paymentDescription}>Pay with Tether on BSC</Text>
                      </View>
                    </View>
                    <View style={styles.paymentPrice}>
                      <Text style={styles.paymentPriceLabel}>Amount</Text>
                      <Text style={styles.paymentPriceValue}>{amount || '0'} USDT</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentButton,
                    paymentMethod === 'BNB' && styles.paymentButtonSelected,
                  ]}
                  onPress={() => setPaymentMethod('BNB')}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#F3BA2F', '#F0B90B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.paymentGradient}
                  >
                    <View style={styles.paymentLeft}>
                      <View style={styles.paymentIconContainer}>
                        <IconSymbol 
                          ios_icon_name="bitcoinsign.circle.fill" 
                          android_material_icon_name="currency_bitcoin" 
                          size={28} 
                          color="#FFFFFF" 
                        />
                      </View>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentName}>BNB</Text>
                        <Text style={styles.paymentDescription}>Pay with Binance Coin</Text>
                      </View>
                    </View>
                    <View style={styles.paymentPrice}>
                      <Text style={styles.paymentPriceLabel}>Amount</Text>
                      <Text style={styles.paymentPriceValue}>
                        {bnbAmount > 0 ? bnbAmount.toFixed(4) : '0'} BNB
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'BNB' && (
                <View style={styles.bnbPriceInfo}>
                  <Text style={styles.bnbPriceText}>
                    Current BNB Price: ${bnbPrice.toFixed(2)} USD
                  </Text>
                </View>
              )}
            </React.Fragment>
          )}

          <View style={styles.metamaskInfo}>
            <Text style={styles.metamaskInfoTitle}>ℹ️ {t('metamaskInfoTitle') || 'MetaMask Payment Info'}</Text>
            <Text style={styles.metamaskInfoText}>• Connect your MetaMask wallet to BSC network</Text>
            <Text style={styles.metamaskInfoText}>• Choose to pay with USDT (BEP-20) or BNB</Text>
            <Text style={styles.metamaskInfoText}>• Transaction will be sent to project wallet</Text>
            <Text style={styles.metamaskInfoText}>• MXI tokens will be credited after confirmation</Text>
            <Text style={styles.metamaskInfoText}>• Your private keys never leave MetaMask</Text>
          </View>

          {transactionHash && (
            <View style={styles.confirmationCard}>
              <Text style={styles.confirmationTitle}>✅ Transaction Submitted</Text>
              <Text style={styles.confirmationText}>
                Your payment has been submitted to the blockchain.
              </Text>
              <Text style={styles.confirmationText}>Transaction Hash:</Text>
              <Text style={styles.hashText}>{transactionHash}</Text>
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
                  ? 'Connect MetaMask First'
                  : !paymentMethod
                  ? t('selectPaymentMethodButton')
                  : `Pay with ${paymentMethod}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
