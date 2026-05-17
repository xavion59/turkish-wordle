import wordsData from '../data/words.json';

let customWords: string[] = [];
let usedCustomWords: string[] = [];
let removedWords: string[] = [];

export function setCustomWords(words: string[]) {
  customWords = words;
}

export function getCustomWords(): string[] {
  return customWords;
}

export function setUsedCustomWords(words: string[]) {
  usedCustomWords = words;
}

export function getUsedCustomWords(): string[] {
  return usedCustomWords;
}

export function setRemovedWords(words: string[]) {
  removedWords = words;
}

export function getRemovedWords(): string[] {
  return removedWords;
}

export function addRemovedWord(word: string) {
  if (!removedWords.includes(word)) {
    removedWords.push(word);
  }
}

export function restoreRemovedWord(word: string) {
  removedWords = removedWords.filter((w) => w !== word);
}

export function markWordAsUsed(word: string) {
  if (customWords.includes(word) && !usedCustomWords.includes(word)) {
    usedCustomWords.push(word);
  }
}

function filterRemoved(words: string[]): string[] {
  return words.filter((w) => !removedWords.includes(w));
}

export function getFilteredAnswers(): string[] {
  return filterRemoved(wordsData.answers);
}

export function getAllAnswers(): string[] {
  return wordsData.answers;
}

export function getTodaysWord(): string {
  const available = getFilteredAnswers();
  if (available.length === 0) return wordsData.answers[0];
  const today = new Date();
  const startDate = new Date(2024, 0, 1);
  const dayNumber = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = ((dayNumber % available.length) + available.length) % available.length;
  return available[index];
}

export function isValidWord(word: string): boolean {
  const upper = word.toUpperCase();
  return (wordsData.validGuesses.includes(upper) && !removedWords.includes(upper)) || customWords.includes(upper);
}

export function getRandomWord(): string {
  const available = filterRemoved(wordsData.answers);
  const availableCustom = customWords.filter((w) => !usedCustomWords.includes(w) && !removedWords.includes(w));
  const all = [...available, ...availableCustom];
  if (all.length === 0) return wordsData.answers[0];
  const index = Math.floor(Math.random() * all.length);
  return all[index];
}
