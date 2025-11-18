
import React, { useState, useEffect, useRef, Fragment } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { Tournament, GAME_NAMES, GAME_DESCRIPTIONS, VIRAL_ZONE_GAME_NAMES, VIRAL_ZONE_GAME_DESCRIPTIONS, MAX_ACTIVE_TOURNAMENTS, PARTICIPANT_OPTIONS, VIRAL_ZONE_MAX_PLAYERS, VIRAL_ZONE_ENTRY_FEE } from '@/types/tournaments';
import ReactionTestGame from '@/components/games/ReactionTestGame';
import JumpTimeGame from '@/components/games/JumpTimeGame';
import SlidePuzzleGame from '@/components/games/SlidePuzzleGame';
import MemorySpeedGame from '@/components/games/MemorySpeedGame';
import SnakeRetroGame from '@/components/games/SnakeRetroGame';
import CatchItGame from '@/components/games/CatchItGame';
import ShurikenAimGame from '@/components/games/ShurikenAimGame';
import NumberTrackerGame from '@/components/games/NumberTrackerGame';
import TournamentLeaderboard from '@/components/TournamentLeaderboard';

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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceCard: {
    backgroundColor: colors.sectionBlue,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    marginVertical: 8,
  },
  balanceTotal: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  tournamentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeWaiting: {
    backgroundColor: colors.success,
  },
  statusBadgeInProgress: {
    backgroundColor: colors.warning,
  },
  statusBadgeText: {
    color: colors.light,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tournamentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: colors.border,
  },
  joinButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  createTournamentButton: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  createTournamentButtonText: {
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
  gameContainer: {
    flex: 1,
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
  participantOption: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  participantOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.sectionBlue,
  },
  participantOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  participantOptionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
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
  limitWarning: {
    backgroundColor: colors.sectionOrange,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  limitWarningText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
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
});

// REMOVED: floor_is_lava and reflex_bomb
const VIRAL_ZONE_GAMES = ['catch_it', 'shuriken_aim', 'number_tracker'];

