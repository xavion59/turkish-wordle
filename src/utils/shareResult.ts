import { LetterState } from '../types';

export function generateShareText(
  evaluations: LetterState[][],
  currentRow: number,
  won: boolean
): string {
  const emojiMap: Record<string, string> = {
    correct: '🟩',
    present: '🟨',
    absent: '⬛',
  };

  const lines: string[] = ['Türkçe Wordle'];

  const today = new Date();
  lines.push(`${today.toLocaleDateString('tr-TR')}`);

  const attempts = won ? currentRow : 6;
  lines.push(`${attempts}/6`);
  lines.push('');

  for (let i = 0; i < (won ? currentRow : 6); i++) {
    const row = evaluations[i];
    if (!row || row.every((s) => s === 'empty')) break;
    const line = row.map((s) => emojiMap[s] || '⬛').join('');
    lines.push(line);
  }

  return lines.join('\n');
}
