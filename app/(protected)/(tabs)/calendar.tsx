import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Agenda, AgendaProps, AgendaSchedule, DateData } from 'react-native-calendars';
import { Theme } from 'react-native-calendars/src/types';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      hideKnob: false,
      selected: getDateFromTimestamp(new Date().getTime()),
      onCalendarToggled: (calendarOpened) => {
        console.log(calendarOpened);
      },
      onDayChange: (day) => {
        console.log('day changed', day);
      },
      loadItemsForMonth: (month) => {
        console.log('trigger items loading');
        loadItems(month);
      },
      renderItem: (entry, isFirst) => {
        return (
          <View style={{ height: 300, width: '100%' }}>
            <Text style={{ color: 'black' }}>{entry.name}</Text>
          </View>
        );
      },
      onDayPress: (day) => {
        console.log('day pressed', day);
      },
      renderKnob: () => {
        return <View style={{ width: 50, height: 5, backgroundColor: 'grey', borderRadius: 10 }} />;
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
      theme,
    } satisfies AgendaProps;
  }, [items]);

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Agenda
        {...agendaProps}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={50}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={50}
        // Override inner list with a custom implemented component
        // renderList={(listProps) => {
        //   return <MyCustomList {...listProps} />;
        // }}
        // Specify what should be rendered instead of ActivityIndicator
        renderEmptyData={() => {
          return <View />;
        }}
        // By default, agenda dates are marked if they have at least one item, but you can override this if needed
        markedDates={{
          '2012-05-16': { selected: true, marked: true },
          '2012-05-17': { marked: true },
          '2012-05-18': { disabled: true },
        }}
        // If disabledByDefault={true} dates flagged as not disabled will be enabled. Default = false
        disabledByDefault
        // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly
        onRefresh={() => console.log('refreshing...')}
        // Set this true while waiting for new data from a refresh
        refreshing={false}
        // Add a custom RefreshControl component, used to provide pull-to-refresh functionality for the ScrollView
        refreshControl={null}
        // Agenda container style
        style={{
          height: '100%',
          width: '100%',
        }}
      />
    </SafeAreaView>
  );
}
