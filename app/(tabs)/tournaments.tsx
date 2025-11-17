
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
  miniBattlesCard: {
    backgroundColor: colors.sectionPink,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  miniBattlesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  miniBattlesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  miniBattlesSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  miniBattlesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniBattlesInfoItem: {
    alignItems: 'center',
  },
  miniBattlesInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  miniBattlesInfoValue: {
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
  const [maxActiveTournaments, setMaxActiveTournaments] = useState(MAX_ACTIVE_TOURNAMENTS);

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

  const handleNavigateToMiniBattles = () => {
    router.push('/mini-battles' as any);
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
    { type: 'floor_is_lava', icon: 'whatshot' },
    { type: 'number_tracker', icon: 'filter-9-plus' },
    { type: 'reflex_bomb', icon: 'alarm' },
  ];

  const limitPercentage = (totalActiveTournaments / maxActiveTournaments) * 100;

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
          <Text style={styles.balanceLabel}>💰 Tournaments Balance</Text>
          <Text style={styles.balanceAmount}>{tournamentsBalance.toFixed(2)} MXI</Text>
          <Text style={styles.balanceNote}>
            Winnings from tournaments. Can be withdrawn from Commission & Tournaments balance.
          </Text>
        </View>

        <View style={styles.limitCard}>
          <Text style={styles.limitTitle}>📊 Active Tournaments</Text>
          <Text style={styles.limitText}>
            Current active tournaments will fill up as participants join. Maximum {maxActiveTournaments} tournaments can be active at once.
          </Text>
          <View style={styles.limitProgress}>
            <View style={styles.limitBar}>
              <View style={[styles.limitBarFill, { width: `${limitPercentage}%` }]} />
            </View>
            <Text style={styles.limitCount}>
              {totalActiveTournaments}/{maxActiveTournaments}
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

        {/* Mini Battles Section */}
        <TouchableOpacity style={styles.miniBattlesCard} onPress={handleNavigateToMiniBattles}>
          <View style={styles.miniBattlesHeader}>
            <View>
              <Text style={styles.miniBattlesTitle}>⚔️ MXI Mini Battles</Text>
              <Text style={styles.miniBattlesSubtitle}>Quick battles with 2-4 players!</Text>
            </View>
            <IconSymbol name={ICONS.ARROW_FORWARD} size={24} color={colors.light} />
          </View>
          <View style={styles.miniBattlesInfo}>
            <View style={styles.miniBattlesInfoItem}>
              <Text style={styles.miniBattlesInfoLabel}>Entry Fee</Text>
              <Text style={styles.miniBattlesInfoValue}>5-1000 MXI</Text>
            </View>
            <View style={styles.miniBattlesInfoItem}>
              <Text style={styles.miniBattlesInfoLabel}>Players</Text>
              <Text style={styles.miniBattlesInfoValue}>2-4</Text>
            </View>
            <View style={styles.miniBattlesInfoItem}>
              <Text style={styles.miniBattlesInfoLabel}>Winner Takes</Text>
              <Text style={styles.miniBattlesInfoValue}>All</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
