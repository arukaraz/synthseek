import type { ParseKeys } from "i18next";

import type { ChainStatus } from "../../components/OrderedChain";

export interface AttentionTileProps {
  title: string;
  count: number;
  caption: string;
  href: string;
}

export interface ConnectionRowView {
  id: string;
  name: string;
  role: string;
  status: ChainStatus;
  href: string;
}

export interface SetupCheck {
  id: string;
  labelKey: ParseKeys<"settings">;
  done: boolean;
  href: string;
}
