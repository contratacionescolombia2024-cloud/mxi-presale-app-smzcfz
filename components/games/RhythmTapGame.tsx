
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface RhythmTapGameProps {
  challengeId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Note {
  id: number;
  lane: number;
  position: Animated.Value;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const NOTE_HEIGHT = 60;
const LANES = 4;
const NOTE_SPEED = 3000; // ms to fall

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
    paddingTop: 40,
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
  lanesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  lane: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    position: 'relative',
  },
  note: {
    position: 'absolute',
    width: '100%',
    height: NOTE_HEIGHT,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hitZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  tapButtons: {
    flexDirection: 'row',
    height: 100,
  },
  tapButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapButtonActive: {
    backgroundColor: colors.sectionPurple,
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 20,
  },
  comboText: {
    fontSize: 20,
    color: colors.accent,
    marginTop: 10,
  },
});

export default function RhythmTapGame({ challengeId, onComplete, onExit }: RhythmTapGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeLanes, setActiveLanes] = useState<boolean[]>([false, false, false, false]);
  const noteIdRef = useRef(0);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimeRef = useRef(0);
  const maxGameTime = 30; // 30 seconds

  useEffect(() => {
    if (gameStarted && !gameEnded) {
      // Spawn notes periodically
      spawnIntervalRef.current = setInterval(() => {
        spawnNote();
        gameTimeRef.current += 1;

        if (gameTimeRef.current >= maxGameTime) {
          endGame();
        }
      }, 800);

      return () => {
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
        }
      };
    }
  }, [gameStarted, gameEnded]);

  const spawnNote = () => {
    const lane = Math.floor(Math.random() * LANES);
    const position = new Animated.Value(0);
    const id = noteIdRef.current++;

    const newNote: Note = { id, lane, position };
    setNotes((prev) => [...prev, newNote]);

    // Animate note falling
    Animated.timing(position, {
      toValue: SCREEN_HEIGHT,
      duration: NOTE_SPEED,
      useNativeDriver: true,
    }).start(() => {
      // Remove note if it reaches the bottom (missed)
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setCombo(0); // Reset combo on miss
    });
  };

  const handleLaneTap = (lane: number) => {
    if (!gameStarted || gameEnded) return;

    // Visual feedback
    const newActiveLanes = [...activeLanes];
    newActiveLanes[lane] = true;
    setActiveLanes(newActiveLanes);
    setTimeout(() => {
      setActiveLanes((prev) => {
        const updated = [...prev];
        updated[lane] = false;
        return updated;
      });
    }, 100);

    // Check if there's a note in the hit zone for this lane
    const hitZoneTop = SCREEN_HEIGHT - 200;
    const hitZoneBottom = SCREEN_HEIGHT - 100;

    const hitNote = notes.find((note) => {
      if (note.lane !== lane) return false;
      const notePosition = (note.position as any)._value;
      return notePosition >= hitZoneTop && notePosition <= hitZoneBottom;
    });

    if (hitNote) {
      // Hit!
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 100 + newCombo * 10; // Combo multiplier
      setScore((prev) => prev + points);
      setNotes((prev) => prev.filter((n) => n.id !== hitNote.id));
    } else {
      // Miss
      setCombo(0);
    }
  };

  const endGame = () => {
    setGameEnded(true);
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setCombo(0);
    setNotes([]);
    gameTimeRef.current = 0;
  };

  const handleFinish = () => {
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
        <View style={styles.centerContent}>
          <Text style={styles.instructions}>
            🎵 Rhythm Tap 🎵{'\n\n'}
            Tap the lanes when notes reach the hit zone!{'\n\n'}
            Build combos for higher scores!{'\n'}
            Game lasts 30 seconds.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Game</Text>
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
        <View style={styles.centerContent}>
          <Text style={styles.finalScore}>{score}</Text>
          <Text style={styles.instructions}>
            {score > 3000 ? 'Perfect rhythm! 🎵' : score > 2000 ? 'Great performance! 🎶' : 'Good effort! 🎼'}
          </Text>
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
        <View>
          <Text style={styles.scoreText}>Score: {score}</Text>
          {combo > 0 && <Text style={styles.comboText}>Combo: {combo}x</Text>}
        </View>
      </View>
      <View style={styles.gameArea}>
        <View style={styles.lanesContainer}>
          {[0, 1, 2, 3].map((lane) => (
            <View key={lane} style={styles.lane}>
              {notes
                .filter((note) => note.lane === lane)
                .map((note) => (
                  <Animated.View
                    key={note.id}
                    style={[
                      styles.note,
                      {
                        transform: [{ translateY: note.position }],
                      },
                    ]}
                  >
                    <IconSymbol name={ICONS.STAR} size={32} color={colors.light} />
                  </Animated.View>
                ))}
            </View>
          ))}
        </View>
        <View style={styles.hitZone} />
        <View style={styles.tapButtons}>
          {[0, 1, 2, 3].map((lane) => (
            <TouchableOpacity
              key={lane}
              style={[styles.tapButton, activeLanes[lane] && styles.tapButtonActive]}
              onPress={() => handleLaneTap(lane)}
              activeOpacity={0.8}
            >
              <IconSymbol name={ICONS.ARROW_UP} size={32} color={colors.text} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
