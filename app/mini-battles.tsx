
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
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
    marginBottom: 16,
  },
  participantOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  participantOption: {
    flex: 1,
    minWidth: 60,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  participantOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.sectionPurple,
  },
  participantOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  participantOptionLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
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
  const [miniBattles, setMiniBattles] = useState<MiniBattle[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>(preselectedGame || 'beat_bounce');
  const [entryFee, setEntryFee] = useState('50');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isCreating, setIsCreating] = useState(false);

  const participantOptions = [2, 3, 4];

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
        .select('tournaments_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vestingError) {
        console.error('❌ Error loading tournaments balance:', vestingError);
      } else {
        setTournamentsBalance(vestingData?.tournaments_balance || 0);
        console.log('💰 Tournaments balance:', vestingData?.tournaments_balance || 0);
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

  const handleCreateMiniBattle = async () => {
    console.log('🎮 ========================================');
    console.log('🎮 CREATE MINI BATTLE - START');
    console.log('🎮 ========================================');
    
    if (!user?.id) {
      console.error('❌ No user ID');
      Alert.alert('Error', 'You must be logged in to create a mini battle.');
      return;
    }

    const fee = parseFloat(entryFee);
    console.log('💰 Entry fee:', fee);
    console.log('💰 Tournaments balance:', tournamentsBalance);
    console.log('👥 Max players:', maxPlayers);
    console.log('🎮 Game type:', selectedGame);

    if (isNaN(fee) || fee < MINI_BATTLE_MIN_ENTRY || fee > MINI_BATTLE_MAX_ENTRY) {
      console.error('❌ Invalid entry fee:', fee);
      Alert.alert('Invalid Entry Fee', `Entry fee must be between ${MINI_BATTLE_MIN_ENTRY} and ${MINI_BATTLE_MAX_ENTRY} MXI`);
      return;
    }

    if (tournamentsBalance < fee) {
      console.error('❌ Insufficient balance:', tournamentsBalance, '<', fee);
      Alert.alert('Insufficient Balance', 'You do not have enough tournaments balance to create this mini battle.');
      return;
    }

    setIsCreating(true);

    try {
      console.log('📡 Calling create_mini_battle RPC...');
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

      console.log('📡 RPC Response:', { data, error });

      if (error) {
        console.error('❌ RPC Error:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ No data returned from RPC');
        Alert.alert('Error', 'Failed to create mini battle. No response from server.');
        return;
      }

      if (!data.success) {
        console.error('❌ RPC returned failure:', data.message);
        Alert.alert('Error', data.message || 'Failed to create mini battle');
        return;
      }

      console.log('✅ Mini battle created successfully!');
      console.log('✅ Mini battle ID:', data.mini_battle_id);
      
      setShowCreateModal(false);
      Alert.alert('Success! 🎉', 'Mini battle created! Waiting for players to join.');
      await loadData();
      
      console.log('🎮 ========================================');
      console.log('🎮 CREATE MINI BATTLE - SUCCESS');
      console.log('🎮 ========================================');
    } catch (error: any) {
      console.error('❌ Failed to create mini battle:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      Alert.alert('Error', `Failed to create mini battle: ${error.message || 'Unknown error'}. Please try again.`);
      
      console.log('🎮 ========================================');
      console.log('🎮 CREATE MINI BATTLE - FAILED');
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
            <Text style={styles.subtitle}>Quick battles for 2-4 players!</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>💰 Tournaments Balance</Text>
          <Text style={styles.balanceAmount}>{tournamentsBalance.toFixed(2)} MXI</Text>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
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

      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Mini Battle</Text>
            <Text style={styles.modalSubtitle}>
              {MINI_BATTLE_GAME_NAMES[selectedGame as keyof typeof MINI_BATTLE_GAME_NAMES]}
            </Text>

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
                    onPress={() => setMaxPlayers(num)}
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
              onChangeText={setEntryFee}
              keyboardType="numeric"
              placeholder={`${MINI_BATTLE_MIN_ENTRY} - ${MINI_BATTLE_MAX_ENTRY}`}
              placeholderTextColor={colors.textSecondary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCreateMiniBattle}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color={colors.light} />
                ) : (
                  <Text style={styles.modalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
