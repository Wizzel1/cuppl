import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import { TodoList, useCouple } from '~/src/schema.jazz';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const [expandedSections, setExpandedSections] = useState(new Set());
  const list = useCoState(TodoList, id as ID<TodoList>);
  const couple = useCouple();

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
          title: list?.title ?? 'To-Do List',
        }}
      />
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SectionList
          style={{ paddingHorizontal: 24, paddingTop: 16 }}
          sections={[
            { title: 'my todos', data: list?.items ?? [] },
            { title: 'my todoss', data: list?.items ?? [] },
            { title: 'my todosss', data: list?.items ?? [] },
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
});
