import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../src/contexts/ThemeContext';
import { loadCustomWordsFromStorage, removeCustomWord } from '../src/utils/storage';

export default function CustomWordsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [customWords, setCustomWordsState] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCustomWordsFromStorage().then(setCustomWordsState);
    }, [])
  );

  const handleRemoveWord = useCallback((word: string) => {
    Alert.alert('Kaldır', `${word} silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await removeCustomWord(word);
          setCustomWordsState((prev) => prev.filter((w) => w !== word));
        },
      },
    ]);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backText, { color: colors.tileCorrect }]}>Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Eklenen Kelimeler
        </Text>
        <View style={styles.headerRight} />
      </View>

      {customWords.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Henüz kelime eklenmemiş.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {customWords.map((word) => (
            <View
              key={word}
              style={[styles.wordRow, { borderColor: colors.tileBorder }]}
            >
              <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
              <TouchableOpacity onPress={() => handleRemoveWord(word)}>
                <Text style={{ color: colors.tilePresent, fontSize: 16, fontWeight: 'bold' }}>
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
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
    marginBottom: 16,
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
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
