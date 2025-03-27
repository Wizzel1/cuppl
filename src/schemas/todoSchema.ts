import { co, CoList, CoMap, ImageDefinition } from 'jazz-tools';

import { cancelNotification, scheduleNotification } from './schema.jazz';
export class TodoItem extends CoMap {
  title = co.string;
  completed = co.boolean;
  dueDate = co.optional.Date;
  notes = co.optional.string;
  deleted = co.boolean;
  photo = co.optional.ref(ImageDefinition);
  isHidden = co.boolean;
  creatorAccID = co.string;
  nextTodoID = co.optional.string;
  assignedTo = co.literal('me', 'partner', 'us');
  recurringUnit = co.optional.literal('daily', 'weekly', 'biweekly', 'monthly', 'yearly');
  alertNotificationID = co.optional.string;
  alertOptionMinutes = co.optional.number;
  secondAlertNotificationID = co.optional.string;
  secondAlertOptionMinutes = co.optional.number;

  get isOverDue() {
    return this.dueDate && new Date(this.dueDate) < new Date();
  }

  async cancelAndDelete() {
    await this.cancelNotifications();
    this.deleted = true;
  }

  async cancelNotifications() {
    if (this.alertNotificationID !== undefined) {
      await cancelNotification(this.alertNotificationID);
    }
    if (this.secondAlertNotificationID !== undefined) {
      await cancelNotification(this.secondAlertNotificationID);
    }
  }

  async scheduleNotifications() {
    if (!this.dueDate) return;
    if (this.alertOptionMinutes !== undefined) {
      const id = await scheduleNotification(
        this.alertOptionMinutes,
        this.dueDate,
        this.title,
        `${this.title} is due in ${this.alertOptionMinutes} minutes`
      );
      this.alertNotificationID = id;
      console.log('scheduled alert notification', id);
    }
    if (this.secondAlertOptionMinutes !== undefined) {
      const id = await scheduleNotification(
        this.secondAlertOptionMinutes,
        this.dueDate,
        this.title,
        `${this.title} is due in ${this.secondAlertOptionMinutes} minutes`
      );
      this.secondAlertNotificationID = id;
      console.log('scheduled second alert notification', id);
    }
  }

  tryCreateNextTodo() {
    if (!this.recurringUnit) {
      console.log('no recurring unit');
      return;
    }
    const nextTodo = TodoItem.create({
      title: this.title,
      dueDate: getNextDueDate(this.recurringUnit, this.dueDate),
      completed: false,
      deleted: false,
      isHidden: this.isHidden,
      creatorAccID: this.creatorAccID,
      assignedTo: this.assignedTo,
      recurringUnit: this.recurringUnit,
      alertOptionMinutes: this.alertOptionMinutes,
      secondAlertOptionMinutes: this.secondAlertOptionMinutes,
    });
    console.log('nextTodo', nextTodo);
    return nextTodo;
  }
}
function getNextDueDate(recurringUnit: TodoItem['recurringUnit'], dueDate: Date | undefined) {
  if (!recurringUnit || !dueDate) return;
  const nextDueDate = new Date(dueDate);
  switch (recurringUnit) {
    case 'daily':
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      break;
    case 'weekly':
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDueDate.setDate(nextDueDate.getDate() + 14);
      break;
    case 'monthly':
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      break;
    default:
      return;
  }
  console.log('nextDueDate', nextDueDate.toDateString());
  return nextDueDate;
}

export class TodoItems extends CoList.Of(co.ref(TodoItem)) {}
export class TodoList extends CoMap {
  title = co.string;
  emoji = co.optional.string;
  backgroundColor = co.optional.string;
  items = co.ref(TodoItems);
  isHidden = co.boolean;
  creatorAccID = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
  deleted = co.boolean;

  get liveItems() {
    const items = [];
    for (const item of this.items ?? []) {
      if (item?.deleted === undefined) continue;
      if (item?.deleted) continue;
      items.push(item);
    }
    return items;
  }

  get completedItems() {
    const items = [];
    for (const item of this.items ?? []) {
      if (item?.deleted) continue;
      if (item?.completed === undefined) continue;
      if (item?.completed) {
        items.push(item);
      }
    }
    return items;
  }
}

export class TodoLists extends CoList.Of(co.ref(TodoList)) {}
export class DefaultTodoList extends CoMap {
  items = co.ref(TodoItems);
}
