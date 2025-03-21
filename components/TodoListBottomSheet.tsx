import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CustomSwitch from './CustomSwitch';
import OwnerDropdown, { OwnerAssignment } from './OwnerDropdown';

import { TodoItem, usePartnerProfiles } from '~/src/schema.jazz';
import { useDebounce } from '~/utils/useDebounce';

// Due Date Section Component
type DueDateSectionProps = {
  hasDueDate: boolean;
  setHasDueDate: (value: boolean) => void;
  dueDate: Date;
  setDueDate: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
};

const DueDateSection = ({
  hasDueDate,
  setHasDueDate,
  dueDate,
  setDueDate,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
}: DueDateSectionProps) => (
  <View style={{ marginTop: 16 }}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
      <Text style={{ fontSize: 16, color: '#27272A' }}>Due Date</Text>
      <CustomSwitch value={hasDueDate} onValueChange={setHasDueDate} />
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
);

// Option Section Component (used for Alert, Second Alert, Repeat)
type OptionSectionProps = {
  label: string;
  value: string;
  onPress: () => void;
};

const OptionSection = ({ label, value, onPress }: OptionSectionProps) => (
  <View style={styles.sectionContainer}>
    <View style={styles.rowBetween}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Pressable style={styles.optionButton} onPress={onPress}>
        <Text style={styles.optionText}>{value}</Text>
      </Pressable>
    </View>
  </View>
);

// Photo Section Component
type PhotoSectionProps = {
  photoUri: string | null;
  onPress: () => void;
};

const PhotoSection = ({ photoUri, onPress }: PhotoSectionProps) => (
  <View style={styles.sectionContainer}>
    <View style={styles.rowBetween}>
      <Text style={styles.sectionLabel}>Photo</Text>
      <Pressable style={styles.photoButton} onPress={onPress}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photoImage} />
        ) : (
          <Ionicons name="image-outline" size={20} color="#71717B" />
        )}
      </Pressable>
    </View>
  </View>
);

// OptionList Component for displaying option selections
type OptionListProps = {
  title: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  onBack: () => void;
};

