
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { usePreSale } from '@/contexts/PreSaleContext';
import { colors, commonStyles, buttonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/app/integrations/supabase/client';

export default function ReferralsScreen() {
  const { user } = useAuth();
  const { referralStats, forceReloadReferrals } = usePreSale();
  const [isReloading, setIsReloading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ========================================');
    console.log('🔍 REFERRALS SCREEN - CURRENT STATE');
    console.log('🔍 ========================================');
    console.log('🔍 User ID:', user?.id);
    console.log('🔍 Referral Stats:', {
      totalReferrals: referralStats?.totalReferrals,
      level1Count: referralStats?.level1Count,
      level2Count: referralStats?.level2Count,
      level3Count: referralStats?.level3Count,
      level1MXI: referralStats?.level1MXI,
      level2MXI: referralStats?.level2MXI,
      level3MXI: referralStats?.level3MXI,
      totalMXIEarned: referralStats?.totalMXIEarned,
    });
    console.log('🔍 ========================================');
  }, [referralStats, user?.id]);

  const referralLink = `https://mxi-presale.com/register?ref=${user?.referralCode}`;

  const handleCopyCode = async () => {
    if (user?.referralCode) {
      await Clipboard.setStringAsync(user.referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    }
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join MXI Pre-Sale using my referral code: ${user?.referralCode}\n\nOr use this link: ${referralLink}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleForceReload = async () => {
    console.log('🔥 FORCE RELOAD BUTTON PRESSED');
    setIsReloading(true);
    try {
      await forceReloadReferrals();
      Alert.alert('Success', 'Referral data reloaded!');
    } catch (error) {
      console.error('Error reloading:', error);
      Alert.alert('Error', 'Failed to reload data');
    } finally {
      setIsReloading(false);
    }
  };

  const handleOpenTransferModal = () => {
    if (!referralStats?.totalMXIEarned || referralStats.totalMXIEarned < 50) {
      Alert.alert(
        'Insufficient Earnings', 
        `You need at least 50 MXI in referral earnings to transfer.\n\nCurrent earnings: ${(referralStats?.totalMXIEarned || 0).toFixed(2)} MXI`
      );
      return;
    }
    setTransferAmount('');
    setShowTransferModal(true);
  };

  const handleTransferToBalance = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const amount = parseFloat(transferAmount);
    
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive amount');
      return;
    }

    if (amount < 50) {
      Alert.alert(
        'Minimum Amount Required',
        'The minimum transfer amount is 50 MXI.\n\nPlease enter at least 50 MXI.'
      );
      return;
    }

    const availableEarnings = referralStats?.totalMXIEarned || 0;
    if (amount > availableEarnings) {
      Alert.alert(
        'Insufficient Earnings',
        `You only have ${availableEarnings.toFixed(2)} MXI in referral earnings.\n\nPlease enter a smaller amount.`
      );
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Transfer ${amount} MXI from referral earnings to your main balance?\n\n⚠️ Important:\n• This will NOT generate commissions\n• The amount will be added to your main balance\n• This action cannot be undone`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          onPress: async () => {
            setIsTransferring(true);
            try {
              console.log(`💰 Transferring ${amount} MXI from referral earnings to balance (NO COMMISSIONS)`);
              
              const { data, error } = await supabase.rpc('user_transfer_referral_to_balance', {
                p_user_id: user.id,
                p_amount: amount,
              });

              if (error) {
                console.error('❌ RPC Error:', error);
                Alert.alert('Error', `Failed to transfer: ${error.message}`);
                throw error;
              }

              console.log('📦 Transfer response:', data);

              if (data && data.success) {
                Alert.alert(
                  'Success! ✅',
                  `${data.message}\n\n📊 Updated Balance:\n• Total MXI: ${data.new_total_mxi.toFixed(2)}\n• Purchased MXI: ${data.new_purchased_mxi.toFixed(2)}\n• Remaining Referral Earnings: ${data.available_referral_earnings.toFixed(2)} MXI\n\n✅ No commissions were generated for this transfer`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setShowTransferModal(false);
                        setTransferAmount('');
                        forceReloadReferrals();
                      }
                    }
                  ]
                );
              } else {
                const errorMsg = data?.error || 'Transfer failed';
                console.error('❌ Transfer failed:', errorMsg);
                Alert.alert('Error', errorMsg);
              }
            } catch (error: any) {
              console.error('❌ Exception in handleTransferToBalance:', error);
              Alert.alert('Error', error.message || 'Failed to transfer');
            } finally {
              setIsTransferring(false);
            }
          }
        }
      ]
    );
  };

  const levels = [
    { 
      level: 1, 
      commission: '5%', 
      count: referralStats?.level1Count || 0, 
      earned: referralStats?.level1MXI || 0,
      color: colors.primary,
    },
    { 
      level: 2, 
      commission: '2%', 
      count: referralStats?.level2Count || 0, 
      earned: referralStats?.level2MXI || 0,
      color: colors.secondary,
    },
    { 
      level: 3, 
      commission: '1%', 
      count: referralStats?.level3Count || 0, 
      earned: referralStats?.level3MXI || 0,
      color: colors.accent,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="person.2.fill" 
            android_material_icon_name="people" 
            size={60} 
            color={colors.accent} 
          />
          <Text style={styles.title}>Referral Program</Text>
          <Text style={styles.subtitle}>Earn up to 5% commission</Text>
        </View>

        {/* FORCE RELOAD BUTTON - DRASTIC MEASURE */}
        <TouchableOpacity 
          style={[buttonStyles.primary, styles.forceReloadButton]}
          onPress={handleForceReload}
          disabled={isReloading}
        >
          {isReloading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <React.Fragment>
              <IconSymbol 
                ios_icon_name="arrow.clockwise.circle.fill" 
                android_material_icon_name="refresh" 
                size={20} 
                color={colors.card} 
              />
              <Text style={[buttonStyles.text, { marginLeft: 8 }]}>Force Reload Data</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <View style={[commonStyles.card, styles.totalCard]}>
          <Text style={styles.totalLabel}>Total Referral Earnings</Text>
          <Text style={styles.totalAmount}>
            {referralStats?.totalMXIEarned !== undefined 
              ? referralStats.totalMXIEarned.toFixed(2) 
              : '0.00'} MXI
          </Text>
          <Text style={styles.totalSubtext}>
            From {(referralStats?.totalReferrals || 0)} total referrals
          </Text>
          
          {/* UNIFY TO BALANCE BUTTON */}
          <TouchableOpacity 
            style={[
              styles.unifyButton,
              (!referralStats?.totalMXIEarned || referralStats.totalMXIEarned < 50) && styles.unifyButtonDisabled
            ]}
            onPress={handleOpenTransferModal}
            disabled={!referralStats?.totalMXIEarned || referralStats.totalMXIEarned < 50}
          >
            <IconSymbol 
              ios_icon_name="arrow.up.circle.fill" 
              android_material_icon_name="upload" 
              size={20} 
              color={colors.card} 
            />
            <Text style={styles.unifyButtonText}>Unify to Balance</Text>
          </TouchableOpacity>
          
          {(!referralStats?.totalMXIEarned || referralStats.totalMXIEarned < 50) && (
            <Text style={styles.minimumNote}>
              Minimum 50 MXI required to transfer
            </Text>
          )}
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.code}>{user?.referralCode}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <IconSymbol 
                ios_icon_name="doc.on.doc.fill" 
                android_material_icon_name="content_copy" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.cardTitle}>Referral Link</Text>
          <View style={styles.linkContainer}>
            <Text style={styles.link} numberOfLines={1}>{referralLink}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
              <IconSymbol 
                ios_icon_name="doc.on.doc.fill" 
                android_material_icon_name="content_copy" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[buttonStyles.primary, styles.shareButton]} onPress={handleShare}>
            <IconSymbol 
              ios_icon_name="square.and.arrow.up.fill" 
              android_material_icon_name="share" 
              size={20} 
              color={colors.card} 
            />
            <Text style={[buttonStyles.text, { marginLeft: 8 }]}>Share Referral</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Commission Levels</Text>
        {levels.map((level, index) => (
          <View key={index} style={[commonStyles.card, styles.levelCard]}>
            <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
              <Text style={styles.levelBadgeText}>Level {level.level}</Text>
            </View>
            
            <View style={styles.levelInfo}>
              <View style={styles.levelRow}>
                <Text style={styles.levelLabel}>Commission Rate</Text>
                <Text style={styles.levelValue}>{level.commission}</Text>
              </View>
              <View style={styles.levelRow}>
                <Text style={styles.levelLabel}>Referrals</Text>
                <Text style={[styles.levelValue, styles.highlightValue]}>
                  {level.count}
                </Text>
              </View>
              <View style={styles.levelRow}>
                <Text style={styles.levelLabel}>MXI Earned</Text>
                <Text style={[styles.levelValue, styles.highlightValue, { color: level.color }]}>
                  {level.earned.toFixed(2)} MXI
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.infoCard}>
          <IconSymbol 
            ios_icon_name="info.circle.fill" 
            android_material_icon_name="info" 
            size={24} 
            color={colors.primary} 
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How It Works</Text>
            <Text style={styles.infoText}>
              - Level 1: 5% commission on direct referrals{'\n'}
              - Level 2: 2% commission on their referrals{'\n'}
              - Level 3: 1% commission on third level{'\n'}
              - Commissions paid in MXI instantly{'\n'}
              - No limit on referrals{'\n'}
              - Transfer earnings to main balance (min 50 MXI){'\n'}
              - Transfers do NOT generate new commissions
            </Text>
          </View>
        </View>

        {/* Debug Info Card */}
        <View style={[commonStyles.card, styles.debugCard]}>
          <Text style={styles.debugTitle}>🔍 Debug Information</Text>
          <Text style={styles.debugInfo}>User ID: {user?.id}</Text>
          <Text style={styles.debugInfo}>Total Referrals: {referralStats?.totalReferrals || 0}</Text>
          <Text style={styles.debugInfo}>Level 1: {referralStats?.level1Count || 0} referrals, {(referralStats?.level1MXI || 0).toFixed(2)} MXI</Text>
          <Text style={styles.debugInfo}>Level 2: {referralStats?.level2Count || 0} referrals, {(referralStats?.level2MXI || 0).toFixed(2)} MXI</Text>
          <Text style={styles.debugInfo}>Level 3: {referralStats?.level3Count || 0} referrals, {(referralStats?.level3MXI || 0).toFixed(2)} MXI</Text>
          <Text style={styles.debugInfo}>Total Earned: {(referralStats?.totalMXIEarned || 0).toFixed(2)} MXI</Text>
        </View>
      </ScrollView>

      {/* Transfer to Balance Modal */}
      <Modal
        visible={showTransferModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Unify to Balance</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.availableBox}>
                <Text style={styles.availableLabel}>Available Referral Earnings</Text>
                <Text style={styles.availableAmount}>
                  {(referralStats?.totalMXIEarned || 0).toFixed(2)} MXI
                </Text>
              </View>

              <Text style={styles.inputLabel}>Amount to Transfer (MXI)</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 50 MXI"
                placeholderTextColor={colors.textSecondary}
                value={transferAmount}
                onChangeText={setTransferAmount}
                keyboardType="decimal-pad"
                editable={!isTransferring}
              />

              <View style={styles.infoBox}>
                <IconSymbol 
                  ios_icon_name="info.circle.fill" 
                  android_material_icon_name="info" 
                  size={20} 
                  color={colors.primary} 
                />
                <View style={styles.infoBoxContent}>
                  <Text style={styles.infoBoxText}>
                    • Minimum transfer: 50 MXI{'\n'}
                    • This will NOT generate commissions{'\n'}
                    • The amount will be added to your main balance{'\n'}
                    • This action cannot be undone
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.transferButton, (isTransferring || !transferAmount) && styles.transferButtonDisabled]}
                onPress={handleTransferToBalance}
                disabled={isTransferring || !transferAmount}
              >
                {isTransferring ? (
                  <ActivityIndicator color={colors.card} />
                ) : (
                  <React.Fragment>
                    <IconSymbol 
                      ios_icon_name="arrow.up.circle.fill" 
                      android_material_icon_name="upload" 
                      size={24} 
                      color={colors.card} 
                    />
                    <Text style={styles.transferButtonText}>Transfer to Balance</Text>
                  </React.Fragment>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'android' ? 48 : 20,
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
  forceReloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: colors.error,
  },
  totalCard: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.card,
    opacity: 0.9,
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 8,
  },
  totalSubtext: {
    fontSize: 12,
    color: colors.card,
    opacity: 0.8,
    marginBottom: 16,
  },
  unifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  unifyButtonDisabled: {
    opacity: 0.5,
  },
  unifyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  minimumNote: {
    fontSize: 12,
    color: colors.card,
    opacity: 0.8,
    marginTop: 8,
    fontStyle: 'italic',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  code: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  link: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  levelCard: {
    marginBottom: 12,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  levelInfo: {
    gap: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  debugCard: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  debugInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalBody: {
    gap: 16,
  },
  availableBox: {
    backgroundColor: `${colors.accent}20`,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  availableLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  availableAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoBoxContent: {
    flex: 1,
  },
  infoBoxText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
  },
  transferButtonDisabled: {
    opacity: 0.5,
  },
  transferButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
});
