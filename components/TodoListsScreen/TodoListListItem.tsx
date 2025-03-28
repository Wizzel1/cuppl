import { Ionicons } from '@expo/vector-icons';
import { useCoState } from 'jazz-react-native';
import { ID, ImageDefinition } from 'jazz-tools';
import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, Pressable } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import AvatarListItem from '../AvatarListItem';

import { TodoList } from '~/src/schemas/todoSchema';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!list?.id) return;
    if (isLoaded) return;
    setIsLoaded(false);
    list?.ensureLoaded({ items: [{}] }).then(() => {
      setIsLoaded(true);
    });
  }, [list?.id]);

  const completedItemsCount = list?.completedItems.length ?? 0;
  const totalItemsCount = list?.liveItems.length ?? 0;
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
        <AvatarListItem
          onPress={isOpen ? () => setIsOpen(false) : onPress}
          title={title}
          avatar={avatar ?? null}
          isLoaded={isLoaded}
          isHidden={list?.isHidden}
          backgroundColor={list?.backgroundColor}
          emoji={list?.emoji}
          subtitle={`${completedItemsCount} / ${totalItemsCount}`}
        />
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
