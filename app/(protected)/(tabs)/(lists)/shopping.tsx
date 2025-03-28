import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { SectionList, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import { ShoppingListBottomSheet } from '~/components/ShoppingListScreen/ShoppingListBottomSheet';
import ShoppingListListItem from '~/components/ShoppingListScreen/ShoppingListListItem';
import { useCouple, usePartnerProfiles } from '~/src/schemas/schema.jazz';
import { ShoppingList } from '~/src/schemas/shoppingSchema';

export default function ShoppingLists() {
  const couple = useCouple();
  const { myProfile, partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // useEffect(() => {
  //   if (!couple) return;
  //   console.log('couple', couple);
  //   couple.shoppingLists = ShoppingLists.create([], { owner: couple._owner });
  // }, [couple?.id]);
  const [toUpdate, setToUpdate] = useState<ShoppingList | null>(null);

  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  const onItemPress = useCallback((listId: string) => {
    router.push({
      pathname: '/(protected)/shopping/[id]',
      params: { id: listId },
    });
  }, []);

  const { myLists, partnerLists, sharedLists } = useMemo(() => {
    const empty = { myLists: [], partnerLists: [], sharedLists: [] };
    if (!couple?.shoppingLists) return empty;
    if (!myProfile?.accountId || !partnerProfile?.accountId) return empty;
    const myAccountId = myProfile.accountId;
    const partnerAccountId = partnerProfile.accountId;

    const myLists: ShoppingList[] = [];
    const partnerLists: ShoppingList[] = [];
    const sharedLists: ShoppingList[] = [];

    for (const list of couple.shoppingLists) {
      if (!list) continue;
      if (list.deleted) continue;
      switch (list.assignedTo) {
        case 'me':
          if (list.creatorAccID === myAccountId) myLists.push(list);
          if (list.creatorAccID === partnerAccountId) partnerLists.push(list);
          break;
        case 'partner':
          if (list.creatorAccID === myAccountId) partnerLists.push(list);
          if (list.creatorAccID === partnerAccountId) myLists.push(list);
          break;
        case 'us':
          sharedLists.push(list);
          break;
      }
    }

    return {
      myLists,
      partnerLists,
      sharedLists,
    };
  }, [couple?.shoppingLists, myProfile?.accountId, partnerProfile?.accountId]);
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SectionList
        sections={[
          { title: 'My Lists', data: myLists },
          { title: "Partner's Lists", data: partnerLists },
          { title: 'Shared Lists', data: sharedLists },
        ]}
        renderSectionHeader={({ section }) => (
          <Text
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 12,
              fontSize: 18,
              color: '#18181B',
              fontWeight: '600',
              backgroundColor: 'white',
            }}>
            {section.title}
          </Text>
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          if (!item) return null;
          return (
            <ShoppingListListItem
              key={item.id}
              title={item.title}
              onPress={() => onItemPress(item.id)}
              listId={item.id}
              onDelete={() => {}}
              onEdit={() => {
                setToUpdate(item);
                bottomSheetModalRef.current?.present();
              }}
            />
          );
        }}
      />
      <ShoppingListBottomSheet
        ref={bottomSheetModalRef}
        toUpdate={toUpdate}
        onDismiss={() => setToUpdate(null)}
      />
      <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
    </View>
  );
}
