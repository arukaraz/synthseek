import * as decks from "./deck-engine";
import * as pcm from "./pcm-engine";
import { pcmBackendReady, probePcmBackend } from "./pcm-support";
import type { EngineBackend, EngineCallbacks, PrimePlan, SkipFade } from "./types";

let chosen: EngineBackend | null = null;

void probePcmBackend();

function backend(): EngineBackend {
  if (chosen === null) chosen = pcmBackendReady() ? pcm : decks;
  return chosen;
}

export function canPlayMime(mimeType: string): boolean {
  return (chosen ?? (pcmBackendReady() ? pcm : decks)).canPlayMime(mimeType);
}

export function connectEngine(next: EngineCallbacks): void {
  decks.connectEngine(next);
  pcm.connectEngine(next);
}

export function loadAndPlay(url: string, volume: number, muted: boolean, startSeconds = 0): number {
  return backend().loadAndPlay(url, volume, muted, startSeconds);
}

export function crossfadeTo(url: string, fade: SkipFade, volume: number, muted: boolean, startSeconds = 0): number {
  return backend().crossfadeTo(url, fade, volume, muted, startSeconds);
}

export function loadAt(url: string, seconds: number, volume: number, muted: boolean): void {
  backend().loadAt(url, seconds, volume, muted);
}

export function prime(plan: PrimePlan): void {
  backend().prime(plan);
}

export function cancelPrime(): void {
  backend().cancelPrime();
}

export function primedUrl(): string | null {
  return backend().primedUrl();
}

export function setActiveTrackGain(factor: number): void {
  backend().setActiveTrackGain(factor);
}

export function resume(): void {
  backend().resume();
}

export function pause(): void {
  backend().pause();
}

export function seek(seconds: number): void {
  backend().seek(seconds);
}

export function applyVolume(volume: number, muted: boolean): void {
  backend().applyVolume(volume, muted);
}

export function stop(): void {
  backend().stop();
}
