import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { ID } from 'jazz-tools';
import { group, sift } from 'radashi';
import { useCallback, useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import { TodoListBottomSheet } from '~/components/TodoListsScreen/TodoListBottomSheet';
import TodoListListItem from '~/components/TodoListsScreen/TodoListListItem';
import { useCouple, usePartnerProfiles } from '~/src/schemas/schema.jazz';
import { DefaultTodoList, TodoList } from '~/src/schemas/todoSchema';

export default function TodoLists() {
  const { myProfile, partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [toUpdate, setToUpdate] = useState<TodoList | null>(null);
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
  //     { items: TodoItems.create([], { owner: couple._owner }) },
  //     { owner: couple._owner }
  //   );
  //   couple.partnerBTodos = DefaultTodoList.create(
  //     { items: TodoItems.create([], { owner: couple._owner }) },
  //     { owner: couple._owner }
  //   );
  //   couple.ourTodos = TodoList.create(
  //     {
  //       title: 'Our To-Dos',
  //       items: TodoItems.create([], { owner: couple._owner }),
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
  const { myDefaultListId, partnerDefaultListId, sharedDefaultListId } = useMemo(() => {
    const empty = { myDefaultListId: null, partnerDefaultListId: null, sharedDefaultListId: null };
    if (!couple) return empty;
    if (!myProfile?.accountId || !partnerProfile?.accountId) return empty;
    const myAccountId = myProfile.accountId;

    if (myAccountId === couple.partnerA?.accountId) {
      return {
        myDefaultListId: couple.partnerATodos?.id ?? null,
        partnerDefaultListId: couple.partnerBTodos?.id ?? null,
        sharedDefaultListId: couple.ourTodos?.id ?? null,
      };
    } else {
      return {
        myDefaultListId: couple.partnerBTodos?.id ?? null,
        partnerDefaultListId: couple.partnerATodos?.id ?? null,
        sharedDefaultListId: couple.ourTodos?.id ?? null,
      };
    }
  }, [
    couple?.partnerA?.id,
    couple?.partnerB?.id,
    couple?.ourTodos,
    couple?.partnerATodos,
    couple?.partnerBTodos,
    myProfile?.accountId,
    partnerProfile?.accountId,
  ]);

  const { myLists, partnerLists, sharedLists } = useMemo(() => {
    const myAccountId = myProfile?.accountId;
    const liveLists = sift(couple?.todoLists ?? []);
    const { me, partner, us } = group(liveLists, (list) => {
      if (list.deleted) return 'deleted';
      if (list.assignedTo === 'me') {
        if (list.creatorAccID === myAccountId) return 'me';
        return 'partner';
      } else if (list.assignedTo === 'partner') {
        if (list.creatorAccID === myAccountId) return 'partner';
        return 'me';
      }
      return 'us';
    });

    return {
      myLists: me ?? [],
      partnerLists: partner ?? [],
      sharedLists: us ?? [],
    };
  }, [couple?.todoLists, myProfile?.accountId]);

  const onItemPress = useCallback((listId: string) => {
    router.push({
      pathname: '/(protected)/todo/[id]',
      params: { id: listId },
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {myProfile?.avatar && myDefaultListId && (
          <TodoListListItem
            avatar={myProfile.avatar}
            title="My To-Dos"
            listId={myDefaultListId as ID<TodoList | DefaultTodoList>}
            onPress={() => onItemPress(myDefaultListId as ID<TodoList | DefaultTodoList>)}
            disableSwipe
          />
        )}

        {partnerProfile?.avatar && partnerDefaultListId && (
          <TodoListListItem
            avatar={partnerProfile.avatar}
            title={`${partnerProfile?.nickname ?? 'Partner'}'s To-Dos`}
            listId={partnerDefaultListId as ID<TodoList | DefaultTodoList>}
            onPress={() => onItemPress(partnerDefaultListId as ID<TodoList | DefaultTodoList>)}
            disableSwipe
          />
        )}
        {sharedDefaultListId && (
          <TodoListListItem
            title="Shared To-Dos"
            listId={sharedDefaultListId}
            onPress={() => onItemPress(sharedDefaultListId)}
            disableSwipe
          />
        )}
      </View>

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
            <TodoListListItem
              key={item.id}
              title={item.title}
              onPress={() => onItemPress(item.id)}
              listId={item.id}
              onDelete={() => {
                item.deleted = true;
              }}
              onEdit={() => {
                setToUpdate(item);
                bottomSheetModalRef.current?.present();
              }}
            />
          );
        }}
      />
      <TodoListBottomSheet
        ref={bottomSheetModalRef}
        toUpdate={toUpdate}
        onDismiss={() => setToUpdate(null)}
      />
      <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContainer: {
    height: 48 * 3 + 16,
    flexDirection: 'column',
    gap: 8,
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
