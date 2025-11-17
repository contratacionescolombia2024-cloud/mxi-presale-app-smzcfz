
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface SpaceshipSurvivalGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  exitButton: {
    padding: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceship: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meteorite: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: colors.error,
    borderRadius: 15,
  },
  instructions: {
    fontSize: 18,
    color: colors.light,
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
    color: colors.error,
    textAlign: 'center',
  },
});

interface Meteorite {
  id: number;
  x: Animated.Value;
  y: number;
}

export default function SpaceshipSurvivalGame({
  tournamentId,
  onComplete,
  onExit,
}: SpaceshipSurvivalGameProps) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [meteorites, setMeteorites] = useState<Meteorite[]>([]);
  const spaceshipX = useRef(new Animated.Value(width / 2 - 20)).current;
  const spaceshipY = useRef(new Animated.Value(height - 100)).current;
  const gameLoopRef = useRef<any>(null);
  const meteoriteIdRef = useRef(0);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      startGameLoop();
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  const startGameLoop = () => {
    // Spawn meteorites
    const spawnInterval = setInterval(() => {
      spawnMeteorite();
    }, 1000);

    // Update score
    gameLoopRef.current = setInterval(() => {
      setScore((prev) => prev + 10);
      checkCollisions();
    }, 100);

    return () => {
      clearInterval(spawnInterval);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  };

  const spawnMeteorite = () => {
    const x = new Animated.Value(Math.random() * (width - 30));
    const newMeteorite: Meteorite = {
      id: meteoriteIdRef.current++,
      x: x,
      y: -30,
    };

    setMeteorites((prev) => [...prev, newMeteorite]);

    // Animate meteorite falling
    Animated.timing(x, {
      toValue: Math.random() * (width - 30),
      duration: 3000,
      useNativeDriver: true,
    }).start();
  };

  const checkCollisions = () => {
    // Simple collision detection
    // In a real game, you'd want more sophisticated collision detection
    setMeteorites((prev) => {
      return prev.filter((meteorite) => {
        // Remove meteorites that are off screen
        return meteorite.y < height + 30;
      });
    });
  };

  const handleMove = (direction: 'left' | 'right') => {
    if (gameOver) {
      console.log('⚠️ Game over');
      return;
    }

    const currentX = (spaceshipX as any)._value;
    const newX = direction === 'left' ? Math.max(0, currentX - 50) : Math.min(width - 40, currentX + 50);

    Animated.spring(spaceshipX, {
      toValue: newX,
      useNativeDriver: true,
    }).start();
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
    setMeteorites([]);
    spaceshipX.setValue(width / 2 - 20);
  };

  const handleComplete = () => {
    onComplete(score);
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.light} />
          </TouchableOpacity>
        </View>
        <Text style={styles.instructions}>
          Dodge the meteorites!{'\n\n'}
          Tap left or right to move.{'\n'}
          Survive as long as possible!
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
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.light} />
          </TouchableOpacity>
        </View>
        <Text style={styles.gameOverText}>Game Over!</Text>
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
          <IconSymbol name={ICONS.CLOSE} size={24} color={colors.light} />
        </TouchableOpacity>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <View style={styles.gameArea}>
        <Animated.View
          style={[
            styles.spaceship,
            {
              transform: [{ translateX: spaceshipX }, { translateY: spaceshipY }],
            },
          ]}
        >
          <IconSymbol name="rocket-launch" size={40} color={colors.secondary} />
        </Animated.View>
        {meteorites.map((meteorite) => (
          <Animated.View
            key={meteorite.id}
            style={[
              styles.meteorite,
              {
                top: meteorite.y,
                transform: [{ translateX: meteorite.x }],
              },
            ]}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 20 }}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleMove('left')}
        >
          <Text style={styles.startButtonText}>← Left</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => handleMove('right')}
        >
          <Text style={styles.startButtonText}>Right →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
