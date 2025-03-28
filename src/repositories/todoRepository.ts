import { ImageDefinition } from 'jazz-tools';

import { CoupleAccount } from '../schemas/schema.jazz';
import { TodoItem } from '../schemas/todoSchema';

function createTodo(args: {
  me: CoupleAccount;
  title: string;
  dueDate: Date | null;
  completed: boolean;
  deleted: boolean;
  isHidden: boolean;
  assignedTo: TodoItem['assignedTo'];
  recurringUnit: TodoItem['recurringUnit'];
  alertOptionMinutes: number | null | undefined;
  secondAlertOptionMinutes: number | null | undefined;
  photo: ImageDefinition | null;
}) {
  const couple = args.me.root?.couple;
  if (!couple) throw new Error('No couple found');
  const coupleGroup = couple._owner;
  if (!coupleGroup) throw new Error('No couple group found');

  return TodoItem.create(
    {
      title: args.title.trim(),
      completed: false,
      creatorAccID: args.me.id,
      assignedTo: args.assignedTo,
      deleted: false,
      isHidden: args.isHidden,
      dueDate: args.dueDate ? args.dueDate : null,
      recurringUnit: args.recurringUnit,
      alertOptionMinutes: args.alertOptionMinutes,
      secondAlertOptionMinutes: args.secondAlertOptionMinutes,
    },
    { owner: args.isHidden ? args.me : coupleGroup }
  );
}

function deleteTodo(args: { id: string; me: CoupleAccount }) {
  const couple = args.me.root?.couple;
  if (!couple) throw new Error('No couple found');
  const coupleGroup = couple._owner;
  if (!coupleGroup) throw new Error('No couple group found');

  const todo = couple.todoLists?.find((todo) => todo?.id === args.id);
  if (!todo) throw new Error('Todo not found');

  todo.deleted = true;

  return todo;
}

export { createTodo, deleteTodo };
