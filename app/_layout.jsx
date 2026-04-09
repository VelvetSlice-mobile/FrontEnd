import {
  Newsreader_400Regular,
  Newsreader_700Bold,
  useFonts,
} from "@expo-google-fonts/newsreader";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import { initDatabase } from "../src/services/database";
import { NavProvider, useNav } from "../src/contexts/NavContext"; 
import { Navbar } from "../src/components/Navbar";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_700Bold,
  });

  useEffect(() => {
    try {
      initDatabase();
    } catch (error) {
    }
  }, []);

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
        <NavProvider>
          <Stack
            linking={{
              prefixes: ["myapp://"],
              config: {
                screens: {
                  "payment-success": "payment-success",
                  "payment-pending": "payment-pending",
                  "payment-error": "payment-failure",
                },
              },
            }}
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="payment-success" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="search" />
          </Stack>
          <NavbarGlobal />
        </NavProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function NavbarGlobal() {
  const { showNav } = useNav();
  return <Navbar visible={showNav} />;
}
