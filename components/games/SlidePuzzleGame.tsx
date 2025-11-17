
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface SlidePuzzleGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const TILE_SIZE = (width - 80) / GRID_SIZE;

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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    width: GRID_SIZE * TILE_SIZE,
    height: GRID_SIZE * TILE_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 2,
  },
  tile: {
    width: TILE_SIZE - 4,
    height: TILE_SIZE - 4,
    margin: 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyTile: {
    backgroundColor: 'transparent',
  },
  tileText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.light,
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

export default function SlidePuzzleGame({ tournamentId, onComplete, onExit }: SlidePuzzleGameProps) {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  const initializePuzzle = () => {
    // Create solved puzzle
    const solved = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1);
    solved.push(0); // 0 represents empty tile

    // Shuffle
    const shuffled = [...solved];
    for (let i = 0; i < 100; i++) {
      const emptyIndex = shuffled.indexOf(0);
      const validMoves = getValidMoves(emptyIndex, shuffled);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]];
    }

    setTiles(shuffled);
    setMoves(0);
    setStartTime(Date.now());
    setGameStarted(true);
    setGameComplete(false);
  };

  const getValidMoves = (emptyIndex: number, currentTiles: number[]) => {
    const row = Math.floor(emptyIndex / GRID_SIZE);
    const col = emptyIndex % GRID_SIZE;
    const validMoves: number[] = [];

    // Up
    if (row > 0) {
      validMoves.push(emptyIndex - GRID_SIZE);
    }
    // Down
    if (row < GRID_SIZE - 1) {
      validMoves.push(emptyIndex + GRID_SIZE);
    }
    // Left
    if (col > 0) {
      validMoves.push(emptyIndex - 1);
    }
    // Right
    if (col < GRID_SIZE - 1) {
      validMoves.push(emptyIndex + 1);
    }

    return validMoves;
  };

  const handleTilePress = (index: number) => {
    if (!gameStarted || gameComplete) {
      console.log('⚠️ Game not started or already complete');
      return;
    }

    const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidMoves(emptyIndex, tiles);

    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves((prev) => prev + 1);

      // Check if puzzle is solved
      const isSolved = newTiles.every((tile, i) => {
        if (i === newTiles.length - 1) {
          return tile === 0;
        }
        return tile === i + 1;
      });

      if (isSolved) {
        const timeTaken = (Date.now() - startTime) / 1000;
        const score = Math.max(10000 - moves * 100 - timeTaken * 10, 1000);
        setGameComplete(true);
        setTimeout(() => {
          onComplete(Math.round(score));
        }, 1000);
      }
    }
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
            Slide the tiles to arrange them in order!{'\n\n'}
            Fewer moves = higher score!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={initializePuzzle}>
            <Text style={styles.startButtonText}>Start Game</Text>
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
        <Text style={styles.scoreText}>Moves: {moves}</Text>
      </View>
      <View style={styles.gameArea}>
        <View style={styles.grid}>
          {tiles.map((tile, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tile, tile === 0 && styles.emptyTile]}
              onPress={() => handleTilePress(index)}
              disabled={tile === 0}
            >
              {tile !== 0 && <Text style={styles.tileText}>{tile}</Text>}
            </TouchableOpacity>
          ))}
        </View>
        {gameComplete && (
          <Text style={[styles.instructions, { color: colors.success }]}>
            Puzzle Solved! 🎉
          </Text>
        )}
      </View>
    </View>
  );
}
