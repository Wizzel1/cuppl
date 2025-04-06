import DateTimePicker from '@react-native-community/datetimepicker';
import { StyleSheet, Text, View } from 'react-native';

import CustomSwitch from '~/components/CustomSwitch';

type DueDateSectionProps = {
  hasDueDate: boolean;
  setHasDueDate: (value: boolean) => void;
  dueDate: Date;
  setDueDate: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
};

const DueDateSection = ({
  hasDueDate,
  setHasDueDate,
  dueDate,
  setDueDate,
  showDatePicker,
  setShowDatePicker,
  showTimePicker,
  setShowTimePicker,
}: DueDateSectionProps) => (
  <View style={{ marginTop: 16 }}>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
      <Text style={{ fontSize: 16, color: '#27272A' }}>Due Date</Text>
      <CustomSwitch value={hasDueDate} onValueChange={setHasDueDate} />
    </View>

    {hasDueDate && (
      <View style={styles.dateTimeContainer}>
        <DateTimePicker
          value={dueDate}
          style={{ flex: 1 }}
          mode="datetime"
          display="compact"
          accentColor="#8E51FF"
          minimumDate={new Date(new Date().setHours(new Date().getHours() + 1))}
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) setDueDate(date);
          }}
        />
      </View>
    )}
  </View>
);

export default DueDateSection;

const styles = StyleSheet.create({
  dateButtonText: {
    fontSize: 14,
    color: '#27272A',
    textAlign: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
});
