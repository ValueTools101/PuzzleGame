import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, radii } from '../theme';

export default function SoundTile({ icon, label, active, volume, onToggle, onVolumeChange }) {
  return (
    <View style={[styles.tile, active && styles.tileActive]}>
      <Pressable style={styles.row} onPress={onToggle}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
        <Switch value={active} onValueChange={onToggle} trackColor={{ true: colors.primary }} />
      </Pressable>
      {active && (
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={onVolumeChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { backgroundColor: colors.card, borderRadius: radii.md, padding: 12, marginBottom: 10 },
  tileActive: { borderWidth: 1, borderColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, marginRight: 10 },
  label: { flex: 1, fontSize: 16, color: colors.textOnLight, fontWeight: '500' },
  slider: { marginTop: 8, width: '100%', height: 32 },
});
