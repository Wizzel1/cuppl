import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import EmojiPicker from 'rn-emoji-keyboard';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListItem from '~/components/TodoListItem';
import { TodoItems, TodoList, useCouple, usePartnerProfiles } from '~/src/schema.jazz';
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
  const router = useRouter();

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
    console.log(couple.todoLists.length);

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
          <Text
            style={{
              paddingHorizontal: 24,
              paddingTop: 24,
              fontSize: 18,
              color: '#18181B',
              fontWeight: '600',
            }}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TodoListItem
            key={item?.id}
            title={item?.title ?? ''}
            todosCount={2}
            completedCount={2}
            onPress={() => {
              router.push(`/(protected)/(lists)/(todos)/${item?.id}`);
            }}
            backgroundColor="red"
            emoji={item?.emoji}
          />
        )}
      />
      <TodoListBottomSheet ref={bottomSheetModalRef} />
      <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
    </View>
  );
}

const TodoListBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const snapPoints = useMemo(() => ['40%'], []);
  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);
  const couple = useCouple();
  const { myProfile } = usePartnerProfiles();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emoji, setEmoji] = useState('🖊');
  const [isHidden, setIsHidden] = useState(false);
  const [title, setTitle] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const handleSubmit = () => {
    if (!couple?.todoLists) return;

    const newList = TodoList.create(
      {
        title: title.trim(),
        items: TodoItems.create([]),
        emoji,
        isHidden,
        backgroundColor,
        creatorAccID: myProfile!.accountId,
        assignedTo: 'us',
        deleted: false,
      },
      { owner: couple._owner }
    );
    couple.todoLists.push(newList);
    setTitle('');
    setEmoji('');
    setIsHidden(false);
    setBackgroundColor('#FFFFFF');
    if (ref && 'current' in ref) {
      ref.current?.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={backdropComponent}
      snapPoints={snapPoints}
      enablePanDownToClose>
      <BottomSheetView style={styles.sheetContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'space-between',
          }}>
          <TextInput
            placeholder="New Todo List"
            style={{ fontSize: 24, fontWeight: '600', color: '#27272A' }}
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={handleSubmit}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <EmojiPicker
              onEmojiSelected={(emoji) => setEmoji(emoji.emoji)}
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
            />
            <Pressable onPress={() => setPickerOpen(true)}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E4E4E7',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 20, textAlign: 'center' }}>{emoji}</Text>
              </View>
            </Pressable>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E4E4E7',
                justifyContent: 'center',
                backgroundColor: '#F4F4F5',
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
          }}>
          <Text style={{ fontSize: 16, color: '#27272A' }}>Hide from partner</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#D4D4D8',
              borderRadius: 20,
            }}>
            <Switch
              trackColor={{ true: 'transparent', false: 'transparent' }}
              thumbColor="white"
              value={isHidden}
              onValueChange={setIsHidden}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  sheetContainer: {
    flex: 1,
    padding: 24,
    zIndex: 1000,
  },
});
