import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Statistics, PairPlayStats } from '../types';
import { setCustomWords, setUsedCustomWords } from './wordList';

const STATS_KEY = '@turkish_wordle_stats';
const GAME_STATE_KEY = '@turkish_wordle_game';
const SETTINGS_KEY = '@turkish_wordle_settings';
const PAIR_STATS_KEY = '@turkish_wordle_pair_stats';

export async function saveStatistics(stats: Statistics): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save statistics:', e);
  }
}

export async function loadStatistics(): Promise<Statistics> {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Migrate: trim distribution to 6, replace NaN/undefined with 0
      if (!Array.isArray(parsed.guessDistribution) || parsed.guessDistribution.length !== 6) {
        parsed.guessDistribution = [0, 0, 0, 0, 0, 0];
      } else {
        parsed.guessDistribution = parsed.guessDistribution.map((v: any) =>
          typeof v === 'number' && !isNaN(v) ? v : 0
        );
      }
      if (!Array.isArray(parsed.bestTimes)) {
        parsed.bestTimes = [];
      }
      if (typeof parsed.bestScore !== 'number') {
        parsed.bestScore = 0;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load statistics:', e);
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    lastPlayedDate: '',
    lastWonDate: '',
    bestTimes: [],
    bestScore: 0,
  };
}

export async function saveGameState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save game state:', e);
  }
}

export async function loadGameState(): Promise<GameState | null> {
  try {
    const data = await AsyncStorage.getItem(GAME_STATE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load game state:', e);
    return null;
  }
}

export async function clearGameState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GAME_STATE_KEY);
  } catch (e) {
    console.error('Failed to clear game state:', e);
  }
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  hardMode: boolean;
  soundEnabled: boolean;
}

export const defaultSettings: Settings = {
  theme: 'system',
  hardMode: false,
  soundEnabled: true,
};

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export async function loadSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

const CUSTOM_WORDS_KEY = '@turkish_wordle_custom_words';
const USED_CUSTOM_WORDS_KEY = '@turkish_wordle_used_custom_words';

export async function loadCustomWordsFromStorage(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load custom words:', e);
    return [];
  }
}

export async function saveCustomWord(word: string): Promise<void> {
  try {
    const existing = await loadCustomWordsFromStorage();
    if (!existing.includes(word)) {
      const updated = [...existing, word];
      await AsyncStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(updated));
      setCustomWords(updated);
    }
  } catch (e) {
    console.error('Failed to save custom word:', e);
  }
}

export async function removeCustomWord(word: string): Promise<void> {
  try {
    const existing = await loadCustomWordsFromStorage();
    const updated = existing.filter((w) => w !== word);
    await AsyncStorage.setItem(CUSTOM_WORDS_KEY, JSON.stringify(updated));
    setCustomWords(updated);
  } catch (e) {
    console.error('Failed to remove custom word:', e);
  }
}

export async function initCustomWords(): Promise<void> {
  const words = await loadCustomWordsFromStorage();
  setCustomWords(words);
}

export async function loadUsedCustomWords(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(USED_CUSTOM_WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load used custom words:', e);
    return [];
  }
}

export async function saveUsedCustomWord(word: string): Promise<void> {
  try {
    const existing = await loadUsedCustomWords();
    if (!existing.includes(word)) {
      const updated = [...existing, word];
      await AsyncStorage.setItem(USED_CUSTOM_WORDS_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save used custom word:', e);
  }
}

export function initUsedCustomWords(words: string[]) {
  setUsedCustomWords(words);
}

const MEANINGS_CACHE_KEY = '@turkish_wordle_meanings';

export async function loadMeaningsCache(): Promise<Record<string, { definition: string; type: string; example: string }>> {
  try {
    const data = await AsyncStorage.getItem(MEANINGS_CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export async function saveMeaningToCache(
  word: string,
  meaning: { definition: string; type: string; example: string }
): Promise<void> {
  try {
    const cache = await loadMeaningsCache();
    cache[word] = meaning;
    await AsyncStorage.setItem(MEANINGS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore cache errors
  }
}

const REMOVED_WORDS_KEY = '@turkish_wordle_removed_words';

export async function loadRemovedWords(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(REMOVED_WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveRemovedWords(words: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REMOVED_WORDS_KEY, JSON.stringify(words));
  } catch {
    // Ignore
  }
}

const defaultPairPlayStats: PairPlayStats = {
  player1: [],
  player2: [],
  currentPlayer: 1,
};

export async function loadPairPlayStats(): Promise<PairPlayStats> {
  try {
    const data = await AsyncStorage.getItem(PAIR_STATS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed.player1) && Array.isArray(parsed.player2)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load pair play stats:', e);
  }
  return JSON.parse(JSON.stringify(defaultPairPlayStats));
}

export async function savePairPlayStats(stats: PairPlayStats): Promise<void> {
  try {
    await AsyncStorage.setItem(PAIR_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save pair play stats:', e);
  }
}

export async function resetPairPlayStats(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PAIR_STATS_KEY);
  } catch (e) {
    console.error('Failed to reset pair play stats:', e);
  }
}
