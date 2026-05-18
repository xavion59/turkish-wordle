import React, { useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export default function FadeInView({ children, style, backgroundColor }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        tension: 100,
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
          backgroundColor,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
