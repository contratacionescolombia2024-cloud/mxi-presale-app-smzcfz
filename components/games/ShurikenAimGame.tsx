
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface ShurikenAimGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width, height } = Dimensions.get('window');

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  targetRing: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 3,
  },
  shuriken: {
    position: 'absolute',
    width: 30,
    height: 30,
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
  throwsText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 20,
  },
});

interface ShurikenThrow {
  id: string;
  x: number;
  y: number;
  distance: number;
}

export default function ShurikenAimGame({ tournamentId, onComplete, onExit }: ShurikenAimGameProps) {
  const [score, setScore] = useState(0);
  const [throws, setThrows] = useState<ShurikenThrow[]>([]);
  const [throwsLeft, setThrowsLeft] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleThrow = (event: any) => {
    if (throwsLeft <= 0 || gameOver) {
      console.log('⚠️ No throws left or game over');
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const centerX = width / 2;
    const centerY = height / 2 - 50;
    
    const distance = Math.sqrt(
      Math.pow(locationX - centerX, 2) + Math.pow(locationY - centerY, 2)
    );

    let points = 0;
    if (distance < 30) {
      points = 100; // Bullseye
    } else if (distance < 60) {
      points = 50; // Inner ring
    } else if (distance < 90) {
      points = 25; // Middle ring
    } else if (distance < 120) {
      points = 10; // Outer ring
    }

    setScore((prev) => prev + points);
    setThrows((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        x: locationX,
        y: locationY,
        distance,
      },
    ]);
    setThrowsLeft((prev) => prev - 1);

    if (throwsLeft <= 1) {
      setTimeout(() => {
        setGameOver(true);
      }, 500);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setThrows([]);
    setThrowsLeft(10);
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
          🎯 Shuriken Aim{'\n\n'}
          Tap the target to throw shurikens!{'\n\n'}
          Bullseye (center): 100 points{'\n'}
          Inner ring: 50 points{'\n'}
          Middle ring: 25 points{'\n'}
          Outer ring: 10 points{'\n\n'}
          You have 10 throws!
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
          Game Complete!{'\n\n'}
          Final Score: {score}{'\n'}
          Average: {Math.round(score / 10)} points per throw
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
      <TouchableOpacity style={styles.gameArea} onPress={handleThrow} activeOpacity={1}>
        <View style={styles.target}>
          <View style={[styles.targetRing, { width: 240, height: 240, borderColor: colors.border }]} />
          <View style={[styles.targetRing, { width: 180, height: 180, borderColor: colors.textSecondary }]} />
          <View style={[styles.targetRing, { width: 120, height: 120, borderColor: colors.warning }]} />
          <View style={[styles.targetRing, { width: 60, height: 60, borderColor: colors.error, backgroundColor: colors.error }]} />
          
          {throws.map((throwItem) => (
            <View
              key={throwItem.id}
              style={[
                styles.shuriken,
                {
                  left: throwItem.x - width / 2 + 15,
                  top: throwItem.y - height / 2 + 65,
                },
              ]}
            >
              <IconSymbol name="star" size={30} color={colors.primary} />
            </View>
          ))}
        </View>
        <Text style={styles.throwsText}>Throws Left: {throwsLeft}</Text>
      </TouchableOpacity>
    </View>
  );
}
