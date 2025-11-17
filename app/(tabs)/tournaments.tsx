
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { Tournament, GAME_NAMES, GAME_DESCRIPTIONS, MAX_ACTIVE_TOURNAMENTS } from '@/types/tournaments';

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
    marginBottom: 8,
  },
  balanceNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  gamesGrid: {
    gap: 16,
    marginBottom: 24,
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
  infoCard: {
    backgroundColor: colors.sectionBlue,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
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
  challengesCard: {
    backgroundColor: colors.sectionPink,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  challengesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  challengesSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  challengesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengesInfoItem: {
    alignItems: 'center',
  },
  challengesInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  challengesInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default function TournamentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentsBalance, setTournamentsBalance] = useState(0);
  const [activeTournaments, setActiveTournaments] = useState<Record<string, number>>({});
  const [totalActiveTournaments, setTotalActiveTournaments] = useState(0);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping tournaments data load');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading tournaments data for user:', user.id);

      // Load tournaments balance
      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('tournaments_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (vestingError) {
        console.error('❌ Error loading tournaments balance:', vestingError);
      } else {
        setTournamentsBalance(vestingData?.tournaments_balance || 0);
      }

      // Load active tournaments count by game type
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

      console.log('✅ Tournaments data loaded');
    } catch (error) {
      console.error('❌ Failed to load tournaments data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePlayGame = (gameType: string) => {
    console.log('🎮 Starting game:', gameType);
    router.push(`/games/${gameType}` as any);
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

  const games = [
    { type: 'reaction_test', icon: 'flash-on' },
    { type: 'jump_time', icon: 'fitness-center' },
    { type: 'slide_puzzle', icon: 'extension' },
    { type: 'memory_speed', icon: 'psychology' },
    { type: 'snake_retro', icon: 'videogame-asset' },
  ];

  const handleNavigateToChallenges = () => {
    router.push('/challenges' as any);
  };

  const limitPercentage = (totalActiveTournaments / MAX_ACTIVE_TOURNAMENTS) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Tournaments & Challenges</Text>
          <Text style={styles.subtitle}>Compete and win MXI prizes!</Text>
        </View>

        {/* Tournaments Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>💰 Tournaments Balance</Text>
          <Text style={styles.balanceAmount}>{tournamentsBalance.toFixed(2)} MXI</Text>
          <Text style={styles.balanceNote}>
            Winnings from tournaments. Can be withdrawn from Commission & Tournaments balance.
          </Text>
        </View>

        {/* Active Tournaments Limit */}
        <View style={styles.limitCard}>
          <Text style={styles.limitTitle}>📊 Active Tournaments</Text>
          <Text style={styles.limitText}>
            Current active tournaments will fill up as participants join. Maximum {MAX_ACTIVE_TOURNAMENTS} tournaments can be active at once.
          </Text>
          <View style={styles.limitProgress}>
            <View style={styles.limitBar}>
              <View style={[styles.limitBarFill, { width: `${limitPercentage}%` }]} />
            </View>
            <Text style={styles.limitCount}>
              {totalActiveTournaments}/{MAX_ACTIVE_TOURNAMENTS}
            </Text>
          </View>
        </View>

        {/* Challenges Card */}
        <TouchableOpacity style={styles.challengesCard} onPress={handleNavigateToChallenges}>
          <View style={styles.challengesHeader}>
            <View>
              <Text style={styles.challengesTitle}>⚔️ 1 vs 3 Challenges</Text>
              <Text style={styles.challengesSubtitle}>Create custom challenges with friends!</Text>
            </View>
            <IconSymbol name={ICONS.ARROW_FORWARD} size={24} color={colors.light} />
          </View>
          <View style={styles.challengesInfo}>
            <View style={styles.challengesInfoItem}>
              <Text style={styles.challengesInfoLabel}>Entry Fee</Text>
              <Text style={styles.challengesInfoValue}>5-1000 MXI</Text>
            </View>
            <View style={styles.challengesInfoItem}>
              <Text style={styles.challengesInfoLabel}>Players</Text>
              <Text style={styles.challengesInfoValue}>1 vs 3</Text>
            </View>
            <View style={styles.challengesInfoItem}>
              <Text style={styles.challengesInfoLabel}>Winner Takes</Text>
              <Text style={styles.challengesInfoValue}>All</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Tournaments</Text>
          <View style={styles.infoRow}>
            <IconSymbol name={ICONS.CHECK_CIRCLE} size={20} color={colors.info} />
            <Text style={styles.infoText}>Entry fee: 3 MXI per tournament</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name={ICONS.CHECK_CIRCLE} size={20} color={colors.info} />
            <Text style={styles.infoText}>Prize pool: 135 MXI per tournament</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name={ICONS.CHECK_CIRCLE} size={20} color={colors.info} />
            <Text style={styles.infoText}>Choose 25 or 50 players per tournament</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name={ICONS.CHECK_CIRCLE} size={20} color={colors.info} />
            <Text style={styles.infoText}>Prizes: 1st (50%), 2nd (25%), 3rd (15%)</Text>
          </View>
        </View>

        {/* Games Grid */}
        <Text style={styles.sectionTitle}>🎮 Tournament Games</Text>
        <View style={styles.gamesGrid}>
          {games.map((game, index) => {
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
      </ScrollView>
    </SafeAreaView>
  );
}
