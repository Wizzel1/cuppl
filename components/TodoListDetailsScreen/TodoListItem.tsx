import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { TodoItem } from '~/src/schema.jazz';

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

interface TodoListItemProps {
  item: TodoItem;
  index: number;
  disableSwipe?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

const DueDateText = ({ item }: { item: TodoItem }) => {
  return (
    <Text
      style={[
        styles.dateText,
        item.isOverDue && !item.completed && styles.overdueText,
        item.completed && styles.completedText,
      ]}>
      {item.dueDate
        ? (() => {
            const today = new Date();
            const isToday =
              item.dueDate?.getDate() === today.getDate() &&
              item.dueDate?.getMonth() === today.getMonth() &&
              item.dueDate?.getFullYear() === today.getFullYear();

            if (isToday) {
              return `Today, ${item.dueDate?.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}`;
            } else {
              return item.dueDate?.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              });
            }
          })()
        : ''}
    </Text>
  );
};

const TodoListItem = ({
  item,
  index,
  disableSwipe = false,
  onDelete,
  onEdit,
}: TodoListItemProps) => {
  const alertCount = item?.alertNotificationID ? (item?.secondAlertNotificationID ? 2 : 1) : 0;
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      item!.completed = !item!.completed;
    }
  };

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
        <View key={(item?.id as string) + index}>
          <Pressable
            style={styles.itemContainer}
            onPress={(ev) => (isOpen ? setIsOpen(false) : handlePress())}>
            <View style={styles.rowContainer}>
              <View style={styles.contentContainer}>
                <Text
                  numberOfLines={1}
                  style={[styles.titleText, item?.completed && styles.completedText]}>
                  {item?.title}
                </Text>
                <View style={styles.metaContainer}>
                  {item?.dueDate && <DueDateText item={item} />}
                  {item?.recurringUnit && (
                    <View style={styles.recurringContainer}>
                      <FontAwesome name="repeat" size={16} color="#71717B" />
                      <Text style={[styles.recurringText, item?.completed && styles.completedText]}>
                        {item.recurringUnit}
                      </Text>
                    </View>
                  )}
                  {alertCount > 0 && (
                    <View style={styles.alertContainer}>
                      <MaterialCommunityIcons name="bell" size={16} color="#71717B" />
                      <Text style={styles.alertText}>{alertCount}</Text>
                    </View>
                  )}
                </View>
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
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentContainer: {
    flexDirection: 'column',
    flex: 1,
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

export default memo(TodoListItem);
