import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { useAccount } from 'jazz-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { JazzAndAuth } from '~/providers/JazzAndAuth';
import { tokenCache } from '~/utils/tokenCache';
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing publishable key');
}

function InitialLayout() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const { logOut } = useAccount();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(protected)';
    if (isSignedIn && !inAuthGroup) {
      router.replace('/(protected)/home');
    } else if (!isSignedIn && pathname !== '/signin') {
      // logOut();
      router.replace('/signin');
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // This prevents directory group names from showing as headers
        headerTitle: '',
      }}>
      <Stack.Screen name="(protected)/home" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  console.log('RootLayout');
  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <ClerkLoaded>
        <JazzAndAuth>
          <InitialLayout />
        </JazzAndAuth>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
