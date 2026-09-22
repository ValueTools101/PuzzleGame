import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../theme';

export default function ModeCard({ icon, title, subtitle, color, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: color }, pressed && styles.pressed]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.8 },
  icon: { fontSize: 34, marginRight: spacing.md },
  textWrap: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textOnLight },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 28, color: colors.textMuted },
});
