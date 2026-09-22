import { GAIN_RAMP_SECONDS, NO_GAIN_FACTOR, WAVE_ANALYSER_SMOOTHING, WAVE_FFT_SIZE } from "./constants";
import type { AudioGraph, AudioOutput } from "./types";

let graph: AudioGraph | null = null;
let unsupported = false;
let output: AudioOutput = { factor: NO_GAIN_FACTOR, volume: 1, muted: false };

export function attachGraph(element: HTMLAudioElement): AudioGraph | null {
  if (graph !== null) return graph;
  if (unsupported) return null;

  try {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = WAVE_FFT_SIZE;
    analyser.smoothingTimeConstant = WAVE_ANALYSER_SMOOTHING;
    const gain = context.createGain();

    context.createMediaElementSource(element).connect(gain);
    gain.connect(analyser);
    analyser.connect(context.destination);

    graph = { context, analyser, gain };
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

export function outputLevel(): number {
  return output.muted ? 0 : output.factor * output.volume;
}

function writeOutput(): void {
  if (graph === null) return;
  graph.gain.gain.setTargetAtTime(outputLevel(), graph.context.currentTime, GAIN_RAMP_SECONDS);
}
