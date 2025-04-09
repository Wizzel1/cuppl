import { Ionicons } from '@expo/vector-icons';
import { ProgressiveImg } from 'jazz-expo';
import { ImageDefinition } from 'jazz-tools';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type PhotoSectionProps = {
  image: ImageDefinition | null;
  onPress: () => void;
};

const PhotoAttachmentSection = ({ image, onPress }: PhotoSectionProps) => (
  <View style={styles.sectionContainer}>
    <View style={styles.rowBetween}>
      <Text style={styles.sectionLabel}>Photo</Text>
      <Pressable style={styles.photoButton} onPress={onPress}>
        {image ? (
          <ProgressiveImg image={image} targetWidth={70}>
            {({ src, res, originalSize }) => (
              <Image source={{ uri: src }} style={styles.photoImage} />
            )}
          </ProgressiveImg>
        ) : (
          <Ionicons name="image-outline" size={20} color="#71717B" />
        )}
      </Pressable>
    </View>
  </View>
);

export default PhotoAttachmentSection;

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 16,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 16,
    color: '#27272A',
  },
  photoButton: {
    backgroundColor: '#F4F4F5',
    width: 70,
    height: 70,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
