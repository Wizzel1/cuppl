import Constants from 'expo-constants';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Agenda, AgendaProps, AgendaSchedule, DateData } from 'react-native-calendars';
import { Theme } from 'react-native-calendars/src/types';

import FloatingActionButton from '~/components/FloatingActionButton';

function getDateFromTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

export default function CalendarScreen() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AgendaSchedule>({});
  const loadItems = (day: DateData) => {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = getDateFromTimestamp(time);

        if (!items[strTime]) {
          items[strTime] = [];

          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Item for ' + strTime + ' #' + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
              day: strTime,
            });
          }
        }
      }

      const newItems: AgendaSchedule = {};
      Object.keys(items).forEach((key) => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  };

  const theme: Theme = {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#00adf5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#00adf5',
    dayTextColor: '#2d4150',
    textDisabledColor: '#dd99ee',
  };
  const agendaProps: AgendaProps = useMemo(() => {
    return {
      items,
      showClosingKnob: true,
      pastScrollRange: 50,
      futureScrollRange: 50,
      selected: getDateFromTimestamp(new Date().getTime()),
      onCalendarToggled: (calendarOpened) => {
        setOpen(calendarOpened);
      },
      // onDayChange: (day: DateData) => {
      //   console.log('day changed', day);
      // },
      loadItemsForMonth: (month) => {
        console.log('trigger items loading');
        loadItems(month);
      },
      renderItem: (entry, isFirst) => {
        const fontSize = isFirst ? 16 : 14;
        const color = isFirst ? 'black' : '#43515c';
        return (
          <Pressable style={[styles.item, { height: 50 }]} onPress={() => Alert.alert(entry.name)}>
            <Text style={{ fontSize, color }}>{entry.name}</Text>
          </Pressable>
        );
      },
      // onDayPress: (day) => {
      //   console.log('day pressed', day);
      // },
      // renderKnob: () => {
      //   return (
      //     <View
      //       style={{ padding: 5, width: 50, height: 5, backgroundColor: 'grey', borderRadius: 10 }}
      //     />
      //   );
      // },
      // rowHasChanged: (r1, r2) => {
      //   return r1.name !== r2.name;
      // },
      // renderDay: (day, item) => {
      //   return <View />;
      // },
      // renderEmptyDate: () => {
      //   return (
      //     <View style={{ backgroundColor: 'red', height: 100, width: 100 }}>
      //       <Text>This is empty date!</Text>
      //     </View>
      //   );
      // },
      // renderEmptyData: () => {
      //   return <View />;
      // },
      // onRefresh: () => {
      //   console.log('refreshing...');
      // },
      // markedDates: {
      //   '2012-05-16': { selected: true, marked: true },
      //   '2012-05-17': { marked: true },
      //   '2012-05-18': { disabled: true },
      // },
      refreshing: false,
      theme,
    } satisfies AgendaProps;
  }, [items]);

  return (
    <View
      style={{
        paddingTop: Constants.statusBarHeight,
        flex: 1,
      }}>
      <Agenda {...agendaProps} />
      {!open && <FloatingActionButton onPress={() => {}} icon="add" color="#27272A" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
