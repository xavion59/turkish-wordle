import React from 'react';
import { View } from 'react-native';
import { Tile } from './Tile';
import type { LetterState } from '../types';

interface RowProps {
  tiles: string[];
  evaluations: LetterState[];
  isCurrentRow: boolean;
  rowIndex: number;
}

export function Row({ tiles, evaluations, isCurrentRow, rowIndex }: RowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 4,
      }}
    >
      {tiles.map((letter, colIndex) => (
        <Tile
          key={colIndex}
          letter={letter}
          state={evaluations[colIndex] || 'empty'}
          isCurrentRow={isCurrentRow}
          delay={colIndex * 150}
        />
      ))}
    </View>
  );
}
