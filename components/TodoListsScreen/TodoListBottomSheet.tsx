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

import BottomSheetColorPicker from '../BottomSheetColorPicker';
import CustomSwitch from '../CustomSwitch';
import OwnerDropdown, { OwnerAssignment } from '../OwnerDropdown';

import * as TodoListsRepo from '~/src/repositories/todoListsRepository';
import { useCouple } from '~/src/schemas/schema.jazz';
import { TodoList } from '~/src/schemas/todoSchema';
import { useDebounce } from '~/utils/useDebounce';

interface TodoListBottomSheetProps {
  toUpdate: TodoList | null;
  onDismiss?: () => void;
}
interface InputFieldProps {
  onChange: (value: string) => void;
  initialValue?: string;
}
const InputField = ({ onChange, initialValue }: InputFieldProps) => {
  const [title, setTitle] = useState(initialValue ?? '');
  const debouncedTitle = useDebounce(title, 300);

  useEffect(() => {
    onChange(debouncedTitle);
  }, [debouncedTitle, onChange]);

  return (
    <BottomSheetTextInput
      placeholder="New Todo List"
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
    const { toUpdate, onDismiss } = props;
    const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
    }, []);
    const { me } = useAccount();
    const couple = useCouple();
    const [emoji, setEmoji] = useState('🖊');
    const [hideFromPartner, setHideFromPartner] = useState(false);
    const [title, setTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState<TodoList['assignedTo']>('us');
    const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
    const [showHideFromPartner, setShowHideFromPartner] = useState(false);
    const [activeScreen, setActiveScreen] = useState<'todo' | 'color' | 'emoji'>('todo');

    useEffect(() => {
      if (toUpdate) {
        setTitle(toUpdate?.title ?? '');
        setEmoji(toUpdate.emoji || '🖊');
        setHideFromPartner(toUpdate.isHidden || false);
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
        TodoListsRepo.updateTodoList({
          me,
          id: toUpdate.id,
          title,
          isHidden: hideFromPartner,
          assignedTo,
          emoji,
          backgroundColor,
        });
      } else {
        TodoListsRepo.createTodoList({
          me,
          title,
          isHidden: hideFromPartner,
          assignedTo,
          emoji,
          backgroundColor,
        });
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

    const EmojiPickerScreen = () => {
      return (
        <View style={{ flex: 1 }}>
          <EmojiKeyboard
            styles={{
              container: {
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
      setBackgroundColor('#FFFFFF');
      onDismiss?.();
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
          {activeScreen === 'color' && (
            <BottomSheetColorPicker
              backgroundColor={backgroundColor}
              setBackgroundColor={setBackgroundColor}
              onBackPress={() => setActiveScreen('todo')}
            />
          )}
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
