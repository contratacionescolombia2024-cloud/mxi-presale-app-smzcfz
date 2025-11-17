
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
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { 
  GAME_NAMES, 
  VIRAL_ZONE_GAME_NAMES, 
  CHALLENGE_GAME_NAMES 
} from '@/types/tournaments';

interface GameSetting {
  id: string;
  game_type: string;
  max_active_tournaments: number;
  current_active_tournaments: number;
  entry_fee: number;
  max_players: number;
  prize_distribution: {
    first: number;
    second?: number;
    third?: number;
  };
  created_at: string;
  updated_at: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTournaments: {
    backgroundColor: colors.primary,
  },
  categoryViralZone: {
    backgroundColor: colors.secondary,
  },
  categoryChallenges: {
    backgroundColor: colors.accent,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  gameCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: colors.light,
    fontSize: 13,
    fontWeight: '600',
  },
  gameInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
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
    maxWidth: 500,
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
  modalScroll: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  warningBox: {
    backgroundColor: `${colors.warning}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: `${colors.info}15`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});

export default function GameSettingsScreen() {
  const { isAdmin } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameSettings, setGameSettings] = useState<GameSetting[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameSetting | null>(null);
  const [editMaxTournaments, setEditMaxTournaments] = useState('');
  const [editEntryFee, setEditEntryFee] = useState('');
  const [editMaxPlayers, setEditMaxPlayers] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      console.log('📊 Loading game settings...');

      const { data, error } = await supabase.rpc('get_game_settings_with_counts');

      if (error) {
        console.error('❌ Error loading game settings:', error);
        throw error;
      }

      console.log('✅ Game settings loaded:', data);
      setGameSettings(data || []);
    } catch (error) {
      console.error('❌ Failed to load game settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEditGame = (game: GameSetting) => {
    setSelectedGame(game);
    setEditMaxTournaments(game.max_active_tournaments.toString());
    setEditEntryFee(game.entry_fee.toString());
    setEditMaxPlayers(game.max_players.toString());
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedGame) {
      console.log('⚠️ No game selected');
      return;
    }

    const maxTournaments = parseInt(editMaxTournaments);
    const entryFee = parseFloat(editEntryFee);
    const maxPlayers = parseInt(editMaxPlayers);

    if (isNaN(maxTournaments) || maxTournaments <= 0) {
      alert('Please enter a valid maximum tournaments value (must be greater than 0)');
      return;
    }

    if (isNaN(entryFee) || entryFee <= 0) {
      alert('Please enter a valid entry fee (must be greater than 0)');
      return;
    }

    if (isNaN(maxPlayers) || maxPlayers <= 0) {
      alert('Please enter a valid max players value (must be greater than 0)');
      return;
    }

    try {
      console.log('✏️ Updating game settings:', selectedGame.game_type);

      const { error } = await supabase
        .from('game_settings')
        .update({
          max_active_tournaments: maxTournaments,
          entry_fee: entryFee,
          max_players: maxPlayers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedGame.id);

      if (error) {
        console.error('❌ Error updating game settings:', error);
        throw error;
      }

      console.log('✅ Game settings updated');
      alert('Game settings updated successfully');
      setShowEditModal(false);
      await loadData();
    } catch (error) {
      console.error('❌ Failed to update game settings:', error);
      alert('Failed to update game settings. Please try again.');
    }
  };

  if (!isAdmin) {
    console.log('⚠️ User is not admin, redirecting...');
    return <Redirect href="/(tabs)/(home)/" />;
  }

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

  const getGameName = (gameType: string) => {
    if (gameType in GAME_NAMES) {
      return GAME_NAMES[gameType as keyof typeof GAME_NAMES];
    }
    if (gameType in VIRAL_ZONE_GAME_NAMES) {
      return VIRAL_ZONE_GAME_NAMES[gameType as keyof typeof VIRAL_ZONE_GAME_NAMES];
    }
    if (gameType in CHALLENGE_GAME_NAMES) {
      return CHALLENGE_GAME_NAMES[gameType as keyof typeof CHALLENGE_GAME_NAMES];
    }
    return gameType;
  };

  const standardGames = gameSettings.filter(g => 
    ['reaction_test', 'jump_time', 'slide_puzzle', 'memory_speed', 'snake_retro'].includes(g.game_type)
  );

  const viralZoneGames = gameSettings.filter(g => 
    ['catch_it', 'shuriken_aim', 'whisper_challenge', 'floor_is_lava', 'number_tracker', 'reflex_bomb'].includes(g.game_type)
  );

  const challengeGames = gameSettings.filter(g => 
    ['quick_draw_duel', 'tap_rush', 'rhythm_tap', 'mental_math_speed', 'danger_path', 'mxi_climber'].includes(g.game_type)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol ios_icon_name="gearshape.fill" android_material_icon_name="settings" size={32} color={colors.primary} />
        <Text style={styles.title}>Game Settings</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <IconSymbol ios_icon_name="arrow.clockwise" android_material_icon_name="refresh" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Standard Tournaments */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, styles.categoryTournaments]}>
              <IconSymbol ios_icon_name="trophy.fill" android_material_icon_name="emoji_events" size={24} color={colors.light} />
            </View>
            <Text style={styles.categoryTitle}>Standard Tournaments</Text>
          </View>

          {standardGames.map((game) => {
            const percentage = (game.current_active_tournaments / game.max_active_tournaments) * 100;
            return (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameName}>{getGameName(game.game_type)}</Text>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEditGame(game)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.gameInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Max Active Tournaments:</Text>
                    <Text style={styles.infoValue}>{game.max_active_tournaments}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Current Active:</Text>
                    <Text style={styles.infoValue}>{game.current_active_tournaments}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Entry Fee:</Text>
                    <Text style={styles.infoValue}>{game.entry_fee} MXI</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Max Players:</Text>
                    <Text style={styles.infoValue}>{game.max_players}</Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {percentage.toFixed(0)}% capacity ({game.current_active_tournaments}/{game.max_active_tournaments})
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Viral Zone Games */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, styles.categoryViralZone]}>
              <IconSymbol ios_icon_name="flame.fill" android_material_icon_name="whatshot" size={24} color={colors.light} />
            </View>
            <Text style={styles.categoryTitle}>MXI Viral Zone</Text>
          </View>

          {viralZoneGames.map((game) => {
            const percentage = (game.current_active_tournaments / game.max_active_tournaments) * 100;
            return (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameName}>{getGameName(game.game_type)}</Text>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEditGame(game)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.gameInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Max Active Tournaments:</Text>
                    <Text style={styles.infoValue}>{game.max_active_tournaments}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Current Active:</Text>
                    <Text style={styles.infoValue}>{game.current_active_tournaments}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Entry Fee:</Text>
                    <Text style={styles.infoValue}>{game.entry_fee} MXI</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Max Players:</Text>
                    <Text style={styles.infoValue}>{game.max_players}</Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {percentage.toFixed(0)}% capacity ({game.current_active_tournaments}/{game.max_active_tournaments})
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Challenge Games */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, styles.categoryChallenges]}>
              <IconSymbol ios_icon_name="bolt.fill" android_material_icon_name="flash_on" size={24} color={colors.light} />
            </View>
            <Text style={styles.categoryTitle}>Challenge Games</Text>
          </View>

          {challengeGames.map((game) => {
            const percentage = (game.current_active_tournaments / game.max_active_tournaments) * 100;
            return (
              <View key={game.id} style={styles.gameCard}>
                <View style={styles.gameHeader}>
                  <Text style={styles.gameName}>{getGameName(game.game_type)}</Text>
                  <TouchableOpacity style={styles.editButton} onPress={() => handleEditGame(game)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.gameInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Max Active Tournaments:</Text>
                    <Text style={styles.infoValue}>{game.max_active_tournaments}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Current Active:</Text>
                    <Text style={styles.infoValue}>{game.current_active_tournaments}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Default Entry Fee:</Text>
                    <Text style={styles.infoValue}>{game.entry_fee} MXI</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Default Max Players:</Text>
                    <Text style={styles.infoValue}>{game.max_players}</Text>
                  </View>

                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {percentage.toFixed(0)}% capacity ({game.current_active_tournaments}/{game.max_active_tournaments})
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Game Settings</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <IconSymbol ios_icon_name="xmark.circle.fill" android_material_icon_name="cancel" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedGame && (
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.gameName, { marginBottom: 16 }]}>{getGameName(selectedGame.game_type)}</Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    💡 These settings control how many tournaments can be active simultaneously for this game and the default parameters for new tournaments.
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Maximum Active Tournaments</Text>
                <TextInput
                  style={styles.input}
                  value={editMaxTournaments}
                  onChangeText={setEditMaxTournaments}
                  keyboardType="numeric"
                  placeholder="Enter max active tournaments"
                  placeholderTextColor={colors.textSecondary}
                />
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    ⚠️ Current active: {selectedGame.current_active_tournaments}. Setting this below the current active count will prevent new tournaments from being created until some complete.
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Entry Fee (MXI)</Text>
                <TextInput
                  style={styles.input}
                  value={editEntryFee}
                  onChangeText={setEditEntryFee}
                  keyboardType="numeric"
                  placeholder="Enter entry fee"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Max Players</Text>
                <TextInput
                  style={styles.input}
                  value={editMaxPlayers}
                  onChangeText={setEditMaxPlayers}
                  keyboardType="numeric"
                  placeholder="Enter max players"
                  placeholderTextColor={colors.textSecondary}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
