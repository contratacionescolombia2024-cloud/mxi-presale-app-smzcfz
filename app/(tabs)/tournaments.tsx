
import React, { useState, useEffect, useCallback, Fragment } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import {
  Tournament,
  MiniBattle,
  GAME_NAMES,
  GAME_DESCRIPTIONS,
  VIRAL_ZONE_GAME_NAMES,
  VIRAL_ZONE_GAME_DESCRIPTIONS,
  MINI_BATTLE_GAME_NAMES,
  MINI_BATTLE_GAME_DESCRIPTIONS,
  MAX_ACTIVE_TOURNAMENTS,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.3)',
  },
  balanceBreakdownItem: {
    flex: 1,
  },
  balanceBreakdownLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceBreakdownValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  refreshButtonText: {
    color: colors.light,
    fontSize: 14,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTournaments: {
    backgroundColor: colors.primary,
  },
  categoryViralZone: {
    backgroundColor: colors.secondary,
  },
  categoryMiniBattles: {
    backgroundColor: colors.accent,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  categoryDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  gameIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  playButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  playButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTournamentsBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTournamentsBadgeText: {
    color: colors.light,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitCard: {
    backgroundColor: colors.sectionPurple,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  limitText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  limitProgress: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  limitBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  limitBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  limitCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
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
  createButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  createButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  miniBattlesList: {
    marginTop: 16,
    gap: 12,
  },
  miniBattleCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  miniBattleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  miniBattleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    color: colors.light,
    fontSize: 11,
    fontWeight: 'bold',
  },
  miniBattleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  miniBattleInfoItem: {
    alignItems: 'center',
  },
  miniBattleInfoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  miniBattleInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  miniBattleButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  miniBattleButtonText: {
    color: colors.light,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  balanceSourceSelector: {
    marginBottom: 20,
  },
  balanceSourceOptions: {
    gap: 12,
  },
  balanceSourceOption: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  balanceSourceOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.sectionBlue,
  },
  balanceSourceOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceSourceOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceSourceOptionBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  balanceSourceOptionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  balanceLoadingIndicator: {
    marginLeft: 8,
  },
});

export default function TournamentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [tournamentsBalance, setTournamentsBalance] = useState(0);
  const [commissionBalance, setCommissionBalance] = useState(0);
  const [activeTournaments, setActiveTournaments] = useState<Record<string, number>>({});
  const [activeMiniBattles, setActiveMiniBattles] = useState<Record<string, number>>({});
  const [totalActiveTournaments, setTotalActiveTournaments] = useState(0);
  const [totalActiveMiniBattles, setTotalActiveMiniBattles] = useState(0);
  const [maxActiveTournaments, setMaxActiveTournaments] = useState(MAX_ACTIVE_TOURNAMENTS);
  const [miniBattles, setMiniBattles] = useState<MiniBattle[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('beat_bounce');
  const [entryFee, setEntryFee] = useState('50');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [balanceSource, setBalanceSource] = useState<'tournaments' | 'commissions'>('tournaments');
  const [isCreating, setIsCreating] = useState(false);

  const participantOptions = [2, 4];

  const loadBalances = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping balance load');
      return;
    }

    setIsLoadingBalances(true);
    try {
      console.log('💰 Loading balances for user:', user.id);

      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('tournaments_balance, commission_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vestingError) {
        console.error('❌ Error loading balances:', vestingError);
        Alert.alert('Error', 'Failed to load balances. Please try again.');
      } else {
        const tournamentsBalanceValue = vestingData?.tournaments_balance || 0;
        const commissionBalanceValue = vestingData?.commission_balance || 0;
        
        console.log('💰 Balances loaded:', {
          tournaments: tournamentsBalanceValue,
          commission: commissionBalanceValue,
          total: tournamentsBalanceValue + commissionBalanceValue,
        });
        
        setTournamentsBalance(tournamentsBalanceValue);
        setCommissionBalance(commissionBalanceValue);
      }
    } catch (error) {
      console.error('❌ Failed to load balances:', error);
      Alert.alert('Error', 'Failed to load balances. Please try again.');
    } finally {
      setIsLoadingBalances(false);
    }
  }, [user?.id]);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping tournaments data load');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading tournaments data for user:', user.id);

      await loadBalances();

      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('game_type, current_players')
        .eq('status', 'waiting');

      if (tournamentsError) {
        console.error('❌ Error loading tournaments:', tournamentsError);
      } else {
        const counts: Record<string, number> = {};
        let total = 0;
        tournaments?.forEach((t) => {
          counts[t.game_type] = (counts[t.game_type] || 0) + 1;
          total++;
        });
        setActiveTournaments(counts);
        setTotalActiveTournaments(total);
      }

      const { data: miniBattlesData, error: miniBattlesError } = await supabase
        .from('mini_battles')
        .select('*')
        .in('status', ['waiting', 'in_progress'])
        .order('created_at', { ascending: false });

      if (miniBattlesError) {
        console.error('❌ Error loading mini battles:', miniBattlesError);
      } else {
        const counts: Record<string, number> = {};
        let total = 0;
        miniBattlesData?.forEach((mb) => {
          if (mb.status === 'waiting') {
            counts[mb.game_type] = (counts[mb.game_type] || 0) + 1;
            total++;
          }
        });
        setActiveMiniBattles(counts);
        setTotalActiveMiniBattles(total);
        setMiniBattles(miniBattlesData || []);
      }

      const { data: gameSettings, error: settingsError } = await supabase
        .from('game_settings')
        .select('max_active_tournaments')
        .limit(1)
        .maybeSingle();

      if (!settingsError && gameSettings) {
        setMaxActiveTournaments(gameSettings.max_active_tournaments);
      }

      console.log('✅ Tournaments data loaded');
    } catch (error) {
      console.error('❌ Failed to load tournaments data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadBalances]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRefreshBalances = async () => {
    await loadBalances();
  };

  const handlePlayGame = (gameType: string) => {
    console.log('🎮 Starting game:', gameType);
    router.push(`/games/${gameType}` as any);
  };

  const handleOpenCreateModal = (gameType: string) => {
    console.log('🎮 Opening create modal for game:', gameType);
    setSelectedGame(gameType);
    setBalanceSource('tournaments'); // Reset to default
    setShowCreateModal(true);
  };

  const handleProceedToConfirmation = () => {
    console.log('🎮 Proceeding to confirmation');
    
    const fee = parseFloat(entryFee);
    const selectedBalance = balanceSource === 'tournaments' ? tournamentsBalance : commissionBalance;
    
    console.log('💰 Entry fee:', fee);
    console.log('💰 Selected balance source:', balanceSource);
    console.log('💰 Available in selected source:', selectedBalance);
    console.log('👥 Max players:', maxPlayers);
    console.log('🎮 Game type:', selectedGame);

    if (isNaN(fee) || fee < MINI_BATTLE_MIN_ENTRY || fee > MINI_BATTLE_MAX_ENTRY) {
      console.error('❌ Invalid entry fee:', fee);
      Alert.alert('Invalid Entry Fee', `Entry fee must be between ${MINI_BATTLE_MIN_ENTRY} and ${MINI_BATTLE_MAX_ENTRY} MXI`);
      return;
    }

    if (selectedBalance < fee) {
      console.error('❌ Insufficient balance in selected source:', selectedBalance, '<', fee);
      Alert.alert(
        'Insufficient Balance', 
        `You do not have enough balance in ${balanceSource === 'tournaments' ? 'Tournament Winnings' : 'Referral Commissions'}.\n\nRequired: ${fee} MXI\nAvailable: ${selectedBalance.toFixed(2)} MXI\n\nPlease select a different balance source or add funds.`
      );
      return;
    }

    console.log('✅ Validation passed, showing confirmation modal');
    setShowCreateModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    console.log('🎮 Creating mini battle - confirmed');
    
    if (!user?.id) {
      console.error('❌ No user ID');
      Alert.alert('Error', 'You must be logged in to create a mini battle.');
      return;
    }

    const fee = parseFloat(entryFee);
    const selectedBalance = balanceSource === 'tournaments' ? tournamentsBalance : commissionBalance;
    
    console.log('💰 Entry fee:', fee);
    console.log('💰 Balance source:', balanceSource);
    console.log('💰 Available in selected source:', selectedBalance);
    console.log('👥 Max players:', maxPlayers);
    console.log('🎮 Game type:', selectedGame);
    console.log('👤 User ID:', user.id);

    if (!selectedGame) {
      console.error('❌ No game type selected');
      Alert.alert('Error', 'Please select a game type.');
      return;
    }

    if (isNaN(fee) || fee <= 0) {
      console.error('❌ Invalid entry fee', fee);
      Alert.alert('Error', 'Invalid entry fee. Please enter a valid number.');
      return;
    }

    if (maxPlayers !== 2 && maxPlayers !== 4) {
      console.error('❌ Invalid max players', maxPlayers);
      Alert.alert('Error', 'Max players must be 2 or 4.');
      return;
    }

    if (selectedBalance < fee) {
      console.error('❌ Insufficient balance', { selectedBalance, fee });
      Alert.alert('Insufficient Balance', `You need ${fee} MXI but only have ${selectedBalance.toFixed(2)} MXI in ${balanceSource === 'tournaments' ? 'Tournament Winnings' : 'Referral Commissions'} balance.`);
      return;
    }

    setIsCreating(true);

    try {
      console.log('📡 Calling RPC: create_mini_battle');
      console.log('📡 Parameters:', {
        p_user_id: user.id,
        p_game_type: selectedGame,
        p_entry_fee: fee,
        p_max_players: maxPlayers,
        p_balance_source: balanceSource,
      });

      const { data, error } = await supabase.rpc('create_mini_battle', {
        p_user_id: user.id,
        p_game_type: selectedGame,
        p_entry_fee: fee,
        p_max_players: maxPlayers,
        p_balance_source: balanceSource,
      });

      console.log('📡 RPC response:', { data, error });

      if (error) {
        console.error('❌ RPC error:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ No data returned');
        Alert.alert('Error', 'Failed to create mini battle. No response from server.');
        return;
      }

      if (!data.success) {
        console.error('❌ RPC returned failure:', data.message);
        Alert.alert('Error', data.message || 'Failed to create mini battle');
        return;
      }

      console.log('✅ Mini battle created successfully:', data.mini_battle_id);
      
      setShowConfirmModal(false);
      Alert.alert('Success! 🎉', 'Mini battle created! Waiting for players to join.');
      
      await loadData();
    } catch (error: any) {
      console.error('❌ Exception caught:', error);
      Alert.alert('Error', `Failed to create mini battle: ${error?.message || 'Unknown error'}. Please try again.`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMiniBattle = async (miniBattleId: string) => {
    if (!user?.id) {
      console.log('⚠️ No user ID');
      return;
    }

    // Show balance selection modal before joining
    Alert.alert(
      'Select Balance Source',
      'Choose which balance to use for the entry fee:',
      [
        {
          text: `Tournament Winnings (${tournamentsBalance.toFixed(2)} MXI)`,
          onPress: () => performJoinMiniBattle(miniBattleId, 'tournaments'),
        },
        {
          text: `Referral Commissions (${commissionBalance.toFixed(2)} MXI)`,
          onPress: () => performJoinMiniBattle(miniBattleId, 'commissions'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const performJoinMiniBattle = async (miniBattleId: string, source: 'tournaments' | 'commissions') => {
    try {
      console.log('🎮 Joining mini battle:', miniBattleId, 'with balance source:', source);

      const { data, error } = await supabase.rpc('join_mini_battle', {
        p_mini_battle_id: miniBattleId,
        p_user_id: user!.id,
        p_balance_source: source,
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

  const standardGames = [
    { type: 'reaction_test', icon: 'flash-on' },
    { type: 'jump_time', icon: 'fitness-center' },
    { type: 'slide_puzzle', icon: 'extension' },
    { type: 'memory_speed', icon: 'psychology' },
    { type: 'snake_retro', icon: 'videogame-asset' },
  ];

  const viralZoneGames = [
    { type: 'catch_it', icon: 'sports-baseball' },
    { type: 'shuriken_aim', icon: 'gps-fixed' },
    { type: 'number_tracker', icon: 'filter-9-plus' },
  ];

  const miniBattleGames = [
    { type: 'beat_bounce', icon: 'music-note', emoji: '🔊' },
    { type: 'perfect_distance', icon: 'straighten', emoji: '📏' },
    { type: 'swipe_master', icon: 'swipe', emoji: '🔥' },
    { type: 'quick_draw_duel', icon: 'flash-on', emoji: '🔫' },
    { type: 'tap_rush', icon: 'touch-app', emoji: '⚡' },
    { type: 'rhythm_tap', icon: 'music-note', emoji: '🎵' },
    { type: 'mental_math_speed', icon: 'calculate', emoji: '🧮' },
    { type: 'danger_path', icon: 'explore', emoji: '🎯' },
    { type: 'mxi_climber', icon: 'terrain', emoji: '⛰️' },
  ];

  const limitPercentage = (totalActiveTournaments / maxActiveTournaments) * 100;
  const miniBattleLimitPercentage = (totalActiveMiniBattles / maxActiveTournaments) * 100;
  const totalBalance = tournamentsBalance + commissionBalance;
  const fee = parseFloat(entryFee) || 0;
  const prizePool = fee * maxPlayers;
  const selectedBalance = balanceSource === 'tournaments' ? tournamentsBalance : commissionBalance;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Tournaments & Battles</Text>
          <Text style={styles.subtitle}>Compete and win MXI prizes!</Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.balanceLabel}>💰 Total Available Balance</Text>
            {isLoadingBalances && (
              <ActivityIndicator size="small" color={colors.accent} style={styles.balanceLoadingIndicator} />
            )}
          </View>
          <Text style={styles.balanceAmount}>{totalBalance.toFixed(2)} MXI</Text>
          
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceBreakdownItem}>
              <Text style={styles.balanceBreakdownLabel}>🏆 Tournament Winnings</Text>
              <Text style={styles.balanceBreakdownValue}>{tournamentsBalance.toFixed(2)}</Text>
            </View>
            <View style={styles.balanceBreakdownItem}>
              <Text style={styles.balanceBreakdownLabel}>💼 Referral Commissions</Text>
              <Text style={styles.balanceBreakdownValue}>{commissionBalance.toFixed(2)}</Text>
            </View>
          </View>
          
          <Text style={styles.balanceNote}>
            💡 Both balances can be used to join games and tournaments
          </Text>
          
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefreshBalances}
            disabled={isLoadingBalances}
          >
            <IconSymbol name="refresh" size={16} color={colors.light} />
            <Text style={styles.refreshButtonText}>
              {isLoadingBalances ? 'Refreshing...' : 'Refresh Balances'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.limitCard}>
          <Text style={styles.limitTitle}>📊 Active Tournaments</Text>
          <Text style={styles.limitText}>
            Maximum {maxActiveTournaments} tournaments can be active per game type. Current total across all games.
          </Text>
          <View style={styles.limitProgress}>
            <View style={styles.limitBar}>
              <View style={[styles.limitBarFill, { width: `${limitPercentage}%` }]} />
            </View>
            <Text style={styles.limitCount}>
              {totalActiveTournaments} Active
            </Text>
          </View>
        </View>

        {/* Standard Tournaments Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, styles.categoryTournaments]}>
              <IconSymbol name="emoji-events" size={28} color={colors.light} />
            </View>
            <Text style={styles.categoryTitle}>Standard Tournaments</Text>
          </View>
          <Text style={styles.categoryDescription}>
            Entry: 3 MXI • Players: 25-50 • Prize: 135 MXI • Distribution: 50% / 25% / 15% (10% to prize fund)
          </Text>
          <View style={styles.gamesGrid}>
            {standardGames.map((game, index) => {
              const gameType = game.type as keyof typeof GAME_NAMES;
              const activeTournamentCount = activeTournaments[game.type] || 0;

              return (
                <View key={index} style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <View style={styles.gameIcon}>
                      <IconSymbol name={game.icon} size={28} color={colors.light} />
                    </View>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{GAME_NAMES[gameType]}</Text>
                      <Text style={styles.gameDescription}>{GAME_DESCRIPTIONS[gameType]}</Text>
                    </View>
                    {activeTournamentCount > 0 && (
                      <View style={styles.activeTournamentsBadge}>
                        <Text style={styles.activeTournamentsBadgeText}>{activeTournamentCount} Active</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.gameStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Entry Fee</Text>
                      <Text style={styles.statValue}>3 MXI</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Prize Pool</Text>
                      <Text style={styles.statValue}>135 MXI</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Players</Text>
                      <Text style={styles.statValue}>25/50</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.playButton} onPress={() => handlePlayGame(game.type)}>
                    <IconSymbol name={ICONS.PLAY} size={20} color={colors.light} />
                    <Text style={styles.playButtonText}>Play Now</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* MXI Viral Zone Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, styles.categoryViralZone]}>
              <IconSymbol name="whatshot" size={28} color={colors.light} />
            </View>
            <Text style={styles.categoryTitle}>MXI Viral Zone</Text>
          </View>
          <Text style={styles.categoryDescription}>
            Entry: 1 MXI • Players: 100 • Prize: 100 MXI • Distribution: 50% / 25% / 15% (10% to prize fund)
          </Text>
          <View style={styles.gamesGrid}>
            {viralZoneGames.map((game, index) => {
              const gameType = game.type as keyof typeof VIRAL_ZONE_GAME_NAMES;
              const activeTournamentCount = activeTournaments[game.type] || 0;

              return (
                <View key={index} style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <View style={[styles.gameIcon, { backgroundColor: colors.secondary }]}>
                      <IconSymbol name={game.icon} size={28} color={colors.light} />
                    </View>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{VIRAL_ZONE_GAME_NAMES[gameType]}</Text>
                      <Text style={styles.gameDescription}>{VIRAL_ZONE_GAME_DESCRIPTIONS[gameType]}</Text>
                    </View>
                    {activeTournamentCount > 0 && (
                      <View style={styles.activeTournamentsBadge}>
                        <Text style={styles.activeTournamentsBadgeText}>{activeTournamentCount} Active</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.gameStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Entry Fee</Text>
                      <Text style={styles.statValue}>1 MXI</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Prize Pool</Text>
                      <Text style={styles.statValue}>100 MXI</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Players</Text>
                      <Text style={styles.statValue}>100</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.playButton, { backgroundColor: colors.secondary }]} onPress={() => handlePlayGame(game.type)}>
                    <IconSymbol name={ICONS.PLAY} size={20} color={colors.light} />
                    <Text style={styles.playButtonText}>Play Now</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* MXI Mini Battles Section */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, styles.categoryMiniBattles]}>
              <IconSymbol name="sports-esports" size={28} color={colors.light} />
            </View>
            <Text style={styles.categoryTitle}>⚔️ MXI Mini Battles</Text>
          </View>
          <Text style={styles.categoryDescription}>
            Entry: 5-1000 MXI • Players: 2 or 4 • Winner Takes All • Create custom battles with friends!
          </Text>
          
          <View style={styles.limitCard}>
            <Text style={styles.limitTitle}>📊 Active Mini Battles</Text>
            <Text style={styles.limitText}>
              Maximum {maxActiveTournaments} battles can be active per game type.
            </Text>
            <View style={styles.limitProgress}>
              <View style={styles.limitBar}>
                <View style={[styles.limitBarFill, { width: `${miniBattleLimitPercentage}%` }]} />
              </View>
              <Text style={styles.limitCount}>
                {totalActiveMiniBattles} Active
              </Text>
            </View>
          </View>

          <View style={styles.gamesGrid}>
            {miniBattleGames.map((game, index) => {
              const gameType = game.type as keyof typeof MINI_BATTLE_GAME_NAMES;
              const activeMiniBattleCount = activeMiniBattles[game.type] || 0;
              const gameBattles = miniBattles.filter((mb) => mb.game_type === game.type);

              return (
                <View key={index} style={styles.gameCard}>
                  <View style={styles.gameHeader}>
                    <View style={[styles.gameIcon, { backgroundColor: colors.accent }]}>
                      <Text style={{ fontSize: 28 }}>{game.emoji}</Text>
                    </View>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{MINI_BATTLE_GAME_NAMES[gameType]}</Text>
                      <Text style={styles.gameDescription}>{MINI_BATTLE_GAME_DESCRIPTIONS[gameType]}</Text>
                    </View>
                    {activeMiniBattleCount > 0 && (
                      <View style={styles.activeTournamentsBadge}>
                        <Text style={styles.activeTournamentsBadgeText}>{activeMiniBattleCount} Active</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.gameStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Entry Fee</Text>
                      <Text style={styles.statValue}>5-1000 MXI</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Players</Text>
                      <Text style={styles.statValue}>2 or 4</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Winner</Text>
                      <Text style={styles.statValue}>Takes All</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={[styles.createButton]} onPress={() => handleOpenCreateModal(game.type)}>
                    <IconSymbol name={ICONS.ADD_CIRCLE} size={20} color={colors.light} />
                    <Text style={styles.createButtonText}>Create Battle</Text>
                  </TouchableOpacity>

                  {gameBattles.length > 0 && (
                    <View style={styles.miniBattlesList}>
                      {gameBattles.map((miniBattle) => {
                        const isMyBattle = miniBattle.creator_id === user?.id;
                        const canJoin = !isMyBattle && miniBattle.status === 'waiting' && miniBattle.current_players < miniBattle.max_players;
                        const canPlay = isMyBattle && miniBattle.current_players >= miniBattle.max_players;

                        return (
                          <View key={miniBattle.id} style={styles.miniBattleCard}>
                            <View style={styles.miniBattleHeader}>
                              <Text style={styles.miniBattleTitle}>
                                {isMyBattle ? '👤 Your Battle' : '🎮 Available'}
                              </Text>
                              <View style={styles.statusBadge}>
                                <Text style={styles.statusBadgeText}>
                                  {miniBattle.status === 'waiting' ? 'Waiting' : 'In Progress'}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.miniBattleInfo}>
                              <View style={styles.miniBattleInfoItem}>
                                <Text style={styles.miniBattleInfoLabel}>Players</Text>
                                <Text style={styles.miniBattleInfoValue}>
                                  {miniBattle.current_players}/{miniBattle.max_players}
                                </Text>
                              </View>
                              <View style={styles.miniBattleInfoItem}>
                                <Text style={styles.miniBattleInfoLabel}>Entry</Text>
                                <Text style={styles.miniBattleInfoValue}>{miniBattle.entry_fee} MXI</Text>
                              </View>
                              <View style={styles.miniBattleInfoItem}>
                                <Text style={styles.miniBattleInfoLabel}>Prize</Text>
                                <Text style={styles.miniBattleInfoValue}>{miniBattle.prize_pool} MXI</Text>
                              </View>
                            </View>

                            {canJoin && (
                              <TouchableOpacity
                                style={styles.miniBattleButton}
                                onPress={() => handleJoinMiniBattle(miniBattle.id)}
                              >
                                <Text style={styles.miniBattleButtonText}>Join Battle</Text>
                              </TouchableOpacity>
                            )}

                            {canPlay && (
                              <TouchableOpacity
                                style={[styles.miniBattleButton, { backgroundColor: colors.success }]}
                                onPress={() => handlePlayMiniBattle(miniBattle)}
                              >
                                <Text style={styles.miniBattleButtonText}>Play Now</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
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
                {MINI_BATTLE_GAME_NAMES[selectedGame as keyof typeof MINI_BATTLE_GAME_NAMES]}
              </Text>

              <View style={styles.balanceSourceSelector}>
                <Text style={styles.inputLabel}>💰 Select Balance Source</Text>
                <View style={styles.balanceSourceOptions}>
                  <TouchableOpacity
                    style={[
                      styles.balanceSourceOption,
                      balanceSource === 'tournaments' && styles.balanceSourceOptionSelected,
                    ]}
                    onPress={() => setBalanceSource('tournaments')}
                  >
                    <View style={styles.balanceSourceOptionHeader}>
                      <Text style={styles.balanceSourceOptionTitle}>🏆 Tournament Winnings</Text>
                      <Text style={styles.balanceSourceOptionBalance}>{tournamentsBalance.toFixed(2)} MXI</Text>
                    </View>
                    <Text style={styles.balanceSourceOptionDescription}>
                      Use your tournament winnings and challenge rewards
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.balanceSourceOption,
                      balanceSource === 'commissions' && styles.balanceSourceOptionSelected,
                    ]}
                    onPress={() => setBalanceSource('commissions')}
                  >
                    <View style={styles.balanceSourceOptionHeader}>
                      <Text style={styles.balanceSourceOptionTitle}>💼 Referral Commissions</Text>
                      <Text style={styles.balanceSourceOptionBalance}>{commissionBalance.toFixed(2)} MXI</Text>
                    </View>
                    <Text style={styles.balanceSourceOptionDescription}>
                      Use your referral commissions
                    </Text>
                  </TouchableOpacity>
                </View>
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
                <Text style={styles.confirmationLabel}>Balance Source:</Text>
                <Text style={styles.confirmationValue}>
                  {balanceSource === 'tournaments' ? '🏆 Tournament Winnings' : '💼 Referral Commissions'}
                </Text>
              </View>

              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Current Balance:</Text>
                <Text style={styles.confirmationValue}>{selectedBalance.toFixed(2)} MXI</Text>
              </View>

              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>After Creation:</Text>
                <Text style={styles.confirmationValue}>{(selectedBalance - fee).toFixed(2)} MXI</Text>
              </View>

              <Text style={styles.warningText}>
                ⚠️ The entry fee will be deducted immediately from your selected balance source
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
