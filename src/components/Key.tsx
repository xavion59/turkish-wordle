import React from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';
import { LetterState } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface KeyProps {
  label: string;
  onPress: (key: string) => void;
  state?: LetterState;
  width?: number;
}

export function Key({ label, onPress, state, width = 28 }: KeyProps) {
  const { colors } = useTheme();

  const backgroundColor =
    state === 'correct'
      ? colors.tileCorrect
      : state === 'present'
      ? colors.tilePresent
      : state === 'absent'
      ? colors.tileAbsent
      : colors.keyBackground;

  const textColor =
    state === 'correct' || state === 'present' || state === 'absent'
      ? '#FFFFFF'
      : colors.keyText;

  const isSpecial = label === 'ENTER' || label === 'BACK';
  const displayLabel = label === 'BACK' ? '⌫' : label === 'ENTER' ? '⏎' : label;

  return (
    <Pressable
      onPress={() => onPress(label)}
      style={({ pressed }) =>
        ({
          width: isSpecial ? 44 : width,
          height: 48,
          margin: 2,
          borderRadius: 4,
          backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: pressed ? 0.7 : 1,
        } as ViewStyle)
      }
    >
      <Text
        style={{
          color: textColor,
          fontSize: isSpecial ? 14 : 18,
          fontWeight: 'bold',
        }}
        selectable={false}
      >
        {displayLabel}
      </Text>
    </Pressable>
  );
}
