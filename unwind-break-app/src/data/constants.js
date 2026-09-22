export const BREATH_PATTERNS = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal counts in, hold, out, hold. Great for focus.',
    phases: [
      { type: 'inhale', seconds: 4, label: 'Breathe in' },
      { type: 'hold', seconds: 4, label: 'Hold' },
      { type: 'exhale', seconds: 4, label: 'Breathe out' },
      { type: 'hold', seconds: 4, label: 'Hold' },
    ],
  },
  {
    id: '478',
    name: 'Calming 4-7-8',
    description: 'A longer exhale to help you wind down fast.',
    phases: [
      { type: 'inhale', seconds: 4, label: 'Breathe in' },
      { type: 'hold', seconds: 7, label: 'Hold' },
      { type: 'exhale', seconds: 8, label: 'Breathe out' },
    ],
  },
  {
    id: 'simple',
    name: 'Simple Breath',
    description: 'Easy in and out, no holding.',
    phases: [
      { type: 'inhale', seconds: 4, label: 'Breathe in' },
      { type: 'exhale', seconds: 4, label: 'Breathe out' },
    ],
  },
];

export const SOUND_PRESETS = [
  { id: 'rain', label: 'Rain', icon: '🌧️' },
  { id: 'brown', label: 'Deep Hum', icon: '🌊' },
  { id: 'wind', label: 'Soft Wind', icon: '🍃' },
  { id: 'tone-low', label: 'Low Calm Tone', icon: '🔔' },
  { id: 'tone-mid', label: 'Gentle Chime Tone', icon: '✨' },
];

export const MOODS = [
  { emoji: '😌', label: 'Calm' },
  { emoji: '🙂', label: 'Okay' },
  { emoji: '😔', label: 'Down' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😰', label: 'Anxious' },
];

export const SHOP_CATEGORIES = ['All', 'Clothing', 'Home', 'Gadgets', 'Beauty'];

export const SHOP_CATALOG = [
  { id: 'p1', name: 'Cloud Sneakers', price: 68, emoji: '👟', category: 'Clothing', color: '#D6E9FF' },
  { id: 'p2', name: 'Oversized Knit Sweater', price: 54, emoji: '🧶', category: 'Clothing', color: '#FFE3D6' },
  { id: 'p3', name: 'Sunset Sundress', price: 45, emoji: '👗', category: 'Clothing', color: '#FFD6E7' },
  { id: 'p4', name: 'Classic Denim Jacket', price: 72, emoji: '🧥', category: 'Clothing', color: '#E1E8F5' },
  { id: 'p5', name: 'Ceramic Plant Pot', price: 22, emoji: '🪴', category: 'Home', color: '#DFF5DE' },
  { id: 'p6', name: 'Fairy Light String', price: 15, emoji: '✨', category: 'Home', color: '#FFF6D6' },
  { id: 'p7', name: 'Fluffy Throw Blanket', price: 38, emoji: '🛋️', category: 'Home', color: '#F0E3FF' },
  { id: 'p8', name: 'Scented Candle Set', price: 26, emoji: '🕯️', category: 'Home', color: '#FFE9D6' },
  { id: 'p9', name: 'Wireless Earbuds', price: 89, emoji: '🎧', category: 'Gadgets', color: '#DDEBFF' },
  { id: 'p10', name: 'Mini Polaroid Cam', price: 64, emoji: '📷', category: 'Gadgets', color: '#E7E7E7' },
  { id: 'p11', name: 'Smart Desk Lamp', price: 34, emoji: '💡', category: 'Gadgets', color: '#FFF3D0' },
  { id: 'p12', name: 'Portable Speaker', price: 42, emoji: '🔊', category: 'Gadgets', color: '#D6F0FF' },
  { id: 'p13', name: 'Rose Face Mask Set', price: 18, emoji: '🌹', category: 'Beauty', color: '#FFDCE6' },
  { id: 'p14', name: 'Silk Hair Scrunchie', price: 9, emoji: '🎀', category: 'Beauty', color: '#F3D6FF' },
  { id: 'p15', name: 'Lavender Bath Bomb', price: 7, emoji: '🛁', category: 'Beauty', color: '#E4D6FF' },
  { id: 'p16', name: 'Glow Serum', price: 29, emoji: '🧴', category: 'Beauty', color: '#D6FFE9' },
];
