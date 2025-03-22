import { Switch } from 'react-native';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  scale?: number;
}

export default function CustomSwitch({
  value,
  onValueChange,
  activeColor = '#8E51FF',
  inactiveColor = '#E4E4E7',
  scale = 0.9,
}: CustomSwitchProps) {
  return (
    <Switch
      trackColor={{ true: activeColor }}
      thumbColor="white"
      value={value}
      onValueChange={onValueChange}
      ios_backgroundColor={inactiveColor}
      style={{ transform: [{ scaleX: scale }, { scaleY: scale }] }}
    />
  );
}
