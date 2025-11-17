
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface QuickDrawDuelGameProps {
  challengeId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  exitButton: {
    padding: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.error,
    textShadowColor: colors.error,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  waitText: {
    fontSize: 32,
    color: colors.textSecondary,
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  tapArea: {
    width: '100%',
    height: 200,
    backgroundColor: colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
  },
  tapAreaActive: {
    borderColor: colors.error,
    backgroundColor: colors.sectionOrange,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    minWidth: 200,
  },
  buttonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  roundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
  },
  reactionTimeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    marginTop: 10,
  },
});

export default function QuickDrawDuelGame({ challengeId, onComplete, onExit }: QuickDrawDuelGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [showFire, setShowFire] = useState(false);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [canTap, setCanTap] = useState(false);
  const maxRounds = 5;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (gameStarted && round < maxRounds && !showFire) {
      startNewRound();
    }
  }, [gameStarted, round]);

  const startNewRound = () => {
    setShowFire(false);
    setCanTap(false);
    setReactionTime(null);

    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;

    setTimeout(() => {
      setShowFire(true);
      setCanTap(true);
      setStartTime(Date.now());

      // Pulse animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  };

  const handleTap = () => {
    if (!canTap) {
      console.log('⚠️ Too early!');
      return;
    }

    const time = Date.now() - startTime;
    setReactionTime(time);
    setCanTap(false);

    // Calculate score (faster = higher score)
    const points = Math.max(1000 - time, 100);
    setTotalScore((prev) => prev + points);

    // Move to next round after showing result
    setTimeout(() => {
      setRound((prev) => prev + 1);
    }, 1500);
  };

  const handleStart = () => {
    setGameStarted(true);
    setRound(0);
    setTotalScore(0);
  };

  const handleFinish = () => {
    onComplete(Math.round(totalScore));
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.gameArea}>
          <Text style={styles.instructions}>
            🔫 Quick Draw Duel 🔫{'\n\n'}
            When you see "FIRE", tap the screen as fast as you can!{'\n\n'}
            You have {maxRounds} rounds.{'\n'}
            Faster reactions = higher score!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Duel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (round >= maxRounds) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.gameArea}>
          <Text style={styles.scoreText}>Final Score: {Math.round(totalScore)}</Text>
          <Text style={styles.instructions}>
            Great reflexes! You completed all {maxRounds} rounds.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleFinish}>
            <Text style={styles.buttonText}>Submit Score</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.scoreText}>Score: {Math.round(totalScore)}</Text>
      </View>
      <View style={styles.gameArea}>
        <Text style={styles.roundText}>
          Round {round + 1} / {maxRounds}
        </Text>
        <TouchableOpacity
          style={[styles.tapArea, showFire && styles.tapAreaActive]}
          onPress={handleTap}
          activeOpacity={0.8}
        >
          {showFire ? (
            <Animated.Text style={[styles.fireText, { transform: [{ scale: scaleAnim }] }]}>
              FIRE! 🔥
            </Animated.Text>
          ) : (
            <Text style={styles.waitText}>Wait...</Text>
          )}
        </TouchableOpacity>
        {reactionTime !== null && (
          <Text style={styles.reactionTimeText}>
            {reactionTime}ms - {reactionTime < 300 ? 'Lightning!' : reactionTime < 500 ? 'Fast!' : 'Good!'}
          </Text>
        )}
      </View>
    </View>
  );
}
