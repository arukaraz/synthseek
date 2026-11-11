export class FakeAudio {
  static made: FakeAudio[] = [];
  static refusal: Error | null = null;
  paused = true;
  muted = false;
  volume = 1;
  src = "";
  preload = "";
  currentTime = 0;
  duration = Number.NaN;
  loads = 0;
  listeners = new Map<string, () => void>();

  constructor() {
    FakeAudio.made.push(this);
  }

  static reset(): void {
    FakeAudio.made = [];
    FakeAudio.refusal = null;
  }

  static only(): FakeAudio {
    const made = FakeAudio.made[0];
    if (made === undefined) throw new Error("no audio element was created");
    return made;
  }

  addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, listener);
  }

  emit(type: string): void {
    this.listeners.get(type)?.();
  }

  removeAttribute(): void {
    this.src = "";
  }

  load(): void {
    this.loads += 1;
  }

  play(): Promise<void> {
    if (FakeAudio.refusal !== null) return Promise.reject(FakeAudio.refusal);
    this.paused = false;
    return Promise.resolve();
  }

  pause(): void {
    this.paused = true;
  }
}
