import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated, View, type ViewStyle } from 'react-native';
import { LetterState } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { playSound } from '../utils/sounds';

interface TileProps {
  letter: string;
  state: LetterState;
  delay?: number;
  isCurrentRow: boolean;
}

export function Tile({ letter, state, delay = 0, isCurrentRow }: TileProps) {
  const { colors } = useTheme();
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipDone, setFlipDone] = useState(false);

  const isEvaluated = state === 'correct' || state === 'present' || state === 'absent';
  const isEmpty = state === 'empty';

  const evaluatedColor = isEvaluated
    ? state === 'correct'
      ? colors.tileCorrect
      : state === 'present'
        ? colors.tilePresent
        : colors.tileAbsent
    : colors.tileEmpty;

  const borderColor = isEmpty ? colors.tileBorder : evaluatedColor;
  const textColor = isEvaluated ? '#FFFFFF' : colors.text;

  useEffect(() => {
    if (isEmpty) {
      flipAnim.setValue(0);
      setFlipDone(false);
    }
  }, [isEmpty]);

  useEffect(() => {
    if (isEvaluated && !flipDone) {
      if (delay === 0) {
        playSound('reveal');
      }
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: false,
      }).start(() => {
        setFlipDone(true);
      });
    }
  }, [state, delay, flipAnim, isEvaluated, flipDone]);

  const flipInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const scaleXInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, -1],
  });

  // Letter hidden before flip, visible during/after flip
  const letterOpacity = flipAnim.interpolate({
    inputRange: [0, 0.01, 1],
    outputRange: [0, 1, 1],
  });

  const animatedStyle: ViewStyle = {
    transform: [{ rotateY: flipInterpolate }, { scaleX: scaleXInterpolate }],
  };

  const visible = isEmpty || (isEvaluated && letter !== '');

  return (
    <Animated.View
      style={[
        {
          width: 65,
          height: 65,
          margin: 3,
          borderWidth: 2,
          borderColor: borderColor,
          backgroundColor: evaluatedColor,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      {visible && (
        <Animated.Text
          style={{
            fontSize: 30,
            fontWeight: 'bold',
            color: textColor,
            textTransform: 'uppercase',
            opacity: isEvaluated ? letterOpacity : 1,
          }}
        >
          {letter}
        </Animated.Text>
      )}
    </Animated.View>
  );
}
