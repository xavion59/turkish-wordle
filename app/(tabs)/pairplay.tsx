import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import FadeInView from '../../src/components/FadeInView';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useGameLogic } from '../../src/hooks/useGameLogic';
import { GameBoard } from '../../src/components/GameBoard';
import { Keyboard } from '../../src/components/Keyboard';
import { isValidWord } from '../../src/utils/wordList';
import {
  loadPairPlayStats,
  savePairPlayStats,
  resetPairPlayStats,
} from '../../src/utils/storage';
import { calculateScore } from '../../src/utils/scoring';
import { playSound } from '../../src/utils/sounds';
import { getWordMeaning } from '../../src/utils/dictionary';
import type { WordMeaning } from '../../src/utils/dictionary';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { LetterState, PairPlayStats, PairPlayGameRecord } from '../../src/types';

export default function PairPlayScreen() {
  const { colors } = useTheme();
  const [customWord, setCustomWord] = useState<string | null>(null);
  const [inputWord, setInputWord] = useState('');
  const [inputError, setInputError] = useState('');
  const [pairStats, setPairStats] = useState<PairPlayStats | null>(null);

  useEffect(() => {
    loadPairPlayStats().then(setPairStats);
  }, []);

  const handleGameEnd = useCallback(
    (result: { won: boolean; guesses: number; time: number; hintsUsed: number; score: number }) => {
      setPairStats((prev) => {
        if (!prev) return prev;
        const p = prev.currentPlayer === 1 ? 'player1' : 'player2';
        const record: PairPlayGameRecord = {
          won: result.won,
          time: result.time,
          guesses: result.guesses,
          hintsUsed: result.hintsUsed,
          score: result.score,
        };
        const next = {
          ...prev,
          [p]: [...prev[p], record],
          currentPlayer: (prev.currentPlayer === 1 ? 2 : 1) as 1 | 2,
        };
        savePairPlayStats(next);
        return next;
      });
    },
    []
  );

  const handleResetStats = () => {
    Alert.alert('İstatistikleri Sıfırla', 'Tüm eşli oyun istatistikleri silinecek. Emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sıfırla',
        style: 'destructive',
        onPress: async () => {
          await resetPairPlayStats();
          setPairStats(await loadPairPlayStats());
        },
      },
    ]);
  };

  if (!customWord) {
    return (
      <FadeInView backgroundColor={colors.background}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Eşli Oyun</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          5 harfli bir kelime girin,{'\n'}arkadaşınız bulmaya çalışsın
        </Text>

        {pairStats && (
          <View style={[styles.statsBox, { borderColor: colors.tileBorder }]}>
            <View style={styles.statsRow}>
              <View style={styles.statsPlayer}>
                <Text style={[styles.statsPlayerTitle, { color: colors.text }]}>
                  1. Oyuncu{pairStats.currentPlayer === 1 ? ' ▶' : ''}
                </Text>
                <Text style={[styles.statsLine, { color: colors.textSecondary }]}>
                  Toplam: {pairStats.player1.length} oyun, {pairStats.player1.reduce((s, r) => s + r.score, 0)}p
                </Text>
                {pairStats.player1.map((rec, i) => (
                  <Text key={i} style={[styles.statsLine, { color: colors.textSecondary }]}>
                    {i + 1}. oyun: {rec.time}sn - {rec.guesses}/6 - {rec.score}p
                  </Text>
                ))}
              </View>
              <View style={styles.statsDivider} />
              <View style={styles.statsPlayer}>
                <Text style={[styles.statsPlayerTitle, { color: colors.text }]}>
                  2. Oyuncu{pairStats.currentPlayer === 2 ? ' ▶' : ''}
                </Text>
                <Text style={[styles.statsLine, { color: colors.textSecondary }]}>
                  Toplam: {pairStats.player2.length} oyun, {pairStats.player2.reduce((s, r) => s + r.score, 0)}p
                </Text>
                {pairStats.player2.map((rec, i) => (
                  <Text key={i} style={[styles.statsLine, { color: colors.textSecondary }]}>
                    {i + 1}. oyun: {rec.time}sn - {rec.guesses}/6 - {rec.score}p
                  </Text>
                ))}
              </View>
            </View>
            <TouchableOpacity onPress={handleResetStats} style={styles.resetLink}>
              <Text style={[styles.resetLinkText, { color: colors.textSecondary }]}>
                Sıfırla
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tileRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.tile,
                {
                  backgroundColor: colors.tileEmpty,
                  borderColor: inputError ? colors.tilePresent : colors.tileBorder,
                },
              ]}
            >
              <Text style={[styles.tileLetter, { color: colors.text }]}>
                {inputWord[i] || ''}
              </Text>
            </View>
          ))}
        </View>

        {inputError !== '' && (
          <Text style={[styles.errorText, { color: colors.tilePresent }]}>
            {inputError}
          </Text>
        )}

        <View style={styles.wordEntryKeyboard}>
          <Keyboard
            onKeyPress={(key) => {
              if (key === 'ENTER') {
                const word = inputWord.toUpperCase();
                if (word.length !== 5) {
                  setInputError('5 harfli bir kelime girin');
                  return;
                }
                if (!isValidWord(word)) {
                  setInputError('Sözlükte bulunamadı');
                  return;
                }
                setCustomWord(word);
              } else if (key === 'BACK') {
                setInputWord((prev) => prev.slice(0, -1));
                setInputError('');
              } else {
                playSound('keypress');
                setInputWord((prev) =>
                  (prev + key).toUpperCase().slice(0, 5)
                );
                setInputError('');
              }
            }}
            keyStates={{}}
          />
        </View>
      </View>
    </FadeInView>
    );
  }

  return (
    <PairGameView
      key={customWord}
      customWord={customWord}
      colors={colors}
      player={pairStats?.currentPlayer ?? 1}
      onBack={() => setCustomWord(null)}
      onGameEnd={handleGameEnd}
    />
  );
}

