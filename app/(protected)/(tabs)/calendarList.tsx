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
  title: string;
  data: {
    hour: string;
    duration: string;
    name: string;
    color?: string;
  }[];
}

// Create dummy data for the agenda
const agendaItems: { [key: string]: AgendaItem } = {
  '2024-03-20': {
    title: '2024-03-20',
    data: [
      { hour: '09:00', duration: '1h', name: 'Team Meeting', color: '#7B68EE' },
      { hour: '14:30', duration: '45m', name: 'Dentist Appointment', color: '#20B2AA' },
    ],
  },
  '2024-03-21': {
    title: '2024-03-21',
    data: [
      { hour: '10:00', duration: '2h', name: 'Project Review', color: '#FFB6C1' },
      { hour: '15:00', duration: '1h', name: 'Coffee with Client', color: '#DEB887' },
    ],
  },
  '2024-03-22': {
    title: '2024-03-22',
    data: [{ hour: '11:00', duration: '1h', name: 'Gym Session', color: '#FF7F50' }],
  },
  '2024-03-25': {
    title: '2024-03-25',
    data: [
      { hour: '09:30', duration: '1h 30m', name: 'Strategy Planning', color: '#6495ED' },
      { hour: '13:00', duration: '1h', name: 'Lunch with Team', color: '#98FB98' },
      { hour: '16:00', duration: '2h', name: 'Code Review', color: '#DDA0DD' },
    ],
  },
};

const AgendaItemComponent = memo(({ item }: { item: AgendaItem['data'][0] }) => {
  return (
    <View style={[styles.agendaItem, { borderLeftColor: item.color || '#000' }]}>
      <View style={styles.agendaItemTime}>
        <Text style={styles.agendaItemHour}>{item.hour}</Text>
        <Text style={styles.agendaItemDuration}>{item.duration}</Text>
      </View>
      <Text style={styles.agendaItemName}>{item.name}</Text>
    </View>
  );
});

AgendaItemComponent.displayName = 'AgendaItemComponent';

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
          title: agendaItems[date].title,
          data: agendaItems[date].data,
        }))}
        renderItem={renderItem}
        // scrollToNextEvent
        // dayFormat={'yyyy-MM-d'}
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
