import { View, StyleSheet, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  style,
  ...props
}: ViewProps & { edges?: Edge[] }) {
  return (
    <View style={[styles.outer, style]} {...props}>
      <SafeAreaView style={styles.safeArea} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#f4f7f2" },
  safeArea: { flex: 1 },
});
