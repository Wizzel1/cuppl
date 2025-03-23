import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TodoItem } from '~/src/schema.jazz';

const TodoListItem = ({ item, index }: { item: TodoItem; index: number }) => {
  const isOverdue = item?.dueDate && new Date(item.dueDate) < new Date();
  return (
    <View key={(item?.id as string) + index}>
      <Pressable
        style={styles.itemContainer}
        onPress={() => {
          item!.completed = !item!.completed;
        }}>
        <View style={styles.rowContainer}>
          <View style={styles.contentContainer}>
            <Text
              numberOfLines={1}
              style={[styles.titleText, item?.completed && styles.completedText]}>
              {item?.title}
            </Text>
            <View style={styles.metaContainer}>
              <Text
                style={[
                  styles.dateText,
                  isOverdue && !item?.completed && styles.overdueText,
                  item?.completed && styles.completedText,
                ]}>
                {item?.dueDate
                  ? (() => {
                      const dueDate = new Date(item.dueDate);
                      const today = new Date();
                      const isToday =
                        dueDate.getDate() === today.getDate() &&
                        dueDate.getMonth() === today.getMonth() &&
                        dueDate.getFullYear() === today.getFullYear();

                      if (isToday) {
                        return `Today, ${dueDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}`;
                      } else {
                        return dueDate.toLocaleDateString('en-US', {
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
              {item?.recurringUnit && (
                <Text style={[styles.recurringText, item?.completed && styles.completedText]}>
                  {item?.recurringUnit}
                </Text>
              )}
            </View>
          </View>
          {item?.isHidden && <MaterialCommunityIcons name="eye-off" size={20} color="#A1A1AA" />}
        </View>
      </Pressable>
      {/* {index < todos.length - 1 && <View style={{ height: 8 }} />} */}
    </View>
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
});

export default memo(TodoListItem);
