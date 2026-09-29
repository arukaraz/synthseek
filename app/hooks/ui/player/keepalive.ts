import { KEEPALIVE_SAMPLE_RATE, KEEPALIVE_SECONDS } from "./constants";

const WAV_HEADER_BYTES = 44;
const SILENCE_8BIT = 0x80;

let element: HTMLAudioElement | null = null;
let follower: ((sounding: boolean) => void) | null = null;

function writeAscii(view: DataView, at: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) view.setUint8(at + index, text.charCodeAt(index));
}

function silentWavUrl(): string {
  const samples = KEEPALIVE_SAMPLE_RATE * KEEPALIVE_SECONDS;
  const bytes = new Uint8Array(WAV_HEADER_BYTES + samples);
  const view = new DataView(bytes.buffer);
  writeAscii(view, 0, "RIFF");
  view.setUint32(4, WAV_HEADER_BYTES - 8 + samples, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, KEEPALIVE_SAMPLE_RATE, true);
  view.setUint32(28, KEEPALIVE_SAMPLE_RATE, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, samples, true);
  bytes.fill(SILENCE_8BIT, WAV_HEADER_BYTES);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}

function create(): HTMLAudioElement {
  const created = new Audio(silentWavUrl());
  created.loop = true;
  const report = (): void => follower?.(!created.paused);
  created.addEventListener("pause", report);
  created.addEventListener("play", report);
  return created;
}

export function followKeepAlive(next: (sounding: boolean) => void): void {
  follower = next;
}

export function keepAlive(): void {
  if (element === null) element = create();
  void element.play().catch(() => undefined);
}

export function releaseKeepAlive(): void {
  element?.pause();
}
