import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EmojiKeyboard } from 'rn-emoji-keyboard';

interface EmojiPickerScreenProps {
  setEmoji: (emoji: string) => void;
}

const EmojiPickerScreen = ({ setEmoji }: EmojiPickerScreenProps) => {
  return (
    <View style={{ flex: 1 }}>
      <EmojiKeyboard
        styles={{
          container: styles.emojiKeyboardContainer,
        }}
        onEmojiSelected={(emoji) => {
          setEmoji(emoji.emoji);
        }}
        defaultHeight={550}
      />
    </View>
  );
};

export default memo(EmojiPickerScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emojiKeyboardContainer: {
    shadowColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