const OptionList = ({ title, options, selectedOption, onSelect, onBack }: OptionListProps) => (
  <View style={{ flex: 1 }}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
      <Pressable onPress={onBack}>
        <Text style={{ fontSize: 16, color: '#8E51FF' }}>← Back</Text>
      </Pressable>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
    <ScrollView style={{ maxHeight: 600, marginBottom: 0, paddingBottom: 0 }}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#F4F4F5',
            },
            selectedOption === option && { backgroundColor: '#F4F4F5' },
          ]}
          onPress={() => onSelect(option)}>
          <Text style={{ fontSize: 16 }}>{option}</Text>
          {selectedOption === option && <Ionicons name="checkmark" size={20} color="#27272A" />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// Main TodoListBottomSheet Component
type TodoListBottomSheetProps = {
  onCreate?: (newTodo: TodoItem) => void;
};

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

const TodoListBottomSheet = forwardRef<BottomSheetModal, TodoListBottomSheetProps>((props, ref) => {
  console.log('TodoListBottomSheet');
  const { onCreate } = props;
  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);
  const { myProfile } = usePartnerProfiles();

  // Active screen state
  const [activeScreen, setActiveScreen] = useState<'todo' | 'alert' | 'secondAlert' | 'repeat'>(
    'todo'
  );
  const [assignedTo, setAssignedTo] = useState<TodoItem['assignedTo']>('us');
  const [showHideFromPartner, setShowHideFromPartner] = useState(false);
  const [hideFromPartner, setHideFromPartner] = useState(false);

  // Form state
  const [isHidden, setIsHidden] = useState(false);
  const [title, setTitle] = useState('');

  // Due date state
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Alert state
  const [hasAlert, setHasAlert] = useState(false);
  const [alertOption, setAlertOption] = useState('None');

  // Second alert state
  const [hasSecondAlert, setHasSecondAlert] = useState(false);
  const [secondAlertOption, setSecondAlertOption] = useState('None');

  // Repeat state
  const [repeatMode, setRepeatMode] = useState('Never');

  // Photo state
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Alert and repeat options
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

  // Handlers
  const handleSubmit = () => {
    if (!onCreate) return;
    const newTodo = TodoItem.create({
      title: title.trim(),
      completed: false,
      creatorAccID: myProfile!.accountId,
      assignedTo,
      deleted: false,
      dueDate: hasDueDate ? dueDate : null,
    });
    onCreate(newTodo);

    if (ref && 'current' in ref) {
      ref.current?.dismiss();
    }
  };

  const handleDismiss = useCallback(() => {
    setTitle('');
    setIsHidden(false);
    setHasDueDate(false);
    setActiveScreen('todo');
  }, []);

  const selectAlertOption = (option: string) => {
    setAlertOption(option);
    setHasAlert(option !== 'None');
    setActiveScreen('todo');
  };

  const selectSecondAlertOption = (option: string) => {
    setSecondAlertOption(option);
    setHasSecondAlert(option !== 'None');
    setActiveScreen('todo');
  };

  const selectRepeatOption = (option: string) => {
    setRepeatMode(option);
    setActiveScreen('todo');
  };

  const handleSelectPhoto = () => {
    // In a real app, this would integrate with image picker
    // For this mockup, we'll just set a placeholder image
    setPhotoUri('https://via.placeholder.com/150');
  };

  const screenHeight = useMemo(() => {
    let height = 300;
    if (activeScreen === 'alert' || activeScreen === 'secondAlert' || activeScreen === 'repeat') {
      height = 500; // Height for option screens
    }
    if (showHideFromPartner) height += 50;
    if (hasDueDate) height += 150;
    return height; // Default height for main screen
  }, [activeScreen, showHideFromPartner, hasDueDate]);

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
              <Text style={styles.footerText}>Create Todo</Text>
            </View>
          </Pressable>
        </BottomSheetFooter>
      );
    },
    [activeScreen, handleSubmit]
  );

  return (
    <BottomSheetModal
      ref={ref}
      backdropComponent={backdropComponent}
      enablePanDownToClose
      enableDynamicSizing
      onDismiss={handleDismiss}
      footerComponent={renderFooter}>
      <BottomSheetView style={{ ...styles.sheetContainer, height: screenHeight }}>
        {activeScreen === 'todo' && (
          <>
            <InputField onChange={setTitle} />
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
            <DueDateSection
              hasDueDate={hasDueDate}
              setHasDueDate={setHasDueDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              showTimePicker={showTimePicker}
              setShowTimePicker={setShowTimePicker}
            />

            {hasDueDate && (
              <>
                <OptionSection
                  label="Alert"
                  value={alertOption}
                  onPress={() => setActiveScreen('alert')}
                />

                <OptionSection
                  label="Second Alert"
                  value={secondAlertOption}
                  onPress={() => setActiveScreen('secondAlert')}
                />
              </>
            )}
            <OptionSection
              label="Repeat"
              value={repeatMode}
              onPress={() => setActiveScreen('repeat')}
            />
            <PhotoSection photoUri={photoUri} onPress={handleSelectPhoto} />
          </>
        )}

        {activeScreen === 'alert' && (
          <OptionList
            title="Select Alert Time"
            options={alertOptions}
            selectedOption={alertOption}
            onSelect={selectAlertOption}
            onBack={() => setActiveScreen('todo')}
          />
        )}

        {activeScreen === 'secondAlert' && (
          <OptionList
            title="Select Second Alert Time"
            options={alertOptions}
            selectedOption={secondAlertOption}
            onSelect={selectSecondAlertOption}
            onBack={() => setActiveScreen('todo')}
          />
        )}

        {activeScreen === 'repeat' && (
          <OptionList
            title="Repeat"
            options={repeatOptions}
            selectedOption={repeatMode}
            onSelect={selectRepeatOption}
            onBack={() => setActiveScreen('todo')}
          />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetContainer: {
    padding: 24,
    zIndex: 1000,
  },
  dateTimeContainer: {
    flexDirection: 'row',
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
