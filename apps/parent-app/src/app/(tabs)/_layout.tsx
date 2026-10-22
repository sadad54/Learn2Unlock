import { Tabs } from "expo-router";
import { colors } from "@learn2unlock/shared/theme";
import { ParentIconBadge, type ParentIconName } from "@/components/themed-icon";

function TabMark({ icon, focused }: { icon: ParentIconName; focused: boolean }) { return <ParentIconBadge name={icon} active={focused} size={34} />; }

export default function TabLayout() {
  return <Tabs screenOptions={{ headerStyle: { backgroundColor: colors.parent.background }, headerTintColor: colors.parent.text, headerShadowVisible: false, sceneStyle: { backgroundColor: colors.parent.background }, tabBarStyle: { backgroundColor: "#102139", borderTopColor: colors.parent.border, height: 72 }, tabBarActiveTintColor: colors.parent.primary, tabBarInactiveTintColor: colors.parent.textMuted }}>
    <Tabs.Screen name="index" options={{ title: "Home", headerTitle: "Good afternoon", tabBarIcon: ({ focused }) => <TabMark icon="home" focused={focused} /> }} />
    <Tabs.Screen name="questions" options={{ title: "Questions", tabBarIcon: ({ focused }) => <TabMark icon="questions" focused={focused} /> }} />
    <Tabs.Screen name="reports" options={{ title: "Reports", tabBarIcon: ({ focused }) => <TabMark icon="reports" focused={focused} /> }} />
    <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ focused }) => <TabMark icon="settings" focused={focused} /> }} />
  </Tabs>;
}
