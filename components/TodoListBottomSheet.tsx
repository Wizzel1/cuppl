import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TodoItems, TodoList, useCouple, usePartnerProfiles } from '~/src/schema.jazz';

const TodoListBottomSheet = forwardRef<BottomSheetModal>((props, ref) => {
  const snapPoints = useMemo(() => ['80%'], []);
  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);
  const couple = useCouple();
  const { myProfile } = usePartnerProfiles();
  const [emoji, setEmoji] = useState('🖊');
  const [isHidden, setIsHidden] = useState(false);
  const [title, setTitle] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [alertOption, setAlertOption] = useState('None');
  const [hasSecondAlert, setHasSecondAlert] = useState(false);
  const [secondAlertOption, setSecondAlertOption] = useState('None');
  const [repeatMode, setRepeatMode] = useState('Never');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Modal visibility states
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showSecondAlertModal, setShowSecondAlertModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);

  // Alert options
  const alertOptions = [
    'None',
    '5 minutes before',
    '15 minutes before',
    '30 minutes before',
    '1 hour before',
    '2 hours before',
    'On date',
  ];
  const repeatOptions = ['Never', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'];

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
    setHasDueDate(false);
    if (ref && 'current' in ref) {
      ref.current?.dismiss();
    }
  };

  const selectAlertOption = (option: string) => {
    setAlertOption(option);
    setHasAlert(option !== 'None');
    setShowAlertModal(false);
  };

  const selectSecondAlertOption = (option: string) => {
    setSecondAlertOption(option);
    setHasSecondAlert(option !== 'None');
    setShowSecondAlertModal(false);
  };

  const selectRepeatOption = (option: string) => {
    setRepeatMode(option);
    setShowRepeatModal(false);
  };

  const handleSelectPhoto = () => {
    // In a real app, this would integrate with image picker
    // For this mockup, we'll just set a placeholder image
    setPhotoUri('https://via.placeholder.com/150');
  };

  return (
    <>
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

          <View
            style={{
              marginTop: 16,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
              <Text style={{ fontSize: 16, color: '#27272A' }}>Due Date</Text>
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
                  value={hasDueDate}
                  onValueChange={setHasDueDate}
                />
              </View>
            </View>

            {hasDueDate && (
              <View style={styles.dateTimeContainer}>
                <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateButtonText}>
                    {dueDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </Pressable>
                <Pressable style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.dateButtonText}>
                    {dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Pressable>

                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="inline"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) setDueDate(date);
                    }}
                  />
                )}

                {showTimePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="time"
                    display="default"
                    onChange={(event, date) => {
                      setShowTimePicker(false);
                      if (date) setDueDate(date);
                    }}
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>Alert</Text>
              <Pressable style={styles.optionButton} onPress={() => setShowAlertModal(true)}>
                <Text style={styles.optionText}>{alertOption}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>Second Alert</Text>
              <Pressable style={styles.optionButton} onPress={() => setShowSecondAlertModal(true)}>
                <Text style={styles.optionText}>{secondAlertOption}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>Repeat</Text>
              <Pressable style={styles.optionButton} onPress={() => setShowRepeatModal(true)}>
                <Text style={styles.optionText}>{repeatMode}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>Photo</Text>
              <Pressable style={styles.photoButton} onPress={handleSelectPhoto}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImage} />
                ) : (
                  <Ionicons name="image-outline" size={20} color="#71717B" />
                )}
              </Pressable>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Alert Modals */}
      <AlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        options={alertOptions}
        selectedOption={alertOption}
        onSelect={selectAlertOption}
      />

      <AlertModal
        visible={showSecondAlertModal}
        onClose={() => setShowSecondAlertModal(false)}
        options={alertOptions}
        selectedOption={secondAlertOption}
        onSelect={selectSecondAlertOption}
      />

      <AlertModal
        visible={showRepeatModal}
        onClose={() => setShowRepeatModal(false)}
        options={repeatOptions}
        selectedOption={repeatMode}
        onSelect={selectRepeatOption}
        title="Repeat"
      />
    </>
  );
});

// Modal components
const AlertModal = ({
  visible,
  onClose,
  options,
  selectedOption,
  onSelect,
  title = 'Select Alert Time',
}: {
  visible: boolean;
  onClose: () => void;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  title?: string;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={modalStyles.container}>
      <View style={modalStyles.content}>
        <Text style={modalStyles.title}>{title}</Text>
        <ScrollView style={modalStyles.optionList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                modalStyles.optionItem,
                selectedOption === option && modalStyles.selectedOption,
              ]}
              onPress={() => onSelect(option)}>
              <Text style={modalStyles.optionItemText}>{option}</Text>
              {selectedOption === option && <Ionicons name="checkmark" size={20} color="#27272A" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
          <Text style={modalStyles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Separate styles for modals
const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  selectedOption: {
    backgroundColor: '#F4F4F5',
  },
  optionItemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    padding: 24,
    zIndex: 1000,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 40,
    height: 40,
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
});

export default TodoListBottomSheet;
