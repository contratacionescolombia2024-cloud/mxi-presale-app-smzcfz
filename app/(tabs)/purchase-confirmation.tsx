
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
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
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  transactionCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
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
    textAlign: 'right',
  },
  txHashRow: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  txHashLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  txHashValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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
  button: {
    ...buttonStyles.primary,
    marginBottom: 12,
  },
  buttonText: {
    ...buttonStyles.primaryText,
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
});

export default function PurchaseConfirmationScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 Loading transactions for user:', user.id);
      const { data, error } = await supabase
        .from('metamask_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading transactions:', error);
        throw error;
      }

      console.log('✅ Transactions loaded:', data?.length || 0);
      setTransactions(data || []);
    } catch (error) {
      console.error('❌ Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('confirmed');
      case 'pending':
        return t('pending');
      case 'failed':
        return t('failed');
      default:
        return status;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const openBscScan = (txHash: string) => {
    const url = `https://bscscan.com/tx/${txHash}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loadingTransactions')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <IconSymbol
              ios_icon_name="checkmark.circle.fill"
              android_material_icon_name="check_circle"
              size={80}
              color={colors.success}
            />
          </View>
          <Text style={styles.title}>{t('purchaseHistory')}</Text>
          <Text style={styles.subtitle}>{t('viewYourTransactions')}</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ {t('noTransactions')}</Text>
            <Text style={styles.infoText}>{t('noTransactionsDescription')}</Text>
          </View>
        ) : (
          <React.Fragment>
            {transactions.map((tx, index) => (
              <View key={tx.id || index} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionTitle}>
                    {t('transaction')} #{transactions.length - index}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(tx.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{getStatusText(tx.status)}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('amount')}:</Text>
                  <Text style={styles.infoValue}>{tx.amount_usd} USDT</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('mxiAmount')}:</Text>
                  <Text style={styles.infoValue}>{tx.mxi_amount.toFixed(2)} MXI</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('wallet')}:</Text>
                  <Text style={styles.infoValue}>
                    {formatAddress(tx.wallet_address)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('date')}:</Text>
                  <Text style={styles.infoValue}>{formatDate(tx.created_at)}</Text>
                </View>

                <View style={styles.txHashRow}>
                  <Text style={styles.txHashLabel}>{t('transactionHash')}:</Text>
                  <Text style={styles.txHashValue}>{tx.transaction_hash}</Text>
                </View>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => openBscScan(tx.transaction_hash)}
                >
                  <IconSymbol
                    ios_icon_name="arrow.up.right.square"
                    android_material_icon_name="open_in_new"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.viewButtonText}>{t('viewOnBscScan')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </React.Fragment>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ {t('verificationProcess')}</Text>
          <Text style={styles.infoText}>
            • {t('transactionsVerifiedAutomatically')}
          </Text>
          <Text style={styles.infoText}>
            • {t('requires3Confirmations')}
          </Text>
          <Text style={styles.infoText}>
            • {t('mxiCreditedAfterVerification')}
          </Text>
          <Text style={styles.infoText}>
            • {t('checkBalanceInVesting')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/purchase-crypto')}
        >
          <Text style={styles.buttonText}>{t('makeAnotherPurchase')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card }]}
          onPress={() => router.push('/(tabs)/')}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {t('backToHome')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
