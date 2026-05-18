import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function FadeInView({ children, style }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        { flex: 1, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