function PairGameView({
  customWord,
  colors,
  player,
  onBack,
  onGameEnd,
}: {
  customWord: string;
  colors: any;
  player: 1 | 2;
  onBack: () => void;
  onGameEnd: (result: { won: boolean; guesses: number; time: number; hintsUsed: number; score: number }) => void;
}) {
  const {
    state,
    addLetter,
    deleteLetter,
    submitGuess,
    useHint,
    keyStates,
  } = useGameLogic(customWord);

  const [message, setMessage] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [meaning, setMeaning] = useState<WordMeaning | null>(null);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameEndedRef = useRef(false);

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), 1500);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.gameStatus === 'playing']);

  // Record stats when game ends
  useEffect(() => {
    if (state.gameStatus !== 'playing' && !gameEndedRef.current) {
      gameEndedRef.current = true;
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const won = state.gameStatus === 'won';
      const guesses = state.currentRow;
      const hintsUsed = state.hintsUsed;
      const score = calculateScore({ won, guesses, time: finalTime, hintsUsed });
      onGameEnd({ won, guesses, time: finalTime, hintsUsed, score });
    }
  }, [state.gameStatus, onGameEnd, state.currentRow, state.hintsUsed]);

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

  const handleSubmitRef = useRef(handleSubmit);
  const deleteLetterRef = useRef(deleteLetter);
  const addLetterRef = useRef(addLetter);
  handleSubmitRef.current = handleSubmit;
  deleteLetterRef.current = deleteLetter;
  addLetterRef.current = addLetter;

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

  return (
    <FadeInView backgroundColor={colors.background}>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerLeft}>
          <Text style={[styles.headerLeftText, { color: colors.text }]}>Yeni Oyun</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {player === 1 ? '1. Oyuncu' : '2. Oyuncu'}
        </Text>
        <TouchableOpacity
          onPress={handleHint}
          style={[styles.hintButton, { backgroundColor: colors.keyBackground }]}
          disabled={state.gameStatus !== 'playing' || state.hintsUsed >= 6}
        >
          <Text
            style={[
              styles.hintCount,
              { color: state.hintsUsed >= 6 ? colors.textSecondary : colors.tileCorrect },
            ]}
          >
            💡{6 - state.hintsUsed}
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
              onPress={onBack}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  statsBox: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsPlayer: {
    alignItems: 'center',
    flex: 1,
  },
  statsPlayerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLine: {
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  statsDivider: {
    width: 1,
    backgroundColor: 'rgba(128,128,128,0.3)',
    marginHorizontal: 8,
  },
  resetLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  resetLinkText: {
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  tileRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tile: {
    width: 65,
    height: 65,
    margin: 3,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLetter: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  wordEntryKeyboard: {
    alignSelf: 'stretch',
    marginTop: 'auto',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerLeftText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hintCount: {
    fontSize: 14,
    fontWeight: 'bold',
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
  timer: {
    fontSize: 13,
    marginBottom: 6,
    fontVariant: ['tabular-nums'],
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
