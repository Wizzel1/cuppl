import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoBottomSheet from '~/components/TodoListDetailsScreen/TodoBottomSheet';
import TodoSectionList from '~/components/TodoListDetailsScreen/TodoDueSection';
import { TodoListBottomSheet } from '~/components/TodoListsScreen/TodoListBottomSheet';
import { TodoItem, TodoList, usePartnerProfiles } from '~/src/schema.jazz';

export default function TodoListScreen() {
  const { todoListId } = useLocalSearchParams<{ todoListId: string }>();
  const [expandedSections, setExpandedSections] = useState(new Set<string>());
  const list = useCoState(TodoList, todoListId as ID<TodoList>);
  const { partnerProfile, myProfile } = usePartnerProfiles();
  const todoSheetRef = useRef<BottomSheetModal>(null);
  const todoListBottomSheetRef = useRef<BottomSheetModal>(null);

  const [completedTodos, setCompletedTodos] = useState(0);
  const [totalTodos, setTotalTodos] = useState(0);

  const [assignedToMe, setAssignedToMe] = useState<TodoItem[]>([]);
  const [assignedToPartner, setAssignedToPartner] = useState<TodoItem[]>([]);
  const [assignedToBoth, setAssignedToBoth] = useState<TodoItem[]>([]);

  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    if (list?.items) {
      const assignedToMe: TodoItem[] = [];
      const assignedToPartner: TodoItem[] = [];
      const assignedToBoth: TodoItem[] = [];
      let completed = 0;
      let total = 0;

      const myAccID = myProfile?.accountId;
      const partnerAccID = partnerProfile?.accountId;

      for (const item of list.items) {
        if (item?.deleted) continue;
        if (item?.completed) {
          completed++;
        }
        total++;
        if (item?.assignedTo === 'me') {
          if (item.creatorAccID === myAccID) {
            assignedToMe.push(item);
          } else {
            assignedToPartner.push(item);
          }
        } else if (item?.assignedTo === 'partner') {
          if (item.creatorAccID === partnerAccID) {
            assignedToMe.push(item);
          } else {
            assignedToPartner.push(item);
          }
        } else if (item?.assignedTo === 'us') {
          assignedToBoth.push(item);
        }
      }

      setAssignedToMe(assignedToMe);
      setAssignedToPartner(assignedToPartner);
      setAssignedToBoth(assignedToBoth);
      setCompletedTodos(completed);
      setTotalTodos(total);
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

  const handleFABPress = () => {
    todoSheetRef.current?.present();
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

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    todoSheetRef.current?.present();
    console.log('Editing todo:', todo);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: renderHeaderTitle,
          headerRight: () => (
            <Pressable
              onPress={() => {
                todoListBottomSheetRef.current?.present();
              }}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14, color: '#71717B' }}>
                    {assignedToMe.filter((todo) => todo?.completed).length} / {assignedToMe.length}
                  </Text>
                  <Ionicons
                    name={expandedSections.has('My To-Dos') ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#71717B"
                  />
                </View>
              </View>
            </Pressable>
            {expandedSections.has('My To-Dos') && (
              <TodoSectionList todos={assignedToMe} onEditTodo={handleEditTodo} />
            )}

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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14, color: '#71717B' }}>
                    {assignedToPartner.filter((todo) => todo?.completed).length} /{' '}
                    {assignedToPartner.length}
                  </Text>
                  <Ionicons
                    name={
                      expandedSections.has(partnerProfile?.nickname ?? 'Partner To-Dos')
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={20}
                    color="#71717B"
                  />
                </View>
              </View>
            </Pressable>
            {expandedSections.has(partnerProfile?.nickname ?? 'Partner To-Dos') && (
              <TodoSectionList todos={assignedToPartner} onEditTodo={handleEditTodo} />
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14, color: '#71717B' }}>
                    {assignedToBoth.filter((todo) => todo?.completed).length} /{' '}
                    {assignedToBoth.length}
                  </Text>
                  <Ionicons
                    name={expandedSections.has('Our To-Dos') ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#71717B"
                  />
                </View>
              </View>
            </Pressable>
            {expandedSections.has('Our To-Dos') && (
              <TodoSectionList todos={assignedToBoth} onEditTodo={handleEditTodo} />
            )}
          </View>
        </ScrollView>

        <FloatingActionButton onPress={handleFABPress} icon="add" color="#27272A" />
        {list && (
          <TodoBottomSheet
            ref={todoSheetRef}
            toUpdate={editingTodo}
            onDismiss={() => setEditingTodo(null)}
            defaultAssignedTo={list.assignedTo}
            onCreate={(newTodo) => {
              if (list.items) {
                console.log('New todo created:', newTodo);
                list.items.push(newTodo);
              }
            }}
          />
        )}
        {list && <TodoListBottomSheet ref={todoListBottomSheetRef} toUpdate={list} />}
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
