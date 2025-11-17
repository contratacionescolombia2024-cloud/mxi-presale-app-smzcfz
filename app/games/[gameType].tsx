
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { Tournament, GAME_NAMES, GAME_DESCRIPTIONS } from '@/types/tournaments';
import ReactionTestGame from '@/components/games/ReactionTestGame';
import JumpTimeGame from '@/components/games/JumpTimeGame';
import SlidePuzzleGame from '@/components/games/SlidePuzzleGame';
import MemorySpeedGame from '@/components/games/MemorySpeedGame';
import SpaceshipSurvivalGame from '@/components/games/SpaceshipSurvivalGame';
import SnakeRetroGame from '@/components/games/SnakeRetroGame';

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
});

export default function GameScreen() {
  const { gameType } = useLocalSearchParams<{ gameType: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [isInGame, setIsInGame] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    loadTournaments();
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

  const loadTournaments = async () => {
    if (!gameType) {
      console.log('⚠️ No game type specified');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading tournaments for game:', gameType);

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

  const handleCreateTournament = async () => {
    if (!user?.id || !gameType) {
      console.log('⚠️ Missing user or game type');
      return;
    }

    try {
      console.log('🎮 Creating tournament for game:', gameType);

      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          game_type: gameType,
          entry_fee: 3,
          prize_pool: 135,
          max_players: 50,
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

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user?.id) {
      console.log('⚠️ No user ID');
      return;
    }

    try {
      console.log('🎮 Joining tournament:', tournamentId);

      const { data, error } = await supabase.rpc('join_tournament', {
        p_tournament_id: tournamentId,
        p_user_id: user.id,
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

      // Find the tournament and start the game
      const tournament = tournaments.find((t) => t.id === tournamentId);
      if (tournament) {
        setActiveTournament(tournament);
        setIsInGame(true);
      }
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

      // Submit score
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

      console.log('✅ Score submitted successfully');
      Alert.alert('Score Submitted', `Your score of ${score} has been recorded!`);

      // Exit game
      setIsInGame(false);
      setActiveTournament(null);
      await loadTournaments();
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
      Alert.alert('Error', 'Failed to submit score. Please try again.');
    }
  };

  const handleBackPress = () => {
    if (isInGame) {
      Alert.alert(
        'Exit Game?',
        'Are you sure you want to exit? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => {
              setIsInGame(false);
              setActiveTournament(null);
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
    // Render the appropriate game component
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
          {gameType === 'spaceship_survival' && <SpaceshipSurvivalGame {...gameProps} />}
          {gameType === 'snake_retro' && <SnakeRetroGame {...gameProps} />}
        </View>
      </SafeAreaView>
    );
  }

  const gameName = GAME_NAMES[gameType as keyof typeof GAME_NAMES] || 'Unknown Game';
  const gameDescription = GAME_DESCRIPTIONS[gameType as keyof typeof GAME_DESCRIPTIONS] || '';

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

        <TouchableOpacity style={styles.createTournamentButton} onPress={handleCreateTournament}>
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
            <View key={tournament.id} style={styles.tournamentCard}>
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
                onPress={() => handleJoinTournament(tournament.id)}
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
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
