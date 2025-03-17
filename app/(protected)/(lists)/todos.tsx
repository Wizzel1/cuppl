import { BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';

export default function Todos() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  const snapPoints = useMemo(() => ['40%', '60%'], []);

  return (
    <View style={styles.container}>
      <Text>Todos</Text>
      <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
      <BottomSheetModal ref={bottomSheetModalRef} snapPoints={snapPoints} enablePanDownToClose>
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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    zIndex: 1000,
    alignItems: 'center',
  },
});
