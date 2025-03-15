import { Tabs } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="(lists)/todos" />
    </Tabs>
  );
}
