export interface AlphabetIndexEntry {
  letter: string;
  offset: number;
}

export interface AlphabetIndexSlot {
  letter: string;
  target: AlphabetIndexEntry | null;
}

export interface AlphabetIndexProps {
  entries: readonly AlphabetIndexEntry[];
  letters: readonly string[];
  descending?: boolean;
  label: string;
  letterLabel: (letter: string) => string;
  onSelect: (entry: AlphabetIndexEntry) => void;
  className?: string;
}

export interface AlphabetIndexScrub {
  letter: string;
  y: number;
}
