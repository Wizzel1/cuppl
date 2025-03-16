import * as ImagePicker from 'expo-image-picker';
import { ProgressiveImg, useAccount, useCoState } from 'jazz-react-native';
import { createImage } from 'jazz-react-native-media-images';
import { useCallback, useState } from 'react';
import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';

import { Couple, PartnerProfile } from '~/src/schema.jazz';

function PartnerAvatar({ partner }: { partner?: PartnerProfile | null }) {
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
        <ProgressiveImg image={partner.avatar} maxWidth={200}>
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

export default function Index() {
  const { me } = useAccount();
  const couple = useCoState(Couple, me.coupleId);
  const [isOpen, setIsOpen] = useState(false);

  const handlePick = (emoji: EmojiType) => {
    setIsOpen(false);
    if (couple?.partnerA) {
      couple.partnerA.mood = emoji.emoji;
    }
    if (couple?.partnerB) {
      couple.partnerB.mood = emoji.emoji;
    }
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
                  height: 391,
                }}
              />
            )}
          </ProgressiveImg>
        ) : (
          <Text
            style={{ textAlign: 'center', width: '100%', height: 300, backgroundColor: 'gray' }}>
            No background photo
          </Text>
        )}
      </Pressable>
      <EmojiPicker
        onEmojiSelected={handlePick}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        enableSearchBar
        enableRecentlyUsed
        categoryOrder={['recently_used', 'smileys_emotion']}
        disabledCategories={['flags', 'symbols']}
      />
      <Text>Index{me.profile?.name}</Text>
      {couple ? <Text> {couple.id}</Text> : <Text>No couple</Text>}
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        <Pressable onPress={() => setIsOpen(true)}>
          <Text style={styles.moodText}>{couple?.partnerA?.mood}</Text>
        </Pressable>
        <PartnerAvatar partner={couple?.partnerA} />
        <PartnerAvatar partner={couple?.partnerB} />
        <Pressable onPress={() => setIsOpen(true)}>
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
  },
});
