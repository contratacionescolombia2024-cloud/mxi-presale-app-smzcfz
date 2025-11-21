
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  score: number;
  rank: number;
  prize_amount: number;
}

interface TournamentLeaderboardProps {
  tournamentId: string;
  prizePool: number;
  maxPlayers: number;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  prizeInfo: {
    backgroundColor: colors.sectionOrange,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  prizeInfoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  leaderboardList: {
    maxHeight: 400,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  leaderboardEntryFirst: {
    backgroundColor: colors.sectionOrange,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  leaderboardEntrySecond: {
    backgroundColor: colors.sectionBlue,
    borderWidth: 2,
    borderColor: '#C0C0C0',
  },
  leaderboardEntryThird: {
    backgroundColor: colors.sectionPurple,
    borderWidth: 2,
    borderColor: '#CD7F32',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeFirst: {
    backgroundColor: '#FFD700',
  },
  rankBadgeSecond: {
    backgroundColor: '#C0C0C0',
  },
  rankBadgeThird: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light,
  },
  rankTextMedal: {
    color: colors.dark,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  playerScore: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prizeAmount: {
    alignItems: 'flex-end',
  },
  prizeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 2,
  },
  prizeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  recordBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  recordBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.light,
  },
});

export default function TournamentLeaderboard({
  tournamentId,
  prizePool,
  maxPlayers,
}: TournamentLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const channelRef = useRef<any>(null);

  console.log('Tournament max players:', maxPlayers);

  const loadLeaderboard = useCallback(async () => {
    try {
      console.log('📊 Loading leaderboard for tournament:', tournamentId);

      const { data, error } = await supabase
        .from('game_scores')
        .select('user_id, user_name, score')
        .eq('tournament_id', tournamentId)
        .order('score', { ascending: false });

      if (error) {
        console.error('❌ Error loading leaderboard:', error);
        throw error;
      }

      // Calculate prize distribution (50%, 25%, 15%, 10% to prize fund)
      const firstPrize = prizePool * 0.5;
      const secondPrize = prizePool * 0.25;
      const thirdPrize = prizePool * 0.15;

      const leaderboardData: LeaderboardEntry[] = (data || []).map((entry, index) => ({
        user_id: entry.user_id,
        user_name: entry.user_name,
        score: entry.score,
        rank: index + 1,
        prize_amount:
          index === 0 ? firstPrize : index === 1 ? secondPrize : index === 2 ? thirdPrize : 0,
      }));

      setLeaderboard(leaderboardData);
      
      if (leaderboardData.length > 0) {
        setHighestScore(leaderboardData[0].score);
      }

      console.log('✅ Leaderboard loaded:', leaderboardData.length, 'entries');
    } catch (error) {
      console.error('❌ Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [tournamentId, prizePool]);

  const setupRealtimeSubscription = useCallback(async () => {
    console.log('🔔 Setting up leaderboard real-time subscription for tournament:', tournamentId);

    const channel = supabase.channel(`tournament:${tournamentId}:leaderboard`, {
      config: { private: true },
    });

    channelRef.current = channel;

    await supabase.realtime.setAuth();

    channel
      .on('broadcast', { event: 'score_update' }, (payload) => {
        console.log('🔔 Score updated:', payload);
        loadLeaderboard();
      })
      .subscribe();
  }, [tournamentId, loadLeaderboard]);

  useEffect(() => {
    loadLeaderboard();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [loadLeaderboard, setupRealtimeSubscription]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  const firstPrize = prizePool * 0.5;
  const secondPrize = prizePool * 0.25;
  const thirdPrize = prizePool * 0.15;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconSymbol ios_icon_name="trophy.fill" android_material_icon_name="emoji_events" size={28} color={colors.accent} />
        <Text style={styles.title}>Live Leaderboard</Text>
        {highestScore > 0 && (
          <View style={styles.recordBadge}>
            <Text style={styles.recordBadgeText}>🔥 {highestScore}</Text>
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>
        Current standings • Updates in real-time
      </Text>

      <View style={styles.prizeInfo}>
        <Text style={styles.prizeInfoText}>
          💰 Prize Distribution:{'\n'}
          🥇 1st Place: {firstPrize.toFixed(2)} MXI{'\n'}
          🥈 2nd Place: {secondPrize.toFixed(2)} MXI{'\n'}
          🥉 3rd Place: {thirdPrize.toFixed(2)} MXI{'\n'}
          📊 10% goes to prize fund
        </Text>
      </View>

      {leaderboard.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol ios_icon_name="person.3" android_material_icon_name="groups" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyText}>
            No scores yet. Be the first to play!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.leaderboardList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {leaderboard.map((entry, _index) => (
            <View
              key={entry.user_id}
              style={[
                styles.leaderboardEntry,
                entry.rank === 1 && styles.leaderboardEntryFirst,
                entry.rank === 2 && styles.leaderboardEntrySecond,
                entry.rank === 3 && styles.leaderboardEntryThird,
              ]}
            >
              <View
                style={[
                  styles.rankBadge,
                  entry.rank === 1 && styles.rankBadgeFirst,
                  entry.rank === 2 && styles.rankBadgeSecond,
                  entry.rank === 3 && styles.rankBadgeThird,
                ]}
              >
                {entry.rank <= 3 ? (
                  <Text style={[styles.rankText, styles.rankTextMedal]}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </Text>
                ) : (
                  <Text style={styles.rankText}>#{entry.rank}</Text>
                )}
              </View>

              <View style={styles.playerInfo}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {entry.user_name}
                  {entry.score === highestScore && entry.rank === 1 && ' 👑'}
                </Text>
                <Text style={styles.playerScore}>Score: {entry.score}</Text>
              </View>

              {entry.prize_amount > 0 && (
                <View style={styles.prizeAmount}>
                  <Text style={styles.prizeValue}>{entry.prize_amount.toFixed(2)} MXI</Text>
                  <Text style={styles.prizeLabel}>Prize</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
