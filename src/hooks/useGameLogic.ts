import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameStatus, LetterState } from '../types';
import { matchWord } from '../utils/wordMatcher';
import { getTodaysWord, isValidWord, getRandomWord, markWordAsUsed } from '../utils/wordList';
import { calculateScore } from '../utils/scoring';
import { saveStatistics, saveUsedCustomWord } from '../utils/storage';
import { saveGameState, loadGameState, clearGameState } from '../utils/storage';
import { useKeyboard } from './useKeyboard';
import { useStatistics } from './useStatistics';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const MAX_HINTS = 6;

type Action =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'DELETE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'USE_HINT' }
  | { type: 'SET_GAME_STATE'; state: GameState }
  | { type: 'NEW_GAME'; answer: string }
  | { type: 'LOADED' };

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_LETTER': {
      if (state.currentCol >= WORD_LENGTH || state.gameStatus !== 'playing') {
        return state;
      }
      const newBoard = state.board.map((row) => [...row]);
      newBoard[state.currentRow][state.currentCol] = action.letter;
      return {
        ...state,
        board: newBoard,
        currentCol: state.currentCol + 1,
        currentGuess: state.currentGuess + action.letter,
      };
    }

    case 'DELETE_LETTER': {
      if (state.currentCol <= 0 || state.gameStatus !== 'playing') return state;
      const newBoard = state.board.map((row) => [...row]);
      newBoard[state.currentRow][state.currentCol - 1] = '';
      const newGuess = state.currentGuess.slice(0, -1);
      return {
        ...state,
        board: newBoard,
        currentCol: state.currentCol - 1,
        currentGuess: newGuess,
      };
    }

    case 'USE_HINT': {
      if (state.gameStatus !== 'playing') return state;
      if (state.currentCol >= WORD_LENGTH) return state;
      if (state.hintsUsed >= MAX_HINTS) return state;

      const col = state.currentCol;
      const letter = state.answer[col];
      const newBoard = state.board.map((row) => [...row]);
      newBoard[state.currentRow][col] = letter;
      const newEvaluations = state.evaluations.map((row) => [...row]);
      newEvaluations[state.currentRow][col] = 'correct';

      return {
        ...state,
        board: newBoard,
        currentCol: col + 1,
        currentGuess: state.currentGuess + letter,
        hintsUsed: state.hintsUsed + 1,
        evaluations: newEvaluations,
      };
    }

    case 'SUBMIT_GUESS': {
      if (state.gameStatus !== 'playing') return state;
      if (state.currentCol < WORD_LENGTH) return { ...state, shakeRow: state.currentRow };
      if (!isValidWord(state.currentGuess)) return { ...state, shakeRow: state.currentRow };

      const result = matchWord(state.currentGuess, state.answer);
      const newEvaluations = state.evaluations.map((row) => [...row]);
      newEvaluations[state.currentRow] = result.states;

      const won = result.states.every((s) => s === 'correct');
      const newRow = state.currentRow + 1;
      const gameStatus: GameStatus = won
        ? 'won'
        : newRow >= MAX_ATTEMPTS
        ? 'lost'
        : 'playing';

      return {
        ...state,
        evaluations: newEvaluations,
        currentRow: newRow,
        currentCol: 0,
        currentGuess: '',
        gameStatus,
        shakeRow: -1,
      };
    }

    case 'SET_GAME_STATE': {
      return action.state;
    }

    case 'NEW_GAME': {
      return {
        board: Array(MAX_ATTEMPTS)
          .fill(null)
          .map(() => Array(WORD_LENGTH).fill('')),
        currentRow: 0,
        currentCol: 0,
        answer: action.answer,
        gameStatus: 'playing',
        evaluations: Array(MAX_ATTEMPTS)
          .fill(null)
          .map(() => Array(WORD_LENGTH).fill('empty' as LetterState)),
        currentGuess: '',
        hardMode: state.hardMode,
        shakeRow: -1,
        hintsUsed: 0,
      };
    }

    case 'LOADED': {
      return { ...state, shakeRow: -1 };
    }

    default:
      return state;
  }
}

