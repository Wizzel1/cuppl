import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { resourceCache } from '@clerk/clerk-expo/resource-cache';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { useAccount, useIsAuthenticated } from 'jazz-expo';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { JazzAndAuth } from '~/providers/JazzAndAuth';
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Missing publishable key');
}

function InitialLayout() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { me } = useAccount();
  const segments = useSegments();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  console.log('isAuthenticated', isAuthenticated);
  console.log('isSignedIn', isSignedIn);

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === '(protected)';
    if (isSignedIn && !inAuthGroup) {
      router.replace('/(protected)');
    } else if (!isSignedIn && pathname !== '/signin') {
      router.replace('/signin');
    }
  }, [isSignedIn, me.id]);

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
      <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
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
