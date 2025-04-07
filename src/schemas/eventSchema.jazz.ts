import { co, CoList, CoMap, ImageDefinition } from 'jazz-tools';

import { cancelNotification, scheduleNotification } from '~/utils/notifications';

export class Event extends CoMap {
  title = co.string;
  assignedTo = co.literal('me', 'partner', 'us');
  dueDate = co.optional.Date;
  notes = co.optional.string;
  deleted = co.boolean;
  photo = co.optional.ref(ImageDefinition);
  isHidden = co.boolean;
  creatorAccID = co.string;
  startDate = co.Date;
  endDate = co.optional.Date;
  location = co.optional.string;
  isAllDay = co.boolean;
  isRecurring = co.boolean;
  recurringUnit = co.optional.literal('daily', 'weekly', 'biweekly', 'monthly', 'yearly');
  alertNotificationID = co.optional.string;
  alertOptionMinutes = co.optional.number;
  secondAlertNotificationID = co.optional.string;
  secondAlertOptionMinutes = co.optional.number;
  travelTime = co.optional.number;

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
}

export class Events extends CoList.Of(co.ref(Event)) {}
