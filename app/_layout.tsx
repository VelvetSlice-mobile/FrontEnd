import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Newsreader_400Regular, Newsreader_700Bold, Newsreader_400Regular_Italic } from '@expo-google-fonts/newsreader';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { JosefinSans_400Regular } from '@expo-google-fonts/josefin-sans';
import { CartProvider } from '../src/contexts/CartContext';
import { AuthProvider } from '../src/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_700Bold,
    Newsreader_400Regular_Italic,
    Poppins_400Regular,
    JosefinSans_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="reset-password" />
          <Stack.Screen name="search" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="pix-payment" />
          <Stack.Screen name="payment-success" />
          <Stack.Screen name="orders" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="settings/edit-name" />
          <Stack.Screen name="settings/edit-phone" />
          <Stack.Screen name="settings/edit-email" />
          <Stack.Screen name="settings/edit-password" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
