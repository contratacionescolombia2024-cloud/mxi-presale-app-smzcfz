
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { Challenge, CHALLENGE_GAME_NAMES } from '@/types/tournaments';
import QuickDrawDuelGame from '@/components/games/QuickDrawDuelGame';
import TapRushGame from '@/components/games/TapRushGame';
import RhythmTapGame from '@/components/games/RhythmTapGame';
import MentalMathSpeedGame from '@/components/games/MentalMathSpeedGame';
import DangerPathGame from '@/components/games/DangerPathGame';
import MXIClimberGame from '@/components/games/MXIClimberGame';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

export default function ChallengeGameScreen() {
  const { gameType, challengeId } = useLocalSearchParams<{ gameType: string; challengeId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    if (!challengeId) {
      console.log('⚠️ No challenge ID');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading challenge:', challengeId);

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error) {
        console.error('❌ Error loading challenge:', error);
        throw error;
      }

      console.log('✅ Challenge loaded:', data);
      setChallenge(data);
    } catch (error) {
      console.error('❌ Failed to load challenge:', error);
      Alert.alert('Error', 'Failed to load challenge. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameComplete = async (score: number) => {
    if (!challenge || !user?.id) {
      console.log('⚠️ No challenge or user');
      return;
    }

    try {
      console.log('🎮 Submitting score:', score);

      // Submit score
      const { error: scoreError } = await supabase.from('challenge_scores').upsert({
        challenge_id: challenge.id,
        user_id: user.id,
        user_name: user.name || 'Unknown',
        score: score,
      });

      if (scoreError) {
        console.error('❌ Error submitting score:', scoreError);
        throw scoreError;
      }

      // Update participant score
      const { error: participantError } = await supabase
        .from('challenge_participants')
        .update({ score: score })
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id);

      if (participantError) {
        console.error('❌ Error updating participant:', participantError);
        throw participantError;
      }

      console.log('✅ Score submitted successfully');
      Alert.alert('Score Submitted', `Your score of ${score} has been recorded!`);

      // Check if all players have completed
      const { data: participants, error: participantsError } = await supabase
        .from('challenge_participants')
        .select('score')
        .eq('challenge_id', challenge.id);

      if (participantsError) {
        console.error('❌ Error checking participants:', participantsError);
      } else if (participants && participants.length === challenge.max_players) {
        // All players have scores, complete the challenge
        const allScored = participants.every((p) => p.score > 0);
        if (allScored) {
          const { error: completeError } = await supabase.rpc('complete_challenge', {
            p_challenge_id: challenge.id,
          });

          if (completeError) {
            console.error('❌ Error completing challenge:', completeError);
          } else {
            console.log('✅ Challenge completed');
          }
        }
      }

      // Navigate back
      router.back();
    } catch (error) {
      console.error('❌ Failed to submit score:', error);
      Alert.alert('Error', 'Failed to submit score. Please try again.');
    }
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Game?',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
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

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>Challenge not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gameProps = {
    challengeId: challenge.id,
    onComplete: handleGameComplete,
    onExit: handleExit,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameContainer}>
        {gameType === 'quick_draw_duel' && <QuickDrawDuelGame {...gameProps} />}
        {gameType === 'tap_rush' && <TapRushGame {...gameProps} />}
        {gameType === 'rhythm_tap' && <RhythmTapGame {...gameProps} />}
        {gameType === 'mental_math_speed' && <MentalMathSpeedGame {...gameProps} />}
        {gameType === 'danger_path' && <DangerPathGame {...gameProps} />}
        {gameType === 'mxi_climber' && <MXIClimberGame {...gameProps} />}
      </View>
    </SafeAreaView>
  );
}
