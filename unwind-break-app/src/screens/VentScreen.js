import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing, radii } from '../theme';
import { MOODS } from '../data/constants';
import {
  getJournalEntries,
  addJournalEntry,
  deleteJournalEntry,
  getSavedRants,
  addSavedRant,
  deleteSavedRant,
} from '../utils/storage';

export default function VentScreen({ onBack }) {
  const [tab, setTab] = useState('write');
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Journal & Vent" onBack={onBack} />
      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, tab === 'write' && styles.tabActive]} onPress={() => setTab('write')}>
          <Text style={[styles.tabText, tab === 'write' && styles.tabTextActive]}>Write</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'speak' && styles.tabActive]} onPress={() => setTab('speak')}>
          <Text style={[styles.tabText, tab === 'speak' && styles.tabTextActive]}>Speak</Text>
        </Pressable>
      </View>
      {tab === 'write' ? <WriteTab /> : <SpeakTab />}
    </SafeAreaView>
  );
}

function WriteTab() {
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [mood, setMood] = useState(MOODS[0].emoji);

  useEffect(() => {
    getJournalEntries().then(setEntries);
  }, []);

  async function handleSave() {
    if (!text.trim()) return;
    const next = await addJournalEntry({ text: text.trim(), mood });
    setEntries(next);
    setText('');
    setEditing(false);
  }

  function handleDelete(id) {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => setEntries(await deleteJournalEntry(id)) },
    ]);
  }

  if (editing) {
    return (
      <View style={styles.editorWrap}>
        <View style={styles.moodRow}>
          {MOODS.map((m) => (
            <Pressable key={m.emoji} onPress={() => setMood(m.emoji)} style={[styles.moodBtn, mood === m.emoji && styles.moodBtnActive]}>
              <Text style={styles.moodEmoji}>{m.emoji}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          style={styles.input}
          multiline
          autoFocus
          placeholder="Let it all out..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
        />
        <PrimaryButton label="Save Entry" onPress={handleSave} />
        <PrimaryButton label="Cancel" variant="ghost" onPress={() => { setEditing(false); setText(''); }} />
      </View>
    );
  }

  return (
    <View style={styles.listWrap}>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet. Tap below to write your first one.</Text>}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleDelete(item.id)} style={styles.entryCard}>
            <Text style={styles.entryMood}>{item.mood}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryDate}>{new Date(item.createdAt).toLocaleString()}</Text>
              <Text style={styles.entryText} numberOfLines={4}>{item.text}</Text>
            </View>
          </Pressable>
        )}
      />
      <View style={styles.fabWrap}>
        <PrimaryButton label="+ New Entry" onPress={() => setEditing(true)} />
      </View>
    </View>
  );
}

function SpeakTab() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState(-160);
  const [playbackUri, setPlaybackUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [savedRants, setSavedRants] = useState([]);

  useEffect(() => {
    getSavedRants().then(setSavedRants);
    return () => {
      if (sound) sound.unloadAsync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone access needed', 'Please allow microphone access to use Speak mode.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      rec.setOnRecordingStatusUpdate((status) => {
        if (typeof status.metering === 'number') setMetering(status.metering);
      });
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
      setPlaybackUri(null);
    } catch (e) {
      Alert.alert('Could not start recording', String(e.message || e));
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setPlaybackUri(uri);
    setRecording(null);
  }

  async function playRecording() {
    if (!playbackUri) return;
    const { sound: s } = await Audio.Sound.createAsync({ uri: playbackUri });
    setSound(s);
    await s.playAsync();
  }

  async function deleteAndRelease() {
    if (sound) await sound.unloadAsync();
    if (playbackUri) await FileSystem.deleteAsync(playbackUri, { idempotent: true });
    setPlaybackUri(null);
    setSound(null);
  }

  async function keepRecording() {
    if (!playbackUri) return;
    const dir = FileSystem.documentDirectory + 'rants/';
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const dest = dir + Date.now() + '.m4a';
    await FileSystem.copyAsync({ from: playbackUri, to: dest });
    const next = await addSavedRant({ uri: dest });
    setSavedRants(next);
    await deleteAndRelease();
  }

  async function playSaved(uri) {
    const { sound: s } = await Audio.Sound.createAsync({ uri });
    await s.playAsync();
  }

  async function removeSaved(id, uri) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    setSavedRants(await deleteSavedRant(id));
  }

  const pulse = Math.min(1, Math.max(0, (metering + 60) / 60));

  return (
    <View style={styles.speakWrap}>
      <View style={styles.micArea}>
        <View style={[styles.micPulse, { transform: [{ scale: 1 + pulse * 0.6 }], opacity: isRecording ? 1 : 0.3 }]} />
        <Pressable style={styles.micBtn} onPress={isRecording ? stopRecording : startRecording}>
          <Text style={styles.micIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
        </Pressable>
        <Text style={styles.micHint}>{isRecording ? 'Recording... tap to stop' : 'Tap to speak your mind'}</Text>
      </View>

      {playbackUri && !isRecording && (
        <View style={styles.playbackWrap}>
          <PrimaryButton label="▶ Play back" variant="secondary" onPress={playRecording} />
          <PrimaryButton label="Delete & Release" variant="danger" onPress={deleteAndRelease} />
          <PrimaryButton label="Save this one" variant="ghost" onPress={keepRecording} />
        </View>
      )}

      {savedRants.length > 0 && (
        <View style={styles.savedWrap}>
          <Text style={styles.sectionTitle}>Saved recordings</Text>
          {savedRants.map((r) => (
            <View key={r.id} style={styles.savedRow}>
              <Text style={styles.savedDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
              <Pressable onPress={() => playSaved(r.uri)}><Text style={styles.savedAction}>Play</Text></Pressable>
              <Pressable onPress={() => removeSaved(r.id, r.uri)}><Text style={[styles.savedAction, { color: colors.danger }]}>Delete</Text></Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  listWrap: { flex: 1 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  entryCard: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm },
  entryMood: { fontSize: 24, marginRight: spacing.sm },
  entryDate: { fontSize: 11, color: colors.textMuted },
  entryText: { fontSize: 14, color: colors.textOnLight, marginTop: 2 },
  fabWrap: { position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg },
  editorWrap: { flex: 1, padding: spacing.lg },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  moodBtn: { padding: 8, borderRadius: radii.pill, backgroundColor: colors.card },
  moodBtnActive: { backgroundColor: colors.primarySoft },
  moodEmoji: { fontSize: 22 },
  input: { flex: 1, backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.md, fontSize: 15, color: colors.textOnLight, textAlignVertical: 'top', marginBottom: spacing.md },
  speakWrap: { flex: 1, padding: spacing.lg },
  micArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl },
  micPulse: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: colors.primarySoft },
  micBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  micIcon: { fontSize: 40 },
  micHint: { marginTop: spacing.md, color: colors.textMuted },
  playbackWrap: { marginTop: spacing.lg },
  savedWrap: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textOnLight, marginBottom: spacing.sm },
  savedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radii.md, padding: spacing.sm, marginBottom: spacing.xs },
  savedDate: { flex: 1, color: colors.textMuted, fontSize: 12 },
  savedAction: { color: colors.primary, fontWeight: '700', marginLeft: spacing.md },
});
