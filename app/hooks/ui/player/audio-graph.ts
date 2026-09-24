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
let output: AudioOutput = { volume: 1, muted: false, headroom: 1 };
let equalizerGains: readonly number[] = EQUALIZER_BANDS_HZ.map(() => 0);
let preampDb = 0;
let compressor: CompressorSettings = defaultCompressor();
const trackGains = new Map<HTMLAudioElement, number>();

export function attachGraph(element: HTMLAudioElement): AudioGraph | null {
  if (unsupported) return null;
  if (graph === null) {
    graph = createGraph();
    if (graph === null) return null;
  }
  if (!graph.decks.has(element)) attachDeck(graph, element);
  return graph;
}

function createGraph(): AudioGraph | null {
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

    let upstream: AudioNode = preamp;
    for (const filter of filters) {
      upstream.connect(filter);
      upstream = filter;
    }
    gain.connect(analyser);
    analyser.connect(context.destination);

    const built: AudioGraph = {
      context,
      analyser,
      gain,
      preamp,
      filters,
      compressor: compressorNode,
      compressorEngaged: false,
      decks: new Map(),
    };
    graph = built;
    applyCompressorParams();
    wireTail();
    output = { ...output, headroom: headroomFactorFor(equalizerGains, context.sampleRate) };
    gain.gain.value = outputLevel();
    return built;
  } catch {
    unsupported = true;
    return null;
  }
}

function attachDeck(built: AudioGraph, element: HTMLAudioElement): void {
  try {
    const source = built.context.createMediaElementSource(element);
    const gain = built.context.createGain();
    gain.gain.value = trackGains.get(element) ?? NO_GAIN_FACTOR;
    source.connect(gain);
    gain.connect(built.preamp);
    built.decks.set(element, { source, gain });
    element.volume = 1;
    element.muted = false;
  } catch {
    return;
  }
}

export function currentGraph(): AudioGraph | null {
  return graph;
}

export function resumeGraph(): void {
  if (graph === null) return;
  void graph.context.resume().catch(() => undefined);
}

export function setTrackGain(element: HTMLAudioElement, factor: number, immediate = false): void {
  const level = Number.isFinite(factor) && factor >= 0 ? factor : NO_GAIN_FACTOR;
  trackGains.set(element, level);
  const deck = graph?.decks.get(element);
  if (graph === null || deck === undefined) return;
  const at = graph.context.currentTime;
  deck.gain.gain.cancelScheduledValues(at);
  if (immediate) {
    deck.gain.gain.setValueAtTime(level, at);
    return;
  }
  deck.gain.gain.setTargetAtTime(level, at, GAIN_RAMP_SECONDS);
}

export function fadeTrackGain(element: HTMLAudioElement, values: Float32Array, seconds: number): boolean {
  const deck = graph?.decks.get(element);
  if (graph === null || deck === undefined || values.length < 2 || !(seconds > 0)) return false;
  const at = graph.context.currentTime;
  deck.gain.gain.cancelScheduledValues(at);
  deck.gain.gain.setValueCurveAtTime(values, at, seconds);
  trackGains.set(element, values[values.length - 1] ?? NO_GAIN_FACTOR);
  return true;
}

export function trackGainOf(element: HTMLAudioElement): number {
  return trackGains.get(element) ?? NO_GAIN_FACTOR;
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

function outputLevel(): number {
  return output.muted ? 0 : output.volume * output.headroom;
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
