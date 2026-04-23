import { describe, expect, it } from 'vitest';
import { resolveAutoTheme } from '../simulator/themeEngine';

function atHour(hour: number): Date {
  return new Date(2026, 0, 1, hour, 0, 0, 0);
}

describe('themeEngine', () => {
  it('resolves dawn/day/dusk/night windows', () => {
    expect(resolveAutoTheme(atHour(6))).toBe('dawn');
    expect(resolveAutoTheme(atHour(12))).toBe('day');
    expect(resolveAutoTheme(atHour(18))).toBe('dusk');
    expect(resolveAutoTheme(atHour(23))).toBe('night');
  });
});
