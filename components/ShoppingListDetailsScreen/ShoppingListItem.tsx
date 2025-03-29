import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { ShoppingItem } from '~/src/schemas/shoppingSchema';

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
interface ShoppingListItemProps {
  item: ShoppingItem;
  index: number;
  disableSwipe?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
}

export default function ShoppingListItem({
  item,
  index,
  disableSwipe = false,
  onDelete,
  onEdit,
  onToggle,
}: ShoppingListItemProps) {
  const [swipeMenuOpen, setSwipeMenuOpen] = useState(false);

  const handlePress = () => {
    if (swipeMenuOpen) {
      setSwipeMenuOpen(false);
    } else if (onToggle) onToggle();
  };

  return (
    <GestureHandlerRootView>
      <Swipeable
        enabled={!disableSwipe}
        friction={1.8}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        onSwipeableOpen={() => setSwipeMenuOpen(true)}
        renderRightActions={(progress, drag, swipeable) =>
          RightAction(progress, drag, {
            onDelete: () => {
              setSwipeMenuOpen(false);
              swipeable.close();
              onDelete?.();
            },
            onEdit: () => {
              setSwipeMenuOpen(false);
              swipeable.close();
              onEdit?.();
            },
          })
        }>
        <View key={(item?.id as string) + index}>
          <Pressable
            style={styles.itemContainer}
            onPress={(ev) => (swipeMenuOpen ? setSwipeMenuOpen(false) : handlePress())}>
            <View style={styles.rowContainer}>
              <View style={styles.contentContainer}>
                <Text
                  numberOfLines={1}
                  style={[styles.titleText, item?.completed && styles.completedText]}>
                  {item?.name}
                </Text>
                <Text style={styles.recurringText}>
                  {item.quantity} {item.unit}
                </Text>
              </View>
              {item?.isHidden && (
                <MaterialCommunityIcons name="eye-off" size={20} color="#71717B" />
              )}
            </View>
          </Pressable>
          {/* {index < todos.length - 1 && <View style={{ height: 8 }} />} */}
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    height: 48,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#A1A1AA',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  overdueText: {
    color: '#FF0000',
  },
  recurringText: {
    fontSize: 14,
    color: '#71717B',
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#71717B',
  },
});
