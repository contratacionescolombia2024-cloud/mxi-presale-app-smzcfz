
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface SnakeRetroGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width } = Dimensions.get('window');
const GRID_SIZE = 20;
const CELL_SIZE = (width - 40) / GRID_SIZE;

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
  grid: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    position: 'relative',
  },
  cell: {
    position: 'absolute',
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    borderRadius: 2,
  },
  snakeCell: {
    backgroundColor: colors.secondary,
  },
  foodCell: {
    backgroundColor: colors.error,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: colors.card,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  startButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
});

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

export default function SnakeRetroGame({ tournamentId, onComplete, onExit }: SnakeRetroGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef<any>(null);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        moveSnake();
      }, 150);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, snake, direction]);

  const moveSnake = () => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      let newHead: Position;

      switch (direction) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check collision with walls
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        handleGameOver();
        return prevSnake;
      }

      // Check collision with self
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 100);
        spawnFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  const spawnFood = (currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));

    setFood(newFood);
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };

  const handleDirectionChange = (newDirection: Direction) => {
    // Prevent reversing direction
    if (
      (direction === 'UP' && newDirection === 'DOWN') ||
      (direction === 'DOWN' && newDirection === 'UP') ||
      (direction === 'LEFT' && newDirection === 'RIGHT') ||
      (direction === 'RIGHT' && newDirection === 'LEFT')
    ) {
      return;
    }

    setDirection(newDirection);
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection('RIGHT');
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
            Classic Snake game!{'\n\n'}
            Eat the food to grow longer.{'\n'}
            Don&apos;t hit the walls or yourself!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
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
        <View style={styles.gameArea}>
          <Text style={styles.scoreText}>Game Over!</Text>
          <Text style={styles.instructions}>
            Final Score: {score}{'\n'}
            Snake Length: {snake.length}
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
        <View style={styles.grid}>
          {snake.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.cell,
                styles.snakeCell,
                {
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                },
              ]}
            />
          ))}
          <View
            style={[
              styles.cell,
              styles.foodCell,
              {
                left: food.x * CELL_SIZE + 1,
                top: food.y * CELL_SIZE + 1,
              },
            ]}
          />
        </View>
        <View style={styles.controls}>
          <View style={{ width: 60 }} />
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDirectionChange('UP')}
          >
            <IconSymbol name="arrow-upward" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ width: 60 }} />
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDirectionChange('LEFT')}
          >
            <IconSymbol name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDirectionChange('DOWN')}
          >
            <IconSymbol name="arrow-downward" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleDirectionChange('RIGHT')}
          >
            <IconSymbol name="arrow-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
