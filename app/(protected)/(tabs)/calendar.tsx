import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Constants from 'expo-constants';
import { useCoState } from 'jazz-expo';
import { group, sift } from 'radashi';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { SectionListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AgendaList, CalendarProvider, DateData, ExpandableCalendar } from 'react-native-calendars';
import { UpdateSources } from 'react-native-calendars/src/expandableCalendar/commons';
import { Theme } from 'react-native-calendars/src/types';

import FloatingActionButton from '~/components/FloatingActionButton';
import TodoListItem from '~/components/TodoListDetailsScreen/TodoListItem';
import EventBottomSheet from '~/components/bottomSheets/EventBottomSheet';
import { Couple, useCouple } from '~/src/schemas/schema.jazz';
import { TodoItem } from '~/src/schemas/todoSchema';

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
  todo?: TodoItem;
}

const AgendaItemComponent = memo(({ item }: { item: AgendaItemData }) => {
  return <TodoListItem item={item.todo!} index={0} />;
});

const OverdueSection = memo(({ todos }: { todos: TodoItem[] }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (todos.length === 0) return null;

  return (
    <View>
      <TouchableOpacity style={styles.overdueHeader} onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.overdueTitle}>Overdue</Text>
        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#71717B" />
      </TouchableOpacity>
      {isExpanded && (
        <View style={{ height: todos.length * 50 }}>
          {todos.map((todo, index) => (
            <TodoListItem
              key={todo.id}
              item={todo}
              index={index}
              onToggle={() => {
                todo.completed = !todo.completed;
              }}
            />
          ))}
        </View>
      )}
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
  const eventSheetRef = useRef<BottomSheetModal>(null);

  // useEffect(() => {
  //   if (!couple) return;
  //   couple.events = Events.create([], couple._owner);
  //   console.log('couple', couple);
  // }, [couple?.id]);

  const allTodos = useMemo(() => {
    const liveA = sift(couple?.partnerATodos?.liveItems ?? []);
    const liveB = sift(couple?.partnerBTodos?.liveItems ?? []);
    const liveTodos = sift(couple?.todoLists.map((list) => list.liveItems).flat() ?? []);
    return [...liveA, ...liveB, ...liveTodos];
  }, [couple?.todoLists, couple?.partnerATodos, couple?.partnerBTodos]);

  const overdueTodos = useMemo(() => {
    return allTodos.filter((todo) => todo.isOverDue);
  }, [allTodos]);

  const agendaItems = useMemo(() => {
    const sortedTodos = allTodos.sort((a, b) => {
      if (!a?.dueDate) return 1;
      if (!b?.dueDate) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
    const groupedByDate = group(sortedTodos, (todo) => {
      if (!todo?.dueDate) return 'NO_DATE';
      if (todo.isOverDue) return 'NO_DATE';
      // Format date as YYYY-MM-DD
      const date = todo.dueDate;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    return Object.entries(groupedByDate)
      .map(([date, todos]) => ({
        title: date,
        data:
          todos?.map((todo) => ({
            hour:
              todo.dueDate?.getHours() +
              ':' +
              todo.dueDate?.getMinutes().toString().padStart(2, '0'),
            duration: null,
            name: todo.title,
            todo,
          })) ?? [],
      }))
      .filter((item) => item.title !== 'NO_DATE');
  }, [allTodos]);

  const onDateChanged = useCallback((date: string, updateSource: UpdateSources) => {
    console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
  }, []);

  const onMonthChange = useCallback((date: DateData, updateSource: UpdateSources) => {
    console.log('ExpandableCalendarScreen onMonthChange: ', date, updateSource);
  }, []);

  const renderItem: SectionListRenderItem<AgendaItemData> = useCallback(({ item, section }) => {
    console.log('item', item);
    return <AgendaItemComponent key={`${section.title}-${item.hour}-${item.name}`} item={item} />;
  }, []);

  const handleFABPress = useCallback(() => {
    eventSheetRef.current?.present();
  }, []);

  return (
    <CalendarProvider
      style={styles.calendarProvider}
      date={new Date().toISOString()}
      onDateChanged={onDateChanged}
      onMonthChange={onMonthChange}
      showTodayButton>
      <ExpandableCalendar
        firstDay={1}
        theme={theme}
        hideArrows
        style={styles.expandableCalendar}
        renderHeader={(dateString) => {
          if (!dateString) return null;
          const date = new Date(dateString);
          const formattedDate = `${date.toLocaleDateString('en-US', {
            month: 'long',
          })} ${date.getFullYear()}`;
          return (
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarHeaderText}>{formattedDate}</Text>
            </View>
          );
        }}
      />

      <OverdueSection todos={overdueTodos} />
      <AgendaList
        style={styles.agendaList}
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{formattedDate}</Text>
              </View>
              <View style={styles.sectionDivider} />
            </View>
          );
        }}
        dayFormat="yyyy-MM-d"
      />
      <FloatingActionButton onPress={handleFABPress} icon="add" color="#27272A" />
      <EventBottomSheet ref={eventSheetRef} toUpdate={null} />
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  agendaList: {
    marginTop: 16,
  },
  agendaItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  agendaItemHour: {
    fontSize: 14,
    color: '#71717B',
  },
  calendarProvider: {
    paddingTop: Constants.statusBarHeight,
    backgroundColor: 'white',
  },
  expandableCalendar: {
    shadowColor: 'transparent',
  },
  calendarHeader: {
    height: 40,
    width: '100%',
    justifyContent: 'center',
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27272A',
  },
  sectionHeader: {
    height: 28,
    backgroundColor: 'white',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 24,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E4E4E7',
  },
  overdueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E7',
  },
  overdueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27272A',
    paddingVertical: 5.5,
  },
  overdueBadgeText: {
    fontSize: 14,
    color: '#EF4444',
  },
  overdueItem: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    height: 70,
  },
  overdueItemTitle: {
    fontSize: 14,
    color: '#27272A',
  },
});
