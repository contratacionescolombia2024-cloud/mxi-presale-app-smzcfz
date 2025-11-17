
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import { colors } from '@/styles/commonStyles';

const { width, height } = Dimensions.get('window');
const DOT_SIZE = 20;
const ROUNDS = 5;

interface MXIPerfectDistanceProps {
  miniBattleId?: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

export default function MXIPerfectDistance({ miniBattleId, onComplete, onExit }: MXIPerfectDistanceProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [targetDistance, setTargetDistance] = useState(0);
  const [blueDotPos, setBlueDotPos] = useState({ x: 0, y: 0 });
  const [redDotPos, setRedDotPos] = useState({ x: 0, y: 0 });
  const [userDotPos, setUserDotPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [roundSubmitted, setRoundSubmitted] = useState(false);
  const [roundScore, setRoundScore] = useState(0);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      startNewRound();
    }
  }, [gameStarted, currentRound]);

  const startNewRound = () => {
    // Generate random positions for blue and red dots
    const blueX = Math.random() * (width - 100) + 50;
    const blueY = Math.random() * (height - 400) + 200;
    setBlueDotPos({ x: blueX, y: blueY });

    const redX = Math.random() * (width - 100) + 50;
    const redY = Math.random() * (height - 400) + 200;
    setRedDotPos({ x: redX, y: redY });

    // Calculate target distance in cm (approximate: 1 cm ≈ 37.8 pixels)
    const pixelDistance = Math.sqrt(Math.pow(redX - blueX, 2) + Math.pow(redY - blueY, 2));
    const cmDistance = pixelDistance / 37.8;
    setTargetDistance(parseFloat(cmDistance.toFixed(1)));

    // Reset user dot to center
    setUserDotPos({ x: width / 2, y: height / 2 });
    setRoundSubmitted(false);
    setRoundScore(0);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    onPanResponderMove: (_, gestureState) => {
      if (!roundSubmitted) {
        setUserDotPos({
          x: Math.max(DOT_SIZE, Math.min(width - DOT_SIZE, gestureState.moveX)),
          y: Math.max(DOT_SIZE + 150, Math.min(height - DOT_SIZE - 150, gestureState.moveY)),
        });
      }
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    const pixelDistance = Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    return pixelDistance / 37.8; // Convert to cm
  };

  const handleSubmit = () => {
    if (roundSubmitted) return;

    const userDistance = calculateDistance(blueDotPos, userDotPos);
    const difference = Math.abs(userDistance - targetDistance);
    
    // Score based on accuracy (max 100 points per round)
    let points = 0;
    if (difference < 0.1) {
      points = 100; // Perfect!
    } else if (difference < 0.5) {
      points = 80;
    } else if (difference < 1.0) {
      points = 60;
    } else if (difference < 2.0) {
      points = 40;
    } else if (difference < 3.0) {
      points = 20;
    }

    setRoundScore(points);
    setScore((prev) => prev + points);
    setRoundSubmitted(true);

    // Move to next round after 2 seconds
    setTimeout(() => {
      if (currentRound < ROUNDS) {
        setCurrentRound((prev) => prev + 1);
      } else {
        endGame();
      }
    }, 2000);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentRound(1);
  };

  const endGame = () => {
    setGameOver(true);
  };

  const handleComplete = () => {
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
          <Text style={styles.title}>📏 MXI Perfect Distance</Text>
          <Text style={styles.instructions}>
            You&apos;ll see a blue dot and a red dot on the screen.
          </Text>
          <Text style={styles.instructions}>
            Drag the yellow dot to place it at exactly the distance shown from the blue dot.
          </Text>
          <Text style={styles.instructions}>
            - {ROUNDS} rounds total
          </Text>
          <Text style={styles.instructions}>
            - Closer = more points
          </Text>
          <Text style={styles.instructions}>
            - Maximum 100 points per round
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
            {score >= 400 ? '🏆 Perfect precision!' : score >= 250 ? '🎯 Great accuracy!' : '💪 Keep practicing!'}
          </Text>

          <TouchableOpacity style={styles.submitButton} onPress={handleComplete}>
            <Text style={styles.submitButtonText}>Submit Score</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const userDistance = calculateDistance(blueDotPos, userDotPos);

  return (
    <View style={styles.gameContainer}>
      <View style={styles.header}>
        <View style={styles.roundContainer}>
          <Text style={styles.roundLabel}>Round</Text>
          <Text style={styles.roundValue}>{currentRound}/{ROUNDS}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.targetContainer}>
        <Text style={styles.targetLabel}>Target Distance:</Text>
        <Text style={styles.targetValue}>{targetDistance} cm</Text>
      </View>

      <View style={styles.currentDistanceContainer}>
        <Text style={styles.currentDistanceLabel}>Your Distance:</Text>
        <Text style={styles.currentDistanceValue}>{userDistance.toFixed(1)} cm</Text>
      </View>

      {roundSubmitted && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>
            {roundScore >= 80 ? '🎯 Excellent!' : roundScore >= 60 ? '👍 Good!' : roundScore >= 40 ? '👌 Not bad!' : '💪 Try again!'}
          </Text>
          <Text style={styles.feedbackScore}>+{roundScore} points</Text>
        </View>
      )}

      <View style={styles.playArea} {...panResponder.panHandlers}>
        {/* Blue Dot (Reference) */}
        <View
          style={[
            styles.dot,
            styles.blueDot,
            { left: blueDotPos.x - DOT_SIZE / 2, top: blueDotPos.y - DOT_SIZE / 2 },
          ]}
        />

        {/* Red Dot (Target reference) */}
        <View
          style={[
            styles.dot,
            styles.redDot,
            { left: redDotPos.x - DOT_SIZE / 2, top: redDotPos.y - DOT_SIZE / 2 },
          ]}
        />

        {/* User Dot (Draggable) */}
        <View
          style={[
            styles.dot,
            styles.userDot,
            { left: userDotPos.x - DOT_SIZE / 2, top: userDotPos.y - DOT_SIZE / 2 },
            isDragging && styles.userDotDragging,
          ]}
        />

        {/* Line from blue to user dot */}
        <View
          style={[
            styles.line,
            {
              left: blueDotPos.x,
              top: blueDotPos.y,
              width: Math.sqrt(
                Math.pow(userDotPos.x - blueDotPos.x, 2) + Math.pow(userDotPos.y - blueDotPos.y, 2)
              ),
              transform: [
                {
                  rotate: `${Math.atan2(userDotPos.y - blueDotPos.y, userDotPos.x - blueDotPos.x)}rad`,
                },
              ],
            },
          ]}
        />
      </View>

      {!roundSubmitted && (
        <TouchableOpacity style={styles.submitRoundButton} onPress={handleSubmit}>
          <Text style={styles.submitRoundButtonText}>Submit</Text>
        </TouchableOpacity>
      )}
    </View>
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
  roundContainer: {
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  roundValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
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
  targetContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  targetLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  targetValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent,
  },
  currentDistanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentDistanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currentDistanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  feedbackScore: {
    fontSize: 20,
    color: colors.primary,
  },
  playArea: {
    flex: 1,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  blueDot: {
    backgroundColor: colors.primary,
  },
  redDot: {
    backgroundColor: colors.error,
  },
  userDot: {
    backgroundColor: '#FCD34D',
    borderWidth: 2,
    borderColor: colors.text,
  },
  userDotDragging: {
    transform: [{ scale: 1.2 }],
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  submitRoundButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    margin: 20,
    alignItems: 'center',
  },
  submitRoundButtonText: {
    color: colors.light,
    fontSize: 18,
    fontWeight: 'bold',
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
