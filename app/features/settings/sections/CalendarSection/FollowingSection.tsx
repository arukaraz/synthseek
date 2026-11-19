"use client";

import { UserMinus, Zap, ZapOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { BulkActionBar } from "@components/ui/BulkActionBar";
import { Button } from "@components/ui/Button";
import { Pagination } from "@components/ui/Pagination";
import { useSetAutoRequest } from "@hooks/api/mutations/artist-follow/useSetAutoRequest";
import { useUnfollowArtists } from "@hooks/api/mutations/artist-follow/useUnfollowArtists";
import type { FollowFilter, FollowSort } from "@hooks/api/queries/artist-follow/types";
import { useFollowList } from "@hooks/api/queries/artist-follow/useFollowList";
import { useSelection } from "@hooks/ui/useSelection";
import { useUrlParams } from "@hooks/ui/useUrlParam";

import { MostPlayedDialog } from "../../components/MostPlayedDialog";
import { FollowingEmpty } from "./components/FollowingEmpty";
import { FollowingTable } from "./components/FollowingTable";
import { FollowingToolbar } from "./components/FollowingToolbar";
import { FOLLOWING_URL_SCHEMA } from "./constants";
import { calendarStack, hintText, pagerRow, placeholderGrid, statusBox } from "./styles";

export function FollowingSection() {
  const { t } = useTranslation("follows");
  const { values, set, setMany } = useUrlParams(FOLLOWING_URL_SCHEMA);
  const selection = useSelection<{ id: string }>();
  const setAutoRequest = useSetAutoRequest();
  const { unfollow } = useUnfollowArtists();
  const [dialogOpen, setDialogOpen] = useState(false);

  const page = Number(values.page) || 1;
  const list = useFollowList({ search: values.q || undefined, sort: values.sort, filter: values.filter, page });
  const data = list.data;
  const items = data?.items ?? [];

  const reset = (changes: Parameters<typeof setMany>[0]) => {
    selection.clear();
    setMany({ ...changes, page: null });
  };

  const selectedItems = items.filter((item) => selection.isSelected(item.catalogArtistId));
  const selectedIds = selectedItems.map((item) => item.catalogArtistId);

  const bulkUnfollow = async () => {
    const ok = await unfollow(
      selectedItems.map((item) => ({ catalogArtistId: item.catalogArtistId, name: item.name }))
    );
    if (ok) selection.clear();
  };

  const bulkAuto = (autoRequest: boolean) => {
    setAutoRequest.mutate({ catalogArtistIds: selectedIds, autoRequest });
  };

  if (list.isError && data === undefined) {
    return (
      <div className={statusBox()} role="alert">
        <p className={hintText()}>{t("following.loadError")}</p>
        <Button variant="secondary" size="sm" onClick={() => void list.refetch()}>
          {t("releases.retry")}
        </Button>
      </div>
    );
  }

  if (data === undefined) {
    return <div className={placeholderGrid()} role="status" aria-label={t("releases.loading")} />;
  }

  if (data.total === 0) {
    return (
      <div data-anchor-target="followed-artists">
        <FollowingEmpty onFollowMostPlayed={() => setDialogOpen(true)} />
        <MostPlayedDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    );
  }

  return (
    <div className={calendarStack()} data-anchor-target="followed-artists">
      <FollowingToolbar
        search={values.q ?? ""}
        sort={values.sort}
        filter={values.filter}
        matching={data.matching}
        total={data.total}
        withAutoRequest={data.withAutoRequest}
        onSearch={(next) => reset({ q: next || null })}
        onSort={(next: FollowSort) => reset({ sort: next })}
        onFilter={(next: FollowFilter) => reset({ filter: next })}
        onFollowMostPlayed={() => setDialogOpen(true)}
      />
      {selection.selectedCount > 0 ? (
        <BulkActionBar
          count={selection.selectedCount}
          countLabel={t("following.selectedLabel", { count: selection.selectedCount })}
          clearLabel={t("following.clear")}
          onClear={selection.clear}
          actions={[
            { icon: Zap, label: t("following.autoOn"), onClick: () => bulkAuto(true) },
            { icon: ZapOff, label: t("following.autoOff"), onClick: () => bulkAuto(false) },
            { icon: UserMinus, label: t("following.unfollow"), onClick: () => void bulkUnfollow() },
          ]}
        />
      ) : null}
      {items.length === 0 ? (
        <div className={statusBox()}>
          <p className={hintText()}>{t("following.noMatch", { query: values.q ?? "" })}</p>
          <Button variant="secondary" size="sm" onClick={() => reset({ q: null, filter: null })}>
            {t("following.clearSearch")}
          </Button>
        </div>
      ) : (
        <FollowingTable items={items} selection={selection} />
      )}
      <Pagination
        className={pagerRow()}
        page={data.page}
        pageSize={data.pageSize}
        pageCount={Math.max(1, Math.ceil(data.matching / data.pageSize))}
        totalItems={data.matching}
        pageSizeOptions={[data.pageSize]}
        onPageChange={(next) => {
          selection.clear();
          set("page", next === 1 ? null : String(next));
        }}
        onPageSizeChange={() => undefined}
      />
      <MostPlayedDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
