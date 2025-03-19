import { Stack, useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { Text, View } from 'react-native';

import { TodoList } from '~/src/schema.jazz';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();

  const list = useCoState(TodoList, id as ID<TodoList>);
  return (
    <>
      <Stack.Screen options={{ title: list?.title ?? 'To-Do List' }} />
      <View>
        <Text>List Detail {id}</Text>
      </View>
    </>
  );
}
