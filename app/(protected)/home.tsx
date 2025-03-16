import * as ImagePicker from 'expo-image-picker';
import { ProgressiveImg, useAccount, useCoState } from 'jazz-react-native';
import { createImage } from 'jazz-react-native-media-images';
import { useState } from 'react';
import { Dimensions, Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';

import PartnerAvatar from '~/components/PartnerAvatar';
import { Couple, PartnerProfile } from '~/src/schema.jazz';

export default function Index() {
  const { me } = useAccount();
  const couple = useCoState(Couple, me.coupleId);
  const [isOpen, setIsOpen] = useState(false);
  const [partnerTapped, setPartnerTapped] = useState<PartnerProfile | null>(null);

  const handleEmojiPick = (emoji: EmojiType) => {
    setIsOpen(false);
    if (partnerTapped) partnerTapped.mood = emoji.emoji;
    setPartnerTapped(null);
  };

  const handleImageUpload = async () => {
    try {
      if (!couple) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true, // Important: We need base64 data
        quality: 1,
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
      <StatusBar translucent backgroundColor="#FFFFFF4D" />
      <Pressable onPress={handleImageUpload}>
        {couple?.backgroundPhoto ? (
          <ProgressiveImg image={couple.backgroundPhoto} maxWidth={1024}>
            {({ src, res, originalSize }) => (
              <Image
                source={{ uri: src }}
                resizeMode="cover"
                style={{
                  width: '100%',
                  height: Dimensions.get('window').height * 0.4,
                }}
              />
            )}
          </ProgressiveImg>
        ) : (
          <Text
            style={{
              textAlign: 'center',
              width: '100%',
              height: Dimensions.get('window').height * 0.4,
              backgroundColor: 'gray',
            }}>
            No background photo
          </Text>
        )}
      </Pressable>
      <EmojiPicker
        onEmojiSelected={handleEmojiPick}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        enableSearchBar
        enableRecentlyUsed
        categoryOrder={['recently_used', 'smileys_emotion']}
        disabledCategories={['flags', 'symbols']}
      />
      {/* <Text>Index{me.profile?.name}</Text>
      {couple ? <Text> {couple.id}</Text> : <Text>No couple</Text>} */}
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'baseline',
          marginTop: -50,
        }}>
        <Pressable
          onPress={() => {
            setPartnerTapped(couple?.partnerA ?? null);
            setIsOpen(true);
          }}>
          <Text style={styles.moodText}>{couple?.partnerA?.mood}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', marginHorizontal: -10 }}>
          <PartnerAvatar partner={couple?.partnerA} />
          <View style={{ marginLeft: -10 }}>
            <PartnerAvatar partner={couple?.partnerB} />
          </View>
        </View>
        <Pressable
          onPress={() => {
            setPartnerTapped(couple?.partnerB ?? null);
            setIsOpen(true);
          }}>
          <Text style={styles.moodText}>{couple?.partnerB?.mood}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moodText: {
    textAlign: 'center',
    fontSize: 32,
    paddingHorizontal: 20,
  },
});
