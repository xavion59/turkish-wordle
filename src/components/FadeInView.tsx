import React, { useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function FadeInView({ children, style }: Props) {
  const anim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      anim.setValue(0.92);
      Animated.spring(anim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          opacity: anim,
          transform: [{ scale: anim }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
