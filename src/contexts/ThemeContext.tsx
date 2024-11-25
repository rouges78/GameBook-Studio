import React, { createContext } from 'react';
import { Theme } from '../types/theme-types';

// Re-export the Theme type for backward compatibility
export type { Theme };

export interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export const defaultTheme: Theme = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  textColor: '#F9FAFB',
  backgroundColor: '#111827',
  fontSize: 16,
  fontFamily: 'Roboto',
  borderRadius: 4,
  buttonStyle: 'rounded',
  spacing: 16,
  paragraphBackground: '#1F2937',
  animationSpeed: 300,
  iconSet: 'default',
  layout: 'grid',
};

export const mochaTheme: Theme = {
  primaryColor: '#886F68',
  secondaryColor: '#6F4E37',
  textColor: '#3B2C26',
  backgroundColor: '#F3E5D8',
  fontSize: 16,
  fontFamily: 'Roboto',
  borderRadius: 4,
  buttonStyle: 'rounded',
  spacing: 16,
  paragraphBackground: '#DBC1AC',
  animationSpeed: 300,
  iconSet: 'default',
  layout: 'grid',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});
