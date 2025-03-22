import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressiveImg, useCoState } from 'jazz-react-native';
import { ID, ImageDefinition } from 'jazz-tools';
import { memo, useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { DefaultTodoList, TodoList } from '~/src/schema.jazz';

function TodoListItem({
  avatar,
  title,
  listId,
  onPress,
}: {
  avatar?: ImageDefinition | null;
  title: string;
  listId: ID<TodoList | DefaultTodoList>;
  onPress: () => void;
}) {
  const list = useCoState(TodoList, listId);
  const defaultList = useCoState(DefaultTodoList, listId);
  const [totalTodos, setTotalTodos] = useState(0);
  const [completedTodos, setCompletedTodos] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);

  useEffect(() => {
    const todos = list?.items ?? defaultList?.items;
    if (!todos) return;
    setTotalTodos(todos.length);
    setCompletedTodos(todos.filter((todo) => todo?.completed ?? false).length);
    setBackgroundColor(list?.backgroundColor ?? null);
    setEmoji(list?.emoji ?? null);
  }, [list?.items, defaultList?.items]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          marginHorizontal: 24,
          marginVertical: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {backgroundColor && emoji ? (
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </View>
          ) : (
            <ProgressiveImg image={avatar} maxWidth={400}>
              {({ src, originalSize, res }) => (
                <Image
                  source={{ uri: src }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    resizeMode: 'cover',
                  }}
                />
              )}
            </ProgressiveImg>
          )}

          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#18181B',
              }}>
              {title}
            </Text>
            <Text style={{ fontSize: 14, color: '#71717B' }}>
              {completedTodos} / {totalTodos}
            </Text>
          </View>
          {list?.isHidden && <MaterialCommunityIcons name="eye-off" size={20} color="#A1A1AA" />}
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color="black"
          style={{ paddingLeft: 18 }}
        />
      </View>
    </TouchableOpacity>
  );
}

export default memo(TodoListItem);
