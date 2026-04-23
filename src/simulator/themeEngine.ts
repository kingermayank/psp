import type { ThemeName } from '../types';

export type ThemeTokens = {
  top: string;
  mid: string;
  bottom: string;
  flareA: string;
  flareB: string;
  waveA: string;
  waveB: string;
  waveC: string;
};

export const THEME_TOKENS: Record<ThemeName, ThemeTokens> = {
  night: {
    top: '#040d52',
    mid: '#0f3eaa',
    bottom: '#57bcdf',
    flareA: 'rgba(92, 212, 255, 0.44)',
    flareB: 'rgba(104, 143, 255, 0.22)',
    waveA: 'rgba(255, 255, 255, 0.78)',
    waveB: 'rgba(239, 250, 255, 0.74)',
    waveC: 'rgba(240, 252, 255, 0.60)',
  },
  dawn: {
    top: '#08186a',
    mid: '#1a50b8',
    bottom: '#69c9e8',
    flareA: 'rgba(128, 224, 255, 0.42)',
    flareB: 'rgba(136, 164, 255, 0.22)',
    waveA: 'rgba(255, 255, 255, 0.80)',
    waveB: 'rgba(243, 252, 255, 0.76)',
    waveC: 'rgba(245, 253, 255, 0.62)',
  },
  day: {
    top: '#0b237e',
    mid: '#1f66cc',
    bottom: '#76d4ec',
    flareA: 'rgba(138, 232, 255, 0.48)',
    flareB: 'rgba(150, 179, 255, 0.22)',
    waveA: 'rgba(255, 255, 255, 0.82)',
    waveB: 'rgba(245, 253, 255, 0.78)',
    waveC: 'rgba(246, 253, 255, 0.66)',
  },
  dusk: {
    top: '#061362',
    mid: '#1848af',
    bottom: '#62c1e3',
    flareA: 'rgba(112, 214, 255, 0.42)',
    flareB: 'rgba(126, 156, 255, 0.22)',
    waveA: 'rgba(255, 255, 255, 0.76)',
    waveB: 'rgba(240, 251, 255, 0.72)',
    waveC: 'rgba(242, 252, 255, 0.60)',
  },
};

export function resolveAutoTheme(now: Date): ThemeName {
  const hour = now.getHours();
  if (hour >= 5 && hour < 9) {
    return 'dawn';
  }
  if (hour >= 9 && hour < 17) {
    return 'day';
  }
  if (hour >= 17 && hour < 21) {
    return 'dusk';
  }
  return 'night';
}
