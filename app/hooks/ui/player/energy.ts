import {
  WAVE_BASS_HIGH_HZ,
  WAVE_BASS_LOW_HZ,
  WAVE_ENERGY_CEILING,
  WAVE_ENERGY_CURVE,
  WAVE_ENERGY_PEAK_DECAY,
  WAVE_ENERGY_SILENCE,
  WAVE_ENERGY_FLOOR,
  WAVE_ENERGY_INTERVAL_MS,
  WAVE_ENERGY_SMOOTHING,
  WAVE_ANALYSER_SMOOTHING,
  WAVE_FFT_SIZE,
} from "./constants";

interface Listener {
  context: AudioContext;
  analyser: AnalyserNode;
  bins: Uint8Array<ArrayBuffer>;
  bassFrom: number;
  bassTo: number;
}

let listener: Listener | null = null;
let unsupported = false;
let timer: ReturnType<typeof setInterval> | undefined;
let smoothed = 1;
let peak = 0;
let trough = 1;

export function audioEnergy(): number {
  return smoothed;
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
    const hertzPerBin = context.sampleRate / 2 / analyser.frequencyBinCount;
    const bassFrom = Math.max(1, Math.floor(WAVE_BASS_LOW_HZ / hertzPerBin));
    listener = {
      context,
      analyser,
      bins: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
      bassFrom,
      bassTo: Math.min(analyser.frequencyBinCount, Math.max(bassFrom + 1, Math.ceil(WAVE_BASS_HIGH_HZ / hertzPerBin))),
    };
    return listener;
  } catch {
    unsupported = true;
    return null;
  }
}

function loudness(source: Listener): number {
  source.analyser.getByteFrequencyData(source.bins);
  const bass = source.bins.subarray(source.bassFrom, source.bassTo);
  let total = 0;
  for (const bin of bass) total += bin;
  return total / bass.length / 255;
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
  }, WAVE_ENERGY_INTERVAL_MS);
}

export function stopFollowingAudio(): void {
  clearInterval(timer);
  timer = undefined;
  smoothed = 1;
  peak = 0;
  trough = 1;
}
