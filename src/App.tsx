import { useEffect, useState, type CSSProperties } from 'react';
import PspScene from './components/PspScene';
import PspScreenOverlay from './components/PspScreenOverlay';
import { bindInputController } from './simulator/inputController';
import { unlockAudioIfNeeded, useSimulatorStore } from './simulator/useSimulatorStore';

const LOCKED_ROTATION_X_DEG = 40;
const LOCKED_ROTATION_Y_DEG = 0;
const LOCKED_ZOOM_DISTANCE = 53;
const LOCKED_UI_WIDTH = 501;
const LOCKED_UI_HEIGHT = 277;
const LOCKED_MODEL_SCALE: [number, number, number] = [1.35, 1.35, 1.35];
const LOCKED_MODEL_OFFSET_Y = 0;
const CENTERED_UI_OFFSET = { x: 0, y: -16 };
type ViewMode = 'model' | 'ui' | 'composite';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const clampUiOffsetToViewport = (offset: { x: number; y: number }): { x: number; y: number } => {
  const navWidth = window.innerWidth > 900 ? 220 : 0;
  const workspaceWidth = Math.max(320, window.innerWidth - navWidth);
  const workspaceHeight = Math.max(220, window.innerHeight);
  const margin = 16;
  const maxX = Math.max(0, workspaceWidth / 2 - LOCKED_UI_WIDTH / 2 - margin);
  const maxY = Math.max(0, workspaceHeight / 2 - LOCKED_UI_HEIGHT / 2 - margin);
  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };
};

export default function App() {
  const api = useSimulatorStore((state) => state.api);
  const powerState = useSimulatorStore((state) => state.powerState);
  const screenMode = useSimulatorStore((state) => state.screenMode);
  const selectedCategoryIndex = useSimulatorStore((state) => state.selectedCategoryIndex);
  const selectedItemIndex = useSimulatorStore((state) => state.selectedItemIndexByCategory[state.selectedCategoryIndex] ?? 0);
  const selectedPhotoIndex = useSimulatorStore((state) => state.selectedPhotoIndex);
  const selectedGameUmdIndex = useSimulatorStore((state) => state.selectedGameUmdIndex);
  const overlay = useSimulatorStore((state) => state.overlay);
  const activeTheme = useSimulatorStore((state) => state.activeTheme);
  const [activeView, setActiveView] = useState<ViewMode>('model');
  const [uiOffset, setUiOffset] = useState(CENTERED_UI_OFFSET);

  useEffect(() => {
    const unbind = bindInputController(api, {
      onFirstInput: () => {
        void unlockAudioIfNeeded();
      },
    });

    return () => {
      unbind();
    };
  }, [api]);

  useEffect(() => {
    api.theme.refreshAuto();
    const timer = window.setInterval(() => {
      api.theme.refreshAuto();
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [api]);

  useEffect(() => {
    setUiOffset((prev) => clampUiOffsetToViewport(prev));

    const handleResize = () => {
      setUiOffset((prev) => clampUiOffsetToViewport(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (activeView === 'model') {
      return;
    }
    setUiOffset((prev) => clampUiOffsetToViewport(prev));
  }, [activeView]);

  useEffect(() => {
    if (activeView !== 'composite') {
      return;
    }
    setUiOffset(CENTERED_UI_OFFSET);
  }, [activeView]);

  const uiShellStyle = {
    '--ui-offset-x': `${uiOffset.x}px`,
    '--ui-offset-y': `${uiOffset.y}px`,
    width: `${LOCKED_UI_WIDTH}px`,
    height: `${LOCKED_UI_HEIGHT}px`,
    aspectRatio: 'auto',
  } as CSSProperties;

  const isCompositeView = activeView === 'composite';

  const uiPanel = (
    <div
      className={`ui-simulator-shell ui-simulator-shell-draggable ${isCompositeView ? 'ui-simulator-shell-flat' : ''}`}
      style={uiShellStyle}
    >
      <div className={`ui-screen ${isCompositeView ? 'ui-screen-flat' : ''}`}>
        <PspScreenOverlay
          powerState={powerState}
          screenMode={screenMode}
          selectedCategoryIndex={selectedCategoryIndex}
          selectedItemIndex={selectedItemIndex}
          selectedPhotoIndex={selectedPhotoIndex}
          selectedGameUmdIndex={selectedGameUmdIndex}
          overlay={overlay}
          activeTheme={activeTheme}
        />
      </div>
    </div>
  );

  return (
    <main className="app-shell">
      <aside className="left-nav" aria-label="Playground navigation">
        <p className="left-nav-title">Mayank&apos;s Playground</p>
        <button
          className={activeView === 'composite' ? 'left-nav-item active' : 'left-nav-item'}
          type="button"
          onClick={() => {
            setActiveView('composite');
          }}
        >
          3D + UI overlay
        </button>
        <button
          className={activeView === 'model' ? 'left-nav-item active' : 'left-nav-item'}
          type="button"
          onClick={() => {
            setActiveView('model');
          }}
        >
          PSP3D model
        </button>
        <button
          className={activeView === 'ui' ? 'left-nav-item active' : 'left-nav-item'}
          type="button"
          onClick={() => {
            setActiveView('ui');
          }}
        >
          OpenXMB UI
        </button>
      </aside>

      <section className="workspace">
        {activeView === 'model' ? (
          <section className="stage" aria-label="PSP simulator stage">
            <div className="model-layer">
              <PspScene
                rotationXDeg={LOCKED_ROTATION_X_DEG}
                rotationYDeg={LOCKED_ROTATION_Y_DEG}
                zoomDistance={LOCKED_ZOOM_DISTANCE}
                modelScale={LOCKED_MODEL_SCALE}
                modelOffsetY={LOCKED_MODEL_OFFSET_Y}
              />
            </div>
          </section>
        ) : null}

        {activeView === 'ui' ? (
          <section className="ui-workspace" aria-label="OpenXMB UI stage">
            <div className="ui-drag-canvas">{uiPanel}</div>
            <p className="ui-hint">
              Controls: P power, arrows navigate, Enter open/select, Esc back.
            </p>
          </section>
        ) : null}

        {activeView === 'composite' ? (
          <section className="stage composite-stage" aria-label="PSP model with UI overlay stage">
            <div className="model-layer">
              <PspScene
                rotationXDeg={LOCKED_ROTATION_X_DEG}
                rotationYDeg={LOCKED_ROTATION_Y_DEG}
                zoomDistance={LOCKED_ZOOM_DISTANCE}
                modelScale={LOCKED_MODEL_SCALE}
                modelOffsetY={LOCKED_MODEL_OFFSET_Y}
              />
            </div>
            <div className="composite-overlay">
              <div className="ui-drag-canvas">{uiPanel}</div>
              <p className="ui-hint composite-hint">
                Controls: P power, arrows navigate, Enter open/select, Esc back.
              </p>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
