
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface WhisperChallengeGameProps {
  tournamentId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

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
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  volumeMeter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 5,
  },
  volumeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  volumeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
    marginTop: 20,
  },
  buttonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default function WhisperChallengeGame({ tournamentId, onComplete, onExit }: WhisperChallengeGameProps) {
  const [score, setScore] = useState(0);
  const [volume, setVolume] = useState(50);
  const [gameStarted, setGameStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    let interval: any;
    if (recording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        simulateVolumeReading();
      }, 1000);
    } else if (timeLeft === 0 && recording) {
      handleStopRecording();
    }
    return () => clearInterval(interval);
  }, [recording, timeLeft]);

  const simulateVolumeReading = () => {
    const randomVolume = Math.floor(Math.random() * 30) + 10;
    setVolume(randomVolume);
    
    if (randomVolume > 0 && randomVolume < 20) {
      setScore((prev) => prev + 10);
    }
  };

  const handleStartRecording = () => {
    Alert.alert(
      'Microphone Access',
      'This is a simulated whisper challenge. In a real implementation, microphone access would be required.',
      [
        {
          text: 'OK',
          onPress: () => {
            setRecording(true);
            setTimeLeft(10);
            setScore(0);
          },
        },
      ]
    );
  };

  const handleStopRecording = () => {
    setRecording(false);
    setGameStarted(false);
  };

  const handleStart = () => {
    setGameStarted(true);
    handleStartRecording();
  };

  const handleComplete = () => {
    onComplete(score);
  };

  if (!gameStarted && !recording) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.gameArea}>
          <Text style={styles.instructions}>
            🤫 Whisper Challenge{'\n\n'}
            Speak as quietly as possible!{'\n\n'}
            Keep your voice low but not silent{'\n'}
            Volume between 1-20 = points{'\n'}
            Volume 0 or above 20 = no points{'\n\n'}
            You have 10 seconds!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Challenge</Text>
          </TouchableOpacity>
          <Text style={styles.warningText}>
            Note: This is a simulated version.{'\n'}
            Real implementation requires microphone access.
          </Text>
        </View>
      </View>
    );
  }

  if (!recording && gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.gameArea}>
          <Text style={styles.instructions}>
            Challenge Complete!{'\n\n'}
            Final Score: {score}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleComplete}>
            <Text style={styles.buttonText}>Submit Score</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const volumeColor = volume === 0 ? colors.error : volume < 20 ? colors.success : colors.warning;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <View style={styles.gameArea}>
        <Text style={styles.instructions}>
          Whisper now! Keep it low...{'\n'}
          Time left: {timeLeft}s
        </Text>
        <View style={[styles.volumeMeter, { borderColor: volumeColor }]}>
          <Text style={[styles.volumeText, { color: volumeColor }]}>{volume}</Text>
          <Text style={styles.volumeLabel}>Volume Level</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleStopRecording}>
          <Text style={styles.buttonText}>Stop Early</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
