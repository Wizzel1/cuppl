import { useClerk } from '@clerk/clerk-expo';
import { JazzProviderWithClerk } from 'jazz-react-native-auth-clerk';
import { Account } from 'jazz-tools';
import { PropsWithChildren } from 'react';

// import { apiKey } from './apiKey';

export function JazzAndAuth({ children }: PropsWithChildren) {
  const clerk = useClerk();

  return (
    <JazzProviderWithClerk
      clerk={clerk}
      storage="sqlite"
      AccountSchema={Account}
      sync={{
        peer: `wss://cloud.jazz.tools/?key=r_christian@gmx.de`,
      }}>
      {children}
    </JazzProviderWithClerk>
  );
}

// declare module 'jazz-react-native' {
//   interface Register {
//     Account: CoupleAppAccount;
//   }
// }
