import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressiveImg, useCoState } from 'jazz-react-native';
import { ID, ImageDefinition } from 'jazz-tools';
import { memo, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { TodoList } from '~/src/schema.jazz';

type RightActionProps = {
  onDelete: () => void;
  onEdit: () => void;
};
function RightAction(
  prog: SharedValue<number>,
  drag: SharedValue<number>,
  { onDelete, onEdit }: RightActionProps
) {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + 130 }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <View style={styles.rightActionContainer}>
        <Pressable onPress={onEdit} style={styles.rightActionButton}>
          <Ionicons name="pencil" size={20} color="#000000" />
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={{ ...styles.rightActionButton, backgroundColor: '#FFE5E5' }}>
          <Ionicons name="trash-outline" size={20} color="#FF0000" />
        </Pressable>
      </View>
    </Reanimated.View>
  );
}

function TodoListListItem({
  avatar,
  title,
  listId,
  onPress,
  onDelete,
  onEdit,
  disableSwipe = false,
}: {
  avatar?: ImageDefinition | null;
  title: string;
  listId: string;
  onPress: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  disableSwipe?: boolean;
}) {
  const list = useCoState(TodoList, listId as ID<TodoList>);
  const [totalTodos, setTotalTodos] = useState(0);
  const [completedTodos, setCompletedTodos] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);

  useEffect(() => {
    const todos = list?.items;
    if (!todos) return;
    setTotalTodos(todos.length);
    setCompletedTodos(todos.filter((todo) => todo?.completed ?? false).length);
    setBackgroundColor(list?.backgroundColor ?? null);
    setEmoji(list?.emoji ?? null);
  }, [list?.items, list?.backgroundColor, list?.emoji, list?.title, list?.isHidden]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <GestureHandlerRootView>
      <Swipeable
        enabled={!disableSwipe}
        friction={1.8}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        onSwipeableOpen={() => setIsOpen(true)}
        renderRightActions={(progress, drag, swipeable) =>
          RightAction(progress, drag, {
            onDelete: () => {
              setIsOpen(false);
              swipeable.close();
              onDelete?.();
            },
            onEdit: () => {
              setIsOpen(false);
              swipeable.close();
              onEdit?.();
            },
          })
        }>
        <TouchableOpacity onPress={isOpen ? () => setIsOpen(false) : onPress}>
          <View style={styles.container}>
            <View style={styles.contentWrapper}>
              {backgroundColor && emoji ? (
                <View style={[styles.avatarContainer, { backgroundColor }]}>
                  <Text style={styles.emojiText}>{emoji}</Text>
                </View>
              ) : (
                <ProgressiveImg image={avatar} maxWidth={400}>
                  {({ src, originalSize, res }) => (
                    <Image source={{ uri: src }} style={styles.avatarImage} />
                  )}
                </ProgressiveImg>
              )}

              <View style={styles.textContainer}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
                  {title}
                </Text>
                <Text style={styles.subtitleText}>
                  {completedTodos} / {totalTodos}
                </Text>
              </View>
              {list?.isHidden && (
                <MaterialCommunityIcons name="eye-off" size={20} color="#A1A1AA" />
              )}
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color="black"
              style={styles.chevron}
            />
          </View>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 20,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#18181B',
  },
  subtitleText: {
    fontSize: 14,
    color: '#71717B',
  },
  chevron: {
    paddingLeft: 18,
  },
  rightAction: { width: 75, height: 75, backgroundColor: 'purple' },
  separator: {
    width: '100%',
    borderTopWidth: 1,
  },
  rightActionContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 130,
    paddingRight: 24,
  },
  rightActionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(TodoListListItem);
