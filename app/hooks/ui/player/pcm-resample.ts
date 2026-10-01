import type { ResamplerState } from "./types";

export function startResampler(sourceRate: number, targetRate: number, channels: number): ResamplerState {
  return { sourceRate, targetRate, channels, nextOutput: 0, inputFrames: 0, previous: null };
}

function sourcePositionOf(state: ResamplerState, output: number): number {
  return (output * state.sourceRate) / state.targetRate;
}

export function resampleChunk(state: ResamplerState, planes: readonly Float32Array[]): Float32Array[] {
  const frames = planes[0]?.length ?? 0;
  if (frames === 0) return planes.map(() => new Float32Array(0));

  const firstFrame = state.inputFrames;
  const lastFrame = firstFrame + frames - 1;
  const previous = state.previous;
  const sampleAt = (channel: number, frame: number): number => {
    if (frame < firstFrame) return previous?.[channel] ?? 0;
    return planes[channel]?.[frame - firstFrame] ?? 0;
  };

  const outputs: number[][] = planes.map(() => []);
  for (;;) {
    const position = sourcePositionOf(state, state.nextOutput);
    const lower = Math.floor(position);
    if (lower + 1 > lastFrame) break;
    const fraction = position - lower;
    for (let channel = 0; channel < planes.length; channel += 1) {
      const from = sampleAt(channel, lower);
      outputs[channel]?.push(from + fraction * (sampleAt(channel, lower + 1) - from));
    }
    state.nextOutput += 1;
  }

  state.previous = planes.map((plane) => plane[frames - 1] ?? 0);
  state.inputFrames += frames;
  return outputs.map((samples) => Float32Array.from(samples));
}

export function flushResampler(state: ResamplerState): Float32Array[] {
  const held = state.previous;
  const outputs: number[][] = Array.from({ length: state.channels }, () => []);
  if (held === null) return outputs.map(() => new Float32Array(0));
  while (sourcePositionOf(state, state.nextOutput) < state.inputFrames) {
    for (let channel = 0; channel < state.channels; channel += 1) outputs[channel]?.push(held[channel] ?? 0);
    state.nextOutput += 1;
  }
  return outputs.map((samples) => Float32Array.from(samples));
}
