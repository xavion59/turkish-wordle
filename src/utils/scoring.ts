export function calculateScore(params: {
  won: boolean;
  guesses: number;
  time: number;
  hintsUsed: number;
}): number {
  if (!params.won) return 0;
  const guessScore = Math.max(0, 7 - params.guesses) * 100;
  const timeScore = Math.max(0, 120 - params.time);
  const hintPenalty = params.hintsUsed * 80;
  return Math.max(0, guessScore + timeScore - hintPenalty);
}
