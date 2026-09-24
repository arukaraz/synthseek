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
} from "./constants";
import { attachGraph, currentGraph, resumeGraph } from "./audio-graph";
import type { AudioGraph } from "./types";

interface Listener {
  context: AudioContext;
  analyser: AnalyserNode;
  bins: Uint8Array<ArrayBuffer>;
  bassFrom: number;
  bassTo: number;
}

let listener: Listener | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
let smoothed = 1;
let peak = 0;
let trough = 1;

export function audioEnergy(): number {
  return smoothed;
}

function listen(graph: AudioGraph | null): Listener | null {
  if (listener !== null) return listener;
  if (graph === null) return null;

  const { context, analyser } = graph;
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
}

function loudness(source: Listener): number {
  source.analyser.getByteFrequencyData(source.bins);
  const bass = source.bins.subarray(source.bassFrom, source.bassTo);
  let total = 0;
  for (const bin of bass) total += bin;
  return total / bass.length / 255;
}

export function followAudio(element: HTMLAudioElement): void {
  follow(listen(attachGraph(element)));
}

export function followGraph(): void {
  follow(listen(currentGraph()));
}

function follow(source: Listener | null): void {
  if (source === null) return;

  resumeGraph();
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
