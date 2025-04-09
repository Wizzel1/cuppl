import { useClerk } from '@clerk/clerk-expo';
import { JazzProviderWithClerk } from 'jazz-expo/auth/clerk';
import { PropsWithChildren } from 'react';

import { CoupleAccount } from '~/src/schemas/schema.jazz';

export function JazzAndAuth({ children }: PropsWithChildren) {
  const clerk = useClerk();

  return (
    <JazzProviderWithClerk
      clerk={clerk}
      AccountSchema={CoupleAccount}
      sync={{
        peer: `wss://cloud.jazz.tools/?key=${process.env.EXPO_PUBLIC_JAZZ_KEY}`,
      }}>
      {children}
    </JazzProviderWithClerk>
  );
}

declare module 'jazz-expo' {
  interface Register {
    Account: CoupleAccount;
  }
}
