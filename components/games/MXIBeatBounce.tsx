
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

const { width, height } = Dimensions.get('window');
const BALL_SIZE = 40;
const TARGET_ZONE_HEIGHT = 80;
const GAME_DURATION = 30; // 30 seconds

interface MXIBeatBounceProps {
  miniBattleId?: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

export default function MXIBeatBounce({ miniBattleId, onComplete, onExit }: MXIBeatBounceProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targetZoneY, setTargetZoneY] = useState(height * 0.5);
  const [speed, setSpeed] = useState(3);
  const [feedback, setFeedback] = useState<string>('');

  const ballY = useRef(new Animated.Value(100)).current;
  const ballX = useRef(new Animated.Value(width / 2 - BALL_SIZE / 2)).current;
  const velocityY = useRef(5);
  const animationRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      startBallAnimation();
      startTimer();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startBallAnimation = () => {
    const animate = () => {
      ballY.setValue((currentY) => {
        let newY = currentY + velocityY.current;
        
        // Bounce off top
        if (newY <= 0) {
          velocityY.current = Math.abs(velocityY.current);
          newY = 0;
        }
        
        // Bounce off bottom
        if (newY >= height - BALL_SIZE - 200) {
          velocityY.current = -Math.abs(velocityY.current);
          newY = height - BALL_SIZE - 200;
        }

        return newY;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const handleTap = () => {
    if (!gameStarted || gameOver) return;

    // Get current ball position
    const currentBallY = (ballY as any)._value;
    const targetTop = targetZoneY - TARGET_ZONE_HEIGHT / 2;
    const targetBottom = targetZoneY + TARGET_ZONE_HEIGHT / 2;

    // Check if ball is in target zone
    if (currentBallY >= targetTop && currentBallY <= targetBottom) {
      // Perfect hit!
      const newScore = score + 10;
      setScore(newScore);
      setFeedback('🎯 Perfect!');
      
      // Increase difficulty
      setSpeed((prev) => Math.min(prev + 0.5, 10));
      velocityY.current = velocityY.current > 0 ? velocityY.current + 0.5 : velocityY.current - 0.5;
      
      // Move target zone
      setTargetZoneY(Math.random() * (height - 300) + 150);
    } else {
      // Miss
      setFeedback('❌ Miss!');
    }

    setTimeout(() => setFeedback(''), 500);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setSpeed(3);
    velocityY.current = 5;
  };

  const endGame = () => {
    setGameOver(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
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
          <Text style={styles.title}>🔊 MXI Beat Bounce</Text>
          <Text style={styles.instructions}>
            A ball bounces on the screen. Tap when it reaches the marked zone!
          </Text>
          <Text style={styles.instructions}>
            - The zone moves after each successful hit
          </Text>
          <Text style={styles.instructions}>
            - The rhythm accelerates as you score
          </Text>
          <Text style={styles.instructions}>
            - You have {GAME_DURATION} seconds
          </Text>
          <Text style={styles.instructions}>
            - Precision + rhythm = high score!
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
    return (
      <View style={styles.container}>
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverTitle}>Game Over!</Text>
          <Text style={styles.finalScore}>Final Score: {score}</Text>
          <Text style={styles.gameOverText}>
            {score >= 100 ? '🏆 Amazing rhythm!' : score >= 50 ? '🎵 Good timing!' : '💪 Keep practicing!'}
          </Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Score</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.gameContainer} 
      activeOpacity={1} 
      onPress={handleTap}
    >
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time</Text>
          <Text style={styles.timerValue}>{timeLeft}s</Text>
        </View>
      </View>

      {feedback !== '' && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Target Zone */}
      <View
        style={[
          styles.targetZone,
          {
            top: targetZoneY - TARGET_ZONE_HEIGHT / 2,
          },
        ]}
      >
        <Text style={styles.targetZoneText}>TAP HERE!</Text>
      </View>

      {/* Bouncing Ball */}
      <Animated.View
        style={[
          styles.ball,
          {
            top: ballY,
            left: ballX,
          },
        ]}
      >
        <Text style={styles.ballEmoji}>⚽</Text>
      </Animated.View>

      <View style={styles.instructionText}>
        <Text style={styles.instructionTextContent}>Tap when the ball is in the zone!</Text>
      </View>
    </TouchableOpacity>
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
    fontSize: 32,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
  },
  feedbackContainer: {
    position: 'absolute',
    top: height * 0.3,
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
  targetZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TARGET_ZONE_HEIGHT,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetZoneText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballEmoji: {
    fontSize: 40,
  },
  instructionText: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionTextContent: {
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
