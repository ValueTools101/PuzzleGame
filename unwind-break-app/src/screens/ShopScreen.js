import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing, radii } from '../theme';
import { SHOP_CATALOG, SHOP_CATEGORIES } from '../data/constants';
import { getCart, setCartItemQty, clearCart } from '../utils/storage';

export default function ShopScreen({ onBack }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    getCart().then(setCart);
  }, []);

  const filtered = useMemo(() => {
    return SHOP_CATALOG.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  function qtyFor(id) {
    return cart.find((c) => c.id === id)?.qty || 0;
  }

  async function changeQty(id, qty) {
    setCart(await setCartItemQty(id, qty));
  }

  function handleCheckout() {
    Alert.alert(
      "There's no checkout here 🛍️",
      "This cart is just for pretend, so there's nothing to buy. Want to clear it and start fresh?",
      [
        { text: 'Keep Browsing', style: 'cancel' },
        {
          text: 'Clear Cart',
          style: 'destructive',
          onPress: async () => {
            setCart(await clearCart());
            setCartOpen(false);
          },
        },
      ]
    );
  }

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = cart.reduce((sum, c) => {
    const product = SHOP_CATALOG.find((p) => p.id === c.id);
    return sum + (product ? product.price * c.qty : 0);
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Window Shop"
        onBack={onBack}
        right={
          <Pressable onPress={() => setCartOpen(true)} style={styles.cartBtn}>
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>
            )}
          </Pressable>
        }
      />
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search anything..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
        {SHOP_CATEGORIES.map((c) => (
          <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, c === category && styles.chipActive]}>
            <Text style={[styles.chipText, c === category && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            qty={qtyFor(item.id)}
            onAdd={() => changeQty(item.id, 1)}
            onIncrease={() => changeQty(item.id, qtyFor(item.id) + 1)}
            onDecrease={() => changeQty(item.id, qtyFor(item.id) - 1)}
          />
        )}
      />

      <Modal visible={cartOpen} animationType="slide" transparent onRequestClose={() => setCartOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Your Cart</Text>
            {cart.length === 0 ? (
              <Text style={styles.empty}>Your cart is empty. Go find something fun!</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {cart.map((c) => {
                  const product = SHOP_CATALOG.find((p) => p.id === c.id);
                  if (!product) return null;
                  return (
                    <View key={c.id} style={styles.cartRow}>
                      <Text style={styles.cartEmoji}>{product.emoji}</Text>
                      <Text style={styles.cartName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.cartQty}>x{c.qty}</Text>
                      <Text style={styles.cartPrice}>${product.price * c.qty}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            )}
            <Text style={styles.total}>Total: ${cartTotal}</Text>
            <PrimaryButton label="Checkout" onPress={handleCheckout} />
            <PrimaryButton label="Close" variant="ghost" onPress={() => setCartOpen(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cartBtn: { position: 'relative' },
  cartIcon: { fontSize: 22 },
  badge: { position: 'absolute', top: -6, right: -8, backgroundColor: colors.danger, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  searchRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  search: { backgroundColor: colors.card, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: colors.textOnLight },
  catRow: { marginBottom: spacing.sm, flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: colors.card, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textOnLight, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.background, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textOnLight, marginBottom: spacing.md },
  empty: { color: colors.textMuted, textAlign: 'center', marginVertical: spacing.lg },
  cartRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  cartEmoji: { fontSize: 22, marginRight: spacing.sm },
  cartName: { flex: 1, fontSize: 14, color: colors.textOnLight, fontWeight: '600' },
  cartQty: { color: colors.textMuted, marginRight: spacing.sm },
  cartPrice: { color: colors.textOnLight, fontWeight: '700' },
  total: { fontSize: 16, fontWeight: '700', color: colors.textOnLight, marginVertical: spacing.md, textAlign: 'right' },
});
