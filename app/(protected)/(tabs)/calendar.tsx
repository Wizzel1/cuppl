import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Agenda, AgendaProps, AgendaSchedule, DateData } from 'react-native-calendars';
import { Theme } from 'react-native-calendars/src/types';
import { SafeAreaView } from 'react-native-safe-area-context';

import FloatingActionButton from '~/components/FloatingActionButton';

function getDateFromTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

const theme: Theme = {
  agendaDayTextColor: 'yellow',
  agendaDayNumColor: 'green',
  agendaTodayColor: 'red',
  agendaKnobColor: 'blue',
  nowIndicatorKnob: {
    backgroundColor: 'red',
  },
  stylesheet: {
    agenda: {
      list: {
        height: 500,
        backgroundColor: 'red',
      },
      main: {
        backgroundColor: 'blue',
      },
    },
  },
};
export default function CalendarScreen() {
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

  const agendaProps: AgendaProps = useMemo(() => {
    return {
      items,
      showClosingKnob: true,
      pastScrollRange: 50,
      futureScrollRange: 50,
      selected: getDateFromTimestamp(new Date().getTime()),
      onCalendarToggled: (calendarOpened) => {
        console.log(calendarOpened);
      },
      onDayChange: (day: DateData) => {
        console.log('day changed', day);
      },
      loadItemsForMonth: (month) => {
        console.log('trigger items loading');
        loadItems(month);
      },
      renderItem: (entry, isFirst) => {
        return (
          <View style={{ height: 300, width: '100%' }} key={entry.name}>
            <Text style={{ color: 'black' }}>{entry.name}</Text>
          </View>
        );
      },
      onDayPress: (day) => {
        console.log('day pressed', day);
      },
      renderKnob: () => {
        return (
          <View
            style={{ padding: 5, width: 50, height: 5, backgroundColor: 'grey', borderRadius: 10 }}
          />
        );
      },
      rowHasChanged: (r1, r2) => {
        return r1.name !== r2.name;
      },
      renderDay: (day, item) => {
        return <View />;
      },
      renderEmptyDate: () => {
        return (
          <View style={{ backgroundColor: 'red', height: 100, width: 100 }}>
            <Text>This is empty date!</Text>
          </View>
        );
      },
      renderEmptyData: () => {
        return <View />;
      },
      onRefresh: () => {
        console.log('refreshing...');
      },
      markedDates: {
        '2012-05-16': { selected: true, marked: true },
        '2012-05-17': { marked: true },
        '2012-05-18': { disabled: true },
      },
      refreshing: false,
      theme,
    } satisfies AgendaProps;
  }, [items]);

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Agenda {...agendaProps} style={{ height: '100%', width: '100%' }} />
      <FloatingActionButton onPress={() => {}} icon="add" color="#27272A" />
    </SafeAreaView>
  );
}
