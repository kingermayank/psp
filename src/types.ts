export type PowerState = 'OFF' | 'BOOTING' | 'HOME';

export type SoundId = 'boot' | 'cursor' | 'confirm' | 'cancel' | 'startGame';
export type ThemeName = 'night' | 'dawn' | 'day' | 'dusk';
export type ThemeMode = ThemeName | 'auto';
export type ScreenMode = 'HOME' | 'PHOTO_VIEWER' | 'GAME_UMD';

export type XmbItem = {
  id: string;
  title: string;
  icon: string;
};

export type PhotoAsset = {
  id: string;
  title: string;
  src: string;
};

export type GameUmdAsset = {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
};

export type AppDescriptor = {
  id: string;
  title: string;
  icon: string;
  routeKey: string;
  items: XmbItem[];
  accent?: string;
  launchSound?: SoundId;
  onSelect?: () => void;
};

export type SimulatorState = {
  powerState: PowerState;
  screenMode: ScreenMode;
  selectedCategoryIndex: number;
  selectedItemIndexByCategory: number[];
  selectedPhotoIndex: number;
  selectedGameUmdIndex: number;
  overlay: OverlayState;
  themeMode: ThemeMode;
  activeTheme: ThemeName;
  isAudioUnlocked: boolean;
};

export type SimulatorAPI = {
  power: {
    toggle: () => void;
  };
  nav: {
    left: () => void;
    right: () => void;
    up: () => void;
    down: () => void;
  };
  audio: {
    play: (soundId: SoundId) => void;
  };
  screen: {
    setState: (state: PowerState) => void;
  };
  overlay: {
    showMessage: (payload: { title: string; body: string; ttlMs?: number }) => void;
    showChoice: (payload: { title: string; body: string; options: string[] }) => void;
    showProgress: (payload: { title: string; body: string; value?: number; indeterminate?: boolean }) => void;
    hide: () => void;
    nextOption: () => void;
    prevOption: () => void;
    confirm: () => void;
  };
  theme: {
    setTheme: (mode: ThemeMode) => void;
    cycleTheme: () => void;
    refreshAuto: () => void;
  };
};

export type OverlayNone = {
  kind: 'none';
};

export type OverlayMessage = {
  kind: 'message';
  title: string;
  body: string;
};

export type OverlayChoice = {
  kind: 'choice';
  title: string;
  body: string;
  options: string[];
  selectedIndex: number;
};

export type OverlayProgress = {
  kind: 'progress';
  title: string;
  body: string;
  value: number;
  indeterminate: boolean;
};

export type OverlayState = OverlayNone | OverlayMessage | OverlayChoice | OverlayProgress;
