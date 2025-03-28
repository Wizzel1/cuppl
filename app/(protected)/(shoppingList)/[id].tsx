import { useLocalSearchParams } from 'expo-router';
import { useCoState } from 'jazz-react-native';
import { ID } from 'jazz-tools';
import { Text, View } from 'react-native';

import { ShoppingList } from '~/src/schemas/shoppingSchema';

export default function ShoppingListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shoppingList = useCoState(ShoppingList, id as ID<ShoppingList>, {
    items: [{}],
  });

  return (
    <View>
      <Text>{shoppingList?.title}</Text>
    </View>
  );
}
