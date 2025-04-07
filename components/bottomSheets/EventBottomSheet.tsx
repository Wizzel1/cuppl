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
import * as ImagePicker from 'expo-image-picker';
import { useAccount, useCoState } from 'jazz-react-native';
import { createImage } from 'jazz-react-native-media-images';
import { ID, ImageDefinition } from 'jazz-tools';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import OwnerDropdown, { OwnerAssignment } from '../OwnerDropdown';
import DueDateSection from './components/DueDateSection';
import { HideFromPartnerSection } from './components/HideFromPartnerSection';
import OptionSection from './components/OptionSection';
import PhotoAttachmentSection from './components/PhotoAttachmentSection';

import { Event } from '~/src/schemas/eventSchema.jazz';
import { useCouple } from '~/src/schemas/schema.jazz';
import { useDebounce } from '~/utils/useDebounce';

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

type EventBottomSheetProps = {
  onCreate?: (newEvent: Event) => void;
  defaultAssignedTo?: OwnerAssignment;
  toUpdate: Event | null;
  onDismiss?: () => void;
};

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
      placeholder="New Event"
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

const alertMinutesOptions = [0, 5, 15, 30, 60, 120] as const;
const repeatOptions = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'];

const EventBottomSheet = forwardRef<BottomSheetModal, EventBottomSheetProps>((props, ref) => {
  const { onCreate, defaultAssignedTo, toUpdate, onDismiss } = props;
  const backdropComponent = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />;
  }, []);
  const { me } = useAccount();
  const couple = useCouple();
  const photo = useCoState(ImageDefinition, toUpdate?.photo?.id as ID<ImageDefinition>);
  const [activeScreen, setActiveScreen] = useState<'todo' | 'alert' | 'secondAlert' | 'repeat'>(
    'todo'
  );

  const [title, setTitle] = useState('');
  const [hasDueDate, setHasDueDate] = useState(toUpdate?.dueDate !== null);
  const [dueDate, setDueDate] = useState<Date>(toUpdate?.dueDate ?? new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [alertOption, setAlertOption] = useState<number | null>(null);
  const [secondAlertOption, setSecondAlertOption] = useState<number | null>(null);
  const [repeatMode, setRepeatMode] = useState<Event['recurringUnit'] | null>(null);

  const [imageDefinition, setImageDefinition] = useState<ImageDefinition | null>(null);
  const [assignedTo, setAssignedTo] = useState<Event['assignedTo']>('me');
  const [showHideFromPartner, setShowHideFromPartner] = useState(true);
  const [hideFromPartner, setHideFromPartner] = useState(false);

  useEffect(() => {
    if (photo?.id) setImageDefinition(photo);
  }, [photo?.id]);

  useEffect(() => {
    if (toUpdate) {
      setTitle(toUpdate?.title ?? '');
      setHideFromPartner(toUpdate?.isHidden ?? false);
      setAssignedTo(toUpdate?.assignedTo ?? 'me');
      setRepeatMode(toUpdate?.recurringUnit ?? null);
      setAlertOption(toUpdate?.alertOptionMinutes ?? null);
      setSecondAlertOption(toUpdate?.secondAlertOptionMinutes ?? null);
      if (toUpdate.dueDate) setDueDate(toUpdate.dueDate);
      setHasDueDate(toUpdate.dueDate !== null);
    }
  }, [toUpdate?.id]);

  useEffect(() => {
    setAssignedTo(defaultAssignedTo ?? 'me');
    setShowHideFromPartner(defaultAssignedTo === 'me');
  }, [defaultAssignedTo]);
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
          owner: couple._owner,
          maxSize: 2048, // Optional: limit maximum image size
        });
        setImageDefinition(image);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const getAlertDisplayText = (minutes: number | null) => {
    if (minutes === null) return 'None';
    if (minutes === 0) return 'On date';
    if (minutes === 60) return '1 hour before';
    if (minutes === 120) return '2 hours before';
    return `${minutes} minutes before`;
  };

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

  const handleSubmit = () => {
    if (!onCreate) return;

    if (toUpdate) {
      toUpdate.title = title.trim();
      toUpdate.dueDate = hasDueDate ? dueDate : undefined;
      toUpdate.assignedTo = assignedTo;
      toUpdate.isHidden = hideFromPartner;
      toUpdate.recurringUnit = repeatMode ?? undefined;
      toUpdate.alertOptionMinutes = alertOption ?? undefined;
      toUpdate.secondAlertOptionMinutes = secondAlertOption ?? undefined;
      toUpdate.photo = imageDefinition;
      // toUpdate.scheduleNotifications();
    } else {
      const newEvent = Event.create(
        {
          title,
          creatorAccID: me.id,
          dueDate: hasDueDate ? dueDate : null,
          deleted: false,
          isAllDay: false,
          isRecurring: false,
          isHidden: hideFromPartner,
          startDate: new Date(),
          assignedTo,
          recurringUnit: repeatMode ?? undefined,
          alertOptionMinutes: alertOption ?? undefined,
          secondAlertOptionMinutes: secondAlertOption ?? undefined,
          photo: imageDefinition,
        },
        { owner: couple!._owner }
      );
      newEvent.scheduleNotifications().then(() => {
        onCreate(newEvent);
      });
    }

    if (ref && 'current' in ref) {
      ref.current?.dismiss();
    }
  };

  const handleDismiss = useCallback(() => {
    setTitle('');
    setHideFromPartner(false);
    setHasDueDate(false);
    setActiveScreen('todo');
    onDismiss?.();
  }, []);

  const selectAlertOption = (minutes: number) => {
    setAlertOption(minutes);
    setActiveScreen('todo');
  };

  const selectSecondAlertOption = (minutes: number) => {
    setSecondAlertOption(minutes);
    setActiveScreen('todo');
  };

  const selectRepeatOption = (option: Event['recurringUnit']) => {
    setRepeatMode(option);
    setActiveScreen('todo');
  };

  const screenHeight = useMemo(() => {
    let height = 280;
    if (activeScreen === 'alert' || activeScreen === 'secondAlert' || activeScreen === 'repeat') {
      height = 500;
    }
    if (showHideFromPartner) height += 50;
    if (hasDueDate) height += 200;
    return height;
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
              <Text style={styles.footerText}>{toUpdate ? 'Update Todo' : 'Create Todo'}</Text>
            </View>
          </Pressable>
        </BottomSheetFooter>
      );
    },
    [activeScreen, handleSubmit, toUpdate?.title]
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
            <InputField onChange={setTitle} initialValue={title} />
            <View style={{ marginTop: 16 }}>
              <OwnerDropdown
                onAssignedToChange={handleAssignedToChange}
                selectedAssignedTo={assignedTo}
              />
            </View>

            {showHideFromPartner && (
              <HideFromPartnerSection hideFromPartner setHideFromPartner={setHideFromPartner} />
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
                  value={getAlertDisplayText(alertOption)}
                  onPress={() => setActiveScreen('alert')}
                />

                <OptionSection
                  label="Second Alert"
                  value={getAlertDisplayText(secondAlertOption)}
                  onPress={() => setActiveScreen('secondAlert')}
                />
                <OptionSection
                  label="Repeat"
                  value={repeatMode ? repeatMode : 'Never'}
                  onPress={() => setActiveScreen('repeat')}
                />
              </>
            )}

            <PhotoAttachmentSection image={imageDefinition} onPress={handleImageUpload} />
          </>
        )}

        {activeScreen === 'alert' && (
          <OptionList
            title="Select Alert Time"
            options={alertMinutesOptions.map(getAlertDisplayText)}
            selectedOption={getAlertDisplayText(alertOption)}
            onSelect={(option) => {
              const minutes =
                alertMinutesOptions[alertMinutesOptions.map(getAlertDisplayText).indexOf(option)];
              selectAlertOption(minutes);
            }}
            onBack={() => setActiveScreen('todo')}
          />
        )}

        {activeScreen === 'secondAlert' && (
          <OptionList
            title="Select Second Alert Time"
            options={alertMinutesOptions.map(getAlertDisplayText)}
            selectedOption={getAlertDisplayText(secondAlertOption)}
            onSelect={(option) => {
              const minutes =
                alertMinutesOptions[alertMinutesOptions.map(getAlertDisplayText).indexOf(option)];
              selectSecondAlertOption(minutes);
            }}
            onBack={() => setActiveScreen('todo')}
          />
        )}

        {activeScreen === 'repeat' && (
          <OptionList
            title="Repeat"
            options={repeatOptions}
            selectedOption={repeatMode ? repeatMode : 'Never'}
            onSelect={(option) => {
              const selectedOption = repeatOptions[repeatOptions.indexOf(option)];
              selectRepeatOption(selectedOption as Event['recurringUnit']);
            }}
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
  sectionContainer: {
    marginTop: 16,
  },
});

export default EventBottomSheet;
