import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { useEffect, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListBottomSheet from '~/components/TodoListBottomSheet';
import { TodoItem, TodoList, usePartnerProfiles } from '~/src/schema.jazz';

export default function ListDetailScreen() {
  const { todo } = useLocalSearchParams<{ todo: string }>();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const list = useCoState(TodoList, todo as ID<TodoList>);
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

  const renderItem = ({
    section: { title },
    item,
  }: {
    section: { title: string };
    item: TodoItem;
  }) => {
    const isExpanded = expandedSections.has(title);
    if (!isExpanded) return null;

    return (
      <Pressable
        onPress={() => {
          item!.completed = !item!.completed;
        }}>
        <View
          style={{
            flexDirection: 'column',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'normal',
              textDecorationLine: item?.completed ? 'line-through' : 'none',
              color: item?.completed ? '#A1A1AA' : 'black',
            }}>
            {item?.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontSize: 14,
                color: '#71717B',
                textDecorationLine: item?.completed ? 'line-through' : 'none',
              }}>
              {item?.dueDate
                ? new Date(item.dueDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : ''}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#71717B',
                textDecorationLine: item?.completed ? 'line-through' : 'none',
              }}>
              Weekly
            </Text>
          </View>
        </View>
      </Pressable>
    );
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
            { title: 'My To-Dos', data: assignedToMe },
            { title: partnerProfile?.nickname ?? 'Partner To-Dos', data: assignedToPartner },
            { title: 'Our To-Dos', data: assignedToBoth },
          ]}
          keyExtractor={(item, index) => (item?.id as string) + index}
          extraData={expandedSections}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={renderItem}
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
        <TodoListBottomSheet
          ref={bottomSheetModalRef}
          onCreate={(newTodo) => {
            console.log('New todo created:', newTodo);
            if (list?.items) {
              list.items.push(newTodo);
            }
          }}
        />
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
