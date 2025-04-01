import Constants from 'expo-constants';
import { memo, useCallback } from 'react';
import { SectionListRenderItem, StyleSheet, Text, View } from 'react-native';
import {
  AgendaList,
  CalendarProvider,
  DateData,
  ExpandableCalendar,
  WeekCalendar,
} from 'react-native-calendars';
import { UpdateSources } from 'react-native-calendars/src/expandableCalendar/commons';

interface Props {
  weekView?: boolean;
}

// Define the structure for our agenda items
interface AgendaItem {
  data: {
    hour: string;
    duration: string;
    name: string;
    color?: string;
  }[];
}

// Create dummy data for the agenda
const agendaItems: { [key: string]: AgendaItem } = {
  '2025-03-20': {
    data: [
      { hour: '09:00', duration: '1h', name: 'Team Meeting' },
      { hour: '14:30', duration: '45m', name: 'Dentist Appointment' },
    ],
  },
  '2025-03-21': {
    data: [
      { hour: '10:00', duration: '2h', name: 'Project Review' },
      { hour: '15:00', duration: '1h', name: 'Coffee with Client' },
    ],
  },
  '2025-03-22': {
    data: [{ hour: '11:00', duration: '1h', name: 'Gym Session' }],
  },
  '2025-03-25': {
    data: [
      { hour: '09:30', duration: '1h 30m', name: 'Strategy Planning' },
      { hour: '13:00', duration: '1h', name: 'Lunch with Team' },
      { hour: '16:00', duration: '2h', name: 'Code Review' },
    ],
  },
  '2025-04-25': {
    data: [
      { hour: '09:30', duration: '1h 30m', name: 'Strategy Planning' },
      { hour: '13:00', duration: '1h', name: 'Lunch with Team' },
      { hour: '16:00', duration: '2h', name: 'Code Review' },
    ],
  },
};

const AgendaItemComponent = memo(({ item }: { item: AgendaItem['data'][0] }) => {
  return (
    <View
      style={{
        height: 100,
        width: '100%',
        paddingHorizontal: 24,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Wedding</Text>
      <Text style={{ fontSize: 16 }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: '#71717B' }}>10:00 - 12:00</Text>
    </View>
  );
});

const ExpandableCalendarScreen = (props: Props) => {
  const { weekView } = props;

  const onDateChanged = useCallback((date: string, updateSource: UpdateSources) => {
    console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  }, []);

  const onMonthChange = useCallback((date: DateData, updateSource: UpdateSources) => {
    console.log('ExpandableCalendarScreen onMonthChange: ', date, updateSource);
  }, []);

  const renderItem: SectionListRenderItem<AgendaItem['data'][0]> = useCallback(
    ({ item, section }) => {
      return <AgendaItemComponent key={`${section.title}-${item.hour}-${item.name}`} item={item} />;
    },
    []
  );

  return (
    <CalendarProvider
      style={{
        paddingTop: Constants.statusBarHeight,
        backgroundColor: 'white',
      }}
      date={new Date().toISOString()}
      onDateChanged={onDateChanged}
      onMonthChange={onMonthChange}
      showTodayButton
      // disabledOpacity={0.6}
      //   todayBottomMargin={16}
    >
      {weekView ? (
        <WeekCalendar firstDay={1} />
      ) : (
        <ExpandableCalendar
          //   horizontal={false}
          hideArrows
          // disablePan
          // hideKnob
          //   initialPosition={ExpandableCalendar.positions.OPEN}
          // calendarStyle={styles.calendar}
          style={{ shadowColor: 'transparent' }}
          // headerStyle={styles.header} // for horizontal only
          // disableWeekScroll
          // disableAllTouchEventsForDisabledDays
          firstDay={1}
          //   animateScroll
        />
      )}
      <AgendaList
        sections={Object.keys(agendaItems).map((date) => ({
          title: date,
          data: agendaItems[date].data,
        }))}
        renderItem={renderItem}
        renderSectionHeader={(test) => {
          console.log(test); //2025-04-25
          const localized = new Date(test as string).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
          return (
            <View style={{ backgroundColor: 'red', height: 50 }}>
              <Text style={{ color: 'white' }}>{localized}</Text>
            </View>
          );
        }}
        scrollToNextEvent
        dayFormat="yyyy-MM-d"
      />
    </CalendarProvider>
  );
};

export default ExpandableCalendarScreen;

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    backgroundColor: 'lightgrey',
    shadowColor: 'transparent',
  },
  section: {
    color: 'grey',
    textTransform: 'capitalize',
  },
  agendaItem: {
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  agendaItemTime: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  agendaItemHour: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  agendaItemDuration: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  agendaItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
