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

import BottomSheetColorPicker from '../BottomSheetColorPicker';
import OwnerDropdown, { OwnerAssignment } from '../OwnerDropdown';
import EmojiPickerScreen from '../bottomSheets/components/EmojiPickerScreen';
import { HideFromPartnerSection } from '../bottomSheets/components/HideFromPartnerSection';

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
      style={styles.input}
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
        <BottomSheetView style={[styles.sheetContainer, { height: getScreenHeight() }]}>
          {activeScreen === 'todo' && (
            <>
              <View style={styles.headerRow}>
                <View style={styles.inputRow}>
                  <InputField onChange={setTitle} initialValue={toUpdate?.title} />

                  <Pressable style={styles.emojiButton} onPress={() => setActiveScreen('emoji')}>
                    <Text style={styles.emojiText}>{emoji}</Text>
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
              <View style={styles.marginTop}>
                <OwnerDropdown
                  selectedAssignedTo={assignedTo}
                  onAssignedToChange={handleAssignedToChange}
                />
              </View>
              {showHideFromPartner && (
                <HideFromPartnerSection
                  hideFromPartner={hideFromPartner}
                  setHideFromPartner={setHideFromPartner}
                />
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
          {activeScreen === 'emoji' && (
            <EmojiPickerScreen
              setEmoji={setEmoji}
              setActiveScreen={(screen) => setActiveScreen(screen as any)}
            />
          )}
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
  input: {
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
    color: '#27272A',
  },
  flexContainer: {
    flex: 1,
  },
  emojiKeyboardContainer: {
    shadowColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  emojiButton: {
    backgroundColor: '#F4F4F5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 20,
    textAlign: 'center',
  },
  marginTop: {
    marginTop: 16,
  },
  hideFromPartnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  hideFromPartnerText: {
    fontSize: 16,
    color: '#27272A',
  },
});
