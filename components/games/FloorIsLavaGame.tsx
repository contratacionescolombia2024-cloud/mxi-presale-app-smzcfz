
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface FloorIsLavaGameProps {
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
});

interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function FloorIsLavaGame({ tournamentId, onComplete, onExit }: FloorIsLavaGameProps) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [playerPos, setPlayerPos] = useState({ x: width / 2 - 20, y: 100 });
  const gameLoopRef = useRef<any>(null);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      generatePlatforms();
      startGameLoop();
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver]);

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

  const startGameLoop = () => {
    let tickCount = 0;
    gameLoopRef.current = setInterval(() => {
      tickCount++;
      setScore((prev) => prev + 1);
      
      // Only check game over after 1 second to give player time to start
      if (tickCount > 10) {
        checkGameOver();
      }
    }, 100);
  };

  const checkGameOver = () => {
    // Check if player is on any platform
    const onPlatform = platforms.some(
      (platform) =>
        playerPos.x + 20 > platform.x &&
        playerPos.x + 20 < platform.x + platform.width &&
        playerPos.y + 40 >= platform.y &&
        playerPos.y + 40 <= platform.y + platform.height
    );

    // Only trigger game over if not on platform and player has moved from initial position
    if (!onPlatform && playerPos.y > 50) {
      handleGameOver();
    }
  };

  const handlePlatformPress = (platform: Platform) => {
    if (gameOver) {
      console.log('⚠️ Game over');
      return;
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
  };

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
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
          🔥 Floor is Lava!{'\n\n'}
          Jump between platforms!{'\n'}
          Tap a platform to jump to it{'\n\n'}
          Don&apos;t fall into the lava!{'\n'}
          Survive as long as possible!
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
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <IconSymbol name={ICONS.CLOSE} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.scoreText}>Time: {(score / 10).toFixed(1)}s</Text>
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
      </View>
    </View>
  );
}
