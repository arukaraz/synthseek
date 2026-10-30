import { useCallback, useMemo, useState } from "react";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type {
  QuestionQuery,
  RecapPeriod,
  WidgetAccent,
  WidgetAction,
  WidgetBlock,
  WidgetDraft,
  WidgetIcon,
  WidgetPreset,
  WidgetQuery,
} from "@hooks/api/queries/widgets/types";
import { useDebounce } from "@hooks/ui/useDebounce";

import { PREVIEW_DEBOUNCE_MS, RECAP_SUBJECT } from "../components/WidgetWorkshop/constants";
import {
  acceptedBlocksOf,
  draftKeyOf,
  fittingBlocksOf,
  kindOf,
  listsTracksOf,
  presetDraftOf,
  ruleListOf,
  rulesFrom,
  withFittingPlaylist,
  withFittingView,
  withSubject,
} from "../components/WidgetWorkshop/helpers";
import type {
  RecipeSubject,
  RuleDraft,
  SmartRefresh,
  RuleMode,
  RuleTarget,
  WidgetKind,
  WidgetRule,
  WidgetWorkshopState,
  WorkshopContext,
  WorkshopOpening,
} from "../components/WidgetWorkshop/types";
import { DEFAULT_QUERIES, DEFAULT_RECAP } from "../constants";

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

  const { purpose } = opening;
  const change = useCallback(
    (next: (current: WidgetDraft) => WidgetDraft) =>
      setDraft((current) => {
        const fitted = withFittingView(next(current), catalog, grammar);
        return purpose === "widget" ? withFittingPlaylist(fitted) : fitted;
      }),
    [catalog, grammar, purpose]
  );

  const setPlaylist = useCallback(
    (refresh: SmartRefresh | null) =>
      setDraft((current) => ({
        ...current,
        playlist: refresh === null ? null : { refresh, playlistId: current.playlist?.playlistId ?? null },
      })),
    []
  );

  const linkPlaylist = useCallback(
    (playlistId: string) =>
      setDraft((current) =>
        current.playlist ? { ...current, playlist: { ...current.playlist, playlistId } } : current
      ),
    []
  );

  const setQuery = useCallback((query: WidgetQuery) => change((current) => ({ ...current, query })), [change]);

  const updateQuestion = useCallback(
    (update: (question: QuestionQuery) => QuestionQuery) =>
      change((current) => (current.query.type === "question" ? { ...current, query: update(current.query) } : current)),
    [change]
  );

  const setRecapPeriod = useCallback(
    (period: RecapPeriod) =>
      change((current) =>
        current.query.type === "recap" ? { ...current, query: { ...current.query, period } } : current
      ),
    [change]
  );

  const setRecipeSubject = useCallback(
    (subject: RecipeSubject) => {
      setRuleDraft(null);
      change((current) => {
        if (subject === RECAP_SUBJECT)
          return current.query.type === "recap" ? current : { ...current, query: DEFAULT_RECAP };
        const base = current.query.type === "question" ? current.query : DEFAULT_QUERIES.question;
        return { ...current, query: withSubject(base, subject, grammar) };
      });
    },
    [change, grammar]
  );

  const setKind = useCallback(
    (kind: WidgetKind) => {
      const leaving = draft.query;
      const leavingKind = kindOf(leaving);
      if (leavingKind === kind) return;
      const restored = stash[kind] ?? DEFAULT_QUERIES[kind];
      setRuleDraft(null);
      setStash((saved) => ({ ...saved, [leavingKind]: leaving }));
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
        if (current.query.type === "recap") return current;
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
  const accepted = useMemo(() => acceptedBlocksOf(draft.query, catalog, grammar), [draft.query, catalog, grammar]);

  return {
    draft,
    widgetId: opening.widgetId,
    purpose,
    kind: kindOf(draft.query),
    dirty: draftKeyOf(draft) !== baseline,
    playlistable: listsTracksOf(draft.query),
    setPlaylist,
    linkPlaylist,
    fitting,
    accepted,
    ruleDraft,
    previewDraft,
    setKind,
    updateQuestion,
    setRecapPeriod,
    setRecipeSubject,
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
