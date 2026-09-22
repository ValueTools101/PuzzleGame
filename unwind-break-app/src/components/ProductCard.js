import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme';

export default function ProductCard({ product, qty, onAdd, onIncrease, onDecrease }) {
  return (
    <View style={[styles.card, { backgroundColor: product.color }]}>
      <Text style={styles.emoji}>{product.emoji}</Text>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
      {qty > 0 ? (
        <View style={styles.stepper}>
          <Pressable onPress={onDecrease} style={styles.stepBtn}><Text style={styles.stepTxt}>-</Text></Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable onPress={onIncrease} style={styles.stepBtn}><Text style={styles.stepTxt}>+</Text></Pressable>
        </View>
      ) : (
        <Pressable onPress={onAdd} style={styles.addBtn}>
          <Text style={styles.addTxt}>Add to Cart</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radii.lg, padding: spacing.md, margin: spacing.xs, minHeight: 170, justifyContent: 'space-between' },
  emoji: { fontSize: 36 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textOnLight, marginTop: spacing.sm },
  price: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  addBtn: { backgroundColor: colors.textOnLight, borderRadius: radii.pill, paddingVertical: 8, alignItems: 'center', marginTop: spacing.sm },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: radii.pill, paddingHorizontal: 6, paddingVertical: 4 },
  stepBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.textOnLight, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { color: '#fff', fontWeight: '700' },
  qty: { fontWeight: '700', color: colors.textOnLight },
});
