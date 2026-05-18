import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import FadeInView from '../../src/components/FadeInView';
import { useGameLogic } from '../../src/hooks/useGameLogic';
import { GameBoard } from '../../src/components/GameBoard';
import { Keyboard } from '../../src/components/Keyboard';
import { useTheme } from '../../src/contexts/ThemeContext';
import { isValidWord } from '../../src/utils/wordList';
import { calculateScore } from '../../src/utils/scoring';
import { playSound } from '../../src/utils/sounds';
import { getWordMeaning } from '../../src/utils/dictionary';
import type { WordMeaning } from '../../src/utils/dictionary';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { LetterState } from '../../src/types';

export default function GameScreen() {
  const {
    state,
    addLetter,
    deleteLetter,
    submitGuess,
    useHint,
    newGame,
    setGameTime,
    keyStates,
  } = useGameLogic();

  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [meaning, setMeaning] = useState<WordMeaning | null>(null);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showMessage = useCallback((text: string) => {
    Haptics.selectionAsync().catch(() => {});
    setMessage(text);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), 1500);
  }, []);

  // Timer
  useEffect(() => {
    if (state.gameStatus === 'playing') {
      startTimeRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(finalElapsed);
      setGameTime(finalElapsed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.gameStatus === 'playing', setGameTime]);

  // Show result popup
  useEffect(() => {
    if (state.gameStatus === 'won') {
      setTimeout(() => {
        setShowResult(true);
        playSound('win');
        getWordMeaning(state.answer).then(setMeaning);
      }, 1800);
    } else if (state.gameStatus === 'lost') {
      setTimeout(() => {
        setShowResult(true);
        playSound('lose');
        getWordMeaning(state.answer).then(setMeaning);
      }, 1800);
    }
  }, [state.gameStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(() => {
    if (state.currentCol < 5) {
      showMessage('Yetersiz harf');
      return;
    }
    if (!isValidWord(state.currentGuess)) {
      showMessage('Sözlükte yok');
      return;
    }
    submitGuess();
  }, [state.currentCol, state.currentGuess, submitGuess, showMessage]);

  const handleNewGame = useCallback(() => {
    setShowResult(false);
    startTimeRef.current = Date.now();
    setElapsed(0);
    newGame();
  }, [newGame]);

  const handleHint = useCallback(() => {
    if (state.gameStatus !== 'playing') return;
    if (state.currentCol >= 5) {
      showMessage('Bu satır dolu');
      return;
    }
    if (state.hintsUsed >= 6) {
      showMessage('İpucu hakkın kalmadı');
      return;
    }
    useHint();
    playSound('hint');
    showMessage(`💡 İpucu (${state.hintsUsed + 1}/6)`);
  }, [state.gameStatus, state.currentCol, state.hintsUsed, useHint, showMessage]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (key === 'ENTER') {
        handleSubmitRef.current();
      } else if (key === 'BACK') {
        deleteLetterRef.current();
      } else {
        playSound('keypress');
        addLetterRef.current(key);
      }
    },
    []
  );

  // Handle physical keyboard
  const handleSubmitRef = useRef(handleSubmit);
  const handleNewGameRef = useRef(handleNewGame);
  const deleteLetterRef = useRef(deleteLetter);
  const addLetterRef = useRef(addLetter);
  handleSubmitRef.current = handleSubmit;
  handleNewGameRef.current = handleNewGame;
  deleteLetterRef.current = deleteLetter;
  addLetterRef.current = addLetter;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (state.gameStatus === 'won') {
          handleNewGameRef.current();
        } else {
          handleSubmitRef.current();
        }
      } else if (e.key === 'Backspace') {
        deleteLetterRef.current();
      } else if (/^[a-zA-ZçğıöşüÇĞİÖŞÜ]$/.test(e.key)) {
        addLetterRef.current(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.gameStatus]);

  return (
    <FadeInView>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleNewGame} style={styles.headerLeft}>
          <Ionicons name="refresh" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Türkçe Wordle</Text>
        <TouchableOpacity
          onPress={handleHint}
          style={[styles.hintButton, { backgroundColor: colors.keyBackground }]}
          disabled={state.gameStatus !== 'playing' || state.hintsUsed >= 6}
        >
          <Ionicons
            name="bulb"
            size={20}
            color={state.hintsUsed >= 6 ? colors.textSecondary : colors.tileCorrect}
          />
          <Text
            style={[
              styles.hintCount,
              { color: state.hintsUsed >= 6 ? colors.textSecondary : colors.text },
            ]}
          >
            {6 - state.hintsUsed}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.timer, { color: colors.textSecondary }]}>
        {formatTime(elapsed)}
      </Text>

      {messageVisible && (
        <View style={[styles.toast, { backgroundColor: colors.text }]}>
          <Text style={[styles.toastText, { color: colors.background }]}>
            {message}
          </Text>
        </View>
      )}

      <View style={styles.gameArea}>
        <GameBoard
          board={state.board}
          evaluations={state.evaluations as LetterState[][]}
          currentRow={state.currentRow}
        />
      </View>

      <Keyboard onKeyPress={handleKeyPress} keyStates={keyStates} />

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.popup, { backgroundColor: colors.surface }]}>
            <Text style={[styles.popupTitle, { color: colors.text }]}>
              {state.gameStatus === 'won' ? 'Tebrikler!' : 'Kaybettiniz'}
            </Text>
            <Text style={[styles.popupWord, { color: colors.tileCorrect }]}>
              {state.answer}
            </Text>
            <View style={styles.popupStats}>
              <Text style={[styles.popupStat, { color: colors.text }]}>
                Süre: {formatTime(elapsed)}
              </Text>
              <Text style={[styles.popupStat, { color: colors.text }]}>
                Tahmin: {state.currentRow}/6
              </Text>
            </View>
            <Text style={[styles.popupScore, { color: colors.tilePresent }]}>
              Puan: {calculateScore({
                won: state.gameStatus === 'won',
                guesses: state.currentRow,
                time: elapsed,
                hintsUsed: state.hintsUsed,
              })}
            </Text>

            <View style={styles.meaningBox}>
              {meaning ? (
                <>
                  <Text style={[styles.meaningType, { color: colors.textSecondary }]}>
                    {meaning.type.toUpperCase()}
                  </Text>
                  <Text style={[styles.meaningText, { color: colors.text }]}>
                    {meaning.definition}
                  </Text>
                  {meaning.example !== '' && (
                    <Text style={[styles.meaningExample, { color: colors.textSecondary }]}>
                      "{meaning.example}"
                    </Text>
                  )}
                </>
              ) : (
                <Text style={[styles.meaningText, { color: colors.textSecondary }]}>
                  TDK sözlüğünde bulunamadı
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.popupButton, { backgroundColor: colors.tileCorrect }]}
              onPress={handleNewGame}
            >
              <Text style={styles.popupButtonText}>Yeni Oyun</Text>
            </TouchableOpacity>
          </View>
        </View>
        {state.gameStatus === 'won' && (
          <>
            <ConfettiCannon count={120} origin={{ x: 180, y: 300 }} explosionSpeed={2000} fallSpeed={6000} fadeOut autoStart />
            <ConfettiCannon count={120} origin={{ x: 180, y: 300 }} explosionSpeed={2200} fallSpeed={6000} fadeOut autoStart />
          </>
        )}
      </Modal>
    </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 0,
  },
  gameArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  headerLeft: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 13,
    marginBottom: 6,
    fontVariant: ['tabular-nums'],
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  hintCount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  toast: {
    position: 'absolute',
    top: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 100,
  },
  toastText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: 280,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  popupWord: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 16,
  },
  popupStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  popupStat: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  popupScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  popupButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  popupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  meaningBox: {
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  meaningType: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    letterSpacing: 1,
  },
  meaningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  meaningExample: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
});
