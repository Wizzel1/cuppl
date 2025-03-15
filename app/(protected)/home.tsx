import * as ImagePicker from 'expo-image-picker';
import { ProgressiveImg, useAccount, useCoState } from 'jazz-react-native';
import { createImage } from 'jazz-react-native-media-images';
import { Button, Image, Text, View } from 'react-native';

import { Couple } from '~/src/schema';
export default function Index() {
  const { me } = useAccount();
  const couple = useCoState(Couple, me.coupleId);

  const handleImageUpload = async () => {
    try {
      if (!couple) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true, // Important: We need base64 data
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0].base64) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        const image = await createImage(base64Uri, {
          owner: couple._owner, // Set appropriate owner
          maxSize: 2048, // Optional: limit maximum image size
        });
        // Store the image in your covalue
        couple.backgroundPhoto = image;
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  return (
    <View>
      {couple?.backgroundPhoto ? (
        <ProgressiveImg image={couple.backgroundPhoto} maxWidth={1024}>
          {({ src, res, originalSize }) => (
            <Image
              source={{ uri: src }}
              resizeMode="cover"
              style={{
                width: '100%',
                height: 300,
              }}
            />
          )}
        </ProgressiveImg>
      ) : (
        <Text style={{ textAlign: 'center', width: '100%', height: 300, backgroundColor: 'gray' }}>
          No background photo
        </Text>
      )}
      <Text>Index{me.profile?.name}</Text>
      <Button title="Upload Image" onPress={handleImageUpload} />
      {couple ? <Text>Couple {couple.id}</Text> : <Text>No couple</Text>}
    </View>
  );
}
