import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import Bubble from '../components/Bubble';
import Header from '../components/Header';
import { colors } from '../theme';
import { getSoundFileUri } from '../utils/audioSynth';
import { addRelaxedSeconds } from '../utils/storage';

const { width: SCREEN_W } = Dimensions.get('window');
const BUBBLE_COLORS = ['#A7C7E7', '#B5EAD7', '#C7CEEA', '#FFDAC1', '#E2F0CB'];

export default function GameScreen({ onBack }) {
  const [bubbles, setBubbles] = useState([]);
  const [popped, setPopped] = useState(0);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const popSoundRef = useRef(null);
  const spawnRef = useRef(null);
  const tickRef = useRef(null);
  const startedAtRef = useRef(Date.now());
  const idRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const uri = await getSoundFileUri('pop');
      const { sound } = await Audio.Sound.createAsync({ uri });
      if (mounted) popSoundRef.current = sound;
      else sound.unloadAsync();
    })();
    return () => {
      mounted = false;
      if (popSoundRef.current) popSoundRef.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  useEffect(() => {
    if (running) {
      spawnRef.current = setInterval(spawnBubble, 650);
    } else {
      clearInterval(spawnRef.current);
    }
    return () => clearInterval(spawnRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    return () => {
      const seconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
      addRelaxedSeconds(seconds);
    };
  }, []);

  function spawnBubble() {
    const size = 40 + Math.random() * 34;
    const bubble = {
      id: idRef.current++,
      x: Math.random() * (SCREEN_W - size - 20) + 10,
      size,
      duration: 4200 + Math.random() * 2600,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    };
    setBubbles((prev) => [...prev, bubble]);
  }

  function handlePop(id, wasPopped) {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    if (wasPopped) {
      setPopped((p) => p + 1);
      popSoundRef.current && popSoundRef.current.replayAsync();
    }
  }

  const minutes = Math.floor(elapsed / 60);
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.background, colors.accentSoft]} style={StyleSheet.absoluteFill} />
      <Header title="Bubble Pop" onBack={onBack} />
      <View style={styles.statsRow}>
        <Text style={styles.stat}>{minutes}:{seconds}</Text>
        <Text style={styles.stat}>{popped} popped</Text>
        <Pressable onPress={() => setRunning((r) => !r)}>
          <Text style={styles.pauseBtn}>{running ? 'Pause' : 'Resume'}</Text>
        </Pressable>
      </View>
      <View style={styles.playArea}>
        {bubbles.map((b) => (
          <Bubble key={b.id} bubble={b} onPop={handlePop} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  stat: { fontSize: 15, color: colors.textOnLight, fontWeight: '600' },
  pauseBtn: { color: colors.primary, fontWeight: '700' },
  playArea: { flex: 1, overflow: 'hidden' },
});
