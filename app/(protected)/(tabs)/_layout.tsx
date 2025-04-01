import { Tabs } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ tabBarLabel: 'Home' }} />
      <Tabs.Screen name="(lists)" options={{ tabBarLabel: 'Lists' }} />
      <Tabs.Screen name="calendar" options={{ tabBarLabel: 'Calendar' }} />
      <Tabs.Screen name="invite" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile' }} />
    </Tabs>
  );
}
