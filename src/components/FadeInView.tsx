import React, { useRef } from 'react';
import { Animated, View, type ViewStyle } from 'react-native';
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
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [])
  );

  return (
    <View style={[{ flex: 1, backgroundColor, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}
