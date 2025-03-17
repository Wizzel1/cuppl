import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { ProgressiveImg } from 'jazz-react-native';
import { useCallback, useMemo, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import { PartnerProfile, usePartnerProfiles } from '~/src/schema.jazz';

function DefaultTodoListItem({
  partner,
  title,
}: {
  partner: PartnerProfile | null;
  title: string;
}) {
  if (!partner) return null;
  return (
    <View
      style={{
        marginHorizontal: 24,
        marginVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <ProgressiveImg image={partner?.avatar} maxWidth={200}>
          {({ src, originalSize, res }) => (
            <Image
              source={{ uri: src }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                resizeMode: 'cover',
              }}
            />
          )}
        </ProgressiveImg>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#18181B' }}>{title}</Text>
          <Text style={{ fontSize: 14, color: '#71717B' }}>10/20</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward-outline" size={24} color="black" />
    </View>
  );
}

export default function Todos() {
  const { myProfile, partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  const snapPoints = useMemo(() => ['40%', '60%'], []);

  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);

  return (
    <View style={styles.container}>
      <DefaultTodoListItem partner={myProfile} title="My To-Dos" />
      <DefaultTodoListItem partner={partnerProfile} title="Partner To-Dos" />

      <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        backdropComponent={backdropComponent}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={styles.contentContainer}>
          <Text>Text</Text>
          <BottomSheetTextInput placeholder="Add a todo" />
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    zIndex: 1000,
    alignItems: 'center',
  },
});
