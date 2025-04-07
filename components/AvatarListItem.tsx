import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressiveImg } from 'jazz-expo';
import { ImageDefinition } from 'jazz-tools';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
interface AvatarListItemProps {
  onPress: () => void;
  title: string;
  avatar: ImageDefinition | null;
  backgroundColor?: string;
  emoji?: string;
  isHidden?: boolean;
  subtitle?: string;
  progress: number;
}

const AvatarListItem = ({
  onPress,
  title,
  avatar,
  backgroundColor,
  emoji,
  isHidden,
  subtitle,
  progress,
}: AvatarListItemProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.avatarWrapper}>
            {backgroundColor && emoji ? (
              <View style={[styles.avatarContainer, { backgroundColor }]}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </View>
            ) : (
              <ProgressiveImg image={avatar} targetWidth={48}>
                {({ src, originalSize, res }) => (
                  <Image source={{ uri: src }} style={styles.avatarImage} />
                )}
              </ProgressiveImg>
            )}
            <View style={styles.progressContainer}>
              <AnimatedCircularProgress
                size={48}
                width={4}
                fill={progress * 100}
                lineCap="round"
                tintColor="#27272A"
                onAnimationComplete={() => console.log('onAnimationComplete')}
                backgroundColor="#E4E4E7"
              />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
              {title}
            </Text>
            <Text style={styles.subtitleText}>{subtitle}</Text>
          </View>
          {isHidden && <MaterialCommunityIcons name="eye-off" size={20} color="#A1A1AA" />}
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color="black" style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
};

export default AvatarListItem;

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
  avatarWrapper: {
    width: 48,
    height: 48,
    position: 'relative',
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
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
