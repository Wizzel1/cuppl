import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListItem from '~/components/TodoListItem';
import { TodoListBottomSheet } from '~/components/TodoListsScreen/NewTodoListBottomSheet';
import { DefaultTodoList, TodoList, useCouple, usePartnerProfiles } from '~/src/schema.jazz';

export default function Todos() {
  const { myProfile, partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [myDefaultList, setMyDefaultList] = useState<DefaultTodoList | null>(null);
  const [partnerDefaultList, setPartnerDefaultList] = useState<DefaultTodoList | null>(null);
  const [sharedDefaultList, setSharedDefaultList] = useState<DefaultTodoList | null>(null);

  const [myLists, setMyLists] = useState<TodoList[]>([]);
  const [partnerLists, setPartnerLists] = useState<TodoList[]>([]);
  const [sharedLists, setSharedLists] = useState<TodoList[]>([]);
  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  const couple = useCouple();
  const router = useRouter();

  // useEffect(() => {
  //   if (!couple) return;
  //   if (couple.todoLists?.length === 0) return;
  //   couple.todoLists = TodoLists.create([], { owner: couple._owner });
  //   couple.partnerATodos = DefaultTodoList.create(
  //     { items: TodoItems.create([]) },
  //     { owner: couple._owner }
  //   );
  //   couple.partnerBTodos = DefaultTodoList.create(
  //     { items: TodoItems.create([]) },
  //     { owner: couple._owner }
  //   );
  //   couple.ourTodos = TodoList.create(
  //     {
  //       title: 'Our To-Dos',
  //       items: TodoItems.create([]),
  //       isHidden: false,
  //       creatorAccID: couple.partnerA!.accountId,
  //       emoji: '🖊',
  //       backgroundColor: '#FFFFFF',
  //       assignedTo: 'us',
  //       deleted: false,
  //     },
  //     { owner: couple._owner }
  //   );
  // }, []);

  useEffect(() => {
    if (!couple?.todoLists) return;
    if (!myProfile?.accountId || !partnerProfile?.accountId) return;
    const myAccountId = myProfile.accountId;
    const partnerAccountId = partnerProfile.accountId;

    const myListsArray: TodoList[] = [];
    const partnerListsArray: TodoList[] = [];
    const sharedListsArray: TodoList[] = [];

    if (myAccountId === couple.partnerA?.accountId) {
      setMyDefaultList(couple.partnerATodos);
      setPartnerDefaultList(couple.partnerBTodos);
    } else {
      setMyDefaultList(couple.partnerBTodos);
      setPartnerDefaultList(couple.partnerATodos);
    }
    setSharedDefaultList(couple.ourTodos);

    for (const list of couple.todoLists) {
      if (!list) return;
      switch (list.assignedTo) {
        case 'me':
          if (list.creatorAccID === myAccountId) myListsArray.push(list);
          if (list.creatorAccID === partnerAccountId) partnerListsArray.push(list);
          break;
        case 'partner':
          if (list.creatorAccID === myAccountId) partnerListsArray.push(list);
          if (list.creatorAccID === partnerAccountId) myListsArray.push(list);
          break;
        case 'us':
          sharedListsArray.push(list);
          break;
      }
    }
    setMyLists(myListsArray);
    setPartnerLists(partnerListsArray);
    setSharedLists(sharedListsArray);
  }, [couple, myProfile?.accountId, partnerProfile?.accountId]);

  const onItemPress = useCallback((list: TodoList | DefaultTodoList) => {
    router.push({
      pathname: '/(protected)/[todoListId]',
      params: {
        todoListId: list.id,
      },
    });
  }, []);

  return (
    <View style={styles.container}>
      {myProfile?.avatar && myDefaultList && (
        <TodoListItem
          avatar={myProfile.avatar}
          title="My To-Dos"
          listId={myDefaultList.id}
          onPress={() => onItemPress(myDefaultList)}
        />
      )}
      {partnerProfile?.avatar && partnerDefaultList && (
        <TodoListItem
          avatar={partnerProfile.avatar}
          title={`${partnerProfile?.nickname ?? 'Partner'}'s To-Dos`}
          listId={partnerDefaultList.id}
          onPress={() => onItemPress(partnerDefaultList)}
        />
      )}
      {sharedDefaultList && (
        <TodoListItem
          title="Shared To-Dos"
          listId={sharedDefaultList.id}
          onPress={() => onItemPress(sharedDefaultList)}
        />
      )}
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
              paddingTop: 24,
              fontSize: 18,
              color: '#18181B',
              fontWeight: '600',
              backgroundColor: 'white',
            }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          if (!item) return null;
          return (
            <TodoListItem
              key={item.id}
              title={item.title}
              onPress={() => onItemPress(item)}
              listId={item.id}
            />
          );
        }}
      />
      <TodoListBottomSheet ref={bottomSheetModalRef} />
      <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  sheetContainer: {
    zIndex: 1000,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerContainer: {
    padding: 12,
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#80f',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
});
