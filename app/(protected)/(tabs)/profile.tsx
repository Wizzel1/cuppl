import { useAccount, useCoState } from 'jazz-react-native';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import { Couple, shareCouple } from '~/src/schema.jazz';
export default function Profile() {
  const { me, logOut } = useAccount();
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const couple = useCoState(Couple, me.coupleId);

  useEffect(() => {
    setInviteLink(couple ? shareCouple(couple) : null);
  }, [couple?.id]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Profile</Text>
      <Button title="Log Out" onPress={logOut} />
      {couple ? <Text>Couple {couple.id}</Text> : <Text>No couple</Text>}
      <Text selectable>{inviteLink}</Text>
    </View>
  );
}
