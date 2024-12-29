import { Notification } from '../../types';

export interface TabProps {
  isDarkMode: boolean;
  language: 'it' | 'en';
  notification: Notification | null;
  setNotification: (notification: Notification | null) => void;
}
