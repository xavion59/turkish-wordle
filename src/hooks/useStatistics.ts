import { useState, useEffect, useCallback } from 'react';
import { Statistics } from '../types';
import { loadStatistics, saveStatistics } from '../utils/storage';

const defaultStats: Statistics = {
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

export function useStatistics() {
  const [stats, setStats] = useState<Statistics>(defaultStats);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadStatistics().then((data) => {
      setStats(data);
      setLoaded(true);
    });
  }, []);

  const recordGame = useCallback(
    (won: boolean, guesses: number, time?: number, score?: number) => {
      setStats((prev) => {
        const newStats = { ...prev, bestTimes: [...prev.bestTimes] };
        newStats.gamesPlayed += 1;
        newStats.lastPlayedDate = new Date().toISOString().split('T')[0];

        if (won) {
          newStats.gamesWon += 1;
          newStats.guessDistribution[guesses - 1] += 1;
          newStats.lastWonDate = newStats.lastPlayedDate;

          if (typeof time === 'number' && time > 0) {
            newStats.bestTimes.push(time);
            newStats.bestTimes.sort((a, b) => a - b);
            newStats.bestTimes = newStats.bestTimes.slice(0, 10);
          }

          if (typeof score === 'number' && score > newStats.bestScore) {
            newStats.bestScore = score;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (prev.lastWonDate === yesterdayStr) {
            newStats.currentStreak = prev.currentStreak + 1;
          } else if (prev.lastWonDate !== newStats.lastPlayedDate) {
            newStats.currentStreak = 1;
          }

          newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        } else {
          newStats.currentStreak = 0;
        }

        saveStatistics(newStats).catch((e) =>
          console.error('Failed to save stats:', e)
        );
        return newStats;
      });
    },
    []
  );

  const resetStats = useCallback(() => {
    setStats(defaultStats);
    saveStatistics(defaultStats).catch((e) =>
      console.error('Failed to reset stats:', e)
    );
  }, []);

  return { stats, loaded, recordGame, resetStats };
}
