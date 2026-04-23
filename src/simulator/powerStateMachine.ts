import type { PowerState } from '../types';

export function nextPowerState(current: PowerState): PowerState {
  if (current === 'OFF') {
    return 'BOOTING';
  }

  return 'OFF';
}

export function shouldPlayBootSound(prev: PowerState, next: PowerState): boolean {
  return prev === 'OFF' && next === 'BOOTING';
}
