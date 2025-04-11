import { Redirect, Stack } from 'expo-router';
import { useIsAuthenticated } from 'jazz-expo';

export default function UnAuthenticatedLayout() {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)/home" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerTitle: '',
      }}
    />
  );
}
