import { co, CoList, CoMap, ImageDefinition } from 'jazz-tools';

import { cancelNotifications, scheduleNotifications } from '~/utils/notifications';

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
    await cancelNotifications(this);
  }

  async scheduleNotifications() {
    await scheduleNotifications(this);
  }
}

export class Events extends CoList.Of(co.ref(Event)) {}
