"use client";

import { Search, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Popover, PopoverAnchor, PopoverContent } from "@components/ui/Popover";
import { getFlatResults } from "@features/search/components/SearchResultsWidget/helpers";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { settingsHomeFor } from "@features/settings/helpers";
import { useSearchContent } from "@hooks/api/queries/useSearchContent";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { HeaderTab } from "../../HeaderTab";
import { OMNI_DEBOUNCE_MS, OMNI_GOTO_HINTS, OMNI_LIST_ID, OMNI_RESULT_LIMIT } from "../constants";
import { omniOptions, optionId, resultOption, scopeTypes } from "../helpers";
import {
  clearButton,
  dropdownPanel,
  kbd,
  navChips,
  omniField,
  omniFieldIcon,
  omniInput,
  omniPill,
  omniPlaceholder,
  pillSeparator,
} from "../styles";
import type { OmniBarProps, OmniOption } from "../types";
import { OmniDropdown } from "./OmniDropdown";
import { OmniScopes } from "./OmniScopes";

export function OmniBar({ omni, navItems }: OmniBarProps) {
  const { t } = useTranslation("components");
  const { isAdmin } = useAuthContext();
  const router = useRouter();
  const { openForResult } = useContentRequestFlow();
  const pillRef = useRef<HTMLDivElement>(null);
  const query = useDebounce(omni.draft.trim(), { delay: OMNI_DEBOUNCE_MS });
  const { data } = useSearchContent(query, scopeTypes(omni.scope), { enabled: omni.open, limit: OMNI_RESULT_LIMIT });

  const results = useMemo(() => getFlatResults(data?.results).slice(0, OMNI_RESULT_LIMIT).map(resultOption), [data]);
  const gotos = useMemo(
    (): OmniOption[] => [
      ...navItems.flatMap((item): OmniOption[] => {
        const hint = OMNI_GOTO_HINTS[item.href];
        return hint
          ? [
              {
                kind: "goto",
                key: `goto:${item.href}`,
                href: item.href,
                icon: item.icon,
                title: item.label,
                subtitle: t(hint),
              },
            ]
          : [];
      }),
      {
        kind: "goto",
        key: "goto:settings",
        href: settingsHomeFor(isAdmin),
        icon: Settings,
        title: t("header.settings"),
        subtitle: t("header.omni.goSettings"),
      },
    ],
    [isAdmin, navItems, t]
  );
  const options = omniOptions(omni.draft, omni.recent, results, gotos);

  const select = (option: OmniOption) => {
    if (option.kind === "result") {
      omni.remember(omni.draft);
      omni.close();
      openForResult(option.item);
    } else if (option.kind === "goto") {
      omni.close();
      router.push(option.href);
    } else {
      omni.submit(option.query);
    }
  };

  return (
    <Popover
      open={omni.open}
      onOpenChange={(open) => {
        if (!open) omni.close();
      }}
    >
      <PopoverAnchor asChild>
        <div ref={pillRef} role="search" className={omniPill({ open: omni.open })}>
          {omni.open ? (
            <OmniScopes layout="inline" value={omni.scope} onChange={omni.changeScope} />
          ) : (
            <nav aria-label={t("header.primaryNav")} className={navChips()}>
              {navItems.map((item) => (
                <HeaderTab
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={item.isActive}
                />
              ))}
            </nav>
          )}
          <span className={pillSeparator()} aria-hidden />
          {omni.open ? (
            <div className={omniField({ open: true })}>
              <Search className={omniFieldIcon()} aria-hidden />
              <input
                ref={omni.inputRef}
                type="search"
                role="combobox"
                aria-expanded
                aria-controls={OMNI_LIST_ID}
                aria-autocomplete="list"
                aria-activedescendant={omni.highlighted >= 0 ? optionId(omni.highlighted) : undefined}
                aria-label={t("header.search")}
                autoComplete="off"
                spellCheck={false}
                value={omni.draft}
                placeholder={t("header.omni.inputPlaceholder")}
                className={omniInput()}
                onChange={(event) => omni.changeDraft(event.target.value)}
                onKeyDown={(event) =>
                  omni.handleKeyDown(event, options.length, (index) => {
                    const option = options[index];
                    if (option) select(option);
                  })
                }
              />
              {omni.draft ? (
                <button
                  type="button"
                  className={clearButton()}
                  aria-label={t("header.clearSearch")}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => omni.changeDraft("")}
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          ) : (
            <button type="button" className={omniField()} aria-label={t("header.search")} onClick={omni.openSearch}>
              <Search className={omniFieldIcon()} aria-hidden />
              <span className={omniPlaceholder()}>{omni.draft || t("header.omni.placeholder")}</span>
              {omni.shortcutEnabled ? (
                <kbd className={kbd()}>
                  {omni.appleKeys ? t("header.omni.shortcutMac") : t("header.omni.shortcutOther")}
                </kbd>
              ) : null}
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={8}
        className={dropdownPanel()}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (event.target instanceof Node && pillRef.current?.contains(event.target)) event.preventDefault();
        }}
      >
        <OmniDropdown omni={omni} options={options} onSelect={select} />
      </PopoverContent>
    </Popover>
  );
}
