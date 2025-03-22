import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListBottomSheet from '~/components/TodoListBottomSheet';
import TodoSectionList from '~/components/TodoListScreen/TodoDueSection';
import { TodoItem, TodoList, usePartnerProfiles } from '~/src/schema.jazz';

export default function TodoListScreen() {
  const { todoListId } = useLocalSearchParams<{ todoListId: string }>();
  const [expandedSections, setExpandedSections] = useState(new Set<string>());
  const list = useCoState(TodoList, todoListId as ID<TodoList>);
  const { partnerProfile } = usePartnerProfiles();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [completedTodos, setCompletedTodos] = useState(0);
  const [totalTodos, setTotalTodos] = useState(0);

  const [assignedToMe, setAssignedToMe] = useState<TodoItem[]>([]);
  const [assignedToPartner, setAssignedToPartner] = useState<TodoItem[]>([]);
  const [assignedToBoth, setAssignedToBoth] = useState<TodoItem[]>([]);

  useEffect(() => {
    if (list?.items) {
      const assignedToMe: TodoItem[] = [];
      const assignedToPartner: TodoItem[] = [];
      const assignedToBoth: TodoItem[] = [];
      let completed = 0;

      for (const item of list.items) {
        if (item?.completed) {
          completed++;
        }
        if (item?.assignedTo === 'me') {
          assignedToMe.push(item);
        } else if (item?.assignedTo === 'partner') {
          assignedToPartner.push(item);
        } else if (item?.assignedTo === 'us') {
          assignedToBoth.push(item);
        }
      }

      setAssignedToMe(assignedToMe);
      setAssignedToPartner(assignedToPartner);
      setAssignedToBoth(assignedToBoth);
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

  const renderHeaderTitle = useCallback(() => {
    const title = list?.title ?? 'To-Do List';
    const titleLength = title.length;
    const titleSubstring = title.substring(0, 24);
    const titleRemaining = titleLength - titleSubstring.length;

    return (
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>
          {titleSubstring} {titleRemaining ? '...' : ''}
        </Text>
        <Text style={{ fontSize: 12, color: '#71717B' }}>
          {completedTodos} / {totalTodos} completed
        </Text>
      </View>
    );
  }, [completedTodos, totalTodos, list?.title]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: renderHeaderTitle,
          headerRight: () => (
            <Pressable onPress={() => {}}>
              <Ionicons name="pencil" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView>
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

          <View style={{ paddingTop: 16, paddingBottom: 80 }}>
            {/* My To-Dos Section */}
            <Pressable onPress={() => handleToggle('My To-Dos')}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}>
                <Text style={styles.sectionHeader}>My To-Dos</Text>
                <Ionicons
                  name={expandedSections.has('My To-Dos') ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="black"
                />
              </View>
            </Pressable>
            {expandedSections.has('My To-Dos') && <TodoSectionList todos={assignedToMe} />}

            {/* Partner To-Dos Section */}
            <Pressable onPress={() => handleToggle(partnerProfile?.nickname ?? 'Partner To-Dos')}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}>
                <Text style={styles.sectionHeader}>
                  {partnerProfile?.nickname ?? 'Partner To-Dos'}
                </Text>
                <Ionicons
                  name={
                    expandedSections.has(partnerProfile?.nickname ?? 'Partner To-Dos')
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={24}
                  color="black"
                />
              </View>
            </Pressable>
            {expandedSections.has(partnerProfile?.nickname ?? 'Partner To-Dos') && (
              <TodoSectionList todos={assignedToPartner} />
            )}

            {/* Our To-Dos Section */}
            <Pressable onPress={() => handleToggle('Our To-Dos')}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}>
                <Text style={styles.sectionHeader}>Our To-Dos</Text>
                <Ionicons
                  name={expandedSections.has('Our To-Dos') ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="black"
                />
              </View>
            </Pressable>
            {expandedSections.has('Our To-Dos') && <TodoSectionList todos={assignedToBoth} />}
          </View>
        </ScrollView>

        <FloatingActionButton onPress={handlePress} icon="add" color="#27272A" />
        {list && (
          <TodoListBottomSheet
            ref={bottomSheetModalRef}
            defaultAssignedTo={list.assignedTo}
            onCreate={(newTodo) => {
              if (list?.items) {
                console.log('New todo created:', newTodo);
                list.items.push(newTodo);
              }
            }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
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
});
