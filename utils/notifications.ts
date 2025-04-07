import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
export async function scheduleNotification(
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

export async function cancelNotification(notificationID: string) {
  console.log('cancelling notification', notificationID);
  await Notifications.cancelScheduledNotificationAsync(notificationID);
}
