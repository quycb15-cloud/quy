import { StyleSheet } from "react-native";

export function number(value: unknown, digits = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? parsed.toLocaleString("vi-VN", { maximumFractionDigits: digits })
    : "—";
}

export function date(value: unknown) {
  if (!value) return "—";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("vi-VN");
}

export const colors = {
  ink: "#173027",
  muted: "#6d7c73",
  primary: "#17663b",
  primarySoft: "#dff1e4",
  background: "#f4f7f2",
  surface: "#ffffff",
  border: "#dce7df",
  warning: "#a66a13",
  danger: "#a84435",
};

export const styles = StyleSheet.create({
  page: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28 },
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  title: { color: colors.ink, fontSize: 27, fontWeight: "800", marginTop: 4 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: 14, padding: 16 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  label: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  value: { color: colors.ink, fontSize: 23, fontWeight: "800", marginTop: 5 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  empty: { color: colors.muted, fontSize: 14, lineHeight: 20, paddingVertical: 12 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, paddingVertical: 12 },
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 13, marginTop: 16, paddingHorizontal: 16, paddingVertical: 13 },
  buttonText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  pill: { backgroundColor: colors.primarySoft, borderRadius: 999, color: colors.primary, fontSize: 12, fontWeight: "700", overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5 },
});
