
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface ReflexBombGameProps {
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
  },
  bomb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  bombSafe: {
    backgroundColor: colors.success,
  },
  bombExploded: {
    backgroundColor: colors.background,
    borderWidth: 5,
    borderColor: colors.error,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.light,
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
    marginTop: 20,
  },
  startButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  roundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 20,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default function ReflexBombGame({ tournamentId, onComplete, onExit }: ReflexBombGameProps) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [explodeTime, setExplodeTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [tappedTime, setTappedTime] = useState<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);
  const maxRounds = 5;

  useEffect(() => {
    if (roundActive && !exploded) {
      startRound();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [roundActive]);

  const startRound = () => {
    const randomTime = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    setExplodeTime(randomTime);
    setTimeLeft(randomTime);
    setTappedTime(null);

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          handleExplode();
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  };

  const handleExplode = () => {
    setExploded(true);
    setRoundActive(false);
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (tappedTime === null) {
      setScore((prev) => Math.max(0, prev - 20));
    }

    setTimeout(() => {
      if (round < maxRounds - 1) {
        setRound((prev) => prev + 1);
        setExploded(false);
        setRoundActive(true);
      } else {
        setGameStarted(false);
      }
    }, 1500);
  };

  const handleBombTap = () => {
    if (!roundActive || exploded || tappedTime !== null) {
      console.log('⚠️ Round not active or already tapped');
      return;
    }

    const timeDiff = explodeTime - timeLeft;
    setTappedTime(timeDiff);

    if (timeDiff < 200) {
      setScore((prev) => prev + 100);
    } else if (timeDiff < 500) {
      setScore((prev) => prev + 50);
    } else if (timeDiff < 1000) {
      setScore((prev) => prev + 25);
    } else {
      setScore((prev) => prev + 10);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setRound(0);
    setScore(0);
    setRoundActive(true);
    setExploded(false);
  };

  const handleComplete = () => {
    onComplete(score);
  };

  if (!gameStarted && round === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.gameArea}>
          <Text style={styles.instructions}>
            💣 Reflex Bomb{'\n\n'}
            Tap the bomb just before it explodes!{'\n\n'}
            Closer to explosion = more points{'\n'}
            Within 0.2s: 100 points{'\n'}
            Within 0.5s: 50 points{'\n'}
            Within 1s: 25 points{'\n'}
            Otherwise: 10 points{'\n\n'}
            Miss the bomb: -20 points{'\n\n'}
            You have {maxRounds} rounds!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!gameStarted && round >= maxRounds) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.gameArea}>
          <Text style={styles.instructions}>
            Game Complete!{'\n\n'}
            Final Score: {score}
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleComplete}>
            <Text style={styles.startButtonText}>Submit Score</Text>
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
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <View style={styles.gameArea}>
        <Text style={styles.instructions}>
          {exploded
            ? tappedTime !== null
              ? `Tapped ${(tappedTime / 1000).toFixed(2)}s before explosion!`
              : 'Too late! Bomb exploded!'
            : 'Tap just before it explodes!'}
        </Text>
        <Animated.View
          style={[
            styles.bomb,
            tappedTime !== null && styles.bombSafe,
            exploded && tappedTime === null && styles.bombExploded,
            {
              transform: [{ scale: roundActive && !exploded ? scaleAnim : 1 }],
            },
          ]}
        >
          <TouchableOpacity
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            onPress={handleBombTap}
            disabled={!roundActive || exploded || tappedTime !== null}
          >
            {exploded && tappedTime === null ? (
              <Text style={[styles.timerText, { color: colors.error }]}>💥</Text>
            ) : tappedTime !== null ? (
              <IconSymbol name="check-circle" size={60} color={colors.light} />
            ) : (
              <Text style={styles.timerText}>{(timeLeft / 1000).toFixed(1)}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.roundText}>
          Round {round + 1} / {maxRounds}
        </Text>
      </View>
    </View>
  );
}
