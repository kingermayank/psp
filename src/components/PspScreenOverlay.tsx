import { useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { GAME_UMD_LIBRARY, PHOTO_LIBRARY } from '../config/simulatorConfig';
import { APPS } from '../config/simulatorConfig';
import { THEME_TOKENS } from '../simulator/themeEngine';
import type { OverlayState, PowerState, ScreenMode, ThemeName } from '../types';

type Props = {
  powerState: PowerState;
  screenMode: ScreenMode;
  selectedCategoryIndex: number;
  selectedItemIndex: number;
  selectedPhotoIndex: number;
  selectedGameUmdIndex: number;
  overlay: OverlayState;
  activeTheme: ThemeName;
};

const CATEGORY_SPACING_PX = 94;
const CATEGORY_ICON_FALLBACK: Record<string, string> = {
  settings: '/assets/openxmb/icons/icon_category_settings.png',
  photo: '/assets/openxmb/icons/icon_category_photo.png',
  music: '/assets/openxmb/icons/icon_category_music.png',
  video: '/assets/openxmb/icons/icon_category_video.png',
  game: '/assets/openxmb/icons/icon_category_game.png',
  network: '/assets/openxmb/icons/icon_category_network.png',
  friends: '/assets/openxmb/icons/icon_category_friends.png',
};
const DEFAULT_ITEM_ICON = '/assets/openxmb/item-icons/icon_category_application.png';
const CATEGORY_ICON_OPTICAL_SCALE: Record<string, number> = {
  settings: 1,
  photo: 0.97,
  music: 1,
  video: 0.98,
  game: 1,
  network: 0.86,
  friends: 0.95,
};

function getItemIconOpticalScale(itemId: string, iconSrc: string): number {
  if (iconSrc.includes('icon_category_network') || itemId.startsWith('network-')) {
    return 0.88;
  }
  if (iconSrc.includes('icon_category_photo')) {
    return 0.96;
  }
  if (iconSrc.includes('icon_category_friends')) {
    return 0.95;
  }
  return 1;
}

function handleIconLoadError(event: SyntheticEvent<HTMLImageElement>, fallbackSrc: string) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === '1') {
    return;
  }
  image.dataset.fallbackApplied = '1';
  image.src = fallbackSrc;
}

