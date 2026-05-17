import React from 'react';
import { View } from 'react-native';
import { Key } from './Key';
import { keyboardRows } from '../utils/constants';
import type { LetterState } from '../types';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyStates: Record<string, LetterState>;
}

export function Keyboard({ onKeyPress, keyStates }: KeyboardProps) {
  return (
    <View style={{ alignSelf: 'stretch', paddingHorizontal: 4 }}>
      {keyboardRows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 6,
          }}
        >
          {row.map((key) => (
            <Key
              key={key}
              label={key}
              onPress={onKeyPress}
              state={keyStates[key] || ('empty' as LetterState)}
              width={key === 'ENTER' || key === 'BACK' ? 44 : 28}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
