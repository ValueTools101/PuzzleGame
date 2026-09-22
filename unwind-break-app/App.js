import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import BreatheScreen from './src/screens/BreatheScreen';
import GameScreen from './src/screens/GameScreen';
import VentScreen from './src/screens/VentScreen';
import ShopScreen from './src/screens/ShopScreen';
import AboutScreen from './src/screens/AboutScreen';

export default function App() {
  const [screen, setScreen] = useState('home');

  function renderScreen() {
    switch (screen) {
      case 'breathe':
        return <BreatheScreen onBack={() => setScreen('home')} />;
      case 'game':
        return <GameScreen onBack={() => setScreen('home')} />;
      case 'vent':
        return <VentScreen onBack={() => setScreen('home')} />;
      case 'shop':
        return <ShopScreen onBack={() => setScreen('home')} />;
      case 'about':
        return <AboutScreen onBack={() => setScreen('home')} />;
      default:
        return <HomeScreen onNavigate={setScreen} />;
    }
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {renderScreen()}
    </SafeAreaProvider>
  );
}
