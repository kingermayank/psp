import { INPUT_MAP } from '../config/simulatorConfig';
import type { SimulatorAPI } from '../types';

type InputOptions = {
  onFirstInput?: () => void;
};

export function bindInputController(api: SimulatorAPI, options: InputOptions = {}): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.repeat) {
      return;
    }

    options.onFirstInput?.();

    if (event.key === INPUT_MAP.navLeft) {
      api.nav.left();
      return;
    }

    if (event.key === INPUT_MAP.navRight) {
      api.nav.right();
      return;
    }

    if (event.key === INPUT_MAP.navUp) {
      api.nav.up();
      return;
    }

    if (event.key === INPUT_MAP.navDown) {
      api.nav.down();
      return;
    }

    if (event.key === INPUT_MAP.confirm) {
      api.overlay.confirm();
      return;
    }

    if (event.key === INPUT_MAP.cancel) {
      api.overlay.hide();
      return;
    }

    if (event.key.toLowerCase() === INPUT_MAP.power) {
      api.power.toggle();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}