function formatTime(now: Date): string {
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hours24 = now.getHours();
  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours12}:${minutes}${meridiem}`;
}

function StatusBar() {
  const [clock, setClock] = useState<string>(() => formatTime(new Date()));

  useEffect(() => {
    const updateClock = () => {
      setClock(formatTime(new Date()));
    };

    updateClock();
    const timer = window.setInterval(updateClock, 60_000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <header className="xmb-status-bar" aria-label="Status bar">
      <span className="xmb-clock">{clock}</span>
      <span className="xmb-battery" aria-label="Battery level">
        <span className="xmb-battery-body">
          <span className="xmb-battery-fill" />
        </span>
        <span className="xmb-battery-tip" />
      </span>
    </header>
  );
}

function OverlayLayer({ overlay }: { overlay: OverlayState }) {
  if (overlay.kind === 'none') {
    return null;
  }

  if (overlay.kind === 'message') {
    return (
      <section className="xmb-overlay xmb-overlay-message" aria-live="polite">
        <h3>{overlay.title}</h3>
        <p>{overlay.body}</p>
      </section>
    );
  }

  if (overlay.kind === 'choice') {
    return (
      <section className="xmb-overlay xmb-overlay-choice" aria-live="polite">
        <h3>{overlay.title}</h3>
        <p>{overlay.body}</p>
        <div className="xmb-choice-list">
          {overlay.options.map((option, index) => (
            <div key={option} className={index === overlay.selectedIndex ? 'xmb-choice-row is-selected' : 'xmb-choice-row'}>
              {option}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="xmb-overlay xmb-overlay-progress" aria-live="polite">
      <h3>{overlay.title}</h3>
      <p>{overlay.body}</p>
      <div className="xmb-progress-track">
        <div
          className={overlay.indeterminate ? 'xmb-progress-fill is-indeterminate' : 'xmb-progress-fill'}
          style={overlay.indeterminate ? undefined : { width: `${Math.max(0, Math.min(100, overlay.value * 100))}%` }}
        />
      </div>
    </section>
  );
}

export default function PspScreenOverlay({
  powerState,
  screenMode,
  selectedCategoryIndex,
  selectedItemIndex,
  selectedPhotoIndex,
  selectedGameUmdIndex,
  overlay,
  activeTheme,
}: Props) {
  const previousCategoryIndex = useRef(selectedCategoryIndex);
  const previousScreenMode = useRef<ScreenMode>(screenMode);
  const [isSnappingItemTrack, setIsSnappingItemTrack] = useState(false);
  const [categorySettleDirection, setCategorySettleDirection] = useState<'left' | 'right' | null>(null);
  const [gameDepthMotion, setGameDepthMotion] = useState<'idle' | 'enter' | 'exit'>('idle');

  useEffect(() => {
    if (previousCategoryIndex.current === selectedCategoryIndex) {
      return;
    }

    const nextDirection = selectedCategoryIndex > previousCategoryIndex.current ? 'right' : 'left';
    previousCategoryIndex.current = selectedCategoryIndex;
    setIsSnappingItemTrack(true);
    setCategorySettleDirection(nextDirection);

    const frame = window.requestAnimationFrame(() => {
      setIsSnappingItemTrack(false);
    });
    const settleTimer = window.setTimeout(() => {
      setCategorySettleDirection(null);
    }, 260);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, [selectedCategoryIndex]);

  useEffect(() => {
    if (previousScreenMode.current === screenMode) {
      return;
    }

    if (screenMode === 'GAME_UMD') {
      setGameDepthMotion('enter');
    } else if (previousScreenMode.current === 'GAME_UMD' && screenMode === 'HOME') {
      setGameDepthMotion('exit');
    }

    previousScreenMode.current = screenMode;
    const timer = window.setTimeout(() => {
      setGameDepthMotion('idle');
    }, 260);

    return () => {
      window.clearTimeout(timer);
    };
  }, [screenMode]);

  if (powerState === 'OFF') {
    return <div className="screen-inner off" aria-label="PSP screen off" />;
  }

  if (powerState === 'BOOTING') {
    return (
      <div className="screen-inner booting xmb-boot" aria-label="PSP booting">
        <div className="boot-bg-flare" aria-hidden />
        <div className="boot-bg-ring" aria-hidden />
        <div className="boot-light-sweep" aria-hidden />
        <div className="boot-stack">
          <div className="boot-logo">PSP</div>
          <div className="boot-subtitle">PlayStation Portable</div>
          <div className="boot-sce">Sony Computer Entertainment</div>
        </div>
      </div>
    );
  }

  const focusedCategory = APPS[selectedCategoryIndex] ?? APPS[0];
  const focusedPhoto = PHOTO_LIBRARY[selectedPhotoIndex] ?? PHOTO_LIBRARY[0];
  const theme = THEME_TOKENS[activeTheme];
  const homeStyle = {
    '--xmb-bg-top': theme.top,
    '--xmb-bg-mid': theme.mid,
    '--xmb-bg-bottom': theme.bottom,
    '--xmb-flare-a': theme.flareA,
    '--xmb-flare-b': theme.flareB,
    '--xmb-wave-a': theme.waveA,
    '--xmb-wave-b': theme.waveB,
    '--xmb-wave-c': theme.waveC,
    '--xmb-parallax-x': `${selectedCategoryIndex - (APPS.length - 1) / 2}`,
    '--xmb-parallax-y': `${selectedItemIndex}`,
  } as CSSProperties;

  return (
    <div
      className={`screen-inner home xmb-home ${overlay.kind !== 'none' ? 'has-overlay' : ''}`}
      aria-label="PSP home screen"
      style={homeStyle}
    >
      <div className="xmb-radiance" aria-hidden />
      <div className="xmb-radiance-glow" aria-hidden />
      <div className="xmb-wave-layer xmb-wave-1" aria-hidden />
      <div className="xmb-wave-layer xmb-wave-2" aria-hidden />
      <div className="xmb-wave-layer xmb-wave-3" aria-hidden />
      <div className="xmb-vignette" aria-hidden />

      <StatusBar />

      {screenMode === 'PHOTO_VIEWER' ? (
        <section className="xmb-photo-viewer" aria-label="Photo viewer">
          <div className="xmb-photo-meta">
            <span className="xmb-photo-title">{focusedPhoto?.title ?? 'Photo'}</span>
            <span className="xmb-photo-count">
              {Math.min(selectedPhotoIndex + 1, PHOTO_LIBRARY.length)} / {PHOTO_LIBRARY.length}
            </span>
          </div>
          <div className="xmb-photo-frame">
            {focusedPhoto ? <img className="xmb-photo-image" src={focusedPhoto.src} alt={focusedPhoto.title} /> : null}
          </div>
          <div className="xmb-photo-help">Left/Right: Browse  Esc: Back</div>
        </section>
      ) : null}

      <section
        className={`xmb-category-row ${categorySettleDirection ? `is-settle-${categorySettleDirection}` : ''} ${
          screenMode === 'PHOTO_VIEWER' ? 'is-hidden' : ''
        }`}
        aria-label="Category row"
      >
        <div className="xmb-category-track">
          {APPS.map((app, index) => {
            const offset = (index - selectedCategoryIndex) * CATEGORY_SPACING_PX;
            const isSelected = index === selectedCategoryIndex;

            return (
              <article
                className={isSelected ? 'xmb-category-item is-selected' : 'xmb-category-item'}
                key={app.id}
                style={
                  {
                    '--item-offset': `${offset}px`,
                    '--item-accent': app.accent ?? '#ffffff',
                    '--xmb-icon-scale': `${CATEGORY_ICON_OPTICAL_SCALE[app.id] ?? 1}`,
                  } as CSSProperties
                }
              >
                <span className="xmb-category-icon" aria-hidden>
                  <img
                    className="xmb-category-icon-image"
                    src={app.icon}
                    alt=""
                    onError={(event) => {
                      handleIconLoadError(event, CATEGORY_ICON_FALLBACK[app.id] ?? CATEGORY_ICON_FALLBACK.settings);
                    }}
                  />
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <div className={`xmb-focus-band ${screenMode === 'PHOTO_VIEWER' ? 'is-hidden' : ''}`} aria-live="polite">
        <span className="xmb-focus-title">{focusedCategory.title}</span>
        <span className="xmb-focus-line" />
      </div>

      <section
        className={`xmb-item-column ${screenMode !== 'HOME' ? 'is-hidden' : ''} ${gameDepthMotion === 'enter' ? 'is-depth-entering' : ''} ${
          gameDepthMotion === 'exit' ? 'is-depth-exiting' : ''
        }`}
        aria-label={`${focusedCategory.title} items`}
      >
        <div className={isSnappingItemTrack ? 'xmb-item-track is-snap' : 'xmb-item-track'}>
          {focusedCategory.items.map((item, index) => {
            const relativeIndex = index - selectedItemIndex;
            const rowClass =
              index === selectedItemIndex
                ? 'xmb-item-row is-selected'
                : relativeIndex < 0
                  ? 'xmb-item-row is-above'
                  : 'xmb-item-row';

            return (
              <div
                key={item.id}
                className={rowClass}
                style={
                  {
                    '--item-rel': `${relativeIndex}`,
                    '--xmb-item-icon-scale': `${getItemIconOpticalScale(item.id, item.icon)}`,
                  } as CSSProperties
                }
              >
                <span className="xmb-item-icon" aria-hidden>
                  <img
                    className="xmb-item-icon-image"
                    src={item.icon}
                    alt=""
                    onError={(event) => {
                      handleIconLoadError(event, DEFAULT_ITEM_ICON);
                    }}
                  />
                </span>
                <span className="xmb-item-title">{item.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className={`xmb-game-depth ${
          screenMode === 'GAME_UMD' ? 'is-active' : ''
        } ${gameDepthMotion === 'enter' ? 'is-entering' : ''} ${gameDepthMotion === 'exit' ? 'is-exiting' : ''}`}
        aria-label="UMD game list"
      >
        <div className="xmb-game-depth-track">
          {GAME_UMD_LIBRARY.map((entry, index) => {
            const rel = index - selectedGameUmdIndex;
            const isSelected = index === selectedGameUmdIndex;
            const cls = isSelected
              ? 'xmb-game-card is-selected'
              : rel < 0
                ? 'xmb-game-card is-above'
                : 'xmb-game-card is-below';

            return (
              <article
                key={entry.id}
                className={cls}
                style={
                  {
                    '--game-rel': `${rel}`,
                  } as CSSProperties
                }
              >
                <img className="xmb-game-cover" src={entry.cover} alt={entry.title} />
                <div className="xmb-game-meta">
                  <h3 className="xmb-game-title">{entry.title}</h3>
                  <p className="xmb-game-subtitle">{entry.subtitle}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <OverlayLayer overlay={overlay} />
    </div>
  );
}
