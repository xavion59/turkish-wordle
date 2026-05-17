import React from 'react';
import { View } from 'react-native';
import { Row } from './Row';
import type { LetterState } from '../../src/types';

interface GameBoardProps {
  board: string[][];
  evaluations: LetterState[][];
  currentRow: number;
}

export function GameBoard({ board, evaluations, currentRow }: GameBoardProps) {
  return (
    <View style={{ marginVertical: 8 }}>
      {board.map((row, index) => (
        <Row
          key={index}
          tiles={row}
          evaluations={evaluations[index] || []}
          isCurrentRow={index === currentRow}
          rowIndex={index}
        />
      ))}
    </View>
  );
}
