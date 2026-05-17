import { ThemeColors } from '../types';

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F6F6F6',
  text: '#1A1A1B',
  textSecondary: '#818384',
  tileEmpty: '#FFFFFF',
  tileBorder: '#D3D6DA',
  tileCorrect: '#6AAA64',
  tilePresent: '#C9B458',
  tileAbsent: '#787C7E',
  keyBackground: '#D3D6DA',
  keyText: '#1A1A1B',
};

export const darkColors: ThemeColors = {
  background: '#121213',
  surface: '#1A1A1B',
  text: '#FFFFFF',
  textSecondary: '#818384',
  tileEmpty: '#121213',
  tileBorder: '#3A3A3C',
  tileCorrect: '#538D4E',
  tilePresent: '#B59F3B',
  tileAbsent: '#3A3A3C',
  keyBackground: '#818384',
  keyText: '#FFFFFF',
};

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;
export const MAX_HINTS = 6;

export const keyboardRows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ç', 'Ö', 'BACK'],
];
