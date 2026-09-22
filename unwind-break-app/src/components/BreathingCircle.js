import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../theme';

const MIN_SCALE = 0.55;
const MAX_SCALE = 1;

export default function BreathingCircle({ pattern, running, onCycleComplete }) {
  const scale = useRef(new Animated.Value(MIN_SCALE)).current;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(pattern.phases[0].seconds);
  const timeoutRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    setPhaseIndex(0);
    setSecondsLeft(pattern.phases[0].seconds);
    scale.setValue(MIN_SCALE);
  }, [pattern]);

  useEffect(() => {
    if (!running) {
      clearTimeout(timeoutRef.current);
      clearInterval(tickRef.current);
      return;
    }
    runPhase(phaseIndex);
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIndex, pattern]);

  function runPhase(idx) {
    const phase = pattern.phases[idx];
    setSecondsLeft(phase.seconds);
    const target = phase.type === 'inhale' ? MAX_SCALE : phase.type === 'exhale' ? MIN_SCALE : undefined;
    if (target !== undefined) {
      Animated.timing(scale, {
        toValue: target,
        duration: phase.seconds * 1000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start();
    }
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 1 ? s - 1 : 0));
    }, 1000);
    timeoutRef.current = setTimeout(() => {
      const nextIdx = (idx + 1) % pattern.phases.length;
      if (nextIdx === 0 && onCycleComplete) onCycleComplete();
      setPhaseIndex(nextIdx);
    }, phase.seconds * 1000);
  }

  const phase = pattern.phases[phaseIndex];

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
      <View style={styles.labelWrap}>
        <Text style={styles.phaseLabel}>{running ? phase.label : 'Ready'}</Text>
        {running && <Text style={styles.seconds}>{secondsLeft}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', height: 260 },
  circle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primarySoft,
  },
  labelWrap: { alignItems: 'center' },
  phaseLabel: { fontSize: 20, fontWeight: '600', color: colors.textOnLight },
  seconds: { fontSize: 32, fontWeight: '700', color: colors.textOnLight, marginTop: 4 },
});
