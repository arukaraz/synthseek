import { defaultCompressor } from "./compressor";
import {
  EQUALIZER_BANDS_HZ,
  EQUALIZER_Q,
  GAIN_RAMP_SECONDS,
  NO_GAIN_FACTOR,
  WAVE_ANALYSER_SMOOTHING,
  WAVE_FFT_SIZE,
} from "./constants";
import { headroomFactorFor } from "./equalizer";
import type { AudioGraph, AudioOutput, CompressorSettings } from "./types";

let graph: AudioGraph | null = null;
let unsupported = false;
let output: AudioOutput = { factor: NO_GAIN_FACTOR, volume: 1, muted: false, headroom: 1 };
let equalizerGains: readonly number[] = EQUALIZER_BANDS_HZ.map(() => 0);
let preampDb = 0;
let compressor: CompressorSettings = defaultCompressor();

export function attachGraph(element: HTMLAudioElement): AudioGraph | null {
  if (graph !== null) return graph;
  if (unsupported) return null;

  try {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = WAVE_FFT_SIZE;
    analyser.smoothingTimeConstant = WAVE_ANALYSER_SMOOTHING;
    const gain = context.createGain();
    const preamp = context.createGain();
    preamp.gain.value = preampFactor();
    const filters = EQUALIZER_BANDS_HZ.map((hz, band) => {
      const filter = context.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = hz;
      filter.Q.value = EQUALIZER_Q;
      filter.gain.value = equalizerGains[band] ?? 0;
      return filter;
    });
    const compressorNode = context.createDynamicsCompressor();

    context.createMediaElementSource(element).connect(preamp);
    let upstream: AudioNode = preamp;
    for (const filter of filters) {
      upstream.connect(filter);
      upstream = filter;
    }
    gain.connect(analyser);
    analyser.connect(context.destination);

    graph = { context, analyser, gain, preamp, filters, compressor: compressorNode, compressorEngaged: false };
    applyCompressorParams();
    wireTail();
    output = { ...output, headroom: headroomFactorFor(equalizerGains, context.sampleRate) };
    element.volume = 1;
    element.muted = false;
    gain.gain.value = outputLevel();
    return graph;
  } catch {
    unsupported = true;
    return null;
  }
}

export function currentGraph(): AudioGraph | null {
  return graph;
}

export function resumeGraph(): void {
  if (graph === null) return;
  void graph.context.resume().catch(() => undefined);
}

export function setGainFactor(factor: number): void {
  output = { ...output, factor: Number.isFinite(factor) && factor > 0 ? factor : NO_GAIN_FACTOR };
  writeOutput();
}

export function setListenerVolume(volume: number, muted: boolean): boolean {
  output = { ...output, volume: Math.min(1, Math.max(0, volume)), muted };
  if (graph === null) return false;
  writeOutput();
  return true;
}

export function setEqualizerGains(gainsDb: readonly number[]): void {
  equalizerGains = gainsDb;
  output = { ...output, headroom: headroomFactorFor(gainsDb, graph?.context.sampleRate) };
  if (graph === null) return;
  const at = graph.context.currentTime;
  graph.filters.forEach((filter, band) => filter.gain.setTargetAtTime(gainsDb[band] ?? 0, at, GAIN_RAMP_SECONDS));
  writeOutput();
}

export function setEqualizerPreamp(db: number): void {
  preampDb = Number.isFinite(db) ? db : 0;
  if (graph === null) return;
  graph.preamp.gain.setTargetAtTime(preampFactor(), graph.context.currentTime, GAIN_RAMP_SECONDS);
}

export function setCompressor(next: CompressorSettings): void {
  compressor = next;
  if (graph === null) return;
  applyCompressorParams();
  if (graph.compressorEngaged !== next.enabled) wireTail();
}

export function outputLevel(): number {
  return output.muted ? 0 : output.factor * output.volume * output.headroom;
}

function preampFactor(): number {
  return Math.pow(10, preampDb / 20);
}

function applyCompressorParams(): void {
  if (graph === null) return;
  const node = graph.compressor;
  node.threshold.value = compressor.thresholdDb;
  node.ratio.value = compressor.ratio;
  node.attack.value = compressor.attackMs / 1000;
  node.release.value = compressor.releaseMs / 1000;
  node.knee.value = compressor.kneeDb;
}

function wireTail(): void {
  if (graph === null) return;
  const tail: AudioNode = graph.filters[graph.filters.length - 1] ?? graph.preamp;
  tail.disconnect();
  graph.compressor.disconnect();
  if (compressor.enabled) {
    tail.connect(graph.compressor);
    graph.compressor.connect(graph.gain);
  } else {
    tail.connect(graph.gain);
  }
  graph.compressorEngaged = compressor.enabled;
}

function writeOutput(): void {
  if (graph === null) return;
  graph.gain.gain.setTargetAtTime(outputLevel(), graph.context.currentTime, GAIN_RAMP_SECONDS);
}
