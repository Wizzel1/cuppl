import { CoupleAccount } from '../schemas/schema.jazz';
import { TodoItems, TodoList } from '../schemas/todoSchema';

function createTodoList(args: {
  me: CoupleAccount;
  title: string;
  isHidden: boolean;
  assignedTo: 'me' | 'partner' | 'us';
  emoji: string;
  backgroundColor: string;
}): TodoList | null {
  const couple = args.me.root?.couple;
  if (!couple) throw new Error('No couple found');
  const coupleGroup = couple._owner;
  if (!coupleGroup) throw new Error('No couple group found');

  const newList = TodoList.create(
    {
      title: args.title.trim(),
      emoji: args.emoji,
      backgroundColor: args.backgroundColor,
      creatorAccID: args.me.id,
      items: TodoItems.create([], { owner: coupleGroup }),
      isHidden: args.isHidden,
      assignedTo: args.assignedTo,
      deleted: false,
    },
    { owner: coupleGroup }
  );

  if (couple.todoLists) {
    couple.todoLists.push(newList);
  } else {
    throw new Error('No todo lists found');
  }

  return newList;
}

function updateTodoList(args: {
  me: CoupleAccount;
  id: string;
  title: string;
  isHidden: boolean;
  assignedTo: 'me' | 'partner' | 'us';
  emoji: string;
  backgroundColor: string;
}): TodoList | null {
  if (!args.me.root?.couple) return null;

  const couple = args.me.root.couple;
  const coupleGroup = couple._owner;
  if (!coupleGroup) throw new Error('No couple group found');

  const list = couple.todoLists?.find((list) => list?.id === args.id);
  if (!list) throw new Error('Todo list not found');

  list.title = args.title.trim();
  list.isHidden = args.isHidden;
  list.assignedTo = args.assignedTo;
  list.emoji = args.emoji;
  list.backgroundColor = args.backgroundColor;

  return list;
}

function deleteTodoList(args: { id: string; me: CoupleAccount }) {
  if (!args.me.root?.couple) return null;

  const couple = args.me.root.couple;
  const coupleGroup = couple._owner;
  if (!coupleGroup) throw new Error('No couple group found');

  const list = couple.todoLists?.find((list) => list?.id === args.id);
  if (!list) throw new Error('Todo list not found');

  list.deleted = true;

  return list;
}

export { createTodoList, deleteTodoList, updateTodoList };
