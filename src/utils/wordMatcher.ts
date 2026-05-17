import { LetterState, MatchResult } from '../types';

export function matchWord(guess: string, answer: string): MatchResult {
  const guessLetters = guess.toUpperCase().split('');
  const answerLetters = answer.toUpperCase().split('');
  const states: LetterState[] = Array(5).fill('absent');

  // Track remaining letters in answer for duplicate handling
  const remaining: (string | null)[] = [...answerLetters];

  // First pass: mark correct positions (green)
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) {
      states[i] = 'correct';
      remaining[i] = null;
    }
  }

  // Second pass: mark present but wrong position (yellow)
  for (let i = 0; i < 5; i++) {
    if (states[i] === 'correct') continue;

    const guessLetter = guessLetters[i];
    const foundIndex = remaining.findIndex(
      (letter) => letter === guessLetter
    );

    if (foundIndex !== -1) {
      states[i] = 'present';
      remaining[foundIndex] = null;
    }
  }

  return {
    letters: guessLetters,
    states,
  };
}
