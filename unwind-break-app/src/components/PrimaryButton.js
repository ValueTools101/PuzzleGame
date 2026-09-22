import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radii } from '../theme';

const VARIANTS = {
  primary: { bg: colors.primary, fg: '#FFFFFF' },
  secondary: { bg: colors.card, fg: colors.primary },
  danger: { bg: colors.danger, fg: '#FFFFFF' },
  ghost: { bg: 'transparent', fg: colors.textMuted },
};

export default function PrimaryButton({ label, onPress, variant = 'primary', disabled, loading }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'secondary' && styles.secondaryBorder,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : <Text style={[styles.label, { color: v.fg }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  secondaryBorder: { borderWidth: 1, borderColor: colors.primary },
  label: { fontSize: 16, fontWeight: '700' },
});
