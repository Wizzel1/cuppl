import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import * as DropdownMenu from 'zeego/dropdown-menu';

import TodoListItem from './TodoListItem';

import { TodoItem } from '~/src/schema.jazz';

const _entering = FadeInDown.damping(50).stiffness(200);
const _exiting = FadeOutDown.springify(200).damping(50).stiffness(100);
const _layout = LinearTransition.springify(1000).damping(50).stiffness(200);

function TodoDueSection({
  title,
  todos,
  onEditTodo,
}: {
  title: string;
  todos: TodoItem[];
  onEditTodo: (todo: TodoItem) => void;
}) {
  if (todos.length === 0) return null;

  return (
    <Animated.View layout={_layout}>
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
        {title === 'Completed' && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Ionicons name="ellipsis-vertical" size={16} color="black" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                key="reset"
                onSelect={() => {
                  todos.forEach((todo) => {
                    todo.completed = false;
                  });
                }}>
                <DropdownMenu.ItemTitle>Reset Completed</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                key="delete"
                destructive
                onSelect={() => {
                  todos.forEach((todo) => {
                    todo.deleted = true;
                  });
                }}>
                <DropdownMenu.ItemTitle>Delete Completed</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
        {title === 'Overdue' && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Ionicons name="ellipsis-vertical" size={16} color="black" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {/* <DropdownMenu.Item
                key="reschedule"
                onSelect={() => {
                  todos.forEach((todo) => {
                    todo.completed = true;
                  });
                }}>
                <DropdownMenu.ItemTitle>Reschedule Overdue</DropdownMenu.ItemTitle>
              </DropdownMenu.Item> */}
              <DropdownMenu.Item
                key="reset"
                onSelect={() => {
                  todos.forEach((todo) => {
                    todo.completed = true;
                  });
                }}>
                <DropdownMenu.ItemTitle>Mark as Completed</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                key="delete"
                destructive
                onSelect={() => {
                  todos.forEach((todo) => {
                    todo.deleted = true;
                  });
                }}>
                <DropdownMenu.ItemTitle>Delete Overdue</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </View>

      {todos.map((item, index) => (
        <Animated.View
          key={item.id + index}
          entering={_entering}
          // exiting={_exiting}
          layout={_layout}>
          <TodoListItem
            item={item}
            index={index}
            onDelete={() => {
              item.deleted = true;
            }}
            onEdit={() => {
              onEditTodo(item);
            }}
          />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export default function TodoSectionList({
  todos,
  onEditTodo,
}: {
  todos: TodoItem[];
  onEditTodo: (todo: TodoItem) => void;
}) {
  const [overdue, setOverdue] = useState<TodoItem[]>([]);
  const [dueNext, setDueNext] = useState<TodoItem[]>([]);
  const [withoutDueDate, setWithoutDueDate] = useState<TodoItem[]>([]);
  const [completed, setCompleted] = useState<TodoItem[]>([]);

  useEffect(() => {
    const overdue: TodoItem[] = [];
    const dueNext: TodoItem[] = [];
    const withoutDueDate: TodoItem[] = [];
    const completed: TodoItem[] = [];

    for (const todo of todos) {
      if (todo.completed) {
        completed.push(todo);
        continue;
      }
      if (todo.isOverDue) {
        overdue.push(todo);
      } else if (todo.dueDate) {
        dueNext.push(todo);
      } else {
        withoutDueDate.push(todo);
      }
    }

    setOverdue(overdue);
    setDueNext(dueNext);
    setWithoutDueDate(withoutDueDate);
    setCompleted(completed);
  }, [todos]);

  return (
    <>
      <TodoDueSection title="Overdue" todos={overdue} onEditTodo={onEditTodo} />
      <TodoDueSection title="Due Next" todos={dueNext} onEditTodo={onEditTodo} />
      <TodoDueSection title="Without Due Date" todos={withoutDueDate} onEditTodo={onEditTodo} />
      <TodoDueSection title="Completed" todos={completed} onEditTodo={onEditTodo} />
    </>
  );
}
