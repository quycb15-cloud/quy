import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#17663b",
        tabBarInactiveTintColor: "#7b887f",
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Tổng quan" }} />
      <Tabs.Screen name="garden" options={{ title: "Vườn" }} />
      <Tabs.Screen name="production" options={{ title: "Sản lượng" }} />
      <Tabs.Screen name="workforce" options={{ title: "Nhân công" }} />
      <Tabs.Screen name="skill" options={{ title: "Tay nghề" }} />
    </Tabs>
  );
}
