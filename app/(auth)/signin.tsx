import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';

const latestAccountNumber = 21;
export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        console.log('signInAttempt', signInAttempt);
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(protected)/(tabs)/home');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
      />
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry
        onChangeText={(password) => setPassword(password)}
      />
      <Button title="Sign in" onPress={onSignInPress} />
      <View>
        <Text>Don't have an account?</Text>
        <Link href="/(auth)/signup">
          <Text>Sign up</Text>
        </Link>
      </View>
      <Button
        title={`Account${latestAccountNumber - 1}`}
        onPress={() => {
          setEmailAddress(`test${latestAccountNumber - 1}+clerk_test@test.com`);
          setPassword(`test${latestAccountNumber - 1}+clerk_test`);
        }}
      />
      <Button
        title={`Account${latestAccountNumber}`}
        onPress={() => {
          setEmailAddress(`test${latestAccountNumber}+clerk_test@test.com`);
          setPassword(`test${latestAccountNumber}+clerk_test`);
        }}
      />
    </View>
  );
}
