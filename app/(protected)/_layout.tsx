import { Stack } from 'expo-router';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Lists' }} />
    </Stack>
  );
}
