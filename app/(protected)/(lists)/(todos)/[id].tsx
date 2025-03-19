import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { useEffect, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import { TodoList, useCouple, usePartnerProfiles } from '~/src/schema.jazz';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const list = useCoState(TodoList, id as ID<TodoList>);
  const couple = useCouple();
  const { partnerProfile } = usePartnerProfiles();

  const [completedTodos, setCompletedTodos] = useState(0);
  const [totalTodos, setTotalTodos] = useState(0);

  useEffect(() => {
    if (list?.items) {
      const completed = list.items.filter((item) => item?.completed || false).length;
      setCompletedTodos(completed);
      setTotalTodos(list.items.length);
    }
  }, [list?.items]);

  // useEffect(() => {
  //   console.log('list', list);
  //   if (!list || !couple) return;
  //   list.items = TodoItems.create([
  //     TodoItem.create(
  //       {
  //         title: 'ttest',
  //         completed: false,
  //         deleted: false,
  //         creatorAccID: '1',
  //       },
  //       { owner: couple?._owner }
  //     ),
  //   ]);
  // }, [list?.id, couple?.id]);

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
          keyExtractor={(item, index) => (item!.id as string) + index}
          extraData={expandedSections}
          renderItem={({ section: { title }, item }) => {
            const isExpanded = expandedSections.has(title);
            if (!isExpanded) return null;

            return <Text>{item?.title}</Text>;
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

        <FloatingActionButton onPress={() => {}} icon="add" color="#27272A" />
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
