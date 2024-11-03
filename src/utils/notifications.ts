export const NOTIFICATION_PERMISSION = {
  GRANTED: 'granted',
  DENIED: 'denied',
  DEFAULT: 'default'
} as const;

export const getNotificationPermissionState = (): string => {
  if (!('Notification' in window)) return NOTIFICATION_PERMISSION.DENIED;
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === NOTIFICATION_PERMISSION.GRANTED;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const showBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  const settings = localStorage.getItem('gamebookSettings');
  if (!settings) return;

  const { notificationsEnabled } = JSON.parse(settings);
  if (!notificationsEnabled) return;

  if (Notification.permission === NOTIFICATION_PERMISSION.GRANTED) {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
};

export const initializeNotifications = async () => {
  const settings = localStorage.getItem('gamebookSettings');
  if (!settings) return;

  const { notificationsEnabled } = JSON.parse(settings);
  if (notificationsEnabled) {
    await requestNotificationPermission();
  }
};