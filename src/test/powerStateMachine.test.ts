import { describe, expect, it } from 'vitest';
import { nextPowerState, shouldPlayBootSound } from '../simulator/powerStateMachine';

describe('powerStateMachine', () => {
  it('transitions OFF -> BOOTING', () => {
    expect(nextPowerState('OFF')).toBe('BOOTING');
  });

  it('transitions BOOTING -> OFF and HOME -> OFF', () => {
    expect(nextPowerState('BOOTING')).toBe('OFF');
    expect(nextPowerState('HOME')).toBe('OFF');
  });

  it('plays boot sound only on OFF -> BOOTING', () => {
    expect(shouldPlayBootSound('OFF', 'BOOTING')).toBe(true);
    expect(shouldPlayBootSound('HOME', 'OFF')).toBe(false);
    expect(shouldPlayBootSound('BOOTING', 'OFF')).toBe(false);
  });
});
