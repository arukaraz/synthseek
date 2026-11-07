export interface ComparedCopy {
  id: string;
  src: string;
  offsetSeconds: number | null;
  loudnessLufs: number | null;
  durationSeconds: number | null;
}

export interface TimelineBounds {
  start: number;
  end: number;
}

export interface CopyComparison {
  playing: boolean;
  position: number;
  bounds: TimelineBounds;
  aligned: boolean;
  matched: boolean;
  loop: TimelineBounds | null;
  sounding: ReadonlySet<string>;
  broken: ReadonlySet<string>;
  durations: ReadonlyMap<string, number>;
  toggle: () => void;
  seek: (position: number) => void;
  toggleCopy: (id: string) => void;
  setAligned: (aligned: boolean) => void;
  setMatched: (matched: boolean) => void;
  toggleLoop: () => void;
  stop: () => void;
}
