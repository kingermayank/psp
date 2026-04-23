import { describe, expect, it, vi } from 'vitest';
import { bindInputController } from '../simulator/inputController';
import type { SimulatorAPI } from '../types';

function makeApi(): SimulatorAPI {
  return {
    power: { toggle: vi.fn() },
    nav: { left: vi.fn(), right: vi.fn(), up: vi.fn(), down: vi.fn() },
    audio: { play: vi.fn() },
    screen: { setState: vi.fn() },
    overlay: {
      showMessage: vi.fn(),
      showChoice: vi.fn(),
      showProgress: vi.fn(),
      hide: vi.fn(),
      nextOption: vi.fn(),
      prevOption: vi.fn(),
      confirm: vi.fn(),
    },
    theme: {
      setTheme: vi.fn(),
      cycleTheme: vi.fn(),
      refreshAuto: vi.fn(),
    },
  };
}

describe('inputController', () => {
  it('routes single key presses to nav and power handlers', () => {
    const api = makeApi();
    const cleanup = bindInputController(api);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));

    expect(api.nav.left).toHaveBeenCalledTimes(1);
    expect(api.nav.right).toHaveBeenCalledTimes(1);
    expect(api.nav.up).toHaveBeenCalledTimes(1);
    expect(api.nav.down).toHaveBeenCalledTimes(1);
    expect(api.overlay.confirm).toHaveBeenCalledTimes(1);
    expect(api.overlay.hide).toHaveBeenCalledTimes(1);
    expect(api.overlay.showMessage).not.toHaveBeenCalled();
    expect(api.overlay.showProgress).not.toHaveBeenCalled();
    expect(api.theme.cycleTheme).not.toHaveBeenCalled();
    expect(api.power.toggle).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it('ignores browser key repeat events', () => {
    const api = makeApi();
    const cleanup = bindInputController(api);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', repeat: true }));

    expect(api.nav.right).not.toHaveBeenCalled();

    cleanup();
  });
});
