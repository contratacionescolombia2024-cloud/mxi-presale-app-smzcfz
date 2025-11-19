
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePreSale } from '@/contexts/PreSaleContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  Linking,
} from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

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
  cryptomusInfo: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cryptomusInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  cryptomusInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default function PurchaseScreen() {
  const { currentStage, purchaseMXI, isLoading } = usePreSale();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cryptomus' | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateMXI = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !currentStage) return 0;
    return amountNum / currentStage.price;
  };

  const handlePurchase = async () => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum < 10 || amountNum > 50000) {
      Alert.alert(
        t('error'),
        `${t('amountMustBeBetween')} 10 ${t('and')} 50,000 USDT`
      );
      return;
    }

    if (!paymentMethod) {
      Alert.alert(t('selectPaymentMethodAlert'), t('pleaseSelectPaymentMethod'));
      return;
    }

    setLoading(true);
    try {
      await purchaseMXI(amountNum, paymentMethod);
      Alert.alert(
        t('purchaseInitiated'),
        t('cryptomusPurchaseMessage'),
        [
          {
            text: t('ok'),
            onPress: () => {
              setAmount('');
              setPaymentMethod(null);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Purchase error:', error);
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
  const canPurchase = mxiAmount > 0 && paymentMethod && !loading;

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
            {t('minimum')}: 10 USDT • {t('maximum')}: 50,000 USDT
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

          <Text style={styles.paymentMethodsTitle}>{t('selectPaymentMethod')}</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'cryptomus' && styles.paymentButtonSelected,
              ]}
              onPress={() => setPaymentMethod('cryptomus')}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#6C5CE7', '#A29BFE']}
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
                    <Text style={styles.paymentName}>{t('cryptomus')}</Text>
                    <Text style={styles.paymentDescription}>{t('cryptomusDescription')}</Text>
                  </View>
                </View>
                <View style={styles.paymentPrice}>
                  <Text style={styles.paymentPriceLabel}>{t('currentPrice')}</Text>
                  <Text style={styles.paymentPriceValue}>${currentStage.price.toFixed(2)}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.cryptomusInfo}>
            <Text style={styles.cryptomusInfoTitle}>ℹ️ {t('cryptomusInfoTitle')}</Text>
            <Text style={styles.cryptomusInfoText}>• {t('cryptomusInfo1')}</Text>
            <Text style={styles.cryptomusInfoText}>• {t('cryptomusInfo2')}</Text>
            <Text style={styles.cryptomusInfoText}>• {t('cryptomusInfo3')}</Text>
            <Text style={styles.cryptomusInfoText}>• {t('cryptomusInfo4')}</Text>
          </View>

          <TouchableOpacity
            style={canPurchase ? styles.purchaseButton : styles.purchaseButtonDisabled}
            onPress={handlePurchase}
            disabled={!canPurchase}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                {paymentMethod ? `${t('completePurchaseVia')} ${t('cryptomus')}` : t('selectPaymentMethodButton')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
