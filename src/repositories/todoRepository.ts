import { CoupleAccount, TodoItem } from '../schema.jazz';

function createTodo(args: {
  me: CoupleAccount;
  title: string;
  dueDate: Date | null;
  completed: boolean;
  deleted: boolean;
  isHidden: boolean;
  assignedTo: TodoItem['assignedTo'];
  alertNotificationID: string | null;
  alertOptionMinutes: number | null;
  secondAlertNotificationID: string | null;
  secondAlertOptionMinutes: number | null;
  recurringUnit: TodoItem['recurringUnit'];
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
      alertNotificationID: args.alertNotificationID,
      alertOptionMinutes: args.alertOptionMinutes,
      secondAlertNotificationID: args.secondAlertNotificationID,
      secondAlertOptionMinutes: args.secondAlertOptionMinutes,
      recurringUnit: args.recurringUnit,
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
