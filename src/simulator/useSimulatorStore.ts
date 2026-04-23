import { create } from 'zustand';
import {
  APPS,
  BOOT_DURATION_MS,
  DEFAULT_THEME_MODE,
  GAME_UMD_LIBRARY,
  PHOTO_LIBRARY,
  SOUND_MAP,
  THEME_MODE_ORDER,
} from '../config/simulatorConfig';
import type { OverlayChoice, PowerState, SimulatorAPI, SimulatorState, ThemeMode } from '../types';
import { AudioManager } from './audioManager';
import { nextPowerState, shouldPlayBootSound } from './powerStateMachine';
import { moveDown, moveLeft, moveRight, moveUp } from './screenCarousel';
import { resolveAutoTheme } from './themeEngine';

type SimulatorStore = SimulatorState & {
  api: SimulatorAPI;
};

const audioManager = new AudioManager(SOUND_MAP);
const createDefaultItemIndices = () => APPS.map(() => 0);
const nextFromOrder = <T,>(value: T, order: readonly T[]): T => {
  const index = order.indexOf(value);
  return order[(index + 1) % order.length] ?? order[0];
};

let bootTimer: number | undefined;
let messageTimer: number | undefined;

const hideOverlay = (set: (partial: Partial<SimulatorStore>) => void) => {
  window.clearTimeout(messageTimer);
  set({ overlay: { kind: 'none' } });
};

