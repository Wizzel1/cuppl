import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import FloatingActionButton from '~/components/FloatingActionButton';
import ShoppingItemBottomSheet from '~/components/ShoppingListDetailsScreen/ShoppingItemBottomSheet';
import { ShoppingItem, ShoppingList } from '~/src/schemas/shoppingSchema';

export default function ShoppingListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = useCoState(ShoppingList, id as ID<ShoppingList>, {
    items: [{}],
  });
  const completedItemsCount = list?.completedItems.length ?? 0;
  const totalItemsCount = list?.liveItems.length ?? 0;
  const shoppingItemSheetRef = useRef<BottomSheetModal>(null);
  const shoppingListSheetRef = useRef<BottomSheetModal>(null);

  const handleFABPress = useCallback(() => {
    shoppingItemSheetRef.current?.present();
  }, [shoppingItemSheetRef.current]);

  const categoryMap = useMemo(() => {
    const categoryMap = new Map<string, ShoppingItem[]>();
    for (const item of list?.items ?? []) {
      const category = item.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)?.push(item);
    }
    return categoryMap;
  }, [list?.items]);

  const renderHeaderTitle = useCallback(() => {
    const title = list?.title ?? 'To-Do List';
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
        <FlatList data={list?.items} renderItem={({ item }) => <Text>{item.name}</Text>} />
        <FloatingActionButton onPress={handleFABPress} icon="add" color="#27272A" />
        <ShoppingItemBottomSheet
          ref={shoppingItemSheetRef}
          toUpdate={null}
          onCreate={(newItem) => {
            if (list) {
              list.items.push(newItem);
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
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  sectionMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionMetaText: {
    fontSize: 14,
    color: '#71717B',
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
