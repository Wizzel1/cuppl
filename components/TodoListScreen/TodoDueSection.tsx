import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import TodoListItem from './TodoListItem';

import { TodoItem } from '~/src/schema.jazz';

function TodoDueSection({ title, todos }: { title: string; todos: TodoItem[] }) {
  if (todos.length === 0) return null;

  return (
    <View>
      <View
        style={{
          width: '100%',
          backgroundColor: '#F4F4F5',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
        <Text style={{ fontWeight: '600', paddingVertical: 5.5, fontSize: 14 }}>{title}</Text>
        {title === 'Completed' || title === 'Overdue' ? (
          <Pressable onPress={() => {}}>
            <Ionicons name="ellipsis-vertical" size={16} color="black" />
          </Pressable>
        ) : null}
      </View>

      {todos.map((item, index) => (
        <TodoListItem key={item.id || index} item={item} index={index} />
      ))}
    </View>
  );
}

export default function TodoSectionList({ todos }: { todos: TodoItem[] }) {
  const [overdue, setOverdue] = useState<TodoItem[]>([]);
  const [dueNext, setDueNext] = useState<TodoItem[]>([]);
  const [withoutDueDate, setWithoutDueDate] = useState<TodoItem[]>([]);
  const [recurring, setRecurring] = useState<TodoItem[]>([]);
  const [completed, setCompleted] = useState<TodoItem[]>([]);

  useEffect(() => {
    const overdue: TodoItem[] = [];
    const dueNext: TodoItem[] = [];
    const withoutDueDate: TodoItem[] = [];
    const recurring: TodoItem[] = [];
    const completed: TodoItem[] = [];

    for (const todo of todos) {
      if (todo.completed) {
        completed.push(todo);
        continue;
      }
      if (todo.dueDate && new Date(todo.dueDate) < new Date()) {
        overdue.push(todo);
      } else if (todo.dueDate && new Date(todo.dueDate) > new Date()) {
        dueNext.push(todo);
      } else {
        withoutDueDate.push(todo);
      }
      if (todo.recurringUnit) {
        recurring.push(todo);
      }
    }

    setRecurring(recurring);
    setOverdue(overdue);
    setDueNext(dueNext);
    setWithoutDueDate(withoutDueDate);
    setCompleted(completed);
  }, [todos]);

  return (
    <View>
      <TodoDueSection title="Overdue" todos={overdue} />
      <TodoDueSection title="Due Next" todos={dueNext} />
      <TodoDueSection title="Without Due Date" todos={withoutDueDate} />
      <TodoDueSection title="Recurring" todos={recurring} />
      <TodoDueSection title="Completed" todos={completed} />
    </View>
  );
}
