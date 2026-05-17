export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  board: string[][];
  currentRow: number;
  currentCol: number;
  answer: string;
  gameStatus: GameStatus;
  evaluations: LetterState[][];
  currentGuess: string;
  hardMode: boolean;
  shakeRow: number;
  hintsUsed: number;
}

export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastPlayedDate: string;
  lastWonDate: string;
  bestTimes: number[];
  bestScore: number;
}

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  tileEmpty: string;
  tileBorder: string;
  tileCorrect: string;
  tilePresent: string;
  tileAbsent: string;
  keyBackground: string;
  keyText: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface MatchResult {
  letters: string[];
  states: LetterState[];
}

export interface PairPlayGameRecord {
  won: boolean;
  time: number;
  guesses: number;
  hintsUsed: number;
  score: number;
}

export interface PairPlayStats {
  player1: PairPlayGameRecord[];
  player2: PairPlayGameRecord[];
  currentPlayer: 1 | 2;
}
