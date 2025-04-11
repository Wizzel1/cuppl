import { useRouter } from 'expo-router';
import { useAccount, useCoState } from 'jazz-expo';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import { Couple, shareCouple } from '~/src/schemas/schema.jazz';
export default function Profile() {
  const { me, logOut } = useAccount();
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const router = useRouter();
  const couple = useCoState(Couple, me.coupleId);

  useEffect(() => {
    setInviteLink(couple ? shareCouple(couple) : null);
  }, [couple?.id]);

  function handleLogOut() {
    logOut();
    router.navigate('/(auth)/signin');
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Profile</Text>
      <Button title="Log Out" onPress={handleLogOut} />
      {me ? <Text>Me {me.profile?.name}</Text> : <Text>No me</Text>}
      {couple ? <Text>Couple {couple.id}</Text> : <Text>No couple</Text>}
      {couple ? <Text>Couple owner {couple._owner.id}</Text> : <Text>No couple owner</Text>}
      <Text>My account {JSON.stringify(me.root)}</Text>

      <Text selectable>{inviteLink}</Text>
    </View>
  );
}
