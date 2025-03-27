import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import * as DropdownMenu from 'zeego/dropdown-menu';

import TodoListItem from './TodoListItem';

import { TodoItem } from '~/src/schemas/todoSchema';

const _entering = FadeInDown.damping(50).stiffness(200);
const _exiting = FadeOutDown.springify(200).damping(50).stiffness(100);
const _layout = LinearTransition.springify(1000).damping(50).stiffness(200);

function TodoDueSection({
  title,
  todos,
  onEditTodo,
  onToggleTodo,
}: {
  title: string;
  todos: TodoItem[];
  onEditTodo: (todo: TodoItem) => void;
  onToggleTodo: (todo: TodoItem) => void;
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
            onDelete={async () => {
              await item.cancelAndDelete();
            }}
            onEdit={() => {
              onEditTodo(item);
            }}
            onToggle={() => {
              onToggleTodo(item);
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
  onToggleTodo,
}: {
  todos: TodoItem[];
  onEditTodo: (todo: TodoItem) => void;
  onToggleTodo: (todo: TodoItem) => void;
}) {
  const { overdue, dueNext, withoutDueDate, completed } = useMemo(() => {
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

    return { overdue, dueNext, withoutDueDate, completed };
  }, [todos]);

  return (
    <>
      <TodoDueSection
        title="Overdue"
        todos={overdue}
        onEditTodo={onEditTodo}
        onToggleTodo={onToggleTodo}
      />
      <TodoDueSection
        title="Due Next"
        todos={dueNext}
        onEditTodo={onEditTodo}
        onToggleTodo={onToggleTodo}
      />
      <TodoDueSection
        title="Without Due Date"
        todos={withoutDueDate}
        onEditTodo={onEditTodo}
        onToggleTodo={onToggleTodo}
      />
      <TodoDueSection
        title="Completed"
        todos={completed}
        onEditTodo={onEditTodo}
        onToggleTodo={onToggleTodo}
      />
    </>
  );
}
