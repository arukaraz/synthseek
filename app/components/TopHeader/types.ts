import type { LucideIcon } from "lucide-react";

import type { ContentType, FilterType, MusicItem } from "@api/__generated__/types";
import type { OmniSearchState } from "@hooks/ui/omni/types";
import type { PrimaryNavItem } from "@hooks/ui/types";

export interface TopHeaderProps {
  onSearch: (query: string, scope: FilterType) => void;
  initialQuery: string;
  initialScope: FilterType;
}

export type OmniState = OmniSearchState<FilterType>;

export type OmniOption =
  | {
      kind: "result";
      key: string;
      title: string;
      subtitle: string;
      image: string | undefined;
      type: ContentType;
      item: MusicItem;
    }
  | { kind: "recent"; key: string; query: string }
  | { kind: "seeAll"; key: string; query: string }
  | { kind: "goto"; key: string; href: string; icon: LucideIcon; title: string; subtitle: string };

export interface OmniOptionText {
  title: string;
  subtitle: string;
}

export interface OmniBarProps {
  omni: OmniState;
  navItems: PrimaryNavItem[];
}

export interface OmniDropdownProps {
  omni: OmniState;
  options: OmniOption[];
  onSelect: (option: OmniOption) => void;
}

export interface OmniOptionRowProps {
  option: OmniOption;
  id: string;
  highlighted: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export interface OmniScopesProps {
  value: FilterType;
  onChange: (scope: FilterType) => void;
  layout: "inline" | "row";
}
