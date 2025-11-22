
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface CatchItGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  exitButton: {
    padding: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.warning,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  fallingObject: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctObject: {
    backgroundColor: colors.success,
  },
  wrongObject: {
    backgroundColor: colors.error,
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  startButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    margin: 20,
  },
  startButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 100,
  },
});

interface FallingItem {
  id: string;
  x: number;
  y: Animated.Value;
  isCorrect: boolean;
  icon: string;
}

export default function CatchItGame({ tournamentId, onComplete, onExit }: CatchItGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const gameLoopRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const correctIcons = ['star', 'favorite', 'emoji-emotions'];
  const wrongIcons = ['close', 'block', 'warning'];

  useEffect(() => {
    if (gameStarted && !gameOver) {
      startGameLoop();
      startTimer();
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (timeLeft <= 0 && gameStarted) {
      handleGameOver();
    }
  }, [timeLeft]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
  };

  const startGameLoop = () => {
    gameLoopRef.current = setInterval(() => {
      spawnItem();
    }, 1000);
  };

  const spawnItem = () => {
    const isCorrect = Math.random() > 0.4;
    const icons = isCorrect ? correctIcons : wrongIcons;
    const icon = icons[Math.floor(Math.random() * icons.length)];
    
    const newItem: FallingItem = {
      id: Math.random().toString(),
      x: Math.random() * (width - 80) + 20,
      y: new Animated.Value(-50),
      isCorrect,
      icon,
    };

    setFallingItems((prev) => [...prev, newItem]);

    Animated.timing(newItem.y, {
      toValue: height,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setFallingItems((prev) => prev.filter((item) => item.id !== newItem.id));
    });
  };

  const handleItemPress = (item: FallingItem) => {
    if (item.isCorrect) {
      setScore((prev) => prev + 10);
    } else {
      setScore((prev) => Math.max(0, prev - 5));
    }
    setFallingItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setFallingItems([]);
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
        <Text style={styles.instructions}>
          🎯 Catch It!{'\n\n'}
          Tap the CORRECT objects (⭐💚😊){'\n'}
          Avoid the WRONG ones (❌🚫⚠️){'\n\n'}
          +10 points for correct{'\n'}
          -5 points for wrong{'\n\n'}
          You have 30 seconds!
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.gameOverText}>Time&apos;s Up!</Text>
        <Text style={styles.instructions}>Final Score: {score}</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleComplete}>
          <Text style={styles.startButtonText}>Submit Score</Text>
        </TouchableOpacity>
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
        <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
      </View>
      <View style={styles.gameArea}>
        {fallingItems.map((item) => (
          <Animated.View
            key={item.id}
            style={[
              styles.fallingObject,
              item.isCorrect ? styles.correctObject : styles.wrongObject,
              {
                left: item.x,
                transform: [{ translateY: item.y }],
              },
            ]}
          >
            <TouchableOpacity
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={() => handleItemPress(item)}
            >
              <IconSymbol name={item.icon} size={30} color={colors.light} />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
