import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useAccount, useCoState } from 'jazz-expo';
import { createImage } from 'jazz-react-native-media-images';
import { ID, ImageDefinition } from 'jazz-tools';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HideFromPartnerSection } from '../bottomSheets/components/HideFromPartnerSection';
import PhotoAttachmentSection from '../bottomSheets/components/PhotoAttachmentSection';
import BottomSheetInput from './components/BottomSheetInput';

import { useCouple } from '~/src/schemas/schema.jazz';
import { ShoppingItem } from '~/src/schemas/shoppingSchema';
import { useDebounce } from '~/utils/useDebounce';

type QuantitySectionProps = {
  onUnitChange: (unit: string) => void;
  onQuantityChange: (quantity: number) => void;
  selectedQuantity: number;
  selectedUnit: string;
  onBack: () => void;
};

const units = ['kg', 'g', 'l', 'ml', 'pcs'];
const quantities = Array.from({ length: 100 }, (_, i) => i + 1);

const QuantitySection = ({
  onUnitChange,
  onQuantityChange,
  selectedQuantity,
  selectedUnit,
  onBack,
}: QuantitySectionProps) => {
  return (
    <View style={styles.quantityContainer}>
      <View style={styles.quantityHeader}>
        <Pressable onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.pickerContainer}>
        <Picker<number>
          style={styles.picker}
          selectedValue={selectedQuantity}
          onValueChange={(itemValue) => onQuantityChange(itemValue)}>
          {quantities.map((quantity) => (
            <Picker.Item key={quantity} label={quantity.toString()} value={quantity.toString()} />
          ))}
        </Picker>
        <Picker<string>
          style={styles.picker}
          selectedValue={selectedUnit}
          onValueChange={(itemValue) => onUnitChange(itemValue)}>
          {units.map((unit) => (
            <Picker.Item key={unit} label={unit} value={unit} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

interface InputFieldProps {
  onChange: (value: string) => void;
  initialValue?: string;
}

const NotesInputField = ({ onChange, initialValue }: InputFieldProps) => {
  const [notes, setNotes] = useState(initialValue ?? '');
  const debouncedNotes = useDebounce(notes, 300);

  useEffect(() => {
    onChange(debouncedNotes);
  }, [debouncedNotes, onChange]);

  return (
    <BottomSheetTextInput
      placeholder="Notes"
      multiline
      style={styles.notesInput}
      value={notes}
      onChangeText={setNotes}
    />
  );
};

type ShoppingItemBottomSheetProps = {
  onCreate?: (newItem: ShoppingItem) => void;
  toUpdate: ShoppingItem | null;
  onDismiss?: () => void;
};

const ShoppingItemSheet = forwardRef<BottomSheetModal, ShoppingItemBottomSheetProps>(
  (props, ref) => {
    const { onCreate, toUpdate, onDismiss } = props;
    const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
      return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
    }, []);
    const { me } = useAccount();
    const couple = useCouple();

    const photo = useCoState(ImageDefinition, toUpdate?.photo?.id as ID<ImageDefinition>);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [imageDefinition, setImageDefinition] = useState<ImageDefinition | null>(null);
    const [hideFromPartner, setHideFromPartner] = useState(false);
    const [activeScreen, setActiveScreen] = useState<'todo' | 'quantity'>('todo');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState('kg');
    const [category, setCategory] = useState('food');

    useEffect(() => {
      if (photo?.id) setImageDefinition(photo);
    }, [photo?.id]);

    useEffect(() => {
      if (toUpdate) {
        setTitle(toUpdate.name);
        setNotes(toUpdate.notes ?? '');
        setHideFromPartner(toUpdate.isHidden);
        setSelectedQuantity(toUpdate.quantity);
        setSelectedUnit(toUpdate.unit);
        setCategory(toUpdate.category);
      }
    }, [toUpdate]);

    const handleImageUpload = async () => {
      try {
        if (!couple) return;
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          base64: true, // Important: We need base64 data
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0].base64) {
          const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
          const image = await createImage(base64Uri, {
            owner: couple._owner, // Set appropriate owner
            maxSize: 2048, // Optional: limit maximum image size
          });
          setImageDefinition(image);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    };

    const handleSubmit = () => {
      if (!onCreate) return;

      if (toUpdate) {
        toUpdate.name = title.trim();
        toUpdate.notes = notes.trim();
        toUpdate.isHidden = hideFromPartner;
        toUpdate.photo = imageDefinition;
        toUpdate.unit = selectedUnit as 'kg' | 'g' | 'l' | 'ml' | 'pcs';
        toUpdate.quantity = selectedQuantity;
      } else {
        const newItem = ShoppingItem.create(
          {
            name: title.trim(),
            notes: notes.trim(),
            creatorAccID: me.id,
            isHidden: hideFromPartner,
            photo: imageDefinition,
            unit: selectedUnit as 'kg' | 'g' | 'l' | 'ml' | 'pcs',
            category: 'food',
            quantity: selectedQuantity,
            deleted: false,
            completed: false,
          },
          { owner: couple!._owner }
        );
        onCreate(newItem);
      }

      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    };

    const handleDismiss = useCallback(() => {
      setTitle('');
      setNotes('');
      setHideFromPartner(false);
      setImageDefinition(null);
      setActiveScreen('todo');
      onDismiss?.();
    }, []);

    const getScreenHeight = () => {
      let height = 450;
      if (activeScreen === 'quantity') height = 300;
      return height;
    };

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => {
        if (activeScreen !== 'todo') return null;

        return (
          <BottomSheetFooter {...props} bottomInset={24}>
            <Pressable onPress={handleSubmit} disabled={title.trim() === ''}>
              <View
                style={{
                  ...styles.footerContainer,
                  backgroundColor: title.trim() === '' ? '#A1A1AA' : '#8E51FF',
                }}>
                <Text style={styles.footerText}>{toUpdate ? 'Update Item' : 'Create Item'}</Text>
              </View>
            </Pressable>
          </BottomSheetFooter>
        );
      },
      [activeScreen, handleSubmit, toUpdate?.name]
    );

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={backdropComponent}
        enablePanDownToClose
        enableDynamicSizing
        onDismiss={handleDismiss}
        footerComponent={renderFooter}>
        <BottomSheetView style={{ ...styles.sheetContainer, height: getScreenHeight() }}>
          {activeScreen === 'todo' && (
            <>
              <BottomSheetInput onChange={setTitle} initialValue={title} placeholder="New Item" />
              <View
                style={{
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={{ fontSize: 16, color: '#27272A' }}>Quantity</Text>
                <TouchableOpacity onPress={() => setActiveScreen('quantity')}>
                  <View
                    style={{
                      paddingVertical: 9,
                      paddingHorizontal: 20,
                      borderRadius: 20,
                      width: 120,
                      backgroundColor: '#F4F4F5',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#8E51FF',
                      }}>
                      {selectedQuantity} {selectedUnit}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <HideFromPartnerSection
                hideFromPartner={hideFromPartner}
                setHideFromPartner={setHideFromPartner}
              />

              <PhotoAttachmentSection image={imageDefinition} onPress={handleImageUpload} />
              <NotesInputField onChange={setNotes} initialValue={notes} />
            </>
          )}
          {activeScreen === 'quantity' && (
            <QuantitySection
              onUnitChange={setSelectedUnit}
              onQuantityChange={setSelectedQuantity}
              selectedQuantity={selectedQuantity}
              selectedUnit={selectedUnit}
              onBack={() => setActiveScreen('todo')}
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  sheetContainer: {
    padding: 24,
    zIndex: 1000,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  footerContainer: {
    padding: 12,
    margin: 12,
    borderRadius: 12,
    backgroundColor: '#8E51FF',
  },
  footerText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '800',
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#27272A',
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    color: '#27272A',
  },
  optionButton: {
    backgroundColor: '#F4F4F5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#71717B',
  },
  photoButton: {
    backgroundColor: '#F4F4F5',
    width: 70,
    height: 70,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  quantityContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'column',
  },
  quantityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    color: '#8E51FF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    width: 40,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  picker: {
    flex: 1,
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    color: '#27272A',
  },
  notesInput: {
    fontSize: 16,
    marginTop: 16,
    height: 100,
    color: '#27272A',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 8,
    padding: 12,
  },
});

export default ShoppingItemSheet;
