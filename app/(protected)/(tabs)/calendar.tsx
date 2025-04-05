import Constants from 'expo-constants';
import { useCoState } from 'jazz-react-native';
import { group, sift } from 'radashi';
import { memo, useCallback, useMemo } from 'react';
import { SectionListRenderItem, Text, View } from 'react-native';
import { AgendaList, CalendarProvider, DateData, ExpandableCalendar } from 'react-native-calendars';
import { UpdateSources } from 'react-native-calendars/src/expandableCalendar/commons';
import { Theme } from 'react-native-calendars/src/types';

import FloatingActionButton from '~/components/FloatingActionButton';
import { Couple, useCouple } from '~/src/schemas/schema.jazz';

// @ts-ignore fix for defaultProps warning: https://github.com/wix/react-native-calendars/issues/2455
(ExpandableCalendar as any).defaultProps = undefined;

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

const theme: Theme = {
  todayBackgroundColor: '#F5F3FF',
  todayTextColor: '#7F22FE',
  textDayHeaderFontWeight: 'medium',
  textDayStyle: {
    color: '#27272A',
    fontSize: 16,
    fontWeight: 'medium',
  },
  selectedDayBackgroundColor: '#27272A',
};

export default function CalendarScreen() {
  const shallowCouple = useCouple();
  const couple = useCoState(Couple, shallowCouple?.id, {
    resolve: {
      partnerATodos: { items: { $each: true } },
      partnerBTodos: { items: { $each: true } },
      ourTodos: { items: { $each: true } },
      todoLists: { $each: { items: { $each: true } } },
    },
  });

  const agendaItems = useMemo(() => {
    const liveA = sift(couple?.partnerATodos?.liveItems ?? []);
    const liveB = sift(couple?.partnerBTodos?.liveItems ?? []);
    const liveTodos = sift(couple?.todoLists.map((list) => list.liveItems).flat() ?? []);
    const allTodos = [...liveA, ...liveB, ...liveTodos];
    const groupedByDate = group(allTodos, (todo) => {
      if (!todo?.dueDate) return 'NO_DATE';
      // Format date as YYYY-MM-DD
      const date = todo.dueDate;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    console.log(groupedByDate);
    return Object.entries(groupedByDate)
      .map(([date, todos]) => ({
        title: date,
        data:
          todos?.map((todo) => ({
            hour:
              todo.dueDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) ??
              '',
            duration: null,
            name: todo.title,
          })) ?? [],
      }))
      .filter((item) => item.title !== 'NO_DATE');
  }, [couple?.id]);

  console.log(agendaItems);
  // const pathname = usePathname();
  // const [selected, setSelected] = useState(new Date());
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
        firstDay={1}
        theme={theme}
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
