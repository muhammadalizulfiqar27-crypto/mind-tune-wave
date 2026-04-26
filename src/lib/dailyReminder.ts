import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const REMINDER_ID = 82401;

export const setupDailyReminder = async () => {
  if (!Capacitor.isNativePlatform()) return;

  const currentPermission = await LocalNotifications.checkPermissions();
  const permission = currentPermission.display === "granted"
    ? currentPermission
    : await LocalNotifications.requestPermissions();

  if (permission.display !== "granted") return;

  await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });
  await LocalNotifications.schedule({
    notifications: [
      {
        id: REMINDER_ID,
        title: "Mind Control",
        body: "Come back and listen to your frequencies 🎧",
        schedule: {
          on: { hour: 20, minute: 0 },
          repeats: true,
        },
      },
    ],
  });
};