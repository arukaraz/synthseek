import {
  WAVE_ENERGY_CEILING,
  WAVE_ENERGY_CURVE,
  WAVE_ENERGY_PEAK_DECAY,
  WAVE_ENERGY_SILENCE,
  WAVE_ENERGY_FLOOR,
  WAVE_ENERGY_INTERVAL_MS,
  WAVE_ENERGY_SELECTOR,
  WAVE_ENERGY_SMOOTHING,
  WAVE_ENERGY_VARIABLE,
  WAVE_ANALYSER_SMOOTHING,
  WAVE_FFT_SIZE,
} from "./constants";

interface Listener {
  context: AudioContext;
  analyser: AnalyserNode;
  bins: Uint8Array<ArrayBuffer>;
}

let listener: Listener | null = null;
let unsupported = false;
let timer: ReturnType<typeof setInterval> | undefined;
let smoothed = 1;
let peak = 0;
let trough = 1;

function paint(energy: number): void {
  if (typeof document === "undefined") return;
  for (const wave of document.querySelectorAll<HTMLElement>(WAVE_ENERGY_SELECTOR)) {
    wave.style.setProperty(WAVE_ENERGY_VARIABLE, energy.toFixed(3));
  }
}

function listen(element: HTMLAudioElement): Listener | null {
  if (listener !== null) return listener;
  if (unsupported) return null;

  try {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = WAVE_FFT_SIZE;
    analyser.smoothingTimeConstant = WAVE_ANALYSER_SMOOTHING;
    analyser.connect(context.destination);
    context.createMediaElementSource(element).connect(analyser);
    listener = { context, analyser, bins: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)) };
    return listener;
  } catch {
    unsupported = true;
    return null;
  }
}

function loudness(source: Listener): number {
  source.analyser.getByteFrequencyData(source.bins);
  const voiced = source.bins.subarray(0, Math.max(1, Math.floor(source.bins.length / 2)));
  let total = 0;
  for (const bin of voiced) total += bin;
  return total / voiced.length / 255;
}

export function followAudio(element: HTMLAudioElement): void {
  const source = listen(element);
  if (source === null) return;

  void source.context.resume().catch(() => undefined);
  clearInterval(timer);
  timer = setInterval(() => {
    const level = loudness(source);
    peak = Math.max(level, peak * WAVE_ENERGY_PEAK_DECAY);
    trough = Math.min(level, trough + (peak - trough) * (1 - WAVE_ENERGY_PEAK_DECAY));
    const span = peak - trough;
    const share =
      span <= WAVE_ENERGY_SILENCE ? 0 : Math.pow(Math.min(1, Math.max(0, (level - trough) / span)), WAVE_ENERGY_CURVE);
    const target = WAVE_ENERGY_FLOOR + share * (WAVE_ENERGY_CEILING - WAVE_ENERGY_FLOOR);
    smoothed = smoothed + (target - smoothed) * WAVE_ENERGY_SMOOTHING;
    paint(smoothed);
  }, WAVE_ENERGY_INTERVAL_MS);
}

export function stopFollowingAudio(): void {
  clearInterval(timer);
  timer = undefined;
  smoothed = 1;
  peak = 0;
  trough = 1;
  paint(1);
}
