import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useAccount } from 'jazz-react-native';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { EmojiKeyboard } from 'rn-emoji-keyboard';

import CustomSwitch from '../CustomSwitch';
import OwnerDropdown, { OwnerAssignment } from '../OwnerDropdown';

import { TodoItems, TodoList, useCouple } from '~/src/schema.jazz';
import { useDebounce } from '~/utils/useDebounce';

interface TodoListBottomSheetProps {
  toUpdate?: TodoList;
}

const InputField = ({
  onChange,
  initialValue,
}: {
  onChange: (value: string) => void;
  initialValue?: string;
}) => {
  const [title, setTitle] = useState(initialValue || '');
  useDebounce(() => onChange(title), 300);

  useEffect(() => {
    if (initialValue) {
      setTitle(initialValue);
    }
  }, [initialValue]);

  return (
    <BottomSheetTextInput
      placeholder="New Todo"
      style={{
        fontSize: 24,
        fontWeight: '600',
        flex: 1,
        color: '#27272A',
      }}
      onChangeText={setTitle}
      value={title}
    />
  );
};

export const TodoListBottomSheet = forwardRef<BottomSheetModal, TodoListBottomSheetProps>(
  (props, ref) => {
    const { toUpdate } = props;
    const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
    }, []);
    const { me } = useAccount();
    const couple = useCouple();
    const [emoji, setEmoji] = useState(toUpdate?.emoji || '🖊');
    const [hideFromPartner, setHideFromPartner] = useState(toUpdate?.isHidden || false);
    const [title, setTitle] = useState(toUpdate?.title || '');
    const [assignedTo, setAssignedTo] = useState<TodoList['assignedTo']>(
      toUpdate?.assignedTo || 'us'
    );
    const [backgroundColor, setBackgroundColor] = useState(toUpdate?.backgroundColor || '#FFFFFF');
    const [showHideFromPartner, setShowHideFromPartner] = useState(toUpdate?.assignedTo === 'me');
    const [activeScreen, setActiveScreen] = useState<'todo' | 'color' | 'emoji'>('todo');

    // Update state when toUpdate changes
    useEffect(() => {
      if (toUpdate) {
        setEmoji(toUpdate.emoji || '🖊');
        setHideFromPartner(toUpdate.isHidden || false);
        setTitle(toUpdate.title || '');
        setAssignedTo(toUpdate.assignedTo || 'us');
        setBackgroundColor(toUpdate.backgroundColor || '#FFFFFF');
        setShowHideFromPartner(toUpdate.assignedTo === 'me');
      }
    }, [toUpdate]);

    const handleSubmit = () => {
      if (!couple) return;
      if (couple.todoLists === null) return;

      if (toUpdate) {
        // Update existing TodoList
        if (hideFromPartner !== toUpdate.isHidden) {
          throw new Error('Ownership transfer required');
        }
        toUpdate.title = title.trim();
        toUpdate.emoji = emoji;
        toUpdate.isHidden = hideFromPartner;
        toUpdate.backgroundColor = backgroundColor;
        toUpdate.assignedTo = assignedTo;
      } else {
        // Create new TodoList
        const newList = TodoList.create(
          {
            title: title.trim(),
            items: TodoItems.create([]),
            emoji,
            isHidden: hideFromPartner,
            backgroundColor,
            creatorAccID: me.id,
            assignedTo,
            deleted: false,
          },
          { owner: hideFromPartner ? me : couple._owner }
        );
        couple.todoLists.push(newList);
      }

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
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: '#8E51FF',
                      }}
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
                <Text style={styles.footerText}>{toUpdate ? 'Update List' : 'Add List'}</Text>
              </View>
            </Pressable>
          </BottomSheetFooter>
        );
      },
      [activeScreen, handleSubmit, toUpdate?.id]
    );

    const handleAssignedToChange = useCallback((newAssignedTo: OwnerAssignment) => {
      setAssignedTo(newAssignedTo);
      if (newAssignedTo === 'us') {
        setShowHideFromPartner(false);
        setHideFromPartner(false);
      } else if (newAssignedTo === 'partner') {
        setShowHideFromPartner(false);
        setHideFromPartner(false);
      } else {
        setShowHideFromPartner(true);
        setHideFromPartner(false);
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
                <InputField onChange={setTitle} initialValue={toUpdate?.title} />
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
                <OwnerDropdown
                  onAssignedToChange={handleAssignedToChange}
                  selectedAssignedTo={assignedTo}
                />
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
  }
);
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
