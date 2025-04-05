import * as ImagePicker from 'expo-image-picker';
import { ProgressiveImg } from 'jazz-react-native';
import { createImage } from 'jazz-react-native-media-images';
import { useState } from 'react';
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Mask, Path, Image as SvgImage } from 'react-native-svg';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';

import PartnerAvatar from '~/components/PartnerAvatar';
import { PartnerProfile, useCouple, usePartnerProfiles } from '~/src/schemas/schema.jazz';

const MaskedBackgroundPhoto = ({ imageUri }: { imageUri: string }) => {
  const windowWidth = Dimensions.get('window').width;
  const height = Dimensions.get('window').height * 0.4;

  return (
    <View style={{ width: windowWidth, height }}>
      <Svg height={height} width={windowWidth}>
        <Defs>
          <Mask id="mask" x="0" y="0" height="100%" width="100%">
            <Path
              d={`M0 0 L${windowWidth} 0 L${windowWidth} ${height - 40} Q${windowWidth / 2} ${height + 50} 0 ${height - 40} Z`}
              fill="white"
            />
          </Mask>
        </Defs>
        <SvgImage
          width="100%"
          height="100%"
          href={{ uri: imageUri }}
          preserveAspectRatio="xMidYMid slice"
          mask="url(#mask)"
        />
      </Svg>
    </View>
  );
};

export default function Index() {
  const couple = useCouple();
  const { myProfile, partnerProfile } = usePartnerProfiles();

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
          owner: couple._owner,
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
            {({ src }) => (src ? <MaskedBackgroundPhoto imageUri={src} /> : null)}
          </ProgressiveImg>
        ) : (
          <View
            style={{
              width: '100%',
              height: Dimensions.get('window').height * 0.4,
              backgroundColor: 'gray',
              justifyContent: 'center',
            }}>
            <Text style={{ textAlign: 'center' }}>No background photo</Text>
          </View>
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
          marginTop: -44,
        }}>
        <Pressable
          onPress={() => {
            setPartnerTapped(myProfile ?? null);
            setIsOpen(true);
          }}>
          <Text style={styles.moodText}>{myProfile?.mood}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', marginHorizontal: -10 }}>
          <PartnerAvatar partner={myProfile} />
          <View style={{ marginLeft: -10 }}>
            <PartnerAvatar partner={partnerProfile} />
          </View>
        </View>
        <Text style={styles.moodText}>{partnerProfile?.mood}</Text>
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
