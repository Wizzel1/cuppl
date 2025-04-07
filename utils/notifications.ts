import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { Event } from '~/src/schemas/eventSchema.jazz';
import { TodoItem } from '~/src/schemas/todoSchema';

export async function scheduleNotifications(item: Event | TodoItem) {
  const { alertOptionMinutes, secondAlertOptionMinutes, dueDate, title } = item;

  if (alertOptionMinutes !== undefined && dueDate !== undefined) {
    const id = await scheduleNotification(
      alertOptionMinutes,
      dueDate,
      title,
      `${title} is due in ${alertOptionMinutes} minutes`
    );
    item.alertNotificationID = id;
  }
  if (secondAlertOptionMinutes !== undefined && dueDate !== undefined) {
    const id = await scheduleNotification(
      secondAlertOptionMinutes,
      dueDate,
      title,
      `${title} is due in ${secondAlertOptionMinutes} minutes`
    );
    item.secondAlertNotificationID = id;
  }
}

async function scheduleNotification(
  minutesBefore: number,
  dueDate: Date,
  title: string,
  body: string
) {
  try {
    return Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: new Date(dueDate.getTime() - minutesBefore * 60 * 1000),
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export async function cancelNotifications(item: Event | TodoItem) {
  const { alertNotificationID, secondAlertNotificationID } = item;
  if (alertNotificationID) {
    await cancelNotification(alertNotificationID);
  }
  if (secondAlertNotificationID) {
    await cancelNotification(secondAlertNotificationID);
  }
}
async function cancelNotification(notificationID: string) {
  console.log('cancelling notification', notificationID);
  await Notifications.cancelScheduledNotificationAsync(notificationID);
}
