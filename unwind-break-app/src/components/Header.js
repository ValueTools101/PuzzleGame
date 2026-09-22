import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Header({ title, onBack, right }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
        <Text style={styles.backTxt}>‹ Back</Text>
      </Pressable>
      <View style={styles.titleWrap} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'space-between' },
  backBtn: { minWidth: 60 },
  backTxt: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  titleWrap: { position: 'absolute', left: 60, right: 60, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textOnLight },
  right: { minWidth: 60, alignItems: 'flex-end' },
});
