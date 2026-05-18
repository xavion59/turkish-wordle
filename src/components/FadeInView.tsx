import React, { useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function FadeInView({ children, style }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  return (
    <Animated.View style={[{ flex: 1, opacity }, style]}>
      {children}
    </Animated.View>
  );
}
