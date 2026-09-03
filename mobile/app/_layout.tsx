import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider } from "@/hooks/use-auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </trpc.Provider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
