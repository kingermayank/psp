import type { SoundId } from '../types';

export class AudioManager {
  private readonly audio = new Map<SoundId, HTMLAudioElement>();
  private readonly pending: SoundId[] = [];

  private unlocked = false;

  constructor(sources: Record<SoundId, string>) {
    (Object.entries(sources) as [SoundId, string][]).forEach(([id, src]) => {
      const element = new Audio(src);
      element.preload = 'auto';
      this.audio.set(id, element);
    });
  }

  async unlock(): Promise<void> {
    if (this.unlocked) {
      return;
    }

    const first = this.audio.values().next().value as HTMLAudioElement | undefined;
    if (!first) {
      this.unlocked = true;
      return;
    }

    try {
      await first.play();
      first.pause();
      first.currentTime = 0;
      this.unlocked = true;
      this.flushPending();
    } catch {
      this.unlocked = false;
    }
  }

  play(id: SoundId): void {
    if (!this.unlocked) {
      // Preserve user-triggered sounds until the browser audio context is unlocked.
      this.pending.push(id);
      if (this.pending.length > 16) {
        this.pending.shift();
      }
      return;
    }

    this.playNow(id);
  }

  private flushPending(): void {
    const queue = [...this.pending];
    this.pending.length = 0;
    queue.forEach((soundId) => {
      this.playNow(soundId);
    });
  }

  private playNow(id: SoundId): void {
    const element = this.audio.get(id);
    if (!element) {
      return;
    }

    element.currentTime = 0;
    void element.play().catch(() => {
      // Browser may block autoplay before unlock.
    });
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }
}
