import type { KeyboardEvent, RefObject } from "react";

export type StepDelta = -1 | 1;

export interface UseOmniSearchOptions<TScope extends string> {
  initialQuery: string;
  initialScope: TScope;
  scopes: readonly TScope[];
  shortcutEnabled: boolean;
  onSubmit: (query: string, scope: TScope) => void;
}

export interface OmniSearchState<TScope extends string> {
  open: boolean;
  draft: string;
  scope: TScope;
  recent: string[];
  highlighted: number;
  inputRef: RefObject<HTMLInputElement | null>;
  appleKeys: boolean;
  shortcutEnabled: boolean;
  openSearch: () => void;
  close: () => void;
  changeDraft: (value: string) => void;
  changeScope: (scope: TScope) => void;
  highlight: (index: number) => void;
  remember: (query: string) => void;
  submit: (query?: string) => void;
  handleKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    optionCount: number,
    activate: (index: number) => void
  ) => void;
}
