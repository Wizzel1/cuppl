import { Stack } from 'expo-router';

export default function TodosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'To-Do Lists', headerShown: false }} />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