interface UseGameLogicReturn {
  state: GameState;
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => void;
  useHint: () => void;
  newGame: () => void;
  setGameTime: (time: number) => void;
  keyStates: Record<string, LetterState>;
  updateKeyState: (letter: string, state: LetterState) => void;
  resetKeyboard: () => void;
  stats: ReturnType<typeof useStatistics>['stats'];
  statsLoaded: boolean;
  recordGame: (won: boolean, guesses: number) => void;
  resetStats: () => void;
  shakeRow: number;
}

export function useGameLogic(customAnswer?: string): UseGameLogicReturn {
  const initialAnswer = customAnswer ?? getTodaysWord();
  const [state, dispatch] = useReducer(gameReducer, {
    board: Array(MAX_ATTEMPTS)
      .fill(null)
      .map(() => Array(WORD_LENGTH).fill('')),
    currentRow: 0,
    currentCol: 0,
    answer: initialAnswer,
    gameStatus: 'playing',
    evaluations: Array(MAX_ATTEMPTS)
      .fill(null)
      .map(() => Array(WORD_LENGTH).fill('empty' as LetterState)),
    currentGuess: '',
    hardMode: false,
    shakeRow: -1,
    hintsUsed: 0,
  });

  const { keyStates, updateKeyState, resetKeyboard } = useKeyboard();
  const { stats, loaded: statsLoaded, recordGame, resetStats } = useStatistics();
  const gameTimeRef = useRef(0);

  const setGameTime = useCallback((time: number) => {
    gameTimeRef.current = time;
  }, []);

  // Load saved game on mount (skip for custom/pair play games)
  useEffect(() => {
    if (customAnswer) return;
    loadGameState().then((saved) => {
      if (saved && saved.gameStatus === 'playing') {
        dispatch({ type: 'SET_GAME_STATE', state: saved });
      }
    });
  }, [customAnswer]);

  // Save game state on change
  useEffect(() => {
    if (state.gameStatus === 'playing') {
      saveGameState(state).catch((e) => console.error('Save failed:', e));
    } else {
      // Game is won or lost
      clearGameState().catch((e) => console.error('Clear failed:', e));
    }
  }, [state]);

  // Update keyboard states when evaluations change
  useEffect(() => {
    for (let row = 0; row <= state.currentRow; row++) {
      const rowEval = state.evaluations[row];
      if (!rowEval) continue;
      for (let col = 0; col < WORD_LENGTH; col++) {
        const letter = state.board[row][col];
        if (letter && rowEval[col] !== 'empty' && rowEval[col] !== 'tbd') {
          updateKeyState(letter, rowEval[col]);
        }
      }
    }
  }, [state.evaluations, state.currentRow, state.board, updateKeyState]);

  // Handle game end
  const prevStatusRef = useRef(state.gameStatus);
  useEffect(() => {
    if (prevStatusRef.current === 'playing' && state.gameStatus !== 'playing') {
      const won = state.gameStatus === 'won';
      const score = calculateScore({ won, guesses: state.currentRow, time: gameTimeRef.current, hintsUsed: state.hintsUsed });
      recordGame(won, state.currentRow, gameTimeRef.current, score);

      markWordAsUsed(state.answer);
      saveUsedCustomWord(state.answer).catch(() => {});
    }
    prevStatusRef.current = state.gameStatus;
  }, [state.gameStatus, state.currentRow, recordGame, state.hintsUsed, state.answer]);

  const addLetter = useCallback(
    (letter: string) => dispatch({ type: 'ADD_LETTER', letter }),
    []
  );

  const deleteLetter = useCallback(
    () => dispatch({ type: 'DELETE_LETTER' }),
    []
  );

  const submitGuess = useCallback(
    () => dispatch({ type: 'SUBMIT_GUESS' }),
    []
  );

  const useHint = useCallback(
    () => dispatch({ type: 'USE_HINT' }),
    []
  );

  const newGame = useCallback(() => {
    const nextAnswer = customAnswer ?? getRandomWord();
    dispatch({ type: 'NEW_GAME', answer: nextAnswer });
    resetKeyboard();
  }, [customAnswer, resetKeyboard]);

  return {
    state,
    addLetter,
    deleteLetter,
    submitGuess,
    useHint,
    newGame,
    setGameTime,
    keyStates,
    updateKeyState,
    resetKeyboard,
    stats,
    statsLoaded,
    recordGame,
    resetStats,
    shakeRow: state.shakeRow ?? -1,
  };
}
