import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TodoItem } from '~/src/schema.jazz';

const TodoListItem = ({ item, index }: { item: TodoItem; index: number }) => {
  const isOverdue = item?.dueDate && new Date(item.dueDate) < new Date();
  return (
    <View key={(item?.id as string) + index}>
      <Pressable
        style={{
          paddingVertical: 12,
          paddingHorizontal: 24,
        }}
        onPress={() => {
          item!.completed = !item!.completed;
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              flexDirection: 'column',
              flex: 1,
            }}>
            <Text
              numberOfLines={1}
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
                  color: isOverdue && !item?.completed ? '#FF0000' : '#A1A1AA',
                  textDecorationLine: item?.completed ? 'line-through' : 'none',
                }}>
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
                <Text
                  style={{
                    fontSize: 14,
                    color: '#71717B',
                    textDecorationLine: item?.completed ? 'line-through' : 'none',
                  }}>
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

export default memo(TodoListItem);
