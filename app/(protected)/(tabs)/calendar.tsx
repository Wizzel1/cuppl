import Constants from 'expo-constants';
import { useAccount } from 'jazz-react-native';
import { memo, useCallback, useState } from 'react';
import { SectionListRenderItem, StyleSheet, Text, View } from 'react-native';
import { AgendaList, CalendarProvider, DateData, ExpandableCalendar } from 'react-native-calendars';
import { UpdateSources } from 'react-native-calendars/src/expandableCalendar/commons';

import FloatingActionButton from '~/components/FloatingActionButton';

// Define the structure for our agenda items
interface AgendaItem {
  title: string;
  data: AgendaItemData[];
}

interface AgendaItemData {
  hour: string;
  duration: string;
  name: string;
  color?: string;
}

// Create dummy data for the agenda
const agendaItems: AgendaItem[] = [
  {
    title: '2025-04-1',
    data: [
      { hour: '09:00', duration: '1h', name: 'Team Meeting' },
      { hour: '11:30', duration: '30m', name: 'Daily Standup' },
      { hour: '14:30', duration: '45m', name: 'Dentist Appointment' },
      { hour: '16:00', duration: '2h', name: 'Product Strategy Workshop' },
    ],
  },
  {
    title: '2025-04-20',
    data: [
      { hour: '09:00', duration: '1h', name: 'Team Meeting' },
      { hour: '11:30', duration: '30m', name: 'Daily Standup' },
      { hour: '14:30', duration: '45m', name: 'Dentist Appointment' },
      { hour: '16:00', duration: '2h', name: 'Product Strategy Workshop' },
    ],
  },
  {
    title: '2025-04-21',
    data: [
      { hour: '10:00', duration: '2h', name: 'Project Review' },
      { hour: '13:00', duration: '1h', name: 'Lunch with Team' },
      { hour: '15:00', duration: '1h', name: 'Coffee with Client' },
      { hour: '17:00', duration: '30m', name: 'Weekly Planning' },
    ],
  },
  {
    title: '2025-04-22',
    data: [
      { hour: '09:30', duration: '3h', name: 'Design Sprint' },
      { hour: '14:00', duration: '1h', name: 'Code Review Session' },
    ],
  },
  {
    title: '2025-04-23',
    data: [
      { hour: '10:00', duration: '1h', name: 'Yoga Class' },
      { hour: '12:00', duration: '2h', name: 'Family Brunch' },
      { hour: '15:00', duration: '2h', name: 'Movie with Friends' },
    ],
  },
  {
    title: '2025-04-24',
    data: [
      { hour: '08:30', duration: '30m', name: 'Morning Check-in' },
      { hour: '11:00', duration: '1h', name: 'Client Presentation' },
      { hour: '14:00', duration: '2h', name: 'Team Building Activity' },
      { hour: '17:30', duration: '1h', name: 'Gym Session' },
    ],
  },
];

const AgendaItemComponent = memo(({ item }: { item: AgendaItemData }) => {
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

export default function CalendarScreen() {
  const { me } = useAccount();
  const [selected, setSelected] = useState(new Date());
  // const couple = useCoState(Couple, me?.root?.couple?.id, { todoLists: [{}] });

  // const lists = couple?.todoLists;
  // console.log(lists);
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

  // const marked = useMemo(() => {
  //   return {
  //     [""]: {
  //       selected: selected === nextWeekDate,
  //       selectedTextColor: '#5E60CE',
  //       marked: true,
  //     },
  //     [nextMonthDate]: {
  //       selected: selected === nextMonthDate,
  //       selectedTextColor: '#5E60CE',
  //       marked: true,
  //     },
  //     [selected]: {
  //       selected: true,
  //       disableTouchEvent: true,
  //       selectedColor: '#5E60CE',
  //       selectedTextColor: 'white',
  //     },
  //   };
  // }, [selected]);

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
      <ExpandableCalendar
        //   horizontal={false}
        // staticHeader
        // hideArrows
        // markedDates={marked}
        theme={{
          todayBackgroundColor: '#F5F3FF',
          todayTextColor: '#7F22FE',
          textDayHeaderFontWeight: 'medium',
          textDayStyle: {
            color: '#27272A',
            fontSize: 16,
            fontWeight: 'medium',
          },
          selectedDayBackgroundColor: '#27272A',
        }}
        // disablePan
        // hideKnob
        //   initialPosition={ExpandableCalendar.positions.OPEN}
        // calendarStyle={styles.calendar}
        style={{ shadowColor: 'transparent' }}
        renderHeader={(test) => {
          if (!test) return null;
          const date = new Date(test);
          const formattedDate = `${date.toLocaleDateString('en-US', {
            month: 'long',
          })} ${date.getFullYear()}`;
          return (
            <View style={{ height: 40, width: '100%', justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#27272A',
                }}>
                {formattedDate}
              </Text>
            </View>
          );
        }}
        // headerStyle={styles.header} // for horizontal only
        // disableWeekScroll
        // disableAllTouchEventsForDisabledDays
        firstDay={1}
        //   animateScroll
      />
      <AgendaList
        sections={agendaItems}
        renderItem={renderItem}
        renderSectionHeader={(dateString) => {
          //@ts-ignore
          const date = new Date(dateString);
          const isToday = new Date().toDateString() === date.toDateString();
          const formattedDate = `${date.getDate()}. ${date.toLocaleDateString('en-US', {
            month: 'long',
          })} - ${date.toLocaleDateString('en-US', {
            weekday: 'long',
          })}${isToday ? ' - Today' : ''}`;

          return (
            <View>
              <View style={{ height: 28, backgroundColor: 'white' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', paddingHorizontal: 24 }}>
                  {formattedDate}
                </Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#E4E4E7' }} />
            </View>
          );
        }}
        // scrollToNextEvent
        dayFormat="yyyy-MM-d"
      />
      <FloatingActionButton onPress={() => {}} icon="add" color="#27272A" />
    </CalendarProvider>
  );
}

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
