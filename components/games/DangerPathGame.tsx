
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface DangerPathGameProps {
  challengeId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const MAZE_WIDTH = 300;
const MAZE_HEIGHT = 400;
const PLAYER_SIZE = 20;
const PATH_WIDTH = 60;

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
  mazeContainer: {
    width: MAZE_WIDTH,
    height: MAZE_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.error,
  },
  path: {
    position: 'absolute',
    backgroundColor: colors.background,
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  goal: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
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
  distanceText: {
    fontSize: 18,
    color: colors.accent,
    marginTop: 10,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 20,
  },
  gameOverText: {
    fontSize: 24,
    color: colors.error,
    marginBottom: 20,
  },
});

export default function DangerPathGame({ challengeId, onComplete, onExit }: DangerPathGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [distance, setDistance] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const playerPosition = useRef(new Animated.ValueXY({ x: PATH_WIDTH / 2 - PLAYER_SIZE / 2, y: 20 })).current;
  const startTimeRef = useRef(0);

  // Simple maze path (zigzag pattern)
  const paths = [
    { x: 0, y: 0, width: PATH_WIDTH, height: 100 },
    { x: MAZE_WIDTH - PATH_WIDTH, y: 80, width: PATH_WIDTH, height: 100 },
    { x: 0, y: 160, width: PATH_WIDTH, height: 100 },
    { x: MAZE_WIDTH - PATH_WIDTH, y: 240, width: PATH_WIDTH, height: 100 },
    { x: MAZE_WIDTH / 2 - PATH_WIDTH / 2, y: 320, width: PATH_WIDTH, height: 80 },
  ];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (!gameStarted || gameEnded || gameOver) return;

        const newX = gesture.moveX - 20 - PLAYER_SIZE / 2;
        const newY = gesture.moveY - 200 - PLAYER_SIZE / 2;

        // Boundary check
        if (newX < 0 || newX > MAZE_WIDTH - PLAYER_SIZE || newY < 0 || newY > MAZE_HEIGHT - PLAYER_SIZE) {
          handleCollision();
          return;
        }

        // Check if player is on path
        const onPath = paths.some((path) => {
          return (
            newX + PLAYER_SIZE / 2 >= path.x &&
            newX + PLAYER_SIZE / 2 <= path.x + path.width &&
            newY + PLAYER_SIZE / 2 >= path.y &&
            newY + PLAYER_SIZE / 2 <= path.y + path.height
          );
        });

        if (!onPath) {
          handleCollision();
          return;
        }

        playerPosition.setValue({ x: newX, y: newY });
        setDistance(Math.floor(newY));

        // Check if reached goal
        if (newY > MAZE_HEIGHT - 50) {
          handleWin();
        }
      },
    })
  ).current;

  const handleCollision = () => {
    setGameOver(true);
    setGameEnded(true);
  };

  const handleWin = () => {
    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const score = Math.max(5000 - Math.floor(timeTaken * 100), 1000);
    setDistance(score);
    setGameEnded(true);
  };

  const handleStart = () => {
    setGameStarted(true);
    setGameEnded(false);
    setGameOver(false);
    setDistance(0);
    playerPosition.setValue({ x: PATH_WIDTH / 2 - PLAYER_SIZE / 2, y: 20 });
    startTimeRef.current = Date.now();
  };

  const handleFinish = () => {
    onComplete(distance);
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
            🎯 Danger Path 🎯{'\n\n'}
            Navigate through the maze without touching the walls!{'\n\n'}
            Reach the goal as fast as possible!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Challenge</Text>
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
        <View style={styles.gameArea}>
          {gameOver ? (
            <>
              <Text style={styles.gameOverText}>Game Over!</Text>
              <Text style={styles.finalScore}>{distance}</Text>
              <Text style={styles.instructions}>You touched the wall!</Text>
            </>
          ) : (
            <>
              <Text style={styles.finalScore}>{distance}</Text>
              <Text style={styles.instructions}>Perfect navigation! 🎯</Text>
            </>
          )}
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
        <Text style={styles.scoreText}>Distance: {distance}</Text>
      </View>
      <View style={styles.gameArea}>
        <View style={styles.mazeContainer} {...panResponder.panHandlers}>
          {paths.map((path, index) => (
            <View
              key={index}
              style={[
                styles.path,
                {
                  left: path.x,
                  top: path.y,
                  width: path.width,
                  height: path.height,
                },
              ]}
            />
          ))}
          <View style={[styles.goal, { left: MAZE_WIDTH / 2 - 15, top: MAZE_HEIGHT - 40 }]}>
            <IconSymbol name={ICONS.STAR} size={20} color={colors.light} />
          </View>
          <Animated.View
            style={[
              styles.player,
              {
                transform: [{ translateX: playerPosition.x }, { translateY: playerPosition.y }],
              },
            ]}
          />
        </View>
        <Text style={styles.distanceText}>Drag the dot to navigate!</Text>
      </View>
    </View>
  );
}
