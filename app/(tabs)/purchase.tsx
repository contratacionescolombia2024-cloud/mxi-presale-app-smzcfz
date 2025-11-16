
import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreSale } from '@/contexts/PreSaleContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function PurchaseScreen() {
  const { currentStage, purchaseMXI } = usePreSale();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'paypal' | 'binance' | null>(null);

  const calculateMXI = () => {
    const usdAmount = parseFloat(amount) || 0;
    return usdAmount / currentStage.price;
  };

  const handlePurchase = async () => {
    const usdAmount = parseFloat(amount);

    if (!usdAmount || usdAmount < 10 || usdAmount > 50000) {
      Alert.alert('Invalid Amount', 'Amount must be between 10 and 50,000 USDT');
      return;
    }

    if (!selectedPayment) {
      Alert.alert('Select Payment', 'Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      await purchaseMXI(usdAmount, selectedPayment);
      Alert.alert('Success', `Purchase of ${calculateMXI().toFixed(2)} MXI initiated!`);
      setAmount('');
      setSelectedPayment(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="cart.fill.badge.plus" 
            android_material_icon_name="add_shopping_cart" 
            size={60} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Purchase MXI</Text>
          <Text style={styles.subtitle}>Stage {currentStage.stage} - ${currentStage.price} per MXI</Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Enter Amount (USDT/USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <View style={styles.limits}>
            <Text style={styles.limitText}>Min: $10</Text>
            <Text style={styles.limitText}>Max: $50,000</Text>
          </View>

          {amount && parseFloat(amount) >= 10 && (
            <View style={styles.calculation}>
              <Text style={styles.calculationLabel}>You will receive:</Text>
              <Text style={styles.calculationValue}>{calculateMXI().toFixed(4)} MXI</Text>
            </View>
          )}
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Select Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'paypal' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('paypal')}
          >
            <IconSymbol 
              ios_icon_name="creditcard.fill" 
              android_material_icon_name="payment" 
              size={32} 
              color={selectedPayment === 'paypal' ? colors.card : colors.primary} 
            />
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle,
                selectedPayment === 'paypal' && styles.paymentTitleSelected,
              ]}>
                PayPal
              </Text>
              <Text style={[
                styles.paymentDescription,
                selectedPayment === 'paypal' && styles.paymentDescriptionSelected,
              ]}>
                Pay with PayPal account
              </Text>
            </View>
            {selectedPayment === 'paypal' && (
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={24} 
                color={colors.card} 
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'binance' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('binance')}
          >
            <IconSymbol 
              ios_icon_name="bitcoinsign.circle.fill" 
              android_material_icon_name="currency_bitcoin" 
              size={32} 
              color={selectedPayment === 'binance' ? colors.card : colors.secondary} 
            />
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle,
                selectedPayment === 'binance' && styles.paymentTitleSelected,
              ]}>
                Binance
              </Text>
              <Text style={[
                styles.paymentDescription,
                selectedPayment === 'binance' && styles.paymentDescriptionSelected,
              ]}>
                Pay with cryptocurrency
              </Text>
            </View>
            {selectedPayment === 'binance' && (
              <IconSymbol 
                ios_icon_name="checkmark.circle.fill" 
                android_material_icon_name="check_circle" 
                size={24} 
                color={colors.card} 
              />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[buttonStyles.primary, styles.purchaseButton]}
          onPress={handlePurchase}
          disabled={loading || !amount || !selectedPayment}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={buttonStyles.text}>Complete Purchase</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.infoText}>
            Your MXI tokens will be added to your balance immediately after payment confirmation. 
            Vesting rewards start accruing automatically at 3% monthly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  limits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  limitText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calculation: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  calculationValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
    gap: 12,
  },
  paymentOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentTitleSelected: {
    color: colors.card,
  },
  paymentDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentDescriptionSelected: {
    color: colors.card,
    opacity: 0.9,
  },
  purchaseButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
