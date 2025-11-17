
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface MXIClimberGameProps {
  challengeId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Obstacle {
  id: number;
  position: Animated.Value;
  side: 'left' | 'right';
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const OBSTACLE_SIZE = 60;

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
    paddingTop: 40,
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
    position: 'relative',
    backgroundColor: colors.card,
  },
  mountain: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  climber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
    backgroundColor: colors.error,
    borderRadius: OBSTACLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'transparent',
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 20,
  },
  heightText: {
    fontSize: 20,
    color: colors.accent,
    marginTop: 10,
  },
});

export default function MXIClimberGame({ challengeId, onComplete, onExit }: MXIClimberGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [height, setHeight] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const climberPosition = useRef(new Animated.Value(0)).current;
  const obstacleIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const climbSpeedRef = useRef(0);

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      // Spawn obstacles
      spawnIntervalRef.current = setInterval(() => {
        spawnObstacle();
      }, 1500);

      return () => {
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
        }
      };
    }
  }, [gameStarted, gameEnded]);

  const spawnObstacle = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const position = new Animated.Value(-100);
    const id = obstacleIdRef.current++;

    const newObstacle: Obstacle = { id, position, side };
    setObstacles((prev) => [...prev, newObstacle]);

    // Animate obstacle moving down
    Animated.timing(position, {
      toValue: 800,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      // Remove obstacle when it goes off screen
      setObstacles((prev) => prev.filter((o) => o.id !== id));
    });
  };

  const handleTap = () => {
    if (!gameStarted || gameEnded || gameOver) return;

    // Climb up
    const newHeight = height + 10;
    setHeight(newHeight);
    climbSpeedRef.current = newHeight;

    Animated.spring(climberPosition, {
      toValue: -newHeight / 10,
      useNativeDriver: true,
    }).start();

    // Check collision with obstacles
    checkCollision();
  };

  const checkCollision = () => {
    // Simple collision detection
    const climberY = 400; // Fixed Y position of climber
    
    obstacles.forEach((obstacle) => {
      const obstacleY = (obstacle.position as any)._value;
      
      if (Math.abs(obstacleY - climberY) < 50) {
        // Collision detected
        endGame(true);
      }
    });
  };

  const endGame = (collision: boolean) => {
    setGameOver(collision);
    setGameEnded(true);
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setGameEnded(false);
    setGameOver(false);
    setHeight(0);
    setObstacles([]);
    climberPosition.setValue(0);
  };

  const handleFinish = () => {
    onComplete(height);
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.instructions}>
            ⛰️ MXI Climber ⛰️{'\n\n'}
            Tap repeatedly to climb higher!{'\n\n'}
            Avoid the falling obstacles!{'\n'}
            Climb as high as you can!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Climbing</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameEnded) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.finalScore}>{height}m</Text>
          <Text style={styles.instructions}>
            {gameOver
              ? 'Hit an obstacle! 💥'
              : height > 500
              ? 'Amazing climb! ⛰️'
              : height > 300
              ? 'Great effort! 🏔️'
              : 'Good try! 🧗'}
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
        <Text style={styles.scoreText}>Height: {height}m</Text>
      </View>
      <View style={styles.gameArea}>
        <View style={styles.mountain}>
          {obstacles.map((obstacle) => (
            <Animated.View
              key={obstacle.id}
              style={[
                styles.obstacle,
                {
                  [obstacle.side]: 20,
                  transform: [{ translateY: obstacle.position }],
                },
              ]}
            >
              <IconSymbol name={ICONS.WARNING} size={32} color={colors.light} />
            </Animated.View>
          ))}
          <Animated.View
            style={[
              styles.climber,
              {
                transform: [{ translateY: climberPosition }],
              },
            ]}
          >
            <IconSymbol name={ICONS.PERSON} size={32} color={colors.light} />
          </Animated.View>
        </View>
        <TouchableOpacity style={styles.tapArea} onPress={handleTap} activeOpacity={1}>
          <Text style={styles.heightText}>Tap to Climb!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
