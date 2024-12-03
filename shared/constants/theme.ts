export enum THEMES {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export const themes: THEMES[] = [THEMES.LIGHT, THEMES.DARK];

export const SINGLE = 'single';

export const themeOptions = [
  { label: 'Single theme', value: SINGLE },
  { label: 'Sync with your system', value: THEMES.SYSTEM },
] as const;

export const StrokeColor = {
  DARK: '#00000068',
  LIGHT: '#ffffff',
};