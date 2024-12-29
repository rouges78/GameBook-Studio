import React from 'react';
import { Bell } from 'lucide-react';
import { TabProps, NotificationStyle, NotificationPosition } from './types';
import { translations } from './translations';

interface NotificationsTabProps extends TabProps {
  notificationStyle: NotificationStyle;
  notificationPosition: NotificationPosition;
  setNotificationStyle: (style: NotificationStyle) => void;
  setNotificationPosition: (position: NotificationPosition) => void;
  saveSettings: (settings: any) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  isDarkMode,
  language,
  notificationStyle,
  notificationPosition,
  setNotificationStyle,
  setNotificationPosition,
  saveSettings
}) => {
  const t = translations[language];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Bell size={20} className="mr-2" />
          {t.notificationSettings}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-sm">{t.notificationStyle}</label>
            <select
              value={notificationStyle}
              onChange={(e) => {
                const newValue = e.target.value as NotificationStyle;
                setNotificationStyle(newValue);
                saveSettings({ notificationStyle: newValue });
              }}
              className={`w-full p-1.5 rounded text-sm ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <option value="modern">{t.modern}</option>
              <option value="minimal">{t.minimal}</option>
              <option value="standard">{t.standard}</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">{t.notificationPosition}</label>
            <select
              value={notificationPosition}
              onChange={(e) => {
                const newValue = e.target.value as NotificationPosition;
                setNotificationPosition(newValue);
                saveSettings({ notificationPosition: newValue });
              }}
              className={`w-full p-1.5 rounded text-sm ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <option value="top-left">{t.topLeft}</option>
              <option value="top-center">{t.topCenter}</option>
              <option value="top-right">{t.topRight}</option>
              <option value="bottom-left">{t.bottomLeft}</option>
              <option value="bottom-center">{t.bottomCenter}</option>
              <option value="bottom-right">{t.bottomRight}</option>
              <option value="center">{t.center}</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};