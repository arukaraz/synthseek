import { PCM_CODEC_PROBES, PCM_NATIVE_MIMES, PCM_REQUIRED_MIMES } from "./constants";

let playable: ReadonlySet<string> = new Set();
let ready = false;
let probed: Promise<boolean> | null = null;

async function supported(config: AudioDecoderConfig): Promise<boolean> {
  try {
    return (await AudioDecoder.isConfigSupported(config)).supported === true;
  } catch {
    return false;
  }
}

export function probePcmBackend(): Promise<boolean> {
  if (probed !== null) return probed;
  probed = (async () => {
    if (typeof AudioDecoder === "undefined" || typeof AudioContext === "undefined") return false;
    const answers = await Promise.all(
      PCM_CODEC_PROBES.map(async (probe) => ({ mime: probe.mime, ok: await supported(probe.config) }))
    );
    playable = new Set(answers.filter((answer) => answer.ok).map((answer) => answer.mime));
    ready = PCM_REQUIRED_MIMES.every((mime) => playable.has(mime));
    return ready;
  })();
  return probed;
}

export function pcmBackendReady(): boolean {
  return ready;
}

export function pcmCanPlay(mimeType: string): boolean {
  return PCM_NATIVE_MIMES.has(mimeType) || playable.has(mimeType);
}
