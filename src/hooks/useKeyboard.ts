import { useState, useCallback, useEffect } from 'react';
import { LetterState } from '../types';

export function useKeyboard() {
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});

  const updateKeyState = useCallback(
    (letter: string, state: LetterState) => {
      setKeyStates((prev) => {
        const current = prev[letter];
        // Don't downgrade from correct
        if (current === 'correct') return prev;
        // Don't downgrade from present to absent
        if (current === 'present' && state === 'absent') return prev;
        return { ...prev, [letter]: state };
      });
    },
    []
  );

  const resetKeyboard = useCallback(() => {
    setKeyStates({});
  }, []);

  return { keyStates, updateKeyState, resetKeyboard };
}
