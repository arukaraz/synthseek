"use client";

import { Ban, CheckCircle2, EyeOff, ListFilter, RotateCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { BulkActionBar } from "@components/ui/BulkActionBar";
import { Button } from "@components/ui/Button";
import type { CheckboxPreview } from "@components/ui/Checkbox";
import { DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { EmptyState } from "@components/ui/EmptyState";
import { Input } from "@components/ui/Input";
import { Notice } from "@components/ui/Notice";
import { Pagination } from "@components/ui/Pagination";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { Spinner } from "@components/ui/Spinner";
import {
  useIgnoreUnidentified,
  useRetryUnidentified,
  useStopIgnoringUnidentified,
} from "@hooks/api/mutations/library/useUnidentifiedActions";
import { useUnidentifiedFiles } from "@hooks/api/queries/useUnidentifiedFiles";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useRangePreview } from "@hooks/ui/useRangePreview";
import { useSelection } from "@hooks/ui/useSelection";

import { REVIEW_DEFAULT_PAGE_SIZE, REVIEW_LAYOUT_ID, REVIEW_PAGE_SIZES } from "../constants";
import {
  centered,
  emptyBox,
  errorText,
  groupList,
  panelBody,
  panelDescription,
  panelFooter,
  panelGrid,
  panelHeader,
  panelHeaderText,
  panelTabs,
  panelTools,
  toolField,
  toolRow,
} from "../styles";
import type { ReviewListProps, ReviewTab } from "../types";
import { GroupRow } from "./GroupRow";

export function ReviewList({ enabled, active, onMatchAlbum, onMatchSong }: ReviewListProps) {
  const { t } = useTranslation("settings");
  const [tab, setTab] = useState<ReviewTab>("review");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(REVIEW_DEFAULT_PAGE_SIZE);
  const search = useDebounce(filter.trim());
  const selection = useSelection<{ id: string }>();
  const { previewId, trackRow } = useRangePreview();

  const list = useUnidentifiedFiles({ tab, page, pageSize, search: search.length > 0 ? search : undefined }, enabled);
  const retry = useRetryUnidentified();
  const ignore = useIgnoreUnidentified();
  const stopIgnoring = useStopIgnoringUnidentified();
  const busy = retry.isPending || ignore.isPending || stopIgnoring.isPending;

  const groups = list.data?.groups ?? [];
  const counts = list.data?.counts ?? { review: 0, ignored: 0 };
  const totalGroups = list.data?.totalGroups ?? 0;
  const orderedKeys = groups.map((group) => group.key);
  const preview = previewId ? selection.rangeTo(orderedKeys, previewId) : null;
  const previewKeys = new Set(preview?.ids ?? []);
  const previewToneFor = (key: string): CheckboxPreview =>
    previewKeys.has(key) ? (preview?.selected ? "select" : "clear") : "none";
  const selectedFileIds = groups
    .filter((group) => selection.isSelected(group.key))
    .flatMap((group) => group.files.map((file) => file.id));

  useEffect(() => {
    if (!list.data || search.length > 0) return;
    const other: ReviewTab = tab === "review" ? "ignored" : "review";
    if (list.data.counts[tab] === 0 && list.data.counts[other] > 0) {
      setTab(other);
      setPage(1);
    }
  }, [list.data, search, tab]);

  useEffect(() => {
    if (!list.data || list.data.groups.length > 0 || list.data.totalGroups === 0 || page === 1) return;
    setPage(Math.max(1, Math.ceil(list.data.totalGroups / pageSize)));
  }, [list.data, page, pageSize]);

  const resetView = () => {
    setPage(1);
    selection.clear();
  };

  const emptyCopy =
    search.length > 0
      ? {
          title: t("libraryScan.review.empty.filterTitle", { query: search }),
          body: t("libraryScan.review.empty.filterBody"),
        }
      : tab === "review"
        ? { title: t("libraryScan.review.empty.reviewTitle"), body: t("libraryScan.review.empty.reviewBody") }
        : { title: t("libraryScan.review.empty.ignoredTitle"), body: t("libraryScan.review.empty.ignoredBody") };

  return (
    <div className={panelGrid()}>
      <div className={panelHeader()}>
        {active ? (
          <div className={panelHeaderText()}>
            <DialogTitle>{t("libraryScan.review.title")}</DialogTitle>
            <DialogDescription className={panelDescription()}>{t("libraryScan.review.description")}</DialogDescription>
          </div>
        ) : null}
      </div>

      <div className={panelTabs()}>
        <SegmentTabs
          layoutId={REVIEW_LAYOUT_ID}
          ariaLabel={t("libraryScan.review.tabs.ariaLabel")}
          value={tab}
          onValueChange={(next) => {
            setTab(next);
            resetView();
          }}
          items={[
            { value: "review", label: t("libraryScan.review.tabs.review"), count: counts.review },
            { value: "ignored", label: t("libraryScan.review.tabs.ignored"), count: counts.ignored },
          ]}
        />
      </div>

      <div className={panelTools()}>
        <div className={toolRow()}>
          <div className={toolField()}>
            <Input
              type="search"
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                resetView();
              }}
              placeholder={t("libraryScan.review.filterPlaceholder")}
              aria-label={t("libraryScan.review.filterPlaceholder")}
            />
          </div>
          {tab === "review" ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => retry.mutate({ kind: "all" })}
              disabled={busy || counts.review === 0}
              aria-label={t("libraryScan.review.tryAllAgain")}
            >
              <RotateCw aria-hidden />
              <span className="hidden sm:inline">{t("libraryScan.review.tryAllAgain")}</span>
            </Button>
          ) : null}
        </div>
        {list.data?.truncated ? (
          <Notice variant="info" icon={ListFilter} title={t("libraryScan.review.truncatedTitle")}>
            {tab === "review"
              ? t("libraryScan.review.truncatedNotice")
              : t("libraryScan.review.truncatedIgnoredNotice")}
          </Notice>
        ) : null}
        {tab === "ignored" && counts.ignored > 0 ? (
          <Notice variant="info" icon={EyeOff} title={t("libraryScan.review.tabs.ignored")}>
            {t("libraryScan.review.ignoredNotice")}
          </Notice>
        ) : null}
        {tab === "review" && selection.selectedCount > 0 ? (
          <BulkActionBar
            count={selection.selectedCount}
            countLabel={t("libraryScan.review.selectedGroups", { count: selection.selectedCount })}
            clearLabel={t("libraryScan.review.clear")}
            onClear={selection.clear}
            actions={[
              {
                icon: RotateCw,
                label: t("libraryScan.review.actions.retry"),
                disabled: busy,
                onClick: () => {
                  retry.mutate({ kind: "files", fileIds: selectedFileIds });
                  selection.clear();
                },
              },
              {
                icon: Ban,
                label: t("libraryScan.review.actions.ignore"),
                disabled: busy,
                onClick: () => {
                  ignore.mutate({ fileIds: selectedFileIds });
                  selection.clear();
                },
              },
            ]}
          />
        ) : null}
      </div>

      <div className={panelBody()}>
        {list.isLoading ? (
          <div className={centered()}>
            <Spinner size="md" />
          </div>
        ) : list.isError ? (
          <p className={errorText()}>{t("libraryScan.review.loadError")}</p>
        ) : groups.length === 0 ? (
          <EmptyState
            className={emptyBox()}
            icon={search.length > 0 ? Search : CheckCircle2}
            title={emptyCopy.title}
            description={emptyCopy.body}
          />
        ) : (
          <ul className={groupList()}>
            {groups.map((group) => (
              <GroupRow
                key={group.key}
                group={group}
                tab={tab}
                selected={selection.isSelected(group.key)}
                previewTone={previewToneFor(group.key)}
                busy={busy}
                onSelect={(extend) =>
                  extend ? selection.extendTo(orderedKeys, group.key) : selection.toggle(group.key)
                }
                onPreviewHover={(hovering) => trackRow(hovering ? group.key : null)}
                onMatchAlbum={() => onMatchAlbum(group)}
                onMatchSong={(file) => onMatchSong(group, file)}
                onRetry={(fileIds) => retry.mutate({ kind: "files", fileIds })}
                onIgnore={(fileIds) => ignore.mutate({ fileIds })}
                onStopIgnoring={(fileIds) => stopIgnoring.mutate({ fileIds, searchAgain: true })}
              />
            ))}
          </ul>
        )}
      </div>

      <div className={panelFooter()}>
        {totalGroups > 0 ? (
          <Pagination
            page={page}
            pageCount={Math.max(1, Math.ceil(totalGroups / pageSize))}
            pageSize={pageSize}
            totalItems={totalGroups}
            pageSizeOptions={REVIEW_PAGE_SIZES}
            onPageChange={(next) => {
              setPage(next);
              selection.clear();
            }}
            onPageSizeChange={(size) => {
              setPageSize(size);
              resetView();
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
