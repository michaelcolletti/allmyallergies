import { config as defaultConfig } from '@tamagui/config';
import { createTamagui } from 'tamagui';

const config = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      primary: '#00A86B', // Green for safety
      danger: '#FF3B30', // Red for allergen warnings
      warning: '#FF9500', // Orange for caution
      background: '#FFFFFF',
      text: '#000000',
    },
    dark: {
      ...defaultConfig.themes.dark,
      primary: '#00C781',
      danger: '#FF453A',
      warning: '#FFB340',
      background: '#000000',
      text: '#FFFFFF',
    },
  },
});

export default config;

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
