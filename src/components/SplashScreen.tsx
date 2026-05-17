import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TILE_COLOR = '#3A3A3C';
const CORRECT_COLOR = '#538D4E';
const PRESENT_COLOR = '#B59F3B';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TÜRKÇE  WORDLE</Text>

      <View style={styles.tilesRow}>
        {['T', 'Ü', 'R', 'K', 'Ç', 'E'].map((letter, i) => (
          <View
            key={i}
            style={[
              styles.tile,
              { backgroundColor: i === 0 ? CORRECT_COLOR : i === 1 ? PRESENT_COLOR : TILE_COLOR },
            ]}
          >
            <Text style={styles.tileLetter}>{letter}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>5 harfli kelimeyi bul</Text>

      <View style={styles.dots}>
        <View style={[styles.dot, { opacity: 0.3 }]} />
        <View style={[styles.dot, { opacity: 0.6 }]} />
        <View style={[styles.dot, { opacity: 0.9 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121213',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 40,
  },
  tilesRow: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  tile: {
    width: 48,
    height: 48,
    margin: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLetter: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#818384',
    letterSpacing: 2,
    marginBottom: 32,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818384',
  },
});
