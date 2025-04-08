import { useAccount, useCoState } from 'jazz-expo';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

import { Couple } from '~/src/schemas/coupleSchema.jazz';

export default function Profile() {
  const { me, logOut } = useAccount();
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const couple = useCoState(Couple, me.coupleId);

  useEffect(() => {
    setInviteLink(couple ? (couple.getInviteLink() ?? null) : null);
  }, [couple?.id]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Profile</Text>
      <Button title="Log Out" onPress={logOut} />
      {me ? <Text>{me.profile?.name}</Text> : <Text>No profile</Text>}
      {couple ? <Text>Couple {couple.id}</Text> : <Text>No couple</Text>}
      {couple ? <Text>Couple owner {couple._owner.id}</Text> : <Text>No couple owner</Text>}
      <Text>My account {me.id}</Text>

      <Text style={{ marginTop: 20 }} selectable>
        {inviteLink}
      </Text>
    </View>
  );
}
