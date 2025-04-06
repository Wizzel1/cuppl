import { StyleSheet, Text, View } from 'react-native';

import CustomSwitch from '~/components/CustomSwitch';

type HideFromPartnerSectionProps = {
  hideFromPartner: boolean;
  setHideFromPartner: (hideFromPartner: boolean) => void;
};

export function HideFromPartnerSection({
  hideFromPartner,
  setHideFromPartner,
}: HideFromPartnerSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 16, color: '#27272A' }}>Hide from partner</Text>
      <CustomSwitch value={hideFromPartner} onValueChange={setHideFromPartner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
