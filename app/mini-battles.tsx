
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import {
  MiniBattle,
  MINI_BATTLE_GAME_NAMES,
  MINI_BATTLE_GAME_DESCRIPTIONS,
  MINI_BATTLE_MIN_ENTRY,
  MINI_BATTLE_MAX_ENTRY,
} from '@/types/tournaments';

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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceCard: {
    backgroundColor: colors.sectionOrange,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 8,
  },
  balanceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  createButtonText: {
    color: colors.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  battleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  battleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    color: colors.light,
    fontSize: 12,
    fontWeight: 'bold',
  },
  battleInfo: {
    marginBottom: 12,
  },
  battleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  battleInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  battleInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  battleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  battleButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  battleButtonSecondary: {
    backgroundColor: colors.secondary,
  },
  battleButtonDanger: {
    backgroundColor: colors.error,
  },
  battleButtonText: {
    color: colors.light,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    maxHeight: '85%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light,
  },
  participantSelector: {
    marginBottom: 20,
  },
  participantOptions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  participantOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  participantOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.sectionPurple,
  },
  participantOptionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  participantOptionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  confirmationSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  confirmationLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  confirmationDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  gameSelector: {
    marginBottom: 20,
  },
  gameOption: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  gameOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.sectionPurple,
  },
  gameOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  gameOptionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default function MiniBattlesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const preselectedGame = params.game as string | undefined;
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentsBalance, setTournamentsBalance] = useState(0);
  const [commissionBalance, setCommissionBalance] = useState(0);
  const [miniBattles, setMiniBattles] = useState<MiniBattle[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>(preselectedGame || 'beat_bounce');
  const [entryFee, setEntryFee] = useState('50');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isCreating, setIsCreating] = useState(false);

  // RESTRICTED: Only 2 or 4 participants
  const participantOptions = [2, 4];

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (preselectedGame) {
      setSelectedGame(preselectedGame);
      setShowCreateModal(true);
    }
  }, [preselectedGame]);

  const loadData = async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping mini battles data load');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading mini battles data for user:', user.id);

      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('tournaments_balance, commission_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vestingError) {
        console.error('❌ Error loading balances:', vestingError);
      } else {
        setTournamentsBalance(vestingData?.tournaments_balance || 0);
        setCommissionBalance(vestingData?.commission_balance || 0);
        console.log('💰 Balances:', {
          tournaments: vestingData?.tournaments_balance || 0,
          commission: vestingData?.commission_balance || 0,
        });
      }

      const { data: battlesData, error: battlesError } = await supabase
        .from('mini_battles')
        .select('*')
        .in('status', ['waiting', 'in_progress'])
        .order('created_at', { ascending: false });

      if (battlesError) {
        console.error('❌ Error loading mini battles:', battlesError);
      } else {
        setMiniBattles(battlesData || []);
        console.log('✅ Mini battles loaded:', battlesData?.length || 0);
      }

      console.log('✅ Mini battles data loaded');
    } catch (error) {
      console.error('❌ Failed to load mini battles data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOpenCreateModal = () => {
    console.log('🎮 ========================================');
    console.log('🎮 OPENING CREATE MODAL');
    console.log('🎮 ========================================');
    console.log('💰 Current balances:', {
      tournaments: tournamentsBalance,
      commission: commissionBalance,
      total: tournamentsBalance + commissionBalance,
    });
    setShowCreateModal(true);
  };

  const handleProceedToConfirmation = () => {
    console.log('🎮 ========================================');
    console.log('🎮 PROCEEDING TO CONFIRMATION');
    console.log('🎮 ========================================');
    
    const fee = parseFloat(entryFee);
    const totalBalance = tournamentsBalance + commissionBalance;
    
    console.log('💰 Entry fee:', fee);
    console.log('💰 Total available balance:', totalBalance);
    console.log('👥 Max players:', maxPlayers);
    console.log('🎮 Game type:', selectedGame);

    // Validation
    if (isNaN(fee) || fee < MINI_BATTLE_MIN_ENTRY || fee > MINI_BATTLE_MAX_ENTRY) {
      console.error('❌ Invalid entry fee:', fee);
      Alert.alert('Invalid Entry Fee', `Entry fee must be between ${MINI_BATTLE_MIN_ENTRY} and ${MINI_BATTLE_MAX_ENTRY} MXI`);
      return;
    }

    if (totalBalance < fee) {
      console.error('❌ Insufficient balance:', totalBalance, '<', fee);
      Alert.alert('Insufficient Balance', 'You do not have enough balance to create this mini battle. Use your Challenge Winnings or Commission Balance.');
      return;
    }

    console.log('✅ Validation passed, showing confirmation modal');
    setShowCreateModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    console.log('🎮 ========================================');
    console.log('🎮 CREATE MINI BATTLE - CONFIRMED - START');
    console.log('🎮 ========================================');
    
    if (!user?.id) {
      console.error('❌ No user ID');
      Alert.alert('Error', 'You must be logged in to create a mini battle.');
      return;
    }

    const fee = parseFloat(entryFee);
    const totalBalance = tournamentsBalance + commissionBalance;
    
    console.log('💰 Entry fee:', fee);
    console.log('💰 Total available balance:', totalBalance);
    console.log('💰 Tournaments balance:', tournamentsBalance);
    console.log('💰 Commission balance:', commissionBalance);
    console.log('👥 Max players:', maxPlayers);
    console.log('🎮 Game type:', selectedGame);
    console.log('👤 User ID:', user.id);

    // AGGRESSIVE VALIDATION
    if (!selectedGame) {
      console.error('❌ CRITICAL: No game type selected!');
      Alert.alert('Error', 'Please select a game type.');
      return;
    }

    if (isNaN(fee) || fee <= 0) {
      console.error('❌ CRITICAL: Invalid entry fee!', fee);
      Alert.alert('Error', 'Invalid entry fee. Please enter a valid number.');
      return;
    }

    if (maxPlayers !== 2 && maxPlayers !== 4) {
      console.error('❌ CRITICAL: Invalid max players!', maxPlayers);
      Alert.alert('Error', 'Max players must be 2 or 4.');
      return;
    }

    if (totalBalance < fee) {
      console.error('❌ CRITICAL: Insufficient balance!', { totalBalance, fee });
      Alert.alert('Insufficient Balance', `You need ${fee} MXI but only have ${totalBalance.toFixed(2)} MXI available.`);
      return;
    }

    setIsCreating(true);

    try {
      console.log('📡 ========================================');
      console.log('📡 CALLING RPC: create_mini_battle');
      console.log('📡 ========================================');
      console.log('📡 Parameters:', {
        p_user_id: user.id,
        p_game_type: selectedGame,
        p_entry_fee: fee,
        p_max_players: maxPlayers,
      });

      const { data, error } = await supabase.rpc('create_mini_battle', {
        p_user_id: user.id,
        p_game_type: selectedGame,
        p_entry_fee: fee,
        p_max_players: maxPlayers,
      });

      console.log('📡 ========================================');
      console.log('📡 RPC RESPONSE RECEIVED');
      console.log('📡 ========================================');
      console.log('📡 Data:', JSON.stringify(data, null, 2));
      console.log('📡 Error:', JSON.stringify(error, null, 2));

      if (error) {
        console.error('❌ ========================================');
        console.error('❌ RPC ERROR');
        console.error('❌ ========================================');
        console.error('❌ Error object:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        throw error;
      }

      if (!data) {
        console.error('❌ ========================================');
        console.error('❌ NO DATA RETURNED');
        console.error('❌ ========================================');
        Alert.alert('Error', 'Failed to create mini battle. No response from server.');
        return;
      }

      console.log('✅ ========================================');
      console.log('✅ DATA RECEIVED');
      console.log('✅ ========================================');
      console.log('✅ Data type:', typeof data);
      console.log('✅ Data success:', data.success);
      console.log('✅ Data message:', data.message);
      console.log('✅ Data mini_battle_id:', data.mini_battle_id);

      if (!data.success) {
        console.error('❌ ========================================');
        console.error('❌ RPC RETURNED FAILURE');
        console.error('❌ ========================================');
        console.error('❌ Message:', data.message);
        Alert.alert('Error', data.message || 'Failed to create mini battle');
        return;
      }

      console.log('✅ ========================================');
      console.log('✅ MINI BATTLE CREATED SUCCESSFULLY!');
      console.log('✅ ========================================');
      console.log('✅ Mini battle ID:', data.mini_battle_id);
      
      setShowConfirmModal(false);
      Alert.alert('Success! 🎉', 'Mini battle created! Waiting for players to join.');
      
      // Reload data to show the new mini battle
      await loadData();
      
      console.log('🎮 ========================================');
      console.log('🎮 CREATE MINI BATTLE - SUCCESS - END');
      console.log('🎮 ========================================');
    } catch (error: any) {
      console.error('❌ ========================================');
      console.error('❌ EXCEPTION CAUGHT');
      console.error('❌ ========================================');
      console.error('❌ Error:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error details:', error?.details);
      console.error('❌ Error hint:', error?.hint);
      console.error('❌ Error stack:', error?.stack);
      
      Alert.alert('Error', `Failed to create mini battle: ${error?.message || 'Unknown error'}. Please try again.`);
      
      console.log('🎮 ========================================');
      console.log('🎮 CREATE MINI BATTLE - FAILED - END');
      console.log('🎮 ========================================');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMiniBattle = async (miniBattleId: string) => {
    if (!user?.id) {
      console.log('⚠️ No user ID');
      return;
    }

    try {
      console.log('🎮 Joining mini battle:', miniBattleId);

      const { data, error } = await supabase.rpc('join_mini_battle', {
        p_mini_battle_id: miniBattleId,
        p_user_id: user.id,
      });

      if (error) throw error;
      if (!data.success) {
        Alert.alert('Cannot Join', data.message);
        return;
      }

      Alert.alert('Success', 'You have joined the mini battle! Good luck!');
      await loadData();

      const miniBattle = miniBattles.find((mb) => mb.id === miniBattleId);
      if (miniBattle) {
        router.push(`/mini-battle-game/${miniBattle.game_type}?miniBattleId=${miniBattleId}` as any);
      }
    } catch (error) {
      console.error('❌ Failed to join mini battle:', error);
      Alert.alert('Error', 'Failed to join mini battle. Please try again.');
    }
  };

  const handlePlayMiniBattle = (miniBattle: MiniBattle) => {
    router.push(`/mini-battle-game/${miniBattle.game_type}?miniBattleId=${miniBattle.id}` as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const myBattles = miniBattles.filter((mb) => mb.creator_id === user?.id);
  const availableBattles = miniBattles.filter((mb) => mb.creator_id !== user?.id && mb.status === 'waiting');
  const totalBalance = tournamentsBalance + commissionBalance;
  const fee = parseFloat(entryFee) || 0;
  const prizePool = fee * maxPlayers;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name={ICONS.BACK} size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>⚔️ MXI Mini Battles</Text>
            <Text style={styles.subtitle}>Quick battles for 2 or 4 players!</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>💰 Available Balance for Games</Text>
          <Text style={styles.balanceAmount}>{totalBalance.toFixed(2)} MXI</Text>
          <Text style={styles.balanceNote}>
            Challenge Winnings: {tournamentsBalance.toFixed(2)} MXI • Commission: {commissionBalance.toFixed(2)} MXI
          </Text>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleOpenCreateModal}>
          <IconSymbol name={ICONS.ADD_CIRCLE} size={24} color={colors.light} />
          <Text style={styles.createButtonText}>Create Mini Battle</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>📋 My Mini Battles</Text>
        {myBattles.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name={ICONS.INFO} size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>You haven&apos;t created any mini battles yet.</Text>
          </View>
        ) : (
          myBattles.map((miniBattle) => (
            <View key={miniBattle.id} style={styles.battleCard}>
              <View style={styles.battleHeader}>
                <Text style={styles.battleTitle}>
                  {MINI_BATTLE_GAME_NAMES[miniBattle.game_type as keyof typeof MINI_BATTLE_GAME_NAMES]}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>
                    {miniBattle.status === 'waiting' ? 'Waiting' : 'In Progress'}
                  </Text>
                </View>
              </View>

              <View style={styles.battleInfo}>
                <View style={styles.battleInfoRow}>
                  <Text style={styles.battleInfoLabel}>Players</Text>
                  <Text style={styles.battleInfoValue}>
                    {miniBattle.current_players}/{miniBattle.max_players}
                  </Text>
                </View>
                <View style={styles.battleInfoRow}>
                  <Text style={styles.battleInfoLabel}>Entry Fee</Text>
                  <Text style={styles.battleInfoValue}>{miniBattle.entry_fee} MXI</Text>
                </View>
                <View style={styles.battleInfoRow}>
                  <Text style={styles.battleInfoLabel}>Prize Pool</Text>
                  <Text style={styles.battleInfoValue}>{miniBattle.prize_pool} MXI</Text>
                </View>
              </View>

              <View style={styles.battleButtons}>
                {miniBattle.current_players >= miniBattle.max_players && (
                  <TouchableOpacity
                    style={[styles.battleButton, styles.battleButtonSecondary]}
                    onPress={() => handlePlayMiniBattle(miniBattle)}
                  >
                    <Text style={styles.battleButtonText}>Play</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>🎮 Available Mini Battles</Text>
        {availableBattles.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name={ICONS.INFO} size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No available mini battles at the moment.</Text>
          </View>
        ) : (
          availableBattles.map((miniBattle) => (
            <View key={miniBattle.id} style={styles.battleCard}>
              <View style={styles.battleHeader}>
                <Text style={styles.battleTitle}>
                  {MINI_BATTLE_GAME_NAMES[miniBattle.game_type as keyof typeof MINI_BATTLE_GAME_NAMES]}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Open</Text>
                </View>
              </View>

              <View style={styles.battleInfo}>
                <View style={styles.battleInfoRow}>
                  <Text style={styles.battleInfoLabel}>Players</Text>
                  <Text style={styles.battleInfoValue}>
                    {miniBattle.current_players}/{miniBattle.max_players}
                  </Text>
                </View>
                <View style={styles.battleInfoRow}>
                  <Text style={styles.battleInfoLabel}>Entry Fee</Text>
                  <Text style={styles.battleInfoValue}>{miniBattle.entry_fee} MXI</Text>
                </View>
                <View style={styles.battleInfoRow}>
                  <Text style={styles.battleInfoLabel}>Prize Pool</Text>
                  <Text style={styles.battleInfoValue}>{miniBattle.prize_pool} MXI</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.battleButton}
                onPress={() => handleJoinMiniBattle(miniBattle.id)}
                disabled={miniBattle.current_players >= miniBattle.max_players}
              >
                <Text style={styles.battleButtonText}>
                  {miniBattle.current_players >= miniBattle.max_players ? 'Full' : 'Join Battle'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* CREATE MODAL */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🎮 Create Mini Battle</Text>
              <Text style={styles.modalSubtitle}>
                Set up your battle and wait for players to join!
              </Text>

              <View style={styles.gameSelector}>
                <Text style={styles.inputLabel}>Select Game</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {Object.entries(MINI_BATTLE_GAME_NAMES).map(([key, name]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.gameOption,
                        selectedGame === key && styles.gameOptionSelected,
                      ]}
                      onPress={() => {
                        console.log('🎮 Game selected:', key);
                        setSelectedGame(key);
                      }}
                    >
                      <Text style={styles.gameOptionTitle}>{name}</Text>
                      <Text style={styles.gameOptionDescription}>
                        {MINI_BATTLE_GAME_DESCRIPTIONS[key as keyof typeof MINI_BATTLE_GAME_DESCRIPTIONS]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.participantSelector}>
                <Text style={styles.inputLabel}>Number of Players (including you)</Text>
                <View style={styles.participantOptions}>
                  {participantOptions.map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.participantOption,
                        maxPlayers === num && styles.participantOptionSelected,
                      ]}
                      onPress={() => {
                        console.log('👥 Max players selected:', num);
                        setMaxPlayers(num);
                      }}
                    >
                      <Text style={styles.participantOptionText}>{num}</Text>
                      <Text style={styles.participantOptionLabel}>players</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.inputLabel}>Entry Fee (MXI)</Text>
              <TextInput
                style={styles.input}
                value={entryFee}
                onChangeText={(text) => {
                  console.log('💰 Entry fee changed:', text);
                  setEntryFee(text);
                }}
                keyboardType="numeric"
                placeholder={`${MINI_BATTLE_MIN_ENTRY} - ${MINI_BATTLE_MAX_ENTRY}`}
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    console.log('❌ Create modal cancelled');
                    setShowCreateModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleProceedToConfirmation}
                >
                  <Text style={styles.modalButtonText}>Next →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isCreating && setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Confirm Creation</Text>
            <Text style={styles.modalSubtitle}>
              Please review your mini battle details before creating
            </Text>

            <View style={styles.confirmationSection}>
              <Text style={styles.confirmationTitle}>📋 Battle Details</Text>
              
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Game:</Text>
                <Text style={styles.confirmationValue}>
                  {MINI_BATTLE_GAME_NAMES[selectedGame as keyof typeof MINI_BATTLE_GAME_NAMES]}
                </Text>
              </View>

              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Players:</Text>
                <Text style={styles.confirmationValue}>{maxPlayers} players</Text>
              </View>

              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Entry Fee:</Text>
                <Text style={styles.confirmationValue}>{fee.toFixed(2)} MXI</Text>
              </View>

              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Prize Pool:</Text>
                <Text style={styles.confirmationValue}>{prizePool.toFixed(2)} MXI</Text>
              </View>

              <View style={styles.confirmationDivider} />

              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Your Balance:</Text>
                <Text style={styles.confirmationValue}>{totalBalance.toFixed(2)} MXI</Text>
              </View>

              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>After Creation:</Text>
                <Text style={styles.confirmationValue}>{(totalBalance - fee).toFixed(2)} MXI</Text>
              </View>

              <Text style={styles.warningText}>
                ⚠️ The entry fee will be deducted immediately from your Challenge Winnings and/or Commission Balance
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  console.log('⬅️ Back to create modal');
                  setShowConfirmModal(false);
                  setShowCreateModal(true);
                }}
                disabled={isCreating}
              >
                <Text style={styles.modalButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color={colors.light} />
                ) : (
                  <Text style={styles.modalButtonText}>✓ Create Battle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
