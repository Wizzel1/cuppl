import { Ionicons } from '@expo/vector-icons';
import { ProgressiveImg } from 'jazz-react-native';
import { ImageDefinition } from 'jazz-tools';
import { Image, Text, TouchableOpacity, View } from 'react-native';

function TodoListItem({
  avatar,
  backgroundColor,
  emoji,
  title,
  todosCount,
  completedCount,
  onPress,
}: {
  avatar?: ImageDefinition | null;
  backgroundColor?: string;
  emoji?: string;
  title: string;
  todosCount: number;
  completedCount: number;
  onPress: () => void;
}) {
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
              {completedCount} / {todosCount}
            </Text>
          </View>
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

export default TodoListItem;
