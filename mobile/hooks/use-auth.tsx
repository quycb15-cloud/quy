import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { clearSessionToken, getSessionToken, loginWithManus } from "@/lib/auth";
import { colors, styles } from "@/lib/ui";
import { trpc } from "@/lib/trpc";

export type MobileUser = {
  id: number;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
};

type AuthValue = {
  isAuthenticated: boolean;
  loading: boolean;
  user: MobileUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  isAuthenticated: false,
  loading: true,
  user: null,
  signIn: async () => undefined,
  signOut: async () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const utils = trpc.useUtils();
  const authQuery = trpc.auth.me.useQuery(undefined, { enabled: Boolean(token), retry: false });
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    void getSessionToken().then(value => {
      setToken(value);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthValue>(() => ({
    isAuthenticated: Boolean(token && authQuery.data),
    loading: loading || (Boolean(token) && authQuery.isLoading),
    user: (authQuery.data as MobileUser | null | undefined) ?? null,
    async signIn() {
      const success = await loginWithManus();
      if (success) {
        setToken(await getSessionToken());
        await utils.auth.me.invalidate();
      }
    },
    async signOut() {
      try {
        if (token) await logoutMutation.mutateAsync();
      } finally {
        await clearSessionToken();
        setToken(null);
        await utils.invalidate();
      }
    },
  }), [authQuery.data, authQuery.isLoading, loading, logoutMutation, token, utils]);

  if (value.loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function LoginRequired() {
  const { signIn } = useAuth();
  return (
    <View style={[styles.card, localStyles.loginCard]}>
      <Text style={styles.sectionTitle}>Đăng nhập để xem dữ liệu</Text>
      <Text style={styles.subtitle}>Ứng dụng dùng chung tài khoản Manus và quyền truy cập nội bộ của WebDev.</Text>
      <Pressable onPress={() => void signIn()} style={({ pressed }) => [styles.button, pressed && localStyles.pressed]}>
        <Text style={styles.buttonText}>Đăng nhập Manus</Text>
      </Pressable>
    </View>
  );
}

const localStyles = StyleSheet.create({
  loginCard: { marginTop: 28 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
});
