
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface ReactionTestGameProps {
  tournamentId: string;
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
    position: 'relative',
  },
  target: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
  },
  completeButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  completeButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function ReactionTestGame({ tournamentId, onComplete, onExit }: ReactionTestGameProps) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [showTarget, setShowTarget] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const maxRounds = 10;

  useEffect(() => {
    if (gameStarted && round < maxRounds) {
      startNewRound();
    }
  }, [gameStarted, round]);

  const startNewRound = () => {
    // Random delay before showing target
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds

    setTimeout(() => {
      // Random position
      const x = Math.random() * 200 - 100;
      const y = Math.random() * 200 - 100;
      setTargetPosition({ x, y });
      setShowTarget(true);
      setStartTime(Date.now());

      // Animate target appearance
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }, delay);
  };

  const handleTargetPress = () => {
    if (!showTarget) {
      console.log('⚠️ Target not visible');
      return;
    }

    const reactionTime = Date.now() - startTime;
    const points = Math.max(1000 - reactionTime, 100); // Faster = more points

    setScore((prev) => prev + points);
    setShowTarget(false);
    setRound((prev) => prev + 1);

    // Reset animation
    scaleAnim.setValue(0);
  };

  const handleStart = () => {
    setGameStarted(true);
    setRound(0);
    setScore(0);
  };

  const handleComplete = () => {
    onComplete(score);
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
            Tap the target as fast as you can!{'\n\n'}
            You have {maxRounds} rounds.{'\n'}
            Faster reactions = higher score!
          </Text>
          <TouchableOpacity style={styles.completeButton} onPress={handleStart}>
            <Text style={styles.completeButtonText}>Start Game</Text>
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
          <Text style={styles.scoreText}>Final Score: {Math.round(score)}</Text>
          <Text style={styles.instructions}>
            Great job! Your average reaction time was {Math.round((maxRounds * 1000) / score * 100) / 100}ms
          </Text>
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Text style={styles.completeButtonText}>Submit Score</Text>
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
        <Text style={styles.scoreText}>Score: {Math.round(score)}</Text>
      </View>
      <View style={styles.gameArea}>
        {!showTarget && (
          <>
            <Text style={styles.instructions}>Get ready...</Text>
            <Text style={styles.roundText}>
              Round {round + 1} / {maxRounds}
            </Text>
          </>
        )}
        {showTarget && (
          <Animated.View
            style={[
              styles.target,
              {
                transform: [
                  { translateX: targetPosition.x },
                  { translateY: targetPosition.y },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={handleTargetPress}
            >
              <IconSymbol name={ICONS.STAR} size={40} color={colors.light} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
