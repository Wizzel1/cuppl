import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListItem from '~/components/TodoListItem';
import { TodoItems, TodoList, TodoLists, useCouple, usePartnerProfiles } from '~/src/schema.jazz';

export default function Todos() {
  const { myProfile, partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [myLists, setMyLists] = useState<TodoList[]>([]);
  const [partnerLists, setPartnerLists] = useState<TodoList[]>([]);
  const [sharedLists, setSharedLists] = useState<TodoList[]>([]);
  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  const couple = useCouple();

  // useEffect(() => {
  //   if (!couple) return;
  //   if (couple.todoLists?.length === 0) return;
  //   couple.todoLists = TodoLists.create([], { owner: couple._owner });
  // }, []);

  useEffect(() => {
    if (!couple?.todoLists) return;
    if (!myProfile?.accountId || !partnerProfile?.accountId) return;

    const myAccountId = myProfile.accountId;
    const partnerAccountId = partnerProfile.accountId;

    const myListsArray: TodoList[] = [];
    const partnerListsArray: TodoList[] = [];
    const sharedListsArray: TodoList[] = [];
    for (const list of couple.todoLists) {
      if (!list) return;
      switch (list.assignedTo) {
        case 'me':
          if (list.creatorAccID === myAccountId) myListsArray.push(list);
          break;
        case 'partner':
          if (list.creatorAccID === partnerAccountId) myListsArray.push(list);
          if (list.creatorAccID === myAccountId) partnerListsArray.push(list);
          break;
        case 'us':
          sharedListsArray.push(list);
          break;
      }
    }
    setMyLists(myListsArray);
    setPartnerLists(partnerListsArray);
    setSharedLists(sharedListsArray);
  }, [couple?.todoLists, myProfile?.accountId, partnerProfile?.accountId]);

  const snapPoints = useMemo(() => ['40%', '60%'], []);

  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);

  const addList = () => {
    if (!couple) return;
    couple!.todoLists = TodoLists.create([]);

    if (couple?.todoLists) {
      const accountId = myProfile!.accountId;
      const partnerAccountId = partnerProfile!.accountId;
      const newList = [
        TodoList.create({
          title: `New List`,
          items: TodoItems.create([]),
          isHidden: false,
          creatorAccID: accountId,
          assignedTo: 'us',
          backgroundColor: '#FFFFFF',
          deleted: false,
        }),
        TodoList.create({
          title: `New List2`,
          items: TodoItems.create([]),
          isHidden: false,
          creatorAccID: accountId,
          assignedTo: 'me',
          backgroundColor: '#FFFFFF',
          deleted: false,
        }),
        TodoList.create({
          title: `New List3`,
          items: TodoItems.create([]),
          isHidden: false,
          creatorAccID: partnerAccountId,
          assignedTo: 'partner',
          backgroundColor: '#FFFFFF',
          deleted: false,
        }),
      ];
      couple.todoLists = TodoLists.create(newList, { owner: couple._owner });
    }
  };

  return (
    <View style={styles.container}>
      <TodoListItem
        avatar={myProfile?.avatar}
        title="My To-Dos"
        todosCount={10}
        completedCount={5}
        onPress={() => {}}
      />
      <TodoListItem
        avatar={partnerProfile?.avatar}
        title={`${partnerProfile?.nickname ?? 'Partner'}'s To-Dos`}
        todosCount={10}
        completedCount={5}
        onPress={() => {}}
      />
      <TodoListItem
        backgroundColor="#ADD8E6"
        emoji="😮‍💨"
        title="Shared To-Dos"
        todosCount={10}
        completedCount={5}
        onPress={() => {}}
      />
      <SectionList
        sections={[
          { title: 'My Lists', data: myLists },
          { title: "Partner's Lists", data: partnerLists },
          { title: 'Shared Lists', data: sharedLists },
        ]}
        renderSectionHeader={({ section }) => (
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#18181B' }}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <TodoListItem
            key={item?.id}
            title={item?.title ?? ''}
            todosCount={2}
            completedCount={2}
            onPress={() => {}}
            backgroundColor={item?.backgroundColor}
            emoji={item?.emoji}
          />
        )}
      />

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
