
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { usePreSale } from '@/contexts/PreSaleContext';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 12,
  },
  paymentButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
});

export default function PurchaseScreen() {
  const { currentStage, purchaseMXI } = usePreSale();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'binance' | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateMXI = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || !currentStage) return 0;
    return amountNum / currentStage.price;
  };

  const handlePurchase = async () => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum < 10 || amountNum > 50000) {
      Alert.alert('Invalid Amount', 'Amount must be between 10 and 50,000 USDT');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      await purchaseMXI(amountNum, paymentMethod);
      Alert.alert(
        'Purchase Initiated',
        'Your purchase is being processed. You will receive your MXI tokens shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              setPaymentMethod(null);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Purchase error:', error);
      Alert.alert('Purchase Failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mxiAmount = calculateMXI();
  const canPurchase = mxiAmount > 0 && paymentMethod && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Purchase MXI</Text>
          <Text style={styles.subtitle}>Buy MXI tokens at current stage price</Text>
        </View>

        {currentStage && (
          <View style={styles.stageCard}>
            <Text style={styles.stageTitle}>Stage {currentStage.stage} Details</Text>
            <View style={styles.stageInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Price per MXI</Text>
                <Text style={styles.infoValue}>${currentStage.price.toFixed(2)} USDT</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Available</Text>
                <Text style={styles.infoValue}>
                  {(currentStage.totalMXI - currentStage.soldMXI).toLocaleString()} MXI
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.purchaseCard}>
          <Text style={styles.inputLabel}>Amount (USDT)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <Text style={styles.helperText}>Minimum: 10 USDT • Maximum: 50,000 USDT</Text>

          {mxiAmount > 0 && (
            <View style={styles.calculationCard}>
              <View style={styles.calculationRow}>
                <Text style={styles.calculationLabel}>You will receive</Text>
                <Text style={styles.calculationValue}>{mxiAmount.toFixed(2)} MXI</Text>
              </View>
            </View>
          )}

          <Text style={styles.paymentMethodsTitle}>Select Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'paypal' && styles.paymentButtonSelected,
              ]}
              onPress={() => setPaymentMethod('paypal')}
              disabled={loading}
            >
              <IconSymbol 
                ios_icon_name="creditcard.fill" 
                android_material_icon_name="payment" 
                size={24} 
                color={paymentMethod === 'paypal' ? colors.primary : colors.text} 
              />
              <Text style={styles.paymentButtonText}>PayPal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentButton,
                paymentMethod === 'binance' && styles.paymentButtonSelected,
              ]}
              onPress={() => setPaymentMethod('binance')}
              disabled={loading}
            >
              <IconSymbol 
                ios_icon_name="bitcoinsign.circle.fill" 
                android_material_icon_name="currency_bitcoin" 
                size={24} 
                color={paymentMethod === 'binance' ? colors.primary : colors.text} 
              />
              <Text style={styles.paymentButtonText}>Binance</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={canPurchase ? styles.purchaseButton : styles.purchaseButtonDisabled}
            onPress={handlePurchase}
            disabled={!canPurchase}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.purchaseButtonText}>Complete Purchase</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
