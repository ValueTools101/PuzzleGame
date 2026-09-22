import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModeCard from '../components/ModeCard';
import { colors, spacing } from '../theme';
import { getStats } from '../utils/storage';

const MODES = [
  { key: 'breathe', icon: '🌬️', title: 'Breathe & Sounds', subtitle: 'Guided breathing with calming ambient sound', color: colors.primarySoft },
  { key: 'game', icon: '🫧', title: 'Bubble Pop', subtitle: 'A tiny, pressure-free game to unwind', color: colors.accentSoft },
  { key: 'vent', icon: '📝', title: 'Journal & Vent', subtitle: 'Write it out, or say it out loud', color: colors.warm },
  { key: 'shop', icon: '🛍️', title: 'Window Shop', subtitle: 'Browse, add to cart, no checkout needed', color: '#F0E3FF' },
];

export default function HomeScreen({ onNavigate }) {
  const [minutes, setMinutes] = useState(0);

  const loadStats = useCallback(() => {
    getStats().then((s) => setMinutes(Math.floor(s.totalRelaxedSeconds / 60)));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Take 10 minutes for you</Text>
        <Text style={styles.subGreeting}>Pick whatever your mood needs right now.</Text>
        {minutes > 0 && (
          <View style={styles.statBadge}>
            <Text style={styles.statText}>🌿 {minutes} min unwound so far</Text>
          </View>
        )}
        <View style={styles.cards}>
          {MODES.map((m) => (
            <ModeCard
              key={m.key}
              icon={m.icon}
              title={m.title}
              subtitle={m.subtitle}
              color={m.color}
              onPress={() => onNavigate(m.key)}
            />
          ))}
        </View>
        <Pressable onPress={() => onNavigate('about')}>
          <Text style={styles.about}>About & Privacy</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.textOnLight },
  subGreeting: { fontSize: 15, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  statBadge: { alignSelf: 'flex-start', backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginBottom: spacing.lg },
  statText: { color: colors.textOnLight, fontWeight: '600', fontSize: 13 },
  cards: { marginBottom: spacing.lg },
  about: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md, textDecorationLine: 'underline' },
});
