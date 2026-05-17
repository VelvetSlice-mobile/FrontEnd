import {
  Newsreader_400Regular,
  Newsreader_700Bold,
  useFonts,
} from "@expo-google-fonts/newsreader";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Navbar } from "../src/components/Navbar";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import { NavProvider, useNav } from "../src/contexts/NavContext";
import { ToastProvider } from "../src/contexts/ToastContext";
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
      console.error("Erro ao inicializar banco local:", error);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <CartProvider>
        <NavProvider>
          <ToastProvider>
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
              <Stack.Screen name="payment-failure" />
              <Stack.Screen name="orders" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="search" />
              <Stack.Screen name="admin" />
            </Stack>
            <NavbarGlobal />
            <SessionGuard />
          </ToastProvider>
        </NavProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const PUBLIC_ROUTES = new Set(["/login", "/register", "/reset-password", "/payment-success", "/payment-failure"]);

function SessionGuard() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !PUBLIC_ROUTES.has(pathname)) {
      router.replace("/login");
    }
  }, [isAuthenticated, pathname]);

  return null;
}

function NavbarGlobal() {
  const { showNav } = useNav();
  const hiddenRoutes = ["/login", "/register", "/reset-password"];
  const isAdminRoute = pathname.startsWith("/admin");
  const shouldShowNavbar = showNav && !hiddenRoutes.includes(pathname) && !isAdminRoute;

  return <Navbar visible={shouldShowNavbar} />;
}
