import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "@/lib/ui";

export default function OAuthCallback() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace("/(tabs)"), 250);
    return () => clearTimeout(timer);
  }, []);

  return <View style={{ alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center", padding: 24 }}><ActivityIndicator color={colors.primary} /><Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700", marginTop: 12 }}>Đang hoàn tất đăng nhập…</Text></View>;
}
