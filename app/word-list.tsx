import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../src/contexts/ThemeContext';
import { getAllAnswers, getRemovedWords, addRemovedWord, restoreRemovedWord } from '../src/utils/wordList';
import { loadRemovedWords, saveRemovedWords } from '../src/utils/storage';

export default function WordListScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [removed, setRemoved] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const allAnswers = useMemo(() => getAllAnswers(), []);

  useFocusEffect(
    useCallback(() => {
      loadRemovedWords().then(setRemoved);
    }, [])
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toUpperCase().trim();
    if (q.length < 2) return [];
    return allAnswers.filter((w) => w.startsWith(q)).slice(0, 50);
  }, [search, allAnswers]);

  const handleToggle = useCallback(async (word: string) => {
    if (removed.includes(word)) {
      restoreRemovedWord(word);
      const next = removed.filter((w) => w !== word);
      setRemoved(next);
      await saveRemovedWords(next);
    } else {
      addRemovedWord(word);
      const next = [...removed, word];
      setRemoved(next);
      await saveRemovedWords(next);
    }
  }, [removed]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.tileCorrect }]}>Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Kelime Listesi</Text>
        <View style={styles.headerRight} />
      </View>

      <Text style={[styles.info, { color: colors.textSecondary }]}>
        {allAnswers.length} kelime, {removed.length} tanesi kaldırıldı
      </Text>

      <TextInput
        style={[styles.searchInput, { color: colors.text, borderColor: colors.tileBorder, backgroundColor: colors.surface }]}
        value={search}
        onChangeText={setSearch}
        placeholder="Kelime ara (en az 2 harf)"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="characters"
        autoCorrect={false}
      />

      <ScrollView style={styles.list}>
        {filtered.map((word) => {
          const isRemoved = removed.includes(word);
          return (
            <View key={word} style={[styles.wordRow, { borderColor: colors.tileBorder }]}>
              <Text style={[styles.wordText, { color: isRemoved ? colors.tileAbsent : colors.text, textDecorationLine: isRemoved ? 'line-through' : 'none' }]}>
                {word}
              </Text>
              <TouchableOpacity onPress={() => handleToggle(word)}>
                <Text style={{ color: isRemoved ? colors.tileCorrect : colors.tilePresent, fontSize: 14, fontWeight: 'bold' }}>
                  {isRemoved ? 'Geri Ekle' : 'Kaldır'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
        {search.trim().length >= 2 && filtered.length === 0 && (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>Sonuç bulunamadı</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 8,
  },
  searchInput: {
    marginHorizontal: 16,
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  wordText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
