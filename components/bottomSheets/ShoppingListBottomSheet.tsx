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

import { useCouple } from '~/src/schemas/schema.jazz';
import { ShoppingItems, ShoppingList } from '~/src/schemas/shoppingSchema';
import { TodoList } from '~/src/schemas/todoSchema';
import { useDebounce } from '~/utils/useDebounce';

interface ShoppingListBottomSheetProps {
  toUpdate: ShoppingList | null;
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
      placeholder="New Shopping List"
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

export const ShoppingListBottomSheet = forwardRef<BottomSheetModal, ShoppingListBottomSheetProps>(
  (props, ref) => {
    const { toUpdate, onDismiss } = props;
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
        toUpdate.title = title;
        toUpdate.emoji = emoji;
        toUpdate.backgroundColor = backgroundColor;
        toUpdate.assignedTo = assignedTo;
        toUpdate.isHidden = hideFromPartner;
      } else {
        const list = ShoppingList.create(
          {
            title,
            emoji,
            backgroundColor,
            assignedTo,
            isHidden: hideFromPartner,
            items: ShoppingItems.create([], { owner: couple._owner }),
            creatorAccID: me.id,
            deleted: false,
          },
          { owner: couple._owner }
        );
        if (couple.shoppingLists) {
          couple.shoppingLists.push(list);
        } else {
          throw new Error('No shopping lists found');
        }
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
      setBackgroundColor('#F7E987');
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
              setEmoji={(emoji) => {
                setEmoji(emoji);
                setActiveScreen('todo');
              }}
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
});
