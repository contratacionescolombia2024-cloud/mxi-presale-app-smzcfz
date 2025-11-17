
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface NumberTrackerGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width } = Dimensions.get('window');
const GRID_SIZE = 5;
const CELL_SIZE = (width - 60) / GRID_SIZE;

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
  targetText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cellText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
    marginTop: 20,
  },
  startButtonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.warning,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default function NumberTrackerGame({ tournamentId, onComplete, onExit }: NumberTrackerGameProps) {
  const [score, setScore] = useState(0);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      generateNumbers();
      startTimer();
    }

    return () => {
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

  const generateNumbers = () => {
    const nums = Array.from({ length: 25 }, (_, i) => i + 1);
    const shuffled = nums.sort(() => Math.random() - 0.5);
    setNumbers(shuffled);
  };

  const handleNumberPress = (number: number) => {
    if (number === currentNumber) {
      setScore((prev) => prev + 10);
      setCurrentNumber((prev) => prev + 1);
      
      if (currentNumber === 25) {
        setTimeout(() => {
          handleGameOver();
        }, 100);
      }
    } else {
      setScore((prev) => Math.max(0, prev - 2));
    }
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentNumber(1);
    setTimeLeft(30);
    setGameOver(false);
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
          🔢 Number Tracker{'\n\n'}
          Tap numbers in order from 1 to 25!{'\n\n'}
          +10 points for correct{'\n'}
          -2 points for wrong{'\n\n'}
          Complete all 25 or survive 30 seconds!
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
        <Text style={styles.instructions}>
          {currentNumber > 25 ? 'Perfect! All numbers found!' : 'Time&apos;s Up!'}{'\n\n'}
          Numbers Found: {currentNumber - 1}/25{'\n'}
          Final Score: {score}
        </Text>
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
      <Text style={styles.targetText}>Find: {currentNumber}</Text>
      <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
      <View style={styles.grid}>
        {numbers.map((number, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cell,
              number < currentNumber && { backgroundColor: colors.success, opacity: 0.3 },
            ]}
            onPress={() => handleNumberPress(number)}
            disabled={number < currentNumber}
          >
            <Text style={styles.cellText}>{number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
