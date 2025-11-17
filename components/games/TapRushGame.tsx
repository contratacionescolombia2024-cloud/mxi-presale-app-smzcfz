
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface TapRushGameProps {
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
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapButton: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  tapButtonActive: {
    backgroundColor: colors.secondary,
  },
  tapCount: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.light,
  },
  tapLabel: {
    fontSize: 18,
    color: colors.light,
    marginTop: 8,
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
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
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 20,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default function TapRushGame({ challengeId, onComplete, onExit }: TapRushGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameStarted, gameEnded]);

  const endGame = () => {
    setGameEnded(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleTap = () => {
    if (!gameStarted || gameEnded) return;

    setTapCount((prev) => prev + 1);

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStart = () => {
    setGameStarted(true);
    setTapCount(0);
    setTimeLeft(10);
    setGameEnded(false);
  };

  const handleFinish = () => {
    onComplete(tapCount);
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
            ⚡ Tap Rush ⚡{'\n\n'}
            Tap the button as many times as you can in 10 seconds!{'\n\n'}
            Speed and endurance are key!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Rush</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameEnded) {
    const tapsPerSecond = (tapCount / 10).toFixed(1);
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.gameArea}>
          <Text style={styles.scoreText}>{tapCount} Taps!</Text>
          <Text style={styles.resultText}>
            {tapsPerSecond} taps per second{'\n\n'}
            {tapCount > 100 ? 'Incredible speed! 🔥' : tapCount > 70 ? 'Great job! 💪' : 'Good effort! 👍'}
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
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>
      <View style={styles.gameArea}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.tapButton, timeLeft <= 3 && styles.tapButtonActive]}
            onPress={handleTap}
            activeOpacity={0.8}
          >
            <Text style={styles.tapCount}>{tapCount}</Text>
            <Text style={styles.tapLabel}>TAPS</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
