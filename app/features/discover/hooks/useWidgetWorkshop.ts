import { useCallback, useMemo, useState } from "react";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type {
  QuestionQuery,
  WidgetAccent,
  WidgetAction,
  WidgetBlock,
  WidgetDraft,
  WidgetIcon,
  WidgetPreset,
  WidgetQuery,
} from "@hooks/api/queries/widgets/types";
import { useDebounce } from "@hooks/ui/useDebounce";

import { PREVIEW_DEBOUNCE_MS } from "../components/WidgetWorkshop/constants";
import {
  draftKeyOf,
  fittingBlocksOf,
  presetDraftOf,
  ruleListOf,
  rulesFrom,
  withFittingView,
} from "../components/WidgetWorkshop/helpers";
import type {
  RuleDraft,
  RuleMode,
  RuleTarget,
  WidgetKind,
  WidgetRule,
  WidgetWorkshopState,
  WorkshopContext,
  WorkshopOpening,
} from "../components/WidgetWorkshop/types";
import { DEFAULT_QUERIES } from "../constants";

export function useWidgetWorkshop(
  opening: WorkshopOpening,
  { catalog, grammar }: WorkshopContext
): WidgetWorkshopState {
  const [initial] = useState(() => withFittingView(opening.draft, catalog, grammar));
  const [baseline] = useState(() => draftKeyOf(initial));
  const [draft, setDraft] = useState<WidgetDraft>(initial);
  const [stash, setStash] = useState<Partial<Record<WidgetKind, WidgetQuery>>>({});
  const [ruleDraft, setRuleDraft] = useState<RuleDraft | null>(null);
  const previewDraft = useDebounce(draft, { delay: PREVIEW_DEBOUNCE_MS });

  const change = useCallback(
    (next: (current: WidgetDraft) => WidgetDraft) =>
      setDraft((current) => withFittingView(next(current), catalog, grammar)),
    [catalog, grammar]
  );

  const setQuery = useCallback((query: WidgetQuery) => change((current) => ({ ...current, query })), [change]);

  const updateQuestion = useCallback(
    (update: (question: QuestionQuery) => QuestionQuery) =>
      change((current) => (current.query.type === "question" ? { ...current, query: update(current.query) } : current)),
    [change]
  );

  const setKind = useCallback(
    (kind: WidgetKind) => {
      if (draft.query.type === kind) return;
      const leaving = draft.query;
      const restored = stash[kind] ?? DEFAULT_QUERIES[kind];
      setRuleDraft(null);
      setStash((saved) => ({ ...saved, [leaving.type]: leaving }));
      change((current) => ({ ...current, query: restored }));
    },
    [change, draft.query, stash]
  );

  const applyPreset = useCallback(
    (preset: WidgetPreset) => {
      setRuleDraft(null);
      change((current) => {
        const named = presetDraftOf(preset, current.meta.name);
        return { ...named, meta: { ...named.meta, description: current.meta.description } };
      });
    },
    [change]
  );

  const setView = useCallback(
    (view: Partial<WidgetDraft["view"]>) => setDraft((current) => ({ ...current, view: { ...current.view, ...view } })),
    []
  );

  const setMeta = useCallback(
    (meta: Partial<WidgetDraft["meta"]>) => setDraft((current) => ({ ...current, meta: { ...current.meta, ...meta } })),
    []
  );

  const writeRules = useCallback(
    (write: (list: WidgetRule[], mode: RuleMode) => { list: WidgetRule[]; mode: RuleMode }) =>
      change((current) => {
        const { mode, list } = ruleListOf(current.query.rules);
        const next = write([...list], mode);
        return { ...current, query: { ...current.query, rules: rulesFrom(next.mode, next.list) } };
      }),
    [change]
  );

  const commitRule = useCallback(() => {
    if (!ruleDraft) return;
    const { target, rule } = ruleDraft;
    writeRules((list, mode) => ({
      mode,
      list:
        target.kind === "new" ? [...list, rule] : list.map((entry, index) => (index === target.index ? rule : entry)),
    }));
    setRuleDraft(null);
  }, [ruleDraft, writeRules]);

  const removeRule = useCallback(
    (index: number) => {
      setRuleDraft(null);
      writeRules((list, mode) => ({ mode, list: list.filter((_, position) => position !== index) }));
    },
    [writeRules]
  );

  const setRuleMode = useCallback((mode: RuleMode) => writeRules((list) => ({ mode, list })), [writeRules]);

  const clearRules = useCallback(() => {
    setRuleDraft(null);
    writeRules((_, mode) => ({ mode, list: [] }));
  }, [writeRules]);

  const fitting = useMemo(() => fittingBlocksOf(draft.query, catalog, grammar), [draft.query, catalog, grammar]);

  return {
    draft,
    widgetId: opening.widgetId,
    kind: draft.query.type,
    dirty: draftKeyOf(draft) !== baseline,
    fitting,
    ruleDraft,
    previewDraft,
    setKind,
    updateQuestion,
    setQuery,
    applyPreset,
    setBlock: (block: WidgetBlock) => setView({ block }),
    setAction: (action: WidgetAction) => setView({ action }),
    setAccent: (accent: WidgetAccent) => setMeta({ accent }),
    setName: (name: string) => setMeta({ name }),
    setDescription: (description: string) => setMeta({ description }),
    setIcon: (icon: WidgetIcon) => setMeta({ icon }),
    setSize: (defaultSize: BoardSize) => setDraft((current) => ({ ...current, defaultSize })),
    openRule: (target: RuleTarget, rule: WidgetRule) => setRuleDraft({ target, rule }),
    changeRule: (rule: WidgetRule) => setRuleDraft((current) => (current ? { ...current, rule } : current)),
    commitRule,
    closeRule: () => setRuleDraft(null),
    removeRule,
    clearRules,
    setRuleMode,
  };
}
