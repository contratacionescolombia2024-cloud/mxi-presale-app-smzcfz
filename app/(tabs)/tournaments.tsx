
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { Tournament, GAME_NAMES, GAME_DESCRIPTIONS, VIRAL_ZONE_GAME_NAMES, VIRAL_ZONE_GAME_DESCRIPTIONS, MINI_BATTLE_GAME_NAMES, MINI_BATTLE_GAME_DESCRIPTIONS, MAX_ACTIVE_TOURNAMENTS } from '@/types/tournaments';

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
});

export default function TournamentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentsBalance, setTournamentsBalance] = useState(0);
  const [commissionBalance, setCommissionBalance] = useState(0);
  const [activeTournaments, setActiveTournaments] = useState<Record<string, number>>({});
  const [activeMiniBattles, setActiveMiniBattles] = useState<Record<string, number>>({});
  const [totalActiveTournaments, setTotalActiveTournaments] = useState(0);
  const [totalActiveMiniBattles, setTotalActiveMiniBattles] = useState(0);
  const [maxActiveTournaments, setMaxActiveTournaments] = useState(MAX_ACTIVE_TOURNAMENTS);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping tournaments data load');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading tournaments data for user:', user.id);

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
      }

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

      // Load mini battles
      const { data: miniBattles, error: miniBattlesError } = await supabase
        .from('mini_battles')
        .select('game_type, current_players')
        .eq('status', 'waiting');

      if (miniBattlesError) {
        console.error('❌ Error loading mini battles:', miniBattlesError);
      } else {
        const counts: Record<string, number> = {};
        let total = 0;
        miniBattles?.forEach((mb) => {
          counts[mb.game_type] = (counts[mb.game_type] || 0) + 1;
          total++;
        });
        setActiveMiniBattles(counts);
        setTotalActiveMiniBattles(total);
      }

      // Load max active tournaments from game settings
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
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePlayGame = (gameType: string) => {
    console.log('🎮 Starting game:', gameType);
    router.push(`/games/${gameType}` as any);
  };

  const handlePlayMiniBattle = (gameType: string) => {
    console.log('🎮 Starting mini battle:', gameType);
    router.push(`/mini-battles?game=${gameType}` as any);
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

  // REMOVED: floor_is_lava and reflex_bomb
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
          <Text style={styles.balanceLabel}>💰 Available Balance for Games</Text>
          <Text style={styles.balanceAmount}>{(tournamentsBalance + commissionBalance).toFixed(2)} MXI</Text>
          <Text style={styles.balanceNote}>
            Challenge Winnings: {tournamentsBalance.toFixed(2)} MXI • Commission: {commissionBalance.toFixed(2)} MXI
          </Text>
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

                  <TouchableOpacity style={[styles.playButton, { backgroundColor: colors.accent }]} onPress={() => handlePlayMiniBattle(game.type)}>
                    <IconSymbol name={ICONS.PLAY} size={20} color={colors.light} />
                    <Text style={styles.playButtonText}>Play Now</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
