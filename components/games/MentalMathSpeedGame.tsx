
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';

interface MentalMathSpeedGameProps {
  challengeId: string;
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
  problemCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 40,
    marginBottom: 30,
    minWidth: 300,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  problemText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    minWidth: 200,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    minWidth: 200,
  },
  submitButtonText: {
    color: colors.light,
    fontSize: 18,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    minWidth: 200,
  },
  buttonText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 20,
    color: colors.accent,
    marginTop: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  correctText: {
    color: colors.success,
  },
  incorrectText: {
    color: colors.error,
  },
  roundText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 20,
  },
});

export default function MentalMathSpeedGame({ challengeId, onComplete, onExit }: MentalMathSpeedGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const maxRounds = 10;
  const startTimeRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameStarted && !gameEnded && !showResult) {
      generateProblem();
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameStarted, round, showResult]);

  const generateProblem = () => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 50) + 10;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 30;
        num2 = Math.floor(Math.random() * 30) + 10;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 12) + 2;
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
        break;
      default:
        num1 = 0;
        num2 = 0;
        answer = 0;
    }

    setProblem({ num1, num2, operator, answer });
    setUserAnswer('');
    setTimeElapsed(0);
  };

  const handleSubmit = () => {
    if (userAnswer === '') return;

    const correct = parseInt(userAnswer) === problem.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (correct) {
      // Award points based on speed (max 1000 points, decreases with time)
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      const points = Math.max(1000 - Math.floor(timeTaken * 100), 100);
      setScore((prev) => prev + points);
    }

    setTimeout(() => {
      setShowResult(false);
      if (round + 1 >= maxRounds) {
        setGameEnded(true);
      } else {
        setRound((prev) => prev + 1);
      }
    }, 1500);
  };

  const handleStart = () => {
    setGameStarted(true);
    setRound(0);
    setScore(0);
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
        <View style={styles.gameArea}>
          <Text style={styles.instructions}>
            🧮 Mental Math Speed 🧮{'\n\n'}
            Solve math problems as quickly as possible!{'\n\n'}
            You have {maxRounds} problems.{'\n'}
            Faster = higher score!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Challenge</Text>
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
        <View style={styles.gameArea}>
          <Text style={styles.finalScore}>{score}</Text>
          <Text style={styles.instructions}>
            {score > 7000 ? 'Math genius! 🧠' : score > 5000 ? 'Great calculations! 📊' : 'Good effort! ✏️'}
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
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <View style={styles.gameArea}>
        <Text style={styles.roundText}>
          Problem {round + 1} / {maxRounds}
        </Text>
        <View style={styles.problemCard}>
          <Text style={styles.problemText}>
            {problem.num1} {problem.operator} {problem.num2} = ?
          </Text>
          <TextInput
            style={styles.input}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="numeric"
            placeholder="Answer"
            placeholderTextColor={colors.textSecondary}
            autoFocus
            editable={!showResult}
          />
          <Text style={styles.timerText}>{timeElapsed}s</Text>
        </View>
        {!showResult ? (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.resultText, isCorrect ? styles.correctText : styles.incorrectText]}>
            {isCorrect ? '✓ Correct!' : `✗ Wrong! Answer: ${problem.answer}`}
          </Text>
        )}
      </View>
    </View>
  );
}
