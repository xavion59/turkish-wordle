import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import FadeInView from '../../src/components/FadeInView';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useStatistics } from '../../src/hooks/useStatistics';
import { StatsChart } from '../../src/components/StatsChart';

export default function StatsScreen() {
  const { colors } = useTheme();
  const { stats, loaded, resetStats } = useStatistics();
  const [currentGuessCount, setCurrentGuessCount] = useState<number | null>(null);

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const handleReset = () => {
    Alert.alert(
      'İstatistikleri Sıfırla',
      'Tüm istatistikleriniz silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: resetStats,
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!loaded) {
    return (
      <FadeInView backgroundColor={colors.background}>
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.text }}>Yükleniyor...</Text>
      </View>
      </FadeInView>
    );
  }

  return (
    <FadeInView backgroundColor={colors.background}>
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          İstatistikler
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.gamesPlayed}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Oyun
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {winRate}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Kazanma
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Seri (gün)
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.maxStreak}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              En İyi (gün)
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.bestScore}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              En İyi Puan
            </Text>
          </View>
        </View>

        <StatsChart
          distribution={stats.guessDistribution}
          currentGuessCount={currentGuessCount}
        />

        {stats.bestTimes.length > 0 && (
          <View style={styles.bestTimesSection}>
            <Text style={[styles.bestTimesTitle, { color: colors.text }]}>
              En İyi 10 Süre
            </Text>
            {stats.bestTimes.map((t, i) => (
              <View key={i} style={styles.bestTimeRow}>
                <Text style={[styles.bestTimeRank, { color: colors.textSecondary }]}>
                  {i + 1}.
                </Text>
                <Text style={[styles.bestTimeValue, { color: colors.text }]}>
                  {formatTime(t)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.tileAbsent }]}
          onPress={handleReset}
        >
          <Text style={[styles.resetText, { color: colors.tileAbsent }]}>
            İstatistikleri Sıfırla
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  bestTimesSection: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  bestTimesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  bestTimeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  bestTimeRank: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'right',
  },
  bestTimeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  resetButton: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
