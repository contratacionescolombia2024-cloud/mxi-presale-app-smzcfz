
import React, { useState, useEffect, useRef } from 'react';
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
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import * as Clipboard from 'expo-clipboard';
import {
  Challenge,
  CHALLENGE_GAME_NAMES,
  CHALLENGE_GAME_DESCRIPTIONS,
  CHALLENGE_MIN_ENTRY,
  CHALLENGE_MAX_ENTRY,
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
  joinByCodeButton: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  joinByCodeButtonText: {
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
  challengeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
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
  challengeInfo: {
    marginBottom: 12,
  },
  challengeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  challengeInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  challengeInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  inviteCodeContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  inviteCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 2,
  },
  copyButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
  },
  challengeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  challengeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  challengeButtonSecondary: {
    backgroundColor: colors.secondary,
  },
  challengeButtonDanger: {
    backgroundColor: colors.error,
  },
  challengeButtonText: {
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
  gameOption: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  gameOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.sectionPurple,
  },
  gameOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  gameOptionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
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
  gamesScrollView: {
    maxHeight: 300,
  },
});

export default function ChallengesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentsBalance, setTournamentsBalance] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('quick_draw_duel');
  const [entryFee, setEntryFee] = useState('50');
  const [allowRandomJoin, setAllowRandomJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const challengeGames = [
    { type: 'quick_draw_duel', icon: '🔫' },
    { type: 'tap_rush', icon: '⚡' },
    { type: 'rhythm_tap', icon: '🎵' },
    { type: 'mental_math_speed', icon: '🧮' },
    { type: 'danger_path', icon: '🎯' },
    { type: 'mxi_climber', icon: '⛰️' },
  ];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping challenges data load');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading challenges data for user:', user.id);

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

      // Load challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .in('status', ['waiting', 'in_progress'])
        .order('created_at', { ascending: false });

      if (challengesError) {
        console.error('❌ Error loading challenges:', challengesError);
      } else {
        setChallenges(challengesData || []);
      }

      console.log('✅ Challenges data loaded');
    } catch (error) {
      console.error('❌ Failed to load challenges data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateChallenge = async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID');
      return;
    }

    const fee = parseFloat(entryFee);
    if (isNaN(fee) || fee < CHALLENGE_MIN_ENTRY || fee > CHALLENGE_MAX_ENTRY) {
      Alert.alert('Invalid Entry Fee', `Entry fee must be between ${CHALLENGE_MIN_ENTRY} and ${CHALLENGE_MAX_ENTRY} MXI`);
      return;
    }

    if (tournamentsBalance < fee) {
      Alert.alert('Insufficient Balance', 'You do not have enough tournaments balance to create this challenge.');
      return;
    }

    setShowCreateModal(false);

    try {
      console.log('🎮 Creating challenge:', selectedGame, 'with entry fee:', fee);

      // Generate invite code
      const { data: inviteCodeData, error: inviteCodeError } = await supabase.rpc('generate_challenge_invite_code');

      if (inviteCodeError) {
        console.error('❌ Error generating invite code:', inviteCodeError);
        throw inviteCodeError;
      }

      const inviteCode = inviteCodeData;
      const prizePool = fee * 4; // 4 players total

      // Create challenge
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          game_type: selectedGame,
          creator_id: user.id,
          entry_fee: fee,
          prize_pool: prizePool,
          max_players: 4,
          current_players: 0,
          status: 'waiting',
          invite_code: inviteCode,
          allow_random_join: allowRandomJoin,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating challenge:', error);
        throw error;
      }

      console.log('✅ Challenge created:', data);
      Alert.alert('Success', `Challenge created! Invite code: ${inviteCode}`);
      await loadData();
    } catch (error) {
      console.error('❌ Failed to create challenge:', error);
      Alert.alert('Error', 'Failed to create challenge. Please try again.');
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user?.id) {
      console.log('⚠️ No user ID');
      return;
    }

    try {
      console.log('🎮 Joining challenge:', challengeId);

      const { data, error } = await supabase.rpc('join_challenge', {
        p_challenge_id: challengeId,
        p_user_id: user.id,
      });

      if (error) {
        console.error('❌ Error joining challenge:', error);
        throw error;
      }

      if (!data.success) {
        Alert.alert('Cannot Join', data.message);
        return;
      }

      console.log('✅ Joined challenge successfully');
      Alert.alert('Success', 'You have joined the challenge! Good luck!');
      await loadData();

      // Navigate to game
      const challenge = challenges.find((c) => c.id === challengeId);
      if (challenge) {
        router.push(`/challenge-game/${challenge.game_type}?challengeId=${challengeId}` as any);
      }
    } catch (error) {
      console.error('❌ Failed to join challenge:', error);
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a valid invite code.');
      return;
    }

    try {
      console.log('🎮 Joining challenge by code:', joinCode);

      // Find challenge by invite code
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('invite_code', joinCode.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (challengeError) {
        console.error('❌ Error finding challenge:', challengeError);
        throw challengeError;
      }

      if (!challengeData) {
        Alert.alert('Challenge Not Found', 'No active challenge found with this invite code.');
        return;
      }

      setShowJoinModal(false);
      setJoinCode('');
      await handleJoinChallenge(challengeData.id);
    } catch (error) {
      console.error('❌ Failed to join by code:', error);
      Alert.alert('Error', 'Failed to join challenge. Please try again.');
    }
  };

  const handleCancelChallenge = async (challengeId: string) => {
    if (!user?.id) {
      console.log('⚠️ No user ID');
      return;
    }

    Alert.alert(
      'Cancel Challenge',
      'Are you sure you want to cancel this challenge? All participants will be refunded.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🎮 Cancelling challenge:', challengeId);

              const { data, error } = await supabase.rpc('cancel_challenge', {
                p_challenge_id: challengeId,
                p_user_id: user.id,
              });

              if (error) {
                console.error('❌ Error cancelling challenge:', error);
                throw error;
              }

              if (!data.success) {
                Alert.alert('Cannot Cancel', data.message);
                return;
              }

              console.log('✅ Challenge cancelled successfully');
              Alert.alert('Success', 'Challenge cancelled and refunds issued.');
              await loadData();
            } catch (error) {
              console.error('❌ Failed to cancel challenge:', error);
              Alert.alert('Error', 'Failed to cancel challenge. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCopyInviteCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', 'Invite code copied to clipboard.');
  };

  const handlePlayChallenge = (challenge: Challenge) => {
    router.push(`/challenge-game/${challenge.game_type}?challengeId=${challenge.id}` as any);
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
            <Text style={styles.title}>⚔️ 1 vs 3 Challenges</Text>
            <Text style={styles.subtitle}>Create or join custom challenges!</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>💰 Tournaments Balance</Text>
          <Text style={styles.balanceAmount}>{tournamentsBalance.toFixed(2)} MXI</Text>
        </View>

        {/* Create Challenge Button */}
        <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
          <IconSymbol name={ICONS.ADD_CIRCLE} size={24} color={colors.light} />
          <Text style={styles.createButtonText}>Create Challenge</Text>
        </TouchableOpacity>

        {/* Join by Code Button */}
        <TouchableOpacity style={styles.joinByCodeButton} onPress={() => setShowJoinModal(true)}>
          <IconSymbol name={ICONS.LINK} size={24} color={colors.light} />
          <Text style={styles.joinByCodeButtonText}>Join by Invite Code</Text>
        </TouchableOpacity>

        {/* My Challenges */}
        <Text style={styles.sectionTitle}>📋 My Challenges</Text>
        {challenges.filter((c) => c.creator_id === user?.id).length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name={ICONS.INFO} size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>You haven&apos;t created any challenges yet.</Text>
          </View>
        ) : (
          challenges
            .filter((c) => c.creator_id === user?.id)
            .map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>
                    {CHALLENGE_GAME_NAMES[challenge.game_type as keyof typeof CHALLENGE_GAME_NAMES]}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {challenge.status === 'waiting' ? 'Waiting' : 'In Progress'}
                    </Text>
                  </View>
                </View>

                <View style={styles.challengeInfo}>
                  <View style={styles.challengeInfoRow}>
                    <Text style={styles.challengeInfoLabel}>Players</Text>
                    <Text style={styles.challengeInfoValue}>
                      {challenge.current_players}/{challenge.max_players}
                    </Text>
                  </View>
                  <View style={styles.challengeInfoRow}>
                    <Text style={styles.challengeInfoLabel}>Entry Fee</Text>
                    <Text style={styles.challengeInfoValue}>{challenge.entry_fee} MXI</Text>
                  </View>
                  <View style={styles.challengeInfoRow}>
                    <Text style={styles.challengeInfoLabel}>Prize Pool</Text>
                    <Text style={styles.challengeInfoValue}>{challenge.prize_pool} MXI</Text>
                  </View>
                </View>

                <View style={styles.inviteCodeContainer}>
                  <View>
                    <Text style={styles.inviteCodeLabel}>Invite Code</Text>
                    <Text style={styles.inviteCode}>{challenge.invite_code}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => handleCopyInviteCode(challenge.invite_code)}
                  >
                    <IconSymbol name={ICONS.COPY} size={20} color={colors.light} />
                  </TouchableOpacity>
                </View>

                <View style={styles.challengeButtons}>
                  {challenge.status === 'waiting' && (
                    <TouchableOpacity
                      style={[styles.challengeButton, styles.challengeButtonDanger]}
                      onPress={() => handleCancelChallenge(challenge.id)}
                    >
                      <Text style={styles.challengeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                  {challenge.current_players >= challenge.max_players && (
                    <TouchableOpacity
                      style={[styles.challengeButton, styles.challengeButtonSecondary]}
                      onPress={() => handlePlayChallenge(challenge)}
                    >
                      <Text style={styles.challengeButtonText}>Play</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
        )}

        {/* Available Challenges */}
        <Text style={styles.sectionTitle}>🎮 Available Challenges</Text>
        {challenges.filter((c) => c.creator_id !== user?.id && (c.allow_random_join || c.status === 'waiting')).length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name={ICONS.INFO} size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No available challenges at the moment.</Text>
          </View>
        ) : (
          challenges
            .filter((c) => c.creator_id !== user?.id && (c.allow_random_join || c.status === 'waiting'))
            .map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>
                    {CHALLENGE_GAME_NAMES[challenge.game_type as keyof typeof CHALLENGE_GAME_NAMES]}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Open</Text>
                  </View>
                </View>

                <View style={styles.challengeInfo}>
                  <View style={styles.challengeInfoRow}>
                    <Text style={styles.challengeInfoLabel}>Players</Text>
                    <Text style={styles.challengeInfoValue}>
                      {challenge.current_players}/{challenge.max_players}
                    </Text>
                  </View>
                  <View style={styles.challengeInfoRow}>
                    <Text style={styles.challengeInfoLabel}>Entry Fee</Text>
                    <Text style={styles.challengeInfoValue}>{challenge.entry_fee} MXI</Text>
                  </View>
                  <View style={styles.challengeInfoRow}>
                    <Text style={styles.challengeInfoLabel}>Prize Pool</Text>
                    <Text style={styles.challengeInfoValue}>{challenge.prize_pool} MXI</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.challengeButton}
                  onPress={() => handleJoinChallenge(challenge.id)}
                  disabled={challenge.current_players >= challenge.max_players}
                >
                  <Text style={styles.challengeButtonText}>
                    {challenge.current_players >= challenge.max_players ? 'Full' : 'Join Challenge'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
        )}
      </ScrollView>

      {/* Create Challenge Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Challenge</Text>
            <Text style={styles.modalSubtitle}>Choose a game and set the entry fee</Text>

            <ScrollView style={styles.gamesScrollView}>
              {challengeGames.map((game) => (
                <TouchableOpacity
                  key={game.type}
                  style={[styles.gameOption, selectedGame === game.type && styles.gameOptionSelected]}
                  onPress={() => setSelectedGame(game.type)}
                >
                  <Text style={styles.gameOptionTitle}>
                    {game.icon} {CHALLENGE_GAME_NAMES[game.type as keyof typeof CHALLENGE_GAME_NAMES]}
                  </Text>
                  <Text style={styles.gameOptionDescription}>
                    {CHALLENGE_GAME_DESCRIPTIONS[game.type as keyof typeof CHALLENGE_GAME_DESCRIPTIONS]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Entry Fee (MXI)</Text>
            <TextInput
              style={styles.input}
              value={entryFee}
              onChangeText={setEntryFee}
              keyboardType="numeric"
              placeholder={`${CHALLENGE_MIN_ENTRY} - ${CHALLENGE_MAX_ENTRY}`}
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAllowRandomJoin(!allowRandomJoin)}
            >
              <View style={[styles.checkbox, allowRandomJoin && styles.checkboxChecked]}>
                {allowRandomJoin && <IconSymbol name={ICONS.CHECK} size={16} color={colors.light} />}
              </View>
              <Text style={styles.checkboxLabel}>Allow random players to join</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleCreateChallenge}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join by Code Modal */}
      <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join by Invite Code</Text>
            <Text style={styles.modalSubtitle}>Enter the invite code shared by your friend</Text>

            <Text style={styles.inputLabel}>Invite Code</Text>
            <TextInput
              style={styles.input}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Enter code"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleJoinByCode}
              >
                <Text style={styles.modalButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
