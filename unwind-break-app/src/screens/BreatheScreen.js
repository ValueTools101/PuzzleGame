import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import Header from '../components/Header';
import BreathingCircle from '../components/BreathingCircle';
import SoundTile from '../components/SoundTile';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing, radii } from '../theme';
import { BREATH_PATTERNS, SOUND_PRESETS } from '../data/constants';
import { getSoundFileUri } from '../utils/audioSynth';
import { addRelaxedSeconds } from '../utils/storage';

export default function BreatheScreen({ onBack }) {
  const [patternId, setPatternId] = useState(BREATH_PATTERNS[0].id);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [activeSounds, setActiveSounds] = useState({});
  const soundsRef = useRef({});
  const startedAtRef = useRef(null);
  const totalElapsedRef = useRef(0);

  const pattern = BREATH_PATTERNS.find((p) => p.id === patternId);

  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach((s) => s && s.sound.unloadAsync());
      if (startedAtRef.current) {
        totalElapsedRef.current += Math.floor((Date.now() - startedAtRef.current) / 1000);
      }
      if (totalElapsedRef.current > 0) addRelaxedSeconds(totalElapsedRef.current);
    };
  }, []);

  function toggleRunning() {
    setRunning((r) => {
      const next = !r;
      if (next) {
        startedAtRef.current = Date.now();
      } else if (startedAtRef.current) {
        totalElapsedRef.current += Math.floor((Date.now() - startedAtRef.current) / 1000);
        startedAtRef.current = null;
      }
      return next;
    });
  }

  async function toggleSound(id) {
    const isActive = activeSounds[id] !== undefined;
    if (isActive) {
      const entry = soundsRef.current[id];
      if (entry) {
        await entry.sound.stopAsync();
        await entry.sound.unloadAsync();
        delete soundsRef.current[id];
      }
      setActiveSounds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      const uri = await getSoundFileUri(id);
      const { sound } = await Audio.Sound.createAsync({ uri }, { isLooping: true, volume: 0.6 });
      await sound.playAsync();
      soundsRef.current[id] = { sound };
      setActiveSounds((prev) => ({ ...prev, [id]: 0.6 }));
    }
  }

  function changeVolume(id, value) {
    setActiveSounds((prev) => ({ ...prev, [id]: value }));
    const entry = soundsRef.current[id];
    if (entry) entry.sound.setVolumeAsync(value);
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.background, colors.primarySoft]} style={StyleSheet.absoluteFill} />
      <Header title="Breathe & Sounds" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.patternRow}>
          {BREATH_PATTERNS.map((p) => (
            <Pressable
              key={p.id}
              disabled={running}
              onPress={() => setPatternId(p.id)}
              style={[styles.chip, p.id === patternId && styles.chipActive, running && styles.chipDisabled]}
            >
              <Text style={[styles.chipText, p.id === patternId && styles.chipTextActive]}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.description}>{pattern.description}</Text>

        <BreathingCircle pattern={pattern} running={running} onCycleComplete={() => setCycles((c) => c + 1)} />

        {cycles > 0 && <Text style={styles.cycles}>{cycles} full cycle{cycles === 1 ? '' : 's'} completed</Text>}

        <PrimaryButton label={running ? 'Pause' : 'Start Breathing'} onPress={toggleRunning} />

        <Text style={styles.sectionTitle}>Ambient Sounds</Text>
        {SOUND_PRESETS.map((s) => (
          <SoundTile
            key={s.id}
            icon={s.icon}
            label={s.label}
            active={activeSounds[s.id] !== undefined}
            volume={activeSounds[s.id] ?? 0.6}
            onToggle={() => toggleSound(s.id)}
            onVolumeChange={(v) => changeVolume(s.id, v)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  patternRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.card, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDisabled: { opacity: 0.5 },
  chipText: { color: colors.textOnLight, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  description: { color: colors.textMuted, marginBottom: spacing.md },
  cycles: { textAlign: 'center', color: colors.textMuted, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textOnLight, marginTop: spacing.lg, marginBottom: spacing.sm },
});
