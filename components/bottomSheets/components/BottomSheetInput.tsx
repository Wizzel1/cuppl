import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { useDebounce } from '~/utils/useDebounce';

interface InputFieldProps {
  onChange: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const BottomSheetInput = ({ onChange, initialValue, placeholder }: InputFieldProps) => {
  const [title, setTitle] = useState(initialValue ?? '');
  const debouncedTitle = useDebounce(title, 300);

  useEffect(() => {
    onChange(debouncedTitle);
  }, [debouncedTitle, onChange]);

  return (
    <BottomSheetTextInput
      placeholder={placeholder}
      style={styles.input}
      onChangeText={setTitle}
      value={title}
    />
  );
};

export default BottomSheetInput;

const styles = StyleSheet.create({
  input: {
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
    color: '#27272A',
  },
});
