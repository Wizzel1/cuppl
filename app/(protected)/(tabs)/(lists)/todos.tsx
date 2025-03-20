import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, SectionList, StyleSheet, Switch, Text, View } from 'react-native';
import EmojiPicker from 'rn-emoji-keyboard';
import * as DropdownMenu from 'zeego/dropdown-menu';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListItem from '~/components/TodoListItem';
import {
  DefaultTodoList,
  TodoItems,
  TodoList,
  useCouple,
  usePartnerProfiles,
} from '~/src/schema.jazz';

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

  const onItemPress = (list: TodoList | DefaultTodoList) => {
    router.push({
      pathname: '/(protected)/[todo]',
      params: {
        todo: list.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      {myProfile?.avatar && (
        <TodoListItem
          avatar={myProfile.avatar}
          title="My To-Dos"
          todosCount={10}
          completedCount={5}
          onPress={() => onItemPress(myLists[0])}
        />
      )}
      {partnerProfile?.avatar && (
        <TodoListItem
          avatar={partnerProfile.avatar}
          title={`${partnerProfile?.nickname ?? 'Partner'}'s To-Dos`}
          todosCount={10}
          completedCount={5}
          onPress={() => onItemPress(partnerLists[0])}
        />
      )}
      <TodoListItem
        backgroundColor="#ADD8E6"
        emoji="😮‍💨"
        title="Shared To-Dos"
        todosCount={10}
        completedCount={5}
        onPress={() => onItemPress(sharedLists[0])}
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
              backgroundColor: 'white',
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
            onPress={() => onItemPress(item)}
            backgroundColor={item?.backgroundColor}
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
  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);
  const couple = useCouple();
  const { myProfile } = usePartnerProfiles();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emoji, setEmoji] = useState('🖊');
  const [hideFromPartner, setHideFromPartner] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<TodoList['assignedTo']>('us');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showHideFromPartner, setShowHideFromPartner] = useState(false);
  const [owner, setOwner] = useState('Both of us');
  const [activeScreen, setActiveScreen] = useState<'todo' | 'color' | 'emoji'>('todo');
  const handleSubmit = () => {
    if (!couple?.todoLists) return;

    const newList = TodoList.create(
      {
        title: title.trim(),
        items: TodoItems.create([]),
        emoji,
        isHidden: hideFromPartner,
        backgroundColor,
        creatorAccID: myProfile!.accountId,
        assignedTo,
        deleted: false,
      },
      { owner: couple._owner }
    );
    couple.todoLists.push(newList);
    setTitle('');
    setEmoji('');
    setHideFromPartner(false);
    setBackgroundColor('#FFFFFF');
    if (ref && 'current' in ref) {
      ref.current?.dismiss();
    }
  };

  useEffect(() => {
    switch (assignedTo) {
      case 'us':
        setOwner('Both of us');
        setShowHideFromPartner(false);
        break;
      case 'partner':
        setOwner('Partner');
        setShowHideFromPartner(false);
        break;
      case 'me':
        setOwner('Me');
        setShowHideFromPartner(true);
        break;
    }
  }, [assignedTo]);

  const getScreenHeight = () => {
    if (activeScreen === 'color') return 400;
    if (activeScreen === 'emoji') return 150;
    if (showHideFromPartner) return 250;
    return 200;
  };

  const TodoScreen = () => {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'space-between',
          }}>
          <BottomSheetTextInput
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
              defaultHeight={Dimensions.get('window').height * 0.7}
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
            <Pressable onPress={() => setActiveScreen('color')}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E4E4E7',
                  justifyContent: 'center',
                  backgroundColor,
                }}
              />
            </Pressable>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 16, color: '#27272A' }}>Owner</Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <View
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  width: 120,
                  backgroundColor: '#F4F4F5',
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#8E51FF' }}>{owner}</Text>
              </View>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                key="me"
                onSelect={() => {
                  setAssignedTo('me');
                }}>
                <DropdownMenu.ItemTitle>Me</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                key="us"
                onSelect={() => {
                  setAssignedTo('us');
                }}>
                <DropdownMenu.ItemTitle>Both</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                key="partner"
                onSelect={() => {
                  setAssignedTo('partner');
                }}>
                <DropdownMenu.ItemTitle>Partner</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </View>
        {showHideFromPartner && (
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
                backgroundColor: hideFromPartner ? '#8E51FF' : '#E4E4E7',
                borderRadius: 20,
              }}>
              <Switch
                trackColor={{ true: 'transparent', false: 'transparent' }}
                thumbColor="white"
                value={hideFromPartner}
                onValueChange={setHideFromPartner}
                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
              />
            </View>
          </View>
        )}
        <View style={{ height: 86 }} />
      </>
    );
  };

  const colors = [
    '#F7E987',
    '#FFD4D4',
    '#FFEEB3',
    '#FFFAC0',
    '#FBFFA3',
    '#E3FCBF',
    '#D0F5BE',
    '#C8FFE0',
    '#B8F1F1',
    '#D0F5FF',
    '#D9F8FF',
    '#D6E5FA',
    '#E5DBFF',
    '#F1E4FF',
    '#F9ECFF',
    '#FFE9F9',
    '#FFDDF3',
    '#FFD6E5',
  ];

  const ColorPickerScreen = () => {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
          <Pressable onPress={() => setActiveScreen('todo')}>
            <Text style={{ fontSize: 16, color: '#8E51FF' }}>← Back</Text>
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Choose Color</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {colors.map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                setBackgroundColor(color);
                setActiveScreen('todo');
              }}
              style={{ marginBottom: 16 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: color,
                  borderWidth: 1,
                  borderColor: '#E4E4E7',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {color === backgroundColor && (
                  <View
                    style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#8E51FF' }}
                  />
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={backdropComponent}
      enablePanDownToClose
      enableDynamicSizing>
      <BottomSheetView
        style={{
          ...styles.sheetContainer,
          height: getScreenHeight(),
        }}>
        {activeScreen === 'todo' && <TodoScreen />}
        {activeScreen === 'color' && <ColorPickerScreen />}
        {/* {activeScreen === 'emoji' && <EmojiPickerScreen />} */}
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
    zIndex: 1000,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
});
