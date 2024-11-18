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

export interface SavedTheme {
  id: string;
  name: string;
  description?: string;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeStorage {
  themes: SavedTheme[];
  lastUsedTheme?: string; // ID of the last used theme
}
