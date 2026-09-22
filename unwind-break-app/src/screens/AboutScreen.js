import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { colors, spacing } from '../theme';

export default function AboutScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="About & Privacy" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Unwind</Text>
        <Text style={styles.p}>
          A pocket-sized 10-minute break. Breathe, listen, play, vent, or window shop — whatever
          your mood needs, with zero pressure and no scores to chase.
        </Text>
        <Text style={styles.p}>
          Every ambient sound in this app is generated on your device — nothing streamed,
          nothing downloaded, no licensing involved.
        </Text>
        <Text style={styles.h2}>Your privacy</Text>
        <Text style={styles.p}>
          Journal entries, voice recordings, and your shopping cart are stored only on this
          device. Nothing is uploaded anywhere. Deleting an entry or recording removes it for good.
        </Text>
        <Pressable onPress={() => Linking.openURL('https://example.com/unwind-privacy-policy')}>
          <Text style={styles.link}>Read the full Privacy Policy</Text>
        </Pressable>
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  h1: { fontSize: 22, fontWeight: '800', color: colors.textOnLight, marginBottom: spacing.sm },
  h2: { fontSize: 16, fontWeight: '700', color: colors.textOnLight, marginTop: spacing.lg, marginBottom: spacing.xs },
  p: { fontSize: 14, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm },
  link: { color: colors.primary, fontWeight: '600', marginTop: spacing.md },
  version: { color: colors.textMuted, marginTop: spacing.xl, textAlign: 'center', fontSize: 12 },
});