const setPowerStateWithEffects = (
  set: (partial: Partial<SimulatorStore>) => void,
  get: () => SimulatorStore,
  nextState: PowerState,
): void => {
  const prevState = get().powerState;
  set({ powerState: nextState });

  if (shouldPlayBootSound(prevState, nextState)) {
    audioManager.play('boot');
    window.clearTimeout(bootTimer);
    bootTimer = window.setTimeout(() => {
      if (get().powerState === 'BOOTING') {
        set({ powerState: 'HOME' });
      }
    }, BOOT_DURATION_MS);
  } else {
    window.clearTimeout(bootTimer);
  }
};

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  powerState: 'OFF',
  screenMode: 'HOME',
  selectedCategoryIndex: 0,
  selectedItemIndexByCategory: createDefaultItemIndices(),
  selectedPhotoIndex: 0,
  selectedGameUmdIndex: 0,
  overlay: { kind: 'none' },
  themeMode: DEFAULT_THEME_MODE,
  activeTheme: resolveAutoTheme(new Date()),
  isAudioUnlocked: false,
  api: {
    power: {
      toggle: () => {
        const current = get().powerState;
        const next = nextPowerState(current);

        if (next === 'OFF') {
          set({
            screenMode: 'HOME',
            selectedCategoryIndex: 0,
            selectedItemIndexByCategory: createDefaultItemIndices(),
            selectedPhotoIndex: 0,
            selectedGameUmdIndex: 0,
          });
          hideOverlay(set);
        }

        setPowerStateWithEffects(set, get, next);
      },
    },
    nav: {
      left: () => {
        const { powerState, selectedCategoryIndex, screenMode, selectedPhotoIndex, overlay } = get();
        audioManager.play('cursor');

        if (powerState !== 'HOME' || overlay.kind !== 'none') {
          return;
        }

        if (screenMode === 'PHOTO_VIEWER') {
          const nextPhotoIndex = moveLeft(selectedPhotoIndex, PHOTO_LIBRARY.length);
          set({ selectedPhotoIndex: nextPhotoIndex });
          return;
        }

        if (screenMode === 'GAME_UMD') {
          set({ screenMode: 'HOME' });
          return;
        }

        const nextIndex = moveLeft(selectedCategoryIndex, APPS.length);
        set({ selectedCategoryIndex: nextIndex });
      },
      right: () => {
        const { powerState, selectedCategoryIndex, screenMode, selectedPhotoIndex, overlay } = get();
        audioManager.play('cursor');

        if (powerState !== 'HOME' || overlay.kind !== 'none') {
          return;
        }

        if (screenMode === 'PHOTO_VIEWER') {
          const nextPhotoIndex = moveRight(selectedPhotoIndex, PHOTO_LIBRARY.length);
          set({ selectedPhotoIndex: nextPhotoIndex });
          return;
        }

        if (screenMode === 'GAME_UMD') {
          return;
        }

        const nextIndex = moveRight(selectedCategoryIndex, APPS.length);
        set({ selectedCategoryIndex: nextIndex });
      },
      up: () => {
        const {
          powerState,
          selectedCategoryIndex,
          selectedItemIndexByCategory,
          selectedPhotoIndex,
          selectedGameUmdIndex,
          screenMode,
          overlay,
        } = get();
        audioManager.play('cursor');

        if (powerState !== 'HOME') {
          return;
        }

        if (overlay.kind === 'choice') {
          const next = moveUp(overlay.selectedIndex, overlay.options.length);
          set({ overlay: { ...overlay, selectedIndex: next } });
          return;
        }

        if (overlay.kind !== 'none') {
          return;
        }

        if (screenMode === 'PHOTO_VIEWER') {
          const nextPhotoIndex = moveLeft(selectedPhotoIndex, PHOTO_LIBRARY.length);
          set({ selectedPhotoIndex: nextPhotoIndex });
          return;
        }

        if (screenMode === 'GAME_UMD') {
          const nextGameIndex = moveUp(selectedGameUmdIndex, GAME_UMD_LIBRARY.length);
          set({ selectedGameUmdIndex: nextGameIndex });
          return;
        }

        const currentItem = selectedItemIndexByCategory[selectedCategoryIndex] ?? 0;
        const itemCount = APPS[selectedCategoryIndex]?.items.length ?? 0;
        const nextItem = moveUp(currentItem, itemCount);
        const nextByCategory = [...selectedItemIndexByCategory];
        nextByCategory[selectedCategoryIndex] = nextItem;
        set({ selectedItemIndexByCategory: nextByCategory });
      },
      down: () => {
        const {
          powerState,
          selectedCategoryIndex,
          selectedItemIndexByCategory,
          selectedPhotoIndex,
          selectedGameUmdIndex,
          screenMode,
          overlay,
        } = get();
        audioManager.play('cursor');

        if (powerState !== 'HOME') {
          return;
        }

        if (overlay.kind === 'choice') {
          const next = moveDown(overlay.selectedIndex, overlay.options.length);
          set({ overlay: { ...overlay, selectedIndex: next } });
          return;
        }

        if (overlay.kind !== 'none') {
          return;
        }

        if (screenMode === 'PHOTO_VIEWER') {
          const nextPhotoIndex = moveRight(selectedPhotoIndex, PHOTO_LIBRARY.length);
          set({ selectedPhotoIndex: nextPhotoIndex });
          return;
        }

        if (screenMode === 'GAME_UMD') {
          const nextGameIndex = moveDown(selectedGameUmdIndex, GAME_UMD_LIBRARY.length);
          set({ selectedGameUmdIndex: nextGameIndex });
          return;
        }

        const currentItem = selectedItemIndexByCategory[selectedCategoryIndex] ?? 0;
        const itemCount = APPS[selectedCategoryIndex]?.items.length ?? 0;
        const nextItem = moveDown(currentItem, itemCount);
        const nextByCategory = [...selectedItemIndexByCategory];
        nextByCategory[selectedCategoryIndex] = nextItem;
        set({ selectedItemIndexByCategory: nextByCategory });
      },
    },
    audio: {
      play: (soundId) => {
        audioManager.play(soundId);
      },
    },
    screen: {
      setState: (state) => {
        setPowerStateWithEffects(set, get, state);
      },
    },
    overlay: {
      showMessage: ({ title, body, ttlMs = 1700 }) => {
        window.clearTimeout(messageTimer);
        set({ overlay: { kind: 'message', title, body } });
        messageTimer = window.setTimeout(() => {
          if (get().overlay.kind === 'message') {
            set({ overlay: { kind: 'none' } });
          }
        }, ttlMs);
      },
      showChoice: ({ title, body, options }) => {
        window.clearTimeout(messageTimer);
        set({ overlay: { kind: 'choice', title, body, options, selectedIndex: 0 } });
      },
      showProgress: ({ title, body, value = 0.45, indeterminate = false }) => {
        window.clearTimeout(messageTimer);
        set({ overlay: { kind: 'progress', title, body, value, indeterminate } });
      },
      hide: () => {
        const { screenMode } = get();
        if (screenMode === 'PHOTO_VIEWER' || screenMode === 'GAME_UMD') {
          set({ screenMode: 'HOME' });
          audioManager.play('cancel');
          return;
        }
        hideOverlay(set);
      },
      nextOption: () => {
        const { overlay } = get();
        if (overlay.kind !== 'choice') {
          return;
        }
        const next = moveDown(overlay.selectedIndex, overlay.options.length);
        set({ overlay: { ...overlay, selectedIndex: next } });
      },
      prevOption: () => {
        const { overlay } = get();
        if (overlay.kind !== 'choice') {
          return;
        }
        const next = moveUp(overlay.selectedIndex, overlay.options.length);
        set({ overlay: { ...overlay, selectedIndex: next } });
      },
      confirm: () => {
        const { overlay, selectedCategoryIndex, selectedItemIndexByCategory, selectedGameUmdIndex, screenMode } = get();
        if (overlay.kind === 'choice') {
          const accepted = overlay.selectedIndex === 0;
          hideOverlay(set);
          if (accepted) {
            audioManager.play('confirm');
            if (screenMode === 'GAME_UMD') {
              const game = GAME_UMD_LIBRARY[selectedGameUmdIndex];
              set({ overlay: { kind: 'message', title: 'Launched', body: game?.title ?? 'Game' } });
            } else {
              const category = APPS[selectedCategoryIndex];
              const item = category?.items[selectedItemIndexByCategory[selectedCategoryIndex] ?? 0];
              set({ overlay: { kind: 'message', title: 'Launched', body: item?.title ?? 'Selection' } });
            }
            messageTimer = window.setTimeout(() => {
              if (get().overlay.kind === 'message') {
                set({ overlay: { kind: 'none' } });
              }
            }, 1100);
          } else {
            audioManager.play('cancel');
          }
          return;
        }

        if (screenMode === 'PHOTO_VIEWER') {
          audioManager.play('confirm');
          return;
        }

        if (screenMode === 'GAME_UMD') {
          const game = GAME_UMD_LIBRARY[selectedGameUmdIndex];
          if (!game) {
            return;
          }
          const payload: OverlayChoice = {
            kind: 'choice',
            title: 'Launch Game',
            body: `Start ${game.title}?`,
            options: ['Start', 'Cancel'],
            selectedIndex: 0,
          };
          set({ overlay: payload });
          audioManager.play('confirm');
          return;
        }

        if (overlay.kind === 'none') {
          const category = APPS[selectedCategoryIndex];
          const item = category?.items[selectedItemIndexByCategory[selectedCategoryIndex] ?? 0];
          if (!item) {
            return;
          }

          if (category.routeKey === 'photo') {
            set({ screenMode: 'PHOTO_VIEWER', selectedPhotoIndex: 0 });
            audioManager.play('confirm');
            return;
          }

          if (category.routeKey === 'game' && item.id === 'game-umd') {
            set({ screenMode: 'GAME_UMD', selectedGameUmdIndex: 0 });
            audioManager.play('confirm');
            return;
          }

          const payload: OverlayChoice = {
            kind: 'choice',
            title: 'Open Item',
            body: `Open ${item.title}?`,
            options: ['Open', 'Cancel'],
            selectedIndex: 0,
          };
          set({ overlay: payload });
          audioManager.play('confirm');
        }
      },
    },
    theme: {
      setTheme: (mode: ThemeMode) => {
        if (mode === 'auto') {
          set({ themeMode: 'auto', activeTheme: resolveAutoTheme(new Date()) });
          return;
        }
        set({ themeMode: mode, activeTheme: mode });
      },
      cycleTheme: () => {
        const current = get().themeMode;
        const next = nextFromOrder(current, THEME_MODE_ORDER);
        if (next === 'auto') {
          set({ themeMode: 'auto', activeTheme: resolveAutoTheme(new Date()) });
          return;
        }
        set({ themeMode: next, activeTheme: next });
      },
      refreshAuto: () => {
        const { themeMode } = get();
        if (themeMode !== 'auto') {
          return;
        }
        set({ activeTheme: resolveAutoTheme(new Date()) });
      },
    },
  },
}));

export async function unlockAudioIfNeeded(): Promise<void> {
  await audioManager.unlock();
  useSimulatorStore.setState({ isAudioUnlocked: audioManager.isUnlocked() });
}
