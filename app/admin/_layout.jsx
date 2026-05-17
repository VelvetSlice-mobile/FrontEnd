import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "admin") {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#fff" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pedidos" />
      <Stack.Screen name="pedido-detalhado" />
      <Stack.Screen name="produtos" />
      <Stack.Screen name="criar-bolo" />
      <Stack.Screen name="editar-bolo" />
    </Stack>
  );
}
