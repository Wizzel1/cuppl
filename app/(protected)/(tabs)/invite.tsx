import { useRouter } from 'expo-router';
import { useAcceptInvite, useAccount } from 'jazz-expo';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Linking, StyleSheet, Text, View } from 'react-native';

import { Couple } from '~/src/schemas/schema.jazz';

export default function HandleInviteScreen() {
  const router = useRouter();
  const { me } = useAccount();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Common error handler function
  const handleError = (error: unknown, customMessage?: string) => {
    console.error('Invite error:', error);
    setStatus('error');

    // Extract error message with fallbacks
    const errorMsg =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : customMessage || 'Unknown error occurred';

    setErrorMessage(errorMsg);
  };

  // Check if user is already in a couple
  // useEffect(() => {
  //   if (me.root?.hasCouple) {
  //     setStatus('error');
  //     setErrorMessage('You are already in a couple. You cannot accept another invitation.');
  //   }
  // }, [me.root?.hasCouple]);

  // Use the useAcceptInvite hook to handle the invite
  useAcceptInvite({
    invitedObjectSchema: Couple,
    onAccept: async (coupleId) => {
      try {
        console.log('Accepting invite for couple:', coupleId);
        await me.acceptCoupleInvite(coupleId);
        setStatus('success');
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          router.replace('/(protected)');
        }, 2000);
      } catch (error) {
        handleError(error, 'Error accepting invite');
      }
    },
  });

  // Set a timeout to detect if the invite processing is taking too long
  useEffect(() => {
    const listener = Linking.addEventListener('url', (url) => {
      console.log('url', url);
    });
    const timer = setTimeout(() => {
      if (status === 'loading') {
        handleError(
          new Error('Invitation processing timed out'),
          'The invite may be invalid or expired. Please ask for a new invite link.'
        );
      }
    }, 10000); // 10 seconds timeout

    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, []);

  // Go back to home
  const goToHome = () => {
    router.replace('/(protected)/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Couple Invitation</Text>

      {status === 'loading' && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.statusText}>Processing your invitation...</Text>
          <Text style={styles.subText}>This should only take a moment</Text>
        </View>
      )}

      {status === 'success' && (
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, styles.successText]}>
            Invitation accepted successfully!
          </Text>
          <Text style={styles.subText}>You are now connected with your partner</Text>
          <Text style={styles.redirectText}>Redirecting to home screen...</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, styles.errorText]}>Error accepting invitation</Text>
          {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
          <View style={styles.buttonContainer}>
            <Button title="Go to Home" onPress={goToHome} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  statusText: {
    fontSize: 18,
    marginVertical: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#666',
  },
  redirectText: {
    fontSize: 14,
    marginTop: 20,
    color: '#888',
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: 'red',
  },
  errorMessage: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fff0f0',
    borderRadius: 5,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});
