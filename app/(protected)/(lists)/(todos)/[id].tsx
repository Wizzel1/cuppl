import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import { TodoItems, TodoList, useCouple, usePartnerProfiles } from '~/src/schema.jazz';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const list = useCoState(TodoList, id as ID<TodoList>);
  const { partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [completedTodos, setCompletedTodos] = useState(0);
  const [totalTodos, setTotalTodos] = useState(0);

  useEffect(() => {
    if (list?.items) {
      const completed = list.items.filter((item) => item?.completed || false).length;
      setCompletedTodos(completed);
      setTotalTodos(list.items.length);
    }
  }, [list?.items]);

  const handleToggle = (title: string) => {
    setExpandedSections((expandedSections) => {
      // Using Set here but you can use an array too
      const next = new Set(expandedSections);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const handlePress = () => {
    bottomSheetModalRef.current?.present();
  };

  return (
    <>
      <Stack.Screen
        options={{
          // title: list?.title ?? 'To-Do List',
          headerTitle: (s) => (
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{list?.title ?? 'To-Do List'}</Text>
              <Text style={{ fontSize: 12, color: '#71717B' }}>
                {completedTodos} / {totalTodos} completed
              </Text>
            </View>
          ),
          headerRight: () => (
            <Pressable onPress={() => {}}>
              <Ionicons name="pencil" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>

        <SectionList
          style={{ paddingHorizontal: 24, paddingTop: 16 }}
          sections={[
            { title: 'My todos', data: list?.items ?? [] },
            { title: partnerProfile?.nickname ?? 'partner todos', data: list?.items ?? [] },
            { title: 'Our todos', data: list?.items ?? [] },
          ]}
          keyExtractor={(item, index) => (item?.id as string) + index}
          extraData={expandedSections}
          renderItem={({ section: { title }, item }) => {
            const isExpanded = expandedSections.has(title);
            if (!isExpanded) return null;

            return (
              <Pressable
                onPress={() => {
                  item!.completed = !item!.completed;
                }}>
                <Text>{item?.title}</Text>
              </Pressable>
            );
          }}
          renderSectionHeader={({ section: { title } }) => {
            const isopen = expandedSections.has(title);
            return (
              <Pressable onPress={() => handleToggle(title)}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 16,
                  }}>
                  <Text style={styles.sectionHeader}>{title}</Text>
                  <Ionicons name={isopen ? 'chevron-up' : 'chevron-down'} size={24} color="black" />
                </View>
              </Pressable>
            );
          }}
        />

        <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
        <TodoListBottomSheet ref={bottomSheetModalRef} />
      </View>
    </>
  );
}

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

  return (
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
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
  },
  sheetContainer: {
    flex: 1,
    padding: 24,
    zIndex: 1000,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F4F4F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#27272A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#71717B',
    marginTop: 8,
    textAlign: 'right',
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
});
