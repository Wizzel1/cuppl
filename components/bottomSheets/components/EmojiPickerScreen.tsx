import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { EmojiKeyboard } from 'rn-emoji-keyboard';

interface EmojiPickerScreenProps {
  setEmoji: (emoji: string) => void;
  setActiveScreen: (screen: string) => void;
}

const EmojiPickerScreen = ({ setEmoji, setActiveScreen }: EmojiPickerScreenProps) => {
  return (
    <View style={{ flex: 1 }}>
      <EmojiKeyboard
        styles={{
          container: styles.emojiKeyboardContainer,
        }}
        onEmojiSelected={(emoji) => {
          setEmoji(emoji.emoji);
          setActiveScreen('todo');
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
