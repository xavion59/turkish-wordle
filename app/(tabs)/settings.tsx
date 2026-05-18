import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { Keyboard } from '../../src/components/Keyboard';
import { loadSettings, saveSettings, saveCustomWord, loadCustomWordsFromStorage, removeCustomWord } from '../../src/utils/storage';
import { isValidWord } from '../../src/utils/wordList';
import { playSound, setSoundEnabled } from '../../src/utils/sounds';



type ThemeMode = 'light' | 'dark' | 'system';

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: 'Açık', value: 'light' },
  { label: 'Koyu', value: 'dark' },
  { label: 'Sistem', value: 'system' },
];

export default function SettingsScreen() {
  const { theme, setTheme, colors } = useTheme();
  const router = useRouter();
  const [hardMode, setHardMode] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [newWord, setNewWord] = useState('');
  const [wordError, setWordError] = useState('');
  const [customWords, setCustomWordsState] = useState<string[]>([]);

  useEffect(() => {
    loadSettings().then((settings) => {
      setHardMode(settings.hardMode);
      setSoundEnabledState(settings.soundEnabled);
      setSoundEnabled(settings.soundEnabled);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCustomWordsFromStorage().then(setCustomWordsState);
    }, [])
  );

  const toggleHardMode = () => {
    const newVal = !hardMode;
    setHardMode(newVal);
    saveSettings({ theme, hardMode: newVal, soundEnabled }).catch((e) =>
      console.error('Failed to save settings:', e)
    );
  };

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabledState(newVal);
    setSoundEnabled(newVal);
    saveSettings({ theme, hardMode, soundEnabled: newVal }).catch((e) =>
      console.error('Failed to save settings:', e)
    );
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const handleAddWord = useCallback(async () => {
    const word = newWord;
    if (word.length !== 5) {
      setWordError('5 harfli olmalı');
      return;
    }
    if (!/^[A-ZÇĞİÖŞÜ]+$/.test(word)) {
      setWordError('Geçersiz karakter');
      return;
    }
    if (isValidWord(word)) {
      setWordError('Zaten oyunda var');
      return;
    }
    await saveCustomWord(word);
    setCustomWordsState((prev) => [...prev, word]);
    setNewWord('');
    setWordError('');
  }, [newWord, customWords]);

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
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tema</Text>
        <View style={styles.optionsRow}>
          {themeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.themeOption,
                {
                  backgroundColor:
                    theme === opt.value ? colors.tileCorrect : colors.keyBackground,
                },
              ]}
              onPress={() => handleThemeChange(opt.value)}
            >
              <Text
                style={[
                  styles.themeOptionText,
                  { color: theme === opt.value ? '#FFFFFF' : colors.keyText },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Zor Mod</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Yeşil harfler bir sonraki tahminde o pozisyonda zorunlu
            </Text>
          </View>
          <Switch
            value={hardMode}
            onValueChange={toggleHardMode}
            trackColor={{ false: colors.keyBackground, true: colors.tileCorrect }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Ses Efektleri</Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Tuş, ipucu ve sonuç sesleri
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: colors.keyBackground, true: colors.tileCorrect }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionLink}
          onPress={() => router.push('/word-list')}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Kelime Listesi
          </Text>
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            Oyunun kelime havuzunu görüntüle ve düzenle
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Kelime Ekle
        </Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary, marginBottom: 12 }]}>
          Oyuna yeni 5 harfli kelime ekleyin
        </Text>
        <View style={styles.tileRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.tile,
                {
                  backgroundColor: colors.tileEmpty,
                  borderColor: wordError ? colors.tilePresent : colors.tileBorder,
                },
              ]}
            >
              <Text style={[styles.tileLetter, { color: colors.text }]}>
                {newWord[i] || ''}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.addWordRow}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tileCorrect }]}
            onPress={handleAddWord}
          >
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>
        {wordError !== '' && (
          <Text style={[styles.errorText, { color: colors.tilePresent }]}>
            {wordError}
          </Text>
        )}

        <View style={styles.wordEntryKeyboard}>
          <Keyboard
            onKeyPress={(key) => {
              if (key === 'ENTER') {
                handleAddWord();
              } else if (key === 'BACK') {
                setNewWord((prev) => prev.slice(0, -1));
                setWordError('');
              } else {
                playSound('keypress');
                setNewWord((prev) => (prev + key).toUpperCase().slice(0, 5));
                setWordError('');
              }
            }}
            keyStates={{}}
          />
        </View>

        {customWords.length > 0 && (
          <View style={styles.customWordsList}>
            <Text style={[styles.settingLabel, { color: colors.text, marginBottom: 8 }]}>
              Eklenen Kelimeler ({customWords.length})
            </Text>
            {customWords.slice(-5).reverse().map((word) => (
              <View key={word} style={[styles.customWordRow, { borderColor: colors.tileBorder }]}>
                <Text style={[styles.customWordText, { color: colors.text }]}>{word}</Text>
                <TouchableOpacity onPress={() => handleRemoveWord(word)}>
                  <Text style={{ color: colors.tilePresent, fontSize: 16, fontWeight: 'bold' }}>Sil</Text>
                </TouchableOpacity>
              </View>
            ))}
            {customWords.length > 5 && (
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push('/custom-words')}
              >
                <Text style={[styles.seeAllText, { color: colors.tileCorrect }]}>
                  Tümünü Gör ({customWords.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionLink: {
    paddingVertical: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
    maxWidth: 250,
  },
  addWordRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tile: {
    width: 60,
    height: 60,
    margin: 3,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLetter: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  wordEntryKeyboard: {
    alignSelf: 'stretch',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
  customWordsList: {
    marginTop: 16,
  },
  customWordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  customWordText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  seeAllButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
