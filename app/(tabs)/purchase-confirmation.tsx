
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
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
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 24,
  },
  statusCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  txHashValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  button: {
    ...buttonStyles.primary,
    marginTop: 16,
  },
  buttonText: {
    ...buttonStyles.primaryText,
  },
  secondaryButton: {
    ...buttonStyles.primary,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 12,
  },
  secondaryButtonText: {
    ...buttonStyles.primaryText,
    color: colors.primary,
  },
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.info,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
});

export default function PurchaseConfirmationScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState(params.status as string || 'pending');
  const [confirmations, setConfirmations] = useState(0);

  const txHash = params.txHash as string;
  const usdtAmount = parseFloat(params.usdtAmount as string || '0');
  const mxiAmount = parseFloat(params.mxiAmount as string || '0');

  // Poll for transaction status
  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('metamask_transactions')
            .select('status, confirmed_at')
            .eq('transaction_hash', txHash)
            .single();

          if (data) {
            setStatus(data.status);
            if (data.status === 'confirmed') {
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Error polling transaction status:', error);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [status, txHash]);

  const openBscScan = () => {
    const url = `https://bscscan.com/tx/${txHash}`;
    Linking.openURL(url);
  };

  const getStatusIcon = () => {
    if (status === 'confirmed') {
      return (
        <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check_circle"
            size={48}
            color="#fff"
          />
        </View>
      );
    } else if (status === 'failed') {
      return (
        <View style={[styles.iconContainer, { backgroundColor: colors.error }]}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="cancel"
            size={48}
            color="#fff"
          />
        </View>
      );
    } else {
      return (
        <View style={[styles.iconContainer, { backgroundColor: colors.warning }]}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      );
    }
  };

  const getStatusBadge = () => {
    if (status === 'confirmed') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
          <IconSymbol
            ios_icon_name="checkmark.circle.fill"
            android_material_icon_name="check_circle"
            size={16}
            color="#fff"
          />
          <Text style={styles.statusBadgeText}>Confirmed</Text>
        </View>
      );
    } else if (status === 'failed') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.error }]}>
          <IconSymbol
            ios_icon_name="xmark.circle.fill"
            android_material_icon_name="cancel"
            size={16}
            color="#fff"
          />
          <Text style={styles.statusBadgeText}>Failed</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.statusBadge, { backgroundColor: colors.warning }]}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.statusBadgeText}>Pending Confirmation</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {getStatusIcon()}
          <Text style={styles.title}>
            {status === 'confirmed' ? 'Payment Confirmed!' : 
             status === 'failed' ? 'Payment Failed' : 
             'Payment Processing'}
          </Text>
          <Text style={styles.subtitle}>
            {status === 'confirmed' ? 'Your MXI tokens have been credited to your account' : 
             status === 'failed' ? 'There was an issue with your payment' : 
             'Your payment is being processed on the blockchain'}
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          {getStatusBadge()}
          <Text style={styles.statusText}>
            {status === 'confirmed' ? 
              'Transaction has been confirmed with 3+ blockchain confirmations. Your MXI balance has been updated.' : 
             status === 'failed' ? 
              'The transaction failed. Please try again or contact support.' : 
              'Waiting for 3 blockchain confirmations. This usually takes 1-2 minutes.'}
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>USDT Paid:</Text>
            <Text style={styles.detailValue}>{usdtAmount.toFixed(2)} USDT</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>MXI Received:</Text>
            <Text style={styles.detailValue}>{mxiAmount.toFixed(2)} MXI</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction Hash:</Text>
          </View>
          <Text style={styles.txHashValue}>
            {txHash.slice(0, 20)}...{txHash.slice(-20)}
          </Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={openBscScan}
          >
            <Text style={styles.secondaryButtonText}>View on BscScan</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        {status === 'pending' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ What&apos;s Next?</Text>
            <Text style={styles.infoText}>
              • Your transaction is being confirmed on the BSC blockchain
            </Text>
            <Text style={styles.infoText}>
              • We require 3 confirmations for security
            </Text>
            <Text style={styles.infoText}>
              • This usually takes 1-2 minutes
            </Text>
            <Text style={styles.infoText}>
              • You can close this screen and check your balance later
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(tabs)/(home)')}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>

        {status === 'confirmed' && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/vesting')}
          >
            <Text style={styles.secondaryButtonText}>View Vesting Rewards</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
