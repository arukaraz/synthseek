import type { PlaylistSetQuery, PlaylistSetWidgetResult, SetGrammar, SetSlot } from "@hooks/api/queries/widgets/types";

export type SetOrigin = SetSlot["origin"];
export type SetMix = PlaylistSetQuery["mix"];
export type SetRefresh = PlaylistSetQuery["refresh"];
export type SetOnRefresh = PlaylistSetQuery["onRefresh"];
export type SetOutside = PlaylistSetQuery["outside"];
export type SetParamKind = SetGrammar["origins"][number]["param"];
export type SetOriginGrammar = Pick<SetGrammar, "origins">;

export interface SetStepProps {
  set: PlaylistSetQuery;
  grammar: SetGrammar;
  onChange: (change: (set: PlaylistSetQuery) => PlaylistSetQuery) => void;
}

export interface SetResultStepProps extends SetStepProps {
  result: PlaylistSetWidgetResult | undefined;
}

export interface SlotRowProps extends SetResultStepProps {
  slot: SetSlot;
  index: number;
}

export interface SlotParamProps {
  slot: SetSlot;
  kind: SetParamKind;
  grammar: SetGrammar;
  onChange: (param: string) => void;
}
