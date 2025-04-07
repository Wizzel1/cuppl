import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCoState } from 'jazz-expo';
import { group, sift } from 'radashi';
import { useCallback, useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListListItem from '~/components/TodoListsScreen/TodoListListItem';
import { TodoListBottomSheet } from '~/components/bottomSheets/TodoListBottomSheet';
import { Couple, useCouple } from '~/src/schemas/coupleSchema.jazz';
import { usePartnerProfiles } from '~/src/schemas/schema.jazz';
import { ResolvedTodoList, TodoList } from '~/src/schemas/todoSchema';

export default function TodoListsScreen() {
  const { myProfile, partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [toUpdate, setToUpdate] = useState<TodoList | null>(null);
  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };
  const shallowCouple = useCouple();
  const couple = useCoState(Couple, shallowCouple?.id, {
    resolve: {
      partnerATodos: { items: { $each: true } },
      partnerBTodos: { items: { $each: true } },
      sharedTodos: { items: { $each: true } },
      todoLists: { $each: { items: { $each: true } } },
    },
  });

  const router = useRouter();

  // useEffect(() => {
  //   if (!shallowCouple) return;
  // if (shallowCouple.todoLists?.length === 0) return;
  //   console.log('shallowCouple', shallowCouple);
  //   shallowCouple.todoLists = TodoLists.create([], { owner: shallowCouple._owner });
  //   shallowCouple.partnerATodos = DefaultTodoList.create(
  //     { items: TodoItems.create([], { owner: shallowCouple._owner }) },
  //     { owner: shallowCouple._owner }
  //   );
  //   shallowCouple.partnerBTodos = DefaultTodoList.create(
  //     { items: TodoItems.create([], { owner: shallowCouple._owner }) },
  //     { owner: shallowCouple._owner }
  //   );
  //   shallowCouple.ourTodos = TodoList.create(
  //     {
  //       title: 'Our To-Dos',
  //       items: TodoItems.create([], { owner: shallowCouple._owner }),
  //       isHidden: false,
  //       creatorAccID: shallowCouple.partnerA!.accountId,
  //       emoji: '🖊',
  //       backgroundColor: '#FFFFFF',
  //       assignedTo: 'us',
  //       deleted: false,
  //     },
  //     { owner: shallowCouple._owner }
  //   );
  // }, [shallowCouple?.id]);
  const { myDefaultList, partnerDefaultList, sharedDefaultList } = useMemo(() => {
    const empty = { myDefaultList: null, partnerDefaultList: null, sharedDefaultList: null };
    if (!couple) return empty;
    if (!myProfile?.accountId || !partnerProfile?.accountId) return empty;
    const myAccountId = myProfile.accountId;

    if (myAccountId === couple.partnerA?.accountId) {
      return {
        myDefaultList: couple.partnerATodos,
        partnerDefaultList: couple.partnerBTodos,
        sharedDefaultList: couple.sharedTodos,
      };
    } else {
      return {
        myDefaultList: couple.partnerBTodos,
        partnerDefaultList: couple.partnerATodos,
        sharedDefaultList: couple.sharedTodos,
      };
    }
  }, [
    couple?.partnerA?.id,
    couple?.partnerB?.id,
    couple?.sharedTodos,
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
      myLists: (me ?? []) as ResolvedTodoList[],
      partnerLists: (partner ?? []) as ResolvedTodoList[],
      sharedLists: (us ?? []) as ResolvedTodoList[],
    };
  }, [couple?.todoLists, myProfile?.accountId]);

  console.log('myLists', myLists);
  console.log('partnerLists', partnerLists);
  console.log('sharedLists', sharedLists);

  const onItemPress = useCallback((listId: string) => {
    router.push({
      pathname: '/(protected)/todo/[id]',
      params: { id: listId },
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {myProfile?.avatar && myDefaultList && (
          <TodoListListItem
            avatar={myProfile.avatar}
            title="My To-Dos"
            list={myDefaultList}
            onPress={() => onItemPress(myDefaultList.id)}
            disableSwipe
          />
        )}

        {partnerProfile?.avatar && partnerDefaultList && (
          <TodoListListItem
            avatar={partnerProfile.avatar}
            title={`${partnerProfile?.nickname ?? 'Partner'}'s To-Dos`}
            list={partnerDefaultList}
            onPress={() => onItemPress(partnerDefaultList.id)}
            disableSwipe
          />
        )}
        {sharedDefaultList && (
          <TodoListListItem
            title="Shared To-Dos"
            list={sharedDefaultList}
            onPress={() => onItemPress(sharedDefaultList.id)}
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
              list={item}
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
