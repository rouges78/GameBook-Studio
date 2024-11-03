import { createContext } from 'react';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
  borderRadius: number;
  buttonStyle: 'rounded' | 'square' | 'pill';
  spacing: number;
  paragraphBackground: string;
  animationSpeed: number;
  iconSet: 'default' | 'minimal' | 'colorful';
  layout: 'grid' | 'list';
}

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

export const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
});

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};