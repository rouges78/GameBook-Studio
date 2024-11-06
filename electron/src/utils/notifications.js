"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeNotifications = exports.showBrowserNotification = exports.requestNotificationPermission = exports.getNotificationPermissionState = exports.NOTIFICATION_PERMISSION = void 0;
exports.NOTIFICATION_PERMISSION = {
    GRANTED: 'granted',
    DENIED: 'denied',
    DEFAULT: 'default'
};
const getNotificationPermissionState = () => {
    if (!('Notification' in window))
        return exports.NOTIFICATION_PERMISSION.DENIED;
    return Notification.permission;
};
exports.getNotificationPermissionState = getNotificationPermissionState;
const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }
    try {
        const permission = await Notification.requestPermission();
        return permission === exports.NOTIFICATION_PERMISSION.GRANTED;
    }
    catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};
exports.requestNotificationPermission = requestNotificationPermission;
const showBrowserNotification = (title, options) => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }
    const settings = localStorage.getItem('gamebookSettings');
    if (!settings)
        return;
    const { notificationsEnabled } = JSON.parse(settings);
    if (!notificationsEnabled)
        return;
    if (Notification.permission === exports.NOTIFICATION_PERMISSION.GRANTED) {
        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                });
            }
            else {
                new Notification(title, options);
            }
        }
        catch (error) {
            console.error('Error showing notification:', error);
        }
    }
};
exports.showBrowserNotification = showBrowserNotification;
const initializeNotifications = async () => {
    const settings = localStorage.getItem('gamebookSettings');
    if (!settings)
        return;
    const { notificationsEnabled } = JSON.parse(settings);
    if (notificationsEnabled) {
        await (0, exports.requestNotificationPermission)();
    }
};
exports.initializeNotifications = initializeNotifications;
