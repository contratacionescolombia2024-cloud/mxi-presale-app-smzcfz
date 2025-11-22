
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
import { MiniBattle } from '@/types/tournaments';
import MXIBeatBounce from '@/components/games/MXIBeatBounce';
import MXIPerfectDistance from '@/components/games/MXIPerfectDistance';
import MXISwipeMaster from '@/components/games/MXISwipeMaster';
import QuickDrawDuelGame from '@/components/games/QuickDrawDuelGame';
import TapRushGame from '@/components/games/TapRushGame';
import RhythmTapGame from '@/components/games/RhythmTapGame';
import MentalMathSpeedGame from '@/components/games/MentalMathSpeedGame';
import DangerPathGame from '@/components/games/DangerPathGame';
import MXIClimberGame from '@/components/games/MXIClimberGame';
import FloorIsLavaGame from '@/components/games/FloorIsLavaGame';

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

export default function MiniBattleGameScreen() {
  const { gameType, miniBattleId } = useLocalSearchParams<{ gameType: string; miniBattleId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [miniBattle, setMiniBattle] = useState<MiniBattle | null>(null);

  useEffect(() => {
    loadMiniBattle();
  }, [miniBattleId]);

  const loadMiniBattle = async () => {
    if (!miniBattleId) {
      console.log('⚠️ No mini battle ID');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎮 Loading mini battle:', miniBattleId);

      const { data, error } = await supabase
        .from('mini_battles')
        .select('*')
        .eq('id', miniBattleId)
        .single();

      if (error) throw error;

      console.log('✅ Mini battle loaded:', data);
      setMiniBattle(data);
    } catch (error) {
      console.error('❌ Failed to load mini battle:', error);
      Alert.alert('Error', 'Failed to load mini battle. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameComplete = async (score: number) => {
    if (!miniBattle || !user?.id) {
      console.log('⚠️ No mini battle or user');
      return;
    }

    try {
      console.log('🎮 Submitting score:', score);

      const { error: scoreError } = await supabase.from('mini_battle_scores').upsert({
        mini_battle_id: miniBattle.id,
        user_id: user.id,
        user_name: user.name || 'Unknown',
        score: score,
      });

      if (scoreError) throw scoreError;

      const { error: participantError } = await supabase
        .from('mini_battle_participants')
        .update({ score: score })
        .eq('mini_battle_id', miniBattle.id)
        .eq('user_id', user.id);

      if (participantError) throw participantError;

      console.log('✅ Score submitted successfully');
      Alert.alert('Score Submitted', `Your score of ${score} has been recorded!`);

      const { data: participants, error: participantsError } = await supabase
        .from('mini_battle_participants')
        .select('score')
        .eq('mini_battle_id', miniBattle.id);

      if (!participantsError && participants && participants.length === miniBattle.max_players) {
        const allScored = participants.every((p) => p.score > 0);
        if (allScored) {
          const { error: completeError } = await supabase.rpc('complete_mini_battle', {
            p_mini_battle_id: miniBattle.id,
          });

          if (completeError) {
            console.error('❌ Error completing mini battle:', completeError);
          } else {
            console.log('✅ Mini battle completed');
          }
        }
      }

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

  if (!miniBattle) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary }}>Mini battle not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gameProps = {
    miniBattleId: miniBattle.id,
    onComplete: handleGameComplete,
    onExit: handleExit,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameContainer}>
        {gameType === 'beat_bounce' && <MXIBeatBounce {...gameProps} />}
        {gameType === 'perfect_distance' && <MXIPerfectDistance {...gameProps} />}
        {gameType === 'swipe_master' && <MXISwipeMaster {...gameProps} />}
        {gameType === 'quick_draw_duel' && <QuickDrawDuelGame {...gameProps} />}
        {gameType === 'tap_rush' && <TapRushGame {...gameProps} />}
        {gameType === 'rhythm_tap' && <RhythmTapGame {...gameProps} />}
        {gameType === 'mental_math_speed' && <MentalMathSpeedGame {...gameProps} />}
        {gameType === 'danger_path' && <DangerPathGame {...gameProps} />}
        {gameType === 'mxi_climber' && <MXIClimberGame {...gameProps} />}
        {gameType === 'floor_is_lava' && <FloorIsLavaGame {...gameProps} />}
      </View>
    </SafeAreaView>
  );
}
