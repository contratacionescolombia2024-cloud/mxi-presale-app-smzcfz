
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface JumpTimeGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width } = Dimensions.get('window');

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
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  player: {
    position: 'absolute',
    bottom: 4,
    left: 50,
    width: 40,
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacle: {
    position: 'absolute',
    bottom: 4,
    width: 30,
    height: 50,
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
  jumpArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default function JumpTimeGame({ tournamentId, onComplete, onExit }: JumpTimeGameProps) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const playerY = useRef(new Animated.Value(0)).current;
  const obstacleX = useRef(new Animated.Value(width)).current;
  const gameLoopRef = useRef<any>(null);

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
    // Move obstacle
    Animated.loop(
      Animated.timing(obstacleX, {
        toValue: -50,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Check collision
    gameLoopRef.current = setInterval(() => {
      checkCollision();
      setScore((prev) => prev + 1);
    }, 100);
  };

  const checkCollision = () => {
    // Simple collision detection
    const playerLeft = 50;
    const playerRight = 90;
    const playerBottom = isJumping ? 100 : 4;
    const playerTop = playerBottom + 40;

    obstacleX.addListener(({ value }) => {
      const obstacleLeft = value;
      const obstacleRight = value + 30;
      const obstacleTop = 54;

      if (
        playerRight > obstacleLeft &&
        playerLeft < obstacleRight &&
        playerBottom < obstacleTop
      ) {
        // Collision detected
        handleGameOver();
      }

      // Reset obstacle position
      if (value < -50) {
        obstacleX.setValue(width);
      }
    });
  };

  const handleJump = () => {
    if (isJumping || gameOver) {
      console.log('⚠️ Already jumping or game over');
      return;
    }

    setIsJumping(true);

    Animated.sequence([
      Animated.timing(playerY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(playerY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsJumping(false);
    });
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
    obstacleX.setValue(width);
    playerY.setValue(0);
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
          Tap anywhere to jump over obstacles!{'\n\n'}
          Survive as long as possible.{'\n'}
          Your score increases over time.
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
          <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <TouchableOpacity style={styles.gameArea} onPress={handleJump} activeOpacity={1}>
        <View style={styles.ground} />
        <Animated.View
          style={[
            styles.player,
            {
              transform: [{ translateY: playerY }],
            },
          ]}
        >
          <IconSymbol name={ICONS.PERSON} size={24} color={colors.light} />
        </Animated.View>
        <Animated.View
          style={[
            styles.obstacle,
            {
              transform: [{ translateX: obstacleX }],
            },
          ]}
        />
        <View style={styles.jumpArea} />
      </TouchableOpacity>
    </View>
  );
}
