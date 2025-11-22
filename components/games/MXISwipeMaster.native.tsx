
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const GAME_DURATION = 30; // 30 seconds

type Direction = 'up' | 'down' | 'left' | 'right';

interface MXISwipeMasterProps {
  miniBattleId?: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const DIRECTION_ARROWS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const DIRECTION_ICONS: Record<Direction, string> = {
  up: 'arrow-upward',
  down: 'arrow-downward',
  left: 'arrow-back',
  right: 'arrow-forward',
};

export default function MXISwipeMaster({ miniBattleId, onComplete, onExit }: MXISwipeMasterProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentDirection, setCurrentDirection] = useState<Direction>('up');
  const [feedback, setFeedback] = useState<string>('');
  const [speed, setSpeed] = useState(2000); // Time to swipe in ms

  useEffect(() => {
    if (gameStarted && !gameOver) {
      startTimer();
      generateNewDirection();
    }
  }, [gameStarted]);

  useEffect(() => {
    if (timeLeft <= 0 && gameStarted) {
      endGame();
    }
  }, [timeLeft]);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateNewDirection = () => {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDirection(randomDirection);
  };

  const handleSwipe = (direction: Direction) => {
    if (!gameStarted || gameOver) return;

    if (direction === currentDirection) {
      // Correct swipe
      const newScore = score + 10;
      setScore(newScore);
      setFeedback('✅ Correct!');
      
      // Increase difficulty every 5 correct swipes
      if (newScore % 50 === 0) {
        setSpeed((prev) => Math.max(prev - 200, 800));
      }
    } else {
      // Wrong swipe
      setErrors((prev) => prev + 1);
      setFeedback('❌ Wrong!');
    }

    setTimeout(() => setFeedback(''), 300);
    generateNewDirection();
  };

  const flingGesture = Gesture.Fling()
    .direction(Gesture.DIRECTION_UP | Gesture.DIRECTION_DOWN | Gesture.DIRECTION_LEFT | Gesture.DIRECTION_RIGHT)
    .onEnd((event) => {
      const { velocityX, velocityY } = event;
      
      // Determine swipe direction based on velocity
      if (Math.abs(velocityX) > Math.abs(velocityY)) {
        // Horizontal swipe
        if (velocityX > 0) {
          handleSwipe('right');
        } else {
          handleSwipe('left');
        }
      } else {
        // Vertical swipe
        if (velocityY > 0) {
          handleSwipe('down');
        } else {
          handleSwipe('up');
        }
      }
    });

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setErrors(0);
    setTimeLeft(GAME_DURATION);
    setSpeed(2000);
  };

  const endGame = () => {
    setGameOver(true);
  };

  const handleSubmit = () => {
    onComplete(score);
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Game?',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onExit },
      ]
    );
  };

  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.instructionsContainer}>
          <Text style={styles.title}>🔥 MXI Swipe Master</Text>
          <Text style={styles.instructions}>
            Figures with arrows will appear on screen.
          </Text>
          <Text style={styles.instructions}>
            Swipe in the correct direction as fast as possible!
          </Text>
          <Text style={styles.instructions}>
            - Swipe up for ↑
          </Text>
          <Text style={styles.instructions}>
            - Swipe down for ↓
          </Text>
          <Text style={styles.instructions}>
            - Swipe left for ←
          </Text>
          <Text style={styles.instructions}>
            - Swipe right for →
          </Text>
          <Text style={styles.instructions}>
            - You have {GAME_DURATION} seconds
          </Text>
          <Text style={styles.instructions}>
            - Speed increases as you score!
          </Text>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameOver) {
    const accuracy = score > 0 ? ((score / (score + errors * 10)) * 100).toFixed(1) : '0';
    
    return (
      <View style={styles.container}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>Game Over!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <Text style={styles.statsText}>Errors: {errors}</Text>
          <Text style={styles.statsText}>Accuracy: {accuracy}%</Text>
          <Text style={styles.gameOverText}>
            {score >= 150 ? '🏆 Swipe Master!' : score >= 100 ? '🔥 Great reflexes!' : '💪 Keep practicing!'}
          </Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Score</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gameContainer}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={styles.timerValue}>{timeLeft}s</Text>
        </View>
        <View style={styles.errorsContainer}>
          <Text style={styles.errorsLabel}>Errors</Text>
          <Text style={styles.errorsValue}>{errors}</Text>
        </View>
      </View>

      {feedback !== '' && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      <GestureDetector gesture={flingGesture}>
        <View style={styles.swipeArea}>
          <View style={styles.directionContainer}>
            <Text style={styles.directionArrow}>{DIRECTION_ARROWS[currentDirection]}</Text>
            <Text style={styles.directionText}>Swipe {currentDirection}!</Text>
          </View>

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Swipe in the direction shown</Text>
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginTop: 32,
    width: 200,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    width: 200,
    alignItems: 'center',
  },
  exitButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  gameContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
  },
  errorsContainer: {
    alignItems: 'center',
  },
  errorsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  errorsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
  },
  feedbackContainer: {
    position: 'absolute',
    top: height * 0.25,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  feedbackText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  swipeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 48,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  directionArrow: {
    fontSize: 120,
    marginBottom: 24,
  },
  directionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  gameOverContainer: {
    padding: 32,
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  gameOverText: {
    fontSize: 20,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    width: 200,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