export default function GameScreen() {
  const { gameType } = useLocalSearchParams<{ gameType: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [isInGame, setIsInGame] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showBalanceSourceModal, setShowBalanceSourceModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<25 | 50>(50);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [balanceSource, setBalanceSource] = useState<'tournaments' | 'commissions'>('tournaments');
  const [tournamentsBalance, setTournamentsBalance] = useState(0);
  const [commissionBalance, setCommissionBalance] = useState(0);
  const [totalActiveTournaments, setTotalActiveTournaments] = useState(0);
  const [maxActiveTournaments, setMaxActiveTournaments] = useState(MAX_ACTIVE_TOURNAMENTS);
  const channelRef = useRef<any>(null);

  const isViralZone = VIRAL_ZONE_GAMES.includes(gameType || '');

  useEffect(() => {
    loadTournaments();
    loadBalances();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [gameType]);

  const setupRealtimeSubscription = async () => {
    if (!gameType) {
      console.log('⚠️ No game type specified');
      return;
    }

    console.log('🔔 Setting up real-time subscription for game:', gameType);

    const channel = supabase.channel(`game:${gameType}:tournaments`, {
      config: { private: true },
    });

    channelRef.current = channel;

    await supabase.realtime.setAuth();

    channel
      .on('broadcast', { event: 'INSERT' }, (payload) => {
        console.log('🔔 Tournament created:', payload);
        loadTournaments();
      })
      .on('broadcast', { event: 'UPDATE' }, (payload) => {
        console.log('🔔 Tournament updated:', payload);
        loadTournaments();
      })
      .subscribe();
  };

  const loadBalances = async () => {
    if (!user?.id) return;

    try {
      console.log('💰 Loading balances for user:', user.id);
      
      const { data, error } = await supabase
        .from('vesting')
        .select('tournaments_balance, commission_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading balances:', error);
      } else {
        const tournamentsBalanceValue = data?.tournaments_balance || 0;
        const commissionBalanceValue = data?.commission_balance || 0;
        
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
    }
  };

  const loadTournaments = async () => {
    if (!gameType) {
      console.log('⚠️ No game type specified');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading tournaments for game:', gameType);

      const { data: allTournaments, error: countError } = await supabase
        .from('tournaments')
        .select('id', { count: 'exact' })
        .eq('status', 'waiting')
        .eq('game_type', gameType);

      if (countError) {
        console.error('❌ Error loading tournament count:', countError);
      } else {
        setTotalActiveTournaments(allTournaments?.length || 0);
      }

      // Load max active tournaments from game settings for this specific game
      const { data: gameSettings, error: settingsError } = await supabase
        .from('game_settings')
        .select('max_active_tournaments')
        .eq('game_type', gameType)
        .maybeSingle();

      if (!settingsError && gameSettings) {
        setMaxActiveTournaments(gameSettings.max_active_tournaments);
      }

      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('game_type', gameType)
        .in('status', ['waiting', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading tournaments:', error);
        throw error;
      }

      console.log('✅ Tournaments loaded:', data?.length || 0);
      setTournaments(data || []);
    } catch (error) {
      console.error('❌ Failed to load tournaments:', error);
      Alert.alert('Error', 'Failed to load tournaments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTournamentPress = () => {
    if (totalActiveTournaments >= maxActiveTournaments) {
      Alert.alert(
        'Tournament Limit Reached',
        `Maximum of ${maxActiveTournaments} active tournaments allowed for this game. Please wait for some tournaments to complete.`
      );
      return;
    }
    
    if (isViralZone) {
      handleCreateTournament(VIRAL_ZONE_MAX_PLAYERS);
    } else {
      setShowParticipantModal(true);
    }
  };

  const handleCreateTournament = async (maxPlayers: number = selectedParticipants) => {
    if (!user?.id || !gameType) {
      console.log('⚠️ Missing user or game type');
      return;
    }

    setShowParticipantModal(false);

    const entryFee = isViralZone ? VIRAL_ZONE_ENTRY_FEE : 3;
    const prizePool = isViralZone ? maxPlayers * entryFee : 135;

    try {
      console.log('🎮 Creating tournament for game:', gameType, 'with', maxPlayers, 'max players');

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          game_type: gameType,
          entry_fee: entryFee,
          prize_pool: prizePool,
          max_players: maxPlayers,
          current_players: 0,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating tournament:', error);
        throw error;
      }

      console.log('✅ Tournament created:', data);
      Alert.alert('Success', 'Tournament created! Join now to start playing.');
      await loadTournaments();
    } catch (error) {
      console.error('❌ Failed to create tournament:', error);
      Alert.alert('Error', 'Failed to create tournament. Please try again.');
    }
  };

  const handleJoinTournamentPress = (tournamentId: string) => {
    setSelectedTournamentId(tournamentId);
    setBalanceSource('tournaments'); // Reset to default
    setShowBalanceSourceModal(true);
  };

  const handleJoinTournament = async () => {
    if (!user?.id || !selectedTournamentId) {
      console.log('⚠️ No user ID or tournament ID');
      return;
    }

    setShowBalanceSourceModal(false);

    try {
      console.log('🎮 Joining tournament:', selectedTournamentId, 'with balance source:', balanceSource);

      const { data, error } = await supabase.rpc('join_tournament', {
        p_tournament_id: selectedTournamentId,
        p_user_id: user.id,
        p_balance_source: balanceSource,
      });

      if (error) {
        console.error('❌ Error joining tournament:', error);
        throw error;
      }

      if (!data.success) {
        Alert.alert('Cannot Join', data.message);
        return;
      }

      console.log('✅ Joined tournament successfully');
      Alert.alert('Success', 'You have joined the tournament! Good luck!');

      const tournament = tournaments.find((t) => t.id === selectedTournamentId);
      if (tournament) {
        setActiveTournament(tournament);
        setIsInGame(true);
      }
      
      await loadBalances();
    } catch (error) {
      console.error('❌ Failed to join tournament:', error);
      Alert.alert('Error', 'Failed to join tournament. Please try again.');
    }
  };

  const handleGameComplete = async (score: number) => {
    if (!activeTournament || !user?.id) {
      console.log('⚠️ No active tournament or user');
      return;
    }

    try {
      console.log('🎮 Submitting score:', score);

      const { error: scoreError } = await supabase.from('game_scores').upsert({
        tournament_id: activeTournament.id,
        user_id: user.id,
        user_name: user.name,
        score: score,
      });

      if (scoreError) {
        console.error('❌ Error submitting score:', scoreError);
        throw scoreError;
      }

      // Broadcast score update for real-time leaderboard
      const channel = supabase.channel(`tournament:${activeTournament.id}:leaderboard`);
      await channel.send({
        type: 'broadcast',
        event: 'score_update',
        payload: {
          user_id: user.id,
          user_name: user.name,
          score: score,
          tournament_id: activeTournament.id,
        },
      });

      console.log('✅ Score submitted successfully');
      
      if (score === 0) {
        Alert.alert('Withdrawn', 'You have withdrawn from the tournament with 0 points.');
      } else {
        Alert.alert('Score Submitted', `Your score of ${score} has been recorded!`);
      }

      setIsInGame(false);
      setActiveTournament(null);
      await loadTournaments();
      await loadBalances();
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
      Alert.alert('Error', 'Failed to submit score. Please try again.');
    }
  };

  const handleBackPress = async () => {
    if (isInGame) {
      Alert.alert(
        'Exit Game?',
        'Are you sure you want to exit? You will receive 0 points for withdrawing.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: async () => {
              // Submit score of 0 for withdrawal
              await handleGameComplete(0);
            },
          },
        ]
      );
    } else {
      router.back();
    }
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

  if (isInGame && activeTournament) {
    const gameProps = {
      tournamentId: activeTournament.id,
      onComplete: handleGameComplete,
      onExit: handleBackPress,
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameContainer}>
          {gameType === 'reaction_test' && <ReactionTestGame {...gameProps} />}
          {gameType === 'jump_time' && <JumpTimeGame {...gameProps} />}
          {gameType === 'slide_puzzle' && <SlidePuzzleGame {...gameProps} />}
          {gameType === 'memory_speed' && <MemorySpeedGame {...gameProps} />}
          {gameType === 'snake_retro' && <SnakeRetroGame {...gameProps} />}
          {gameType === 'catch_it' && <CatchItGame {...gameProps} />}
          {gameType === 'shuriken_aim' && <ShurikenAimGame {...gameProps} />}
          {gameType === 'number_tracker' && <NumberTrackerGame {...gameProps} />}
        </View>
      </SafeAreaView>
    );
  }

  const gameName = isViralZone 
    ? VIRAL_ZONE_GAME_NAMES[gameType as keyof typeof VIRAL_ZONE_GAME_NAMES] 
    : GAME_NAMES[gameType as keyof typeof GAME_NAMES] || 'Unknown Game';
  const gameDescription = isViralZone
    ? VIRAL_ZONE_GAME_DESCRIPTIONS[gameType as keyof typeof VIRAL_ZONE_GAME_DESCRIPTIONS]
    : GAME_DESCRIPTIONS[gameType as keyof typeof GAME_DESCRIPTIONS] || '';
  const isAtLimit = totalActiveTournaments >= maxActiveTournaments;
  const totalBalance = tournamentsBalance + commissionBalance;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <IconSymbol name={ICONS.BACK} size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{gameName}</Text>
            <Text style={styles.subtitle}>{gameDescription}</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>🏆 Tournaments Balance</Text>
            <Text style={styles.balanceValue}>{tournamentsBalance.toFixed(2)} MXI</Text>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>💼 Commission Balance</Text>
            <Text style={styles.balanceValue}>{commissionBalance.toFixed(2)} MXI</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceRow}>
            <Text style={styles.balanceTotal}>💰 Total Available</Text>
            <Text style={styles.balanceTotalValue}>{totalBalance.toFixed(2)} MXI</Text>
          </View>
        </View>

        {isAtLimit && (
          <View style={styles.limitWarning}>
            <Text style={styles.limitWarningText}>
              ⚠️ Maximum active tournaments reached ({totalActiveTournaments}/{maxActiveTournaments}). Wait for tournaments to complete.
            </Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.createTournamentButton, isAtLimit && styles.joinButtonDisabled]} 
          onPress={handleCreateTournamentPress}
          disabled={isAtLimit}
        >
          <IconSymbol name={ICONS.ADD_CIRCLE} size={24} color={colors.light} />
          <Text style={styles.createTournamentButtonText}>Create New Tournament</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>🏆 Available Tournaments</Text>

        {tournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name={ICONS.INFO} size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              No active tournaments. Create one to start playing!
            </Text>
          </View>
        ) : (
          tournaments.map((tournament) => (
            <Fragment key={tournament.id}>
              <View style={styles.tournamentCard}>
                <View style={styles.tournamentHeader}>
                  <Text style={styles.tournamentTitle}>Tournament #{tournament.id.slice(0, 8)}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      tournament.status === 'waiting'
                        ? styles.statusBadgeWaiting
                        : styles.statusBadgeInProgress,
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {tournament.status === 'waiting' ? 'Open' : 'In Progress'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tournamentStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Players</Text>
                    <Text style={styles.statValue}>
                      {tournament.current_players}/{tournament.max_players}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Entry Fee</Text>
                    <Text style={styles.statValue}>{tournament.entry_fee} MXI</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Prize Pool</Text>
                    <Text style={styles.statValue}>{tournament.prize_pool} MXI</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    (tournament.current_players >= tournament.max_players ||
                      tournament.status !== 'waiting') &&
                      styles.joinButtonDisabled,
                  ]}
                  onPress={() => handleJoinTournamentPress(tournament.id)}
                  disabled={
                    tournament.current_players >= tournament.max_players ||
                    tournament.status !== 'waiting'
                  }
                >
                  <Text style={styles.joinButtonText}>
                    {tournament.current_players >= tournament.max_players
                      ? 'Tournament Full'
                      : tournament.status !== 'waiting'
                      ? 'In Progress'
                      : 'Join Tournament'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Show leaderboard for tournaments with participants */}
              {tournament.current_players > 0 && (
                <TournamentLeaderboard
                  tournamentId={tournament.id}
                  prizePool={tournament.prize_pool}
                  maxPlayers={tournament.max_players}
                />
              )}
            </Fragment>
          ))
        )}
      </ScrollView>

      {/* PARTICIPANT SELECTION MODAL */}
      {!isViralZone && (
        <Modal
          visible={showParticipantModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowParticipantModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Tournament Size</Text>
              <Text style={styles.modalSubtitle}>
                Select the maximum number of participants for this tournament
              </Text>

              {PARTICIPANT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.participantOption,
                    selectedParticipants === option && styles.participantOptionSelected,
                  ]}
                  onPress={() => setSelectedParticipants(option)}
                >
                  <Text style={styles.participantOptionTitle}>{option} Players</Text>
                  <Text style={styles.participantOptionSubtitle}>
                    {option === 25 ? 'Smaller tournament, faster to fill' : 'Larger tournament, bigger competition'}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowParticipantModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={() => handleCreateTournament()}
                >
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* BALANCE SOURCE SELECTION MODAL */}
      <Modal
        visible={showBalanceSourceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBalanceSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💰 Select Balance Source</Text>
            <Text style={styles.modalSubtitle}>
              Choose which balance to use for the entry fee
            </Text>

            <View style={styles.balanceSourceSelector}>
              <View style={styles.balanceSourceOptions}>
                <TouchableOpacity
                  style={[
                    styles.balanceSourceOption,
                    balanceSource === 'tournaments' && styles.balanceSourceOptionSelected,
                  ]}
                  onPress={() => setBalanceSource('tournaments')}
                >
                  <View style={styles.balanceSourceOptionHeader}>
                    <Text style={styles.balanceSourceOptionTitle}>🏆 Tournaments Balance</Text>
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
                    <Text style={styles.balanceSourceOptionTitle}>💼 Commission Balance</Text>
                    <Text style={styles.balanceSourceOptionBalance}>{commissionBalance.toFixed(2)} MXI</Text>
                  </View>
                  <Text style={styles.balanceSourceOptionDescription}>
                    Use your referral commissions
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowBalanceSourceModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleJoinTournament}
              >
                <Text style={styles.modalButtonText}>Join Tournament</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
