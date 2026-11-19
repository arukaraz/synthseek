"use client";

import { ArrowUpDown, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { Input } from "@components/ui/Input";
import { useDebouncedDraft } from "@hooks/ui/useDebouncedDraft";
import type { FollowFilter, FollowSort } from "@hooks/api/queries/artist-follow/types";

import { followingBar, searchBox, summaryText } from "../styles";
import type { FollowingToolbarProps } from "./types";

export function FollowingToolbar({
  search,
  sort,
  filter,
  matching,
  total,
  withAutoRequest,
  onSearch,
  onSort,
  onFilter,
  onFollowMostPlayed,
}: FollowingToolbarProps) {
  const { t } = useTranslation("follows");
  const [draft, setDraft] = useDebouncedDraft(search, onSearch);

  return (
    <div className={followingBar()}>
      <Input
        type="search"
        className={searchBox()}
        value={draft}
        placeholder={t("following.search")}
        aria-label={t("following.search")}
        onChange={(event) => setDraft(event.target.value)}
      />
      <FilterSortDropdown<FollowFilter, FollowSort>
        triggerIcon={ArrowUpDown}
        triggerLabel={t("following.sort")}
        filter={{
          value: filter,
          onChange: onFilter,
          sectionLabel: t("following.filter"),
          options: [
            { value: "all", label: t("following.filterAll") },
            { value: "autoRequest", label: t("following.filterAuto") },
          ],
        }}
        sort={{
          value: sort,
          onChange: onSort,
          sectionLabel: t("following.sort"),
          options: [
            { value: "name", label: t("following.sortName") },
            { value: "followedAt", label: t("following.sortFollowedAt") },
            { value: "latestRelease", label: t("following.sortLatest") },
          ],
        }}
      />
      <p className={summaryText()}>
        {search === "" && filter === "all"
          ? t("following.summary", { count: total })
          : t("following.summary", { count: matching })}
        {" · "}
        {t("following.withAuto", { count: withAutoRequest })}
      </p>
      <Button variant="secondary" size="sm" className="ms-auto" onClick={onFollowMostPlayed}>
        <UserPlus aria-hidden />
        {t("following.followMostPlayed")}
      </Button>
    </div>
  );
}
