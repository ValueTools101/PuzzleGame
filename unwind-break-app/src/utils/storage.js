import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  JOURNAL: 'unwind:journal',
  CART: 'unwind:cart',
  RANTS: 'unwind:savedRants',
  STATS: 'unwind:stats',
};

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getJournalEntries() {
  return readJson(KEYS.JOURNAL, []);
}

export async function addJournalEntry({ text, mood }) {
  const entries = await getJournalEntries();
  const entry = { id: Date.now().toString(), text, mood, createdAt: new Date().toISOString() };
  const next = [entry, ...entries];
  await writeJson(KEYS.JOURNAL, next);
  return next;
}

export async function deleteJournalEntry(id) {
  const entries = await getJournalEntries();
  const next = entries.filter((e) => e.id !== id);
  await writeJson(KEYS.JOURNAL, next);
  return next;
}

export async function getCart() {
  return readJson(KEYS.CART, []);
}

export async function setCartItemQty(productId, qty) {
  const cart = await getCart();
  let next;
  if (qty <= 0) {
    next = cart.filter((c) => c.id !== productId);
  } else {
    const exists = cart.find((c) => c.id === productId);
    next = exists
      ? cart.map((c) => (c.id === productId ? { ...c, qty } : c))
      : [...cart, { id: productId, qty }];
  }
  await writeJson(KEYS.CART, next);
  return next;
}

export async function clearCart() {
  await writeJson(KEYS.CART, []);
  return [];
}

export async function getSavedRants() {
  return readJson(KEYS.RANTS, []);
}

export async function addSavedRant(rant) {
  const rants = await getSavedRants();
  const entry = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...rant };
  const next = [entry, ...rants];
  await writeJson(KEYS.RANTS, next);
  return next;
}

export async function deleteSavedRant(id) {
  const rants = await getSavedRants();
  const next = rants.filter((r) => r.id !== id);
  await writeJson(KEYS.RANTS, next);
  return next;
}

export async function getStats() {
  return readJson(KEYS.STATS, { totalRelaxedSeconds: 0 });
}

export async function addRelaxedSeconds(seconds) {
  if (!seconds || seconds <= 0) return (await getStats()).totalRelaxedSeconds;
  const stats = await getStats();
  const next = { ...stats, totalRelaxedSeconds: stats.totalRelaxedSeconds + seconds };
  await writeJson(KEYS.STATS, next);
  return next.totalRelaxedSeconds;
}
