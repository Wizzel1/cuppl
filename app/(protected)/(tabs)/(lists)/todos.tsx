import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { EmojiKeyboard } from 'rn-emoji-keyboard';

import CustomSwitch from '~/components/CustomSwitch';
import FloatingActionButton from '~/components/FloatingActionButton';
import OwnerDropdown, { OwnerAssignment } from '~/components/OwnerDropdown';
import TodoListItem from '~/components/TodoListItem';
import {
  DefaultTodoList,
  TodoItems,
  TodoList,
  useCouple,
  usePartnerProfiles,
} from '~/src/schema.jazz';
import { useDebounce } from '~/utils/useDebounce';

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
const InputField = ({ onChange }: { onChange: (value: string) => void }) => {
  const [title, setTitle] = useState('');
  useDebounce(() => onChange(title), 300);

  return (
    <BottomSheetTextInput
      placeholder="New Todo"
      style={{
        fontSize: 24,
        fontWeight: '600',
        color: '#27272A',
      }}
      onChangeText={setTitle}
      value={title}
    />
  );
};
const TodoListBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);
  const couple = useCouple();
  const { myProfile } = usePartnerProfiles();
  const [emoji, setEmoji] = useState('🖊');
  const [hideFromPartner, setHideFromPartner] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<TodoList['assignedTo']>('us');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [showHideFromPartner, setShowHideFromPartner] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'todo' | 'color' | 'emoji'>('todo');
  const handleSubmit = () => {
    if (!couple) return;
    if (couple.todoLists === null) return;
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
    if (ref && 'current' in ref) {
      ref.current?.dismiss();
    }
  };

  const getScreenHeight = () => {
    if (activeScreen === 'color') return 400;
    if (activeScreen === 'emoji') return 550;
    if (showHideFromPartner) return 250;
    return 200;
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

  const EmojiPickerScreen = () => {
    return (
      <View style={{ flex: 1 }}>
        <EmojiKeyboard
          styles={{
            category: {
              container: {
                backgroundColor: 'red',
              },
            },
            container: {
              backgroundColor: 'red',
              shadowColor: 'transparent',
              paddingVertical: 0,
              paddingHorizontal: 0,
            },
          }}
          onEmojiSelected={(emoji) => {
            setEmoji(emoji.emoji);
            setActiveScreen('todo');
          }}
          defaultHeight={550}
        />
      </View>
    );
  };

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => {
      if (activeScreen !== 'todo') return null;
      return (
        <BottomSheetFooter {...props} bottomInset={24}>
          <Pressable onPress={handleSubmit} disabled={title.trim() === ''}>
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Add List</Text>
            </View>
          </Pressable>
        </BottomSheetFooter>
      );
    },
    [activeScreen, handleSubmit]
  );

  const handleAssignedToChange = useCallback((newAssignedTo: OwnerAssignment) => {
    setAssignedTo(newAssignedTo);
    if (newAssignedTo === 'us') {
      setShowHideFromPartner(false);
    } else if (newAssignedTo === 'partner') {
      setShowHideFromPartner(false);
    } else {
      setShowHideFromPartner(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setTitle('');
    setEmoji('🖊');
    setHideFromPartner(false);
    setBackgroundColor(colors[0]);
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={handleDismiss}
      backdropComponent={backdropComponent}
      enablePanDownToClose
      enableDynamicSizing
      footerComponent={renderFooter}
      keyboardBehavior="interactive">
      <BottomSheetView
        style={{
          ...styles.sheetContainer,
          height: getScreenHeight(),
        }}>
        {activeScreen === 'todo' && (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'space-between',
              }}>
              <InputField onChange={setTitle} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable onPress={() => setActiveScreen('emoji')}>
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
            <View style={{ marginTop: 16 }}>
              <OwnerDropdown onAssignedToChange={handleAssignedToChange} />
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
                <CustomSwitch value={hideFromPartner} onValueChange={setHideFromPartner} />
              </View>
            )}
          </>
        )}
        {activeScreen === 'color' && <ColorPickerScreen />}
        {activeScreen === 'emoji' && <EmojiPickerScreen />}
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
