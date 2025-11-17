
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface FloorIsLavaGameProps {
  tournamentId?: string;
  miniBattleId?: string;
  onComplete: (score: number) => void;
  onExit: () => void;
}

const { width, height } = Dimensions.get('window');
const GRACE_PERIOD = 3; // 3 seconds grace period

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
    paddingTop: 60,
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
    backgroundColor: colors.error,
  },
  platform: {
    position: 'absolute',
    backgroundColor: colors.success,
    borderRadius: 8,
  },
  player: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  graceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  graceText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.light,
  },
  graceSubtext: {
    fontSize: 24,
    color: colors.textSecondary,
    marginTop: 16,
  },
  tapToStartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  tapToStartText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.light,
    textAlign: 'center',
  },
});

interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function FloorIsLavaGame({ tournamentId, miniBattleId, onComplete, onExit }: FloorIsLavaGameProps) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [graceCountdown, setGraceCountdown] = useState(GRACE_PERIOD);
  const [showGraceOverlay, setShowGraceOverlay] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: width / 2 - 20, y: 100 });
  const gameLoopRef = useRef<any>(null);
  const graceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      generatePlatforms();
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (graceTimerRef.current) {
        clearInterval(graceTimerRef.current);
      }
    };
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (timerStarted && !gameOver) {
      startGameLoop();
    }
  }, [timerStarted, gameOver]);

  const generatePlatforms = () => {
    const newPlatforms: Platform[] = [];
    for (let i = 0; i < 8; i++) {
      newPlatforms.push({
        id: Math.random().toString(),
        x: Math.random() * (width - 100),
        y: 100 + i * 80,
        width: 80 + Math.random() * 40,
        height: 20,
      });
    }
    setPlatforms(newPlatforms);
    setPlayerPos({ x: newPlatforms[0].x + 20, y: newPlatforms[0].y - 40 });
  };

  const startGracePeriod = () => {
    setShowGraceOverlay(true);
    setGraceCountdown(GRACE_PERIOD);

    graceTimerRef.current = setInterval(() => {
      setGraceCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(graceTimerRef.current);
          setShowGraceOverlay(false);
          setTimerStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startGameLoop = () => {
    let tickCount = 0;
    gameLoopRef.current = setInterval(() => {
      tickCount++;
      setScore((prev) => prev + 1);
      
      if (tickCount > 10) {
        checkGameOver();
      }
    }, 100);
  };

  const checkGameOver = () => {
    const onPlatform = platforms.some(
      (platform) =>
        playerPos.x + 20 > platform.x &&
        playerPos.x + 20 < platform.x + platform.width &&
        playerPos.y + 40 >= platform.y &&
        playerPos.y + 40 <= platform.y + platform.height
    );

    if (!onPlatform && playerPos.y > 50) {
      handleGameOver();
    }
  };

  const handlePlatformPress = (platform: Platform) => {
    if (gameOver) return;

    // Start timer on first touch
    if (!timerStarted && !showGraceOverlay) {
      startGracePeriod();
    }

    const distance = Math.abs(playerPos.y - (platform.y - 40));
    if (distance < 150) {
      setPlayerPos({ x: platform.x + platform.width / 2 - 20, y: platform.y - 40 });
    }
  };

  const handleGameOver = () => {
    setGameOver(true);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
    }
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setGameOver(false);
    setTimerStarted(false);
    setShowGraceOverlay(false);
    setGraceCountdown(GRACE_PERIOD);
  };

  const handleComplete = () => {
    onComplete(score);
  };

  const handleExitPress = () => {
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExitPress}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.instructions}>
          🔥 Floor is Lava!{'\n\n'}
          Jump between platforms!{'\n'}
          Tap a platform to jump to it{'\n\n'}
          Don&apos;t fall into the lava!{'\n'}
          Survive as long as possible!{'\n\n'}
          Timer starts when you tap the screen{'\n'}
          You get 3 seconds grace period!
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
          <TouchableOpacity style={styles.exitButton} onPress={handleExitPress}>
            <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.instructions}>
          You fell into the lava!{'\n\n'}
          Survival Time: {(score / 10).toFixed(1)}s{'\n'}
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
        <TouchableOpacity style={styles.exitButton} onPress={handleExitPress}>
          <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.scoreText}>
          {timerStarted ? `Time: ${(score / 10).toFixed(1)}s` : 'Ready...'}
        </Text>
      </View>
      <View style={styles.gameArea}>
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={[
              styles.platform,
              {
                left: platform.x,
                top: platform.y,
                width: platform.width,
                height: platform.height,
              },
            ]}
            onPress={() => handlePlatformPress(platform)}
          />
        ))}
        <View
          style={[
            styles.player,
            {
              left: playerPos.x,
              top: playerPos.y,
            },
          ]}
        >
          <IconSymbol name="person" size={24} color={colors.light} />
        </View>

        {!timerStarted && !showGraceOverlay && (
          <View style={styles.tapToStartOverlay}>
            <Text style={styles.tapToStartText}>
              Tap any platform{'\n'}to start the timer!
            </Text>
          </View>
        )}

        {showGraceOverlay && (
          <View style={styles.graceOverlay}>
            <Text style={styles.graceText}>{graceCountdown}</Text>
            <Text style={styles.graceSubtext}>Get Ready!</Text>
          </View>
        )}
      </View>
    </View>
  );
}
