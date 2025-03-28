import { Pressable, StyleSheet, Text, View } from 'react-native';

const colors = [
  '#F7E987',
  '#FFD4D4',
  '#FFEEB3',
  '#FFFAC0',
  '#FBFFA3',
  '#E3FCBF',
  '#D0F5BE',
  '#C8FFE0',
  '#B8F1F1',
  '#D0F5FF',
  '#D9F8FF',
  '#D6E5FA',
  '#E5DBFF',
  '#F1E4FF',
  '#F9ECFF',
  '#FFE9F9',
  '#FFDDF3',
  '#FFD6E5',
];

interface BottomSheetColorPickerProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  onBackPress: () => void;
}

const BottomSheetColorPicker = ({
  backgroundColor,
  setBackgroundColor,
  onBackPress,
}: BottomSheetColorPickerProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBackPress}>
          <Text style={styles.backButton}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Choose Color</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <Pressable
            key={color}
            onPress={() => {
              setBackgroundColor(color);
              onBackPress();
            }}
            style={styles.colorButtonContainer}>
            <View style={[styles.colorButton, { backgroundColor: color }]}>
              {color === backgroundColor && <View style={styles.selectedIndicator} />}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    color: '#8E51FF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  spacer: {
    width: 40,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButtonContainer: {
    marginBottom: 16,
  },
  colorButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8E51FF',
  },
});

export default BottomSheetColorPicker;
