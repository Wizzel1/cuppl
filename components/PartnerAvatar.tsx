import * as ImagePicker from 'expo-image-picker';
import { ProgressiveImg } from 'jazz-react-native';
import { createImage } from 'jazz-react-native-media-images';
import { useCallback } from 'react';
import { Image, Pressable, View } from 'react-native';

import { PartnerProfile } from '~/src/schemas/schema.jazz';

export default function PartnerAvatar({ partner }: { partner?: PartnerProfile | null }) {
  const handleAvatarPress = useCallback(async () => {
    try {
      if (!partner) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true, // Important: We need base64 data
        quality: 1,
      });
      if (!result.canceled && result.assets[0].base64) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const image = await createImage(base64Uri, {
          owner: partner._owner, // Set appropriate owner
        });
        // Store the image in your covalue
        partner.avatar = image;
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }, [partner?.id]);

  return (
    <Pressable onPress={handleAvatarPress} style={{ width: 88, height: 88 }}>
      {partner?.avatar ? (
        <ProgressiveImg image={partner.avatar} maxWidth={400}>
          {({ src, originalSize, res }) => (
            <Image
              source={{ uri: src }}
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                resizeMode: 'cover',
              }}
            />
          )}
        </ProgressiveImg>
      ) : (
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: '#e0e0e0',
          }}
        />
      )}
    </Pressable>
  );
}
