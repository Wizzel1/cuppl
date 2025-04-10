import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-expo';
import { ID } from 'jazz-tools';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import ShoppingListItem from '~/components/ShoppingListDetailsScreen/ShoppingListItem';
import ShoppingItemBottomSheet from '~/components/bottomSheets/ShoppingItemBottomSheet';
import { ShoppingListBottomSheet } from '~/components/bottomSheets/ShoppingListBottomSheet';
import { ShoppingItem, ShoppingList } from '~/src/schemas/shoppingSchema.jazz';

export default function ShoppingListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useCoState(ShoppingList, id as ID<ShoppingList>, {
    resolve: {
      items: { $each: true },
    },
  });
  const completedItemsCount = list?.completedItems.length ?? 0;
  const totalItemsCount = list?.liveItems.length ?? 0;

  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const shoppingItemSheetRef = useRef<BottomSheetModal>(null);
  const shoppingListSheetRef = useRef<BottomSheetModal>(null);

  const handleFABPress = useCallback(() => {
    shoppingItemSheetRef.current?.present();
  }, [shoppingItemSheetRef.current]);

  const categoryMap = useMemo(() => {
    const categoryMap = new Map<string, ShoppingItem[]>();
    for (const item of list?.liveItems ?? []) {
      const category = item.category;
      if (item.completed) {
        categoryMap.set('Completed', [...(categoryMap.get('Completed') ?? []), item]);
      } else {
        categoryMap.set(category, [...(categoryMap.get(category) ?? []), item]);
      }
    }
    return categoryMap;
  }, [list?.items]);

  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item);
    shoppingItemSheetRef.current?.present();
  };

  const renderHeaderTitle = useCallback(() => {
    const title = list?.title ?? 'Shopping List';
    const titleLength = title.length;
    const titleSubstring = title.substring(0, 24);
    const titleRemaining = titleLength - titleSubstring.length;

    return (
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          {titleSubstring} {titleRemaining ? '...' : ''}
        </Text>
        <Text style={styles.headerSubtitle}>
          {completedItemsCount} / {totalItemsCount} completed
        </Text>
      </View>
    );
  }, [list?.title, completedItemsCount, totalItemsCount]);
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: renderHeaderTitle,
          headerRight: () => (
            <Pressable
              onPress={() => {
                shoppingListSheetRef.current?.present();
              }}>
              <Ionicons name="pencil" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${totalItemsCount > 0 ? (completedItemsCount / totalItemsCount) * 100 : 0}%`,
                },
              ]}
            />
          </View>
        </View>

        <SectionList
          style={styles.contentContainer}
          sections={Array.from(categoryMap.entries()).map(([category, items]) => ({
            title: category,
            data: items,
          }))}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ShoppingListItem
              item={item}
              index={index}
              onEdit={() => handleEditItem(item)}
              onDelete={() => {
                item.deleted = true;
              }}
              onToggle={() => {
                item.completed = !item.completed;
              }}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
        />
        <FloatingActionButton onPress={handleFABPress} icon="add" color="#27272A" />
        {list && (
          <ShoppingItemBottomSheet
            ref={shoppingItemSheetRef}
            toUpdate={editingItem}
            onDismiss={() => setEditingItem(null)}
            onCreate={(newItem) => {
              console.log('New item created:', newItem);
              list.items.push(newItem);
            }}
          />
        )}
        {list && <ShoppingListBottomSheet ref={shoppingListSheetRef} toUpdate={list} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    width: '100%',
    backgroundColor: '#F4F4F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 5.5,
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
  contentContainer: {
    paddingBottom: 80,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#71717B',
  },
});
