import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { resourceCache } from '@clerk/clerk-expo/resource-cache';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { useIsAuthenticated } from 'jazz-expo';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { JazzAndAuth } from '~/providers/JazzAndAuth';
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing publishable key');
}

function InitialLayout() {
  const isAuthenticated = useIsAuthenticated();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('isAuthenticated', isAuthenticated);
    const inAuthGroup = segments[0] === '(protected)';
    if (isAuthenticated && inAuthGroup) {
      router.replace('/(protected)');
    } else if (!isAuthenticated && pathname !== '/signin') {
      router.replace('/(auth)/signin');
    }
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // This prevents directory group names from showing as headers
        headerTitle: '',
      }}>
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <ClerkProvider
          publishableKey={publishableKey!}
          tokenCache={tokenCache}
          __experimental_resourceCache={resourceCache}>
          <ClerkLoaded>
            <JazzAndAuth>
              <InitialLayout />
            </JazzAndAuth>
          </ClerkLoaded>
        </ClerkProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
