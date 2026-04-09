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

// Impede que a tela de splash suma antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    Newsreader_700Bold,
  });

  // 1. Inicializa o Banco de Dados SQLite assim que o app abre
  useEffect(() => {
    try {
      initDatabase();
      console.log("SQLite: Banco de dados local inicializado com sucesso.");
    } catch (error) {
      console.error("SQLite: Erro ao iniciar banco local", error);
    }
  }, []);

  // 2. Gerencia o fechamento da tela de Splash
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Enquanto as fontes não carregam, não renderiza nada
  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <NavProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
            }}
          >
            {/* Definição das rotas principais */}
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
