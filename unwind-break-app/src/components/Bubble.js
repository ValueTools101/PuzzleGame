import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Dimensions } from 'react-native';

const { height: SCREEN_H } = Dimensions.get('window');

export default function Bubble({ bubble, onPop }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: -(SCREEN_H * 0.75),
      duration: bubble.duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onPop(bubble.id, false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePress() {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1.6, duration: 140, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => onPop(bubble.id, true));
  }

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          left: bubble.x,
          width: bubble.size,
          height: bubble.size,
          borderRadius: bubble.size / 2,
          backgroundColor: bubble.color,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={handlePress} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: { position: 'absolute', bottom: 0 },
});
