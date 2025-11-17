
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface MemorySpeedGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width } = Dimensions.get('window');
const BUTTON_SIZE = (width - 80) / 2;

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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: BUTTON_SIZE * 2 + 20,
    gap: 10,
  },
  colorButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructions: {
    fontSize: 18,
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
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
});

const COLORS = [
  { id: 0, color: '#EF4444', name: 'red' },
  { id: 1, color: '#10B981', name: 'green' },
  { id: 2, color: '#3B82F6', name: 'blue' },
  { id: 3, color: '#F59E0B', name: 'yellow' },
];

export default function MemorySpeedGame({ tournamentId, onComplete, onExit }: MemorySpeedGameProps) {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const generateSequence = (length: number) => {
    const newSequence: number[] = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    return newSequence;
  };

  const showSequence = async (seq: number[]) => {
    setIsShowingSequence(true);
    setUserSequence([]);

    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActiveButton(seq[i]);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActiveButton(null);
    }

    setIsShowingSequence(false);
  };

  const handleButtonPress = (buttonId: number) => {
    if (isShowingSequence || gameOver) {
      console.log('⚠️ Cannot press during sequence or game over');
      return;
    }

    const newUserSequence = [...userSequence, buttonId];
    setUserSequence(newUserSequence);

    // Check if correct
    if (buttonId !== sequence[newUserSequence.length - 1]) {
      // Wrong button
      setGameOver(true);
      const finalScore = (level - 1) * 1000;
      setTimeout(() => {
        onComplete(finalScore);
      }, 1000);
      return;
    }

    // Check if sequence complete
    if (newUserSequence.length === sequence.length) {
      // Level complete
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        const nextSequence = generateSequence(nextLevel);
        setSequence(nextSequence);
        showSequence(nextSequence);
      }, 500);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setLevel(1);
    setGameOver(false);
    const initialSequence = generateSequence(1);
    setSequence(initialSequence);
    showSequence(initialSequence);
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
            Watch the sequence and repeat it!{'\n\n'}
            Each level adds one more step.{'\n'}
            How far can you go?
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
            You reached level {level - 1}!{'\n'}
            Final Score: {(level - 1) * 1000}
          </Text>
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
        <Text style={styles.scoreText}>Level: {level}</Text>
      </View>
      <View style={styles.gameArea}>
        {isShowingSequence && <Text style={styles.levelText}>Watch carefully...</Text>}
        {!isShowingSequence && <Text style={styles.levelText}>Your turn!</Text>}
        <View style={styles.buttonGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color.id}
              style={[
                styles.colorButton,
                {
                  backgroundColor: color.color,
                  opacity: activeButton === color.id ? 1 : 0.5,
                },
              ]}
              onPress={() => handleButtonPress(color.id)}
              disabled={isShowingSequence}
            />
          ))}
        </View>
        <Text style={styles.instructions}>
          {isShowingSequence
            ? 'Memorize the sequence...'
            : `Repeat the sequence (${userSequence.length}/${sequence.length})`}
        </Text>
      </View>
    </View>
  );
}
