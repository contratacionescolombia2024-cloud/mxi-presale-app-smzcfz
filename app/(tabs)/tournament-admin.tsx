
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
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { supabase } from '@/app/integrations/supabase/client';
import { Tournament, Challenge, GAME_NAMES, VIRAL_ZONE_GAME_NAMES, CHALLENGE_GAME_NAMES } from '@/types/tournaments';

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
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  tournamentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeWaiting: {
    backgroundColor: colors.success,
  },
  statusBadgeInProgress: {
    backgroundColor: colors.warning,
  },
  statusBadgeCompleted: {
    backgroundColor: colors.info,
  },
  statusBadgeCancelled: {
    backgroundColor: colors.error,
  },
  statusBadgeText: {
    color: colors.light,
    fontSize: 11,
    fontWeight: '600',
  },
  tournamentInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  tournamentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.light,
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
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
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
});

export default function TournamentAdminScreen() {
  const { isAdmin } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalChallenges: 0,
    activeChallenges: 0,
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [editEntryFee, setEditEntryFee] = useState('');
  const [editMaxPlayers, setEditMaxPlayers] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      console.log('📊 Loading tournament admin data...');

      const [tournamentsResult, challengesResult] = await Promise.all([
        supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('challenges')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (tournamentsResult.error) {
        console.error('❌ Error loading tournaments:', tournamentsResult.error);
      } else {
        setTournaments(tournamentsResult.data || []);
        setStats((prev) => ({
          ...prev,
          totalTournaments: tournamentsResult.data?.length || 0,
          activeTournaments: tournamentsResult.data?.filter((t) => t.status === 'waiting').length || 0,
        }));
      }

      if (challengesResult.error) {
        console.error('❌ Error loading challenges:', challengesResult.error);
      } else {
        setChallenges(challengesResult.data || []);
        setStats((prev) => ({
          ...prev,
          totalChallenges: challengesResult.data?.length || 0,
          activeChallenges: challengesResult.data?.filter((c) => c.status === 'waiting').length || 0,
        }));
      }

      console.log('✅ Tournament admin data loaded');
    } catch (error) {
      console.error('❌ Failed to load tournament admin data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting tournament:', tournamentId);

              const { error } = await supabase
                .from('tournaments')
                .delete()
                .eq('id', tournamentId);

              if (error) {
                console.error('❌ Error deleting tournament:', error);
                throw error;
              }

              console.log('✅ Tournament deleted');
              Alert.alert('Success', 'Tournament deleted successfully');
              await loadData();
            } catch (error) {
              console.error('❌ Failed to delete tournament:', error);
              Alert.alert('Error', 'Failed to delete tournament. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setEditEntryFee(tournament.entry_fee.toString());
    setEditMaxPlayers(tournament.max_players.toString());
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTournament) {
      console.log('⚠️ No tournament selected');
      return;
    }

    const entryFee = parseFloat(editEntryFee);
    const maxPlayers = parseInt(editMaxPlayers);

    if (isNaN(entryFee) || entryFee <= 0) {
      Alert.alert('Invalid Entry Fee', 'Please enter a valid entry fee');
      return;
    }

    if (isNaN(maxPlayers) || maxPlayers <= 0) {
      Alert.alert('Invalid Max Players', 'Please enter a valid number of players');
      return;
    }

    try {
      console.log('✏️ Updating tournament:', selectedTournament.id);

      const { error } = await supabase
        .from('tournaments')
        .update({
          entry_fee: entryFee,
          max_players: maxPlayers,
          prize_pool: entryFee * maxPlayers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTournament.id);

      if (error) {
        console.error('❌ Error updating tournament:', error);
        throw error;
      }

      console.log('✅ Tournament updated');
      Alert.alert('Success', 'Tournament updated successfully');
      setShowEditModal(false);
      await loadData();
    } catch (error) {
      console.error('❌ Failed to update tournament:', error);
      Alert.alert('Error', 'Failed to update tournament. Please try again.');
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this challenge? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting challenge:', challengeId);

              const { error } = await supabase
                .from('challenges')
                .delete()
                .eq('id', challengeId);

              if (error) {
                console.error('❌ Error deleting challenge:', error);
                throw error;
              }

              console.log('✅ Challenge deleted');
              Alert.alert('Success', 'Challenge deleted successfully');
              await loadData();
            } catch (error) {
              console.error('❌ Failed to delete challenge:', error);
              Alert.alert('Error', 'Failed to delete challenge. Please try again.');
            }
          },
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol ios_icon_name="trophy.fill" android_material_icon_name="emoji_events" size={32} color={colors.primary} />
        <Text style={styles.title}>Tournament Management</Text>
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
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalTournaments}</Text>
              <Text style={styles.statLabel}>Total Tournaments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.activeTournaments}</Text>
              <Text style={styles.statLabel}>Active Tournaments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalChallenges}</Text>
              <Text style={styles.statLabel}>Total Challenges</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.activeChallenges}</Text>
              <Text style={styles.statLabel}>Active Challenges</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>🏆 Tournaments</Text>
        {tournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol ios_icon_name="trophy" android_material_icon_name="emoji_events" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No tournaments found</Text>
          </View>
        ) : (
          tournaments.map((tournament) => (
            <View key={tournament.id} style={styles.tournamentCard}>
              <View style={styles.tournamentHeader}>
                <Text style={styles.tournamentTitle}>{getGameName(tournament.game_type)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    tournament.status === 'waiting' && styles.statusBadgeWaiting,
                    tournament.status === 'in_progress' && styles.statusBadgeInProgress,
                    tournament.status === 'completed' && styles.statusBadgeCompleted,
                    tournament.status === 'cancelled' && styles.statusBadgeCancelled,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{tournament.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.tournamentInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>ID:</Text>
                  <Text style={styles.infoValue}>{tournament.id.slice(0, 8)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Players:</Text>
                  <Text style={styles.infoValue}>
                    {tournament.current_players}/{tournament.max_players}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Entry Fee:</Text>
                  <Text style={styles.infoValue}>{tournament.entry_fee} MXI</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Prize Pool:</Text>
                  <Text style={styles.infoValue}>{tournament.prize_pool} MXI</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Created:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(tournament.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.tournamentActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditTournament(tournament)}
                  disabled={tournament.status !== 'waiting'}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteTournament(tournament.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>⚔️ Challenges</Text>
        {challenges.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol ios_icon_name="bolt.fill" android_material_icon_name="flash_on" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No challenges found</Text>
          </View>
        ) : (
          challenges.map((challenge) => (
            <View key={challenge.id} style={styles.tournamentCard}>
              <View style={styles.tournamentHeader}>
                <Text style={styles.tournamentTitle}>{getGameName(challenge.game_type)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    challenge.status === 'waiting' && styles.statusBadgeWaiting,
                    challenge.status === 'in_progress' && styles.statusBadgeInProgress,
                    challenge.status === 'completed' && styles.statusBadgeCompleted,
                    challenge.status === 'cancelled' && styles.statusBadgeCancelled,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{challenge.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.tournamentInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Invite Code:</Text>
                  <Text style={styles.infoValue}>{challenge.invite_code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Players:</Text>
                  <Text style={styles.infoValue}>
                    {challenge.current_players}/{challenge.max_players}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Entry Fee:</Text>
                  <Text style={styles.infoValue}>{challenge.entry_fee} MXI</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Prize Pool:</Text>
                  <Text style={styles.infoValue}>{challenge.prize_pool} MXI</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Random Join:</Text>
                  <Text style={styles.infoValue}>{challenge.allow_random_join ? 'Yes' : 'No'}</Text>
                </View>
              </View>

              <View style={styles.tournamentActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteChallenge(challenge.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Tournament</Text>

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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
