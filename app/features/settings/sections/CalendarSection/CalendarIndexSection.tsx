"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { FOLLOW_FIRST_PAGE } from "@hooks/api/queries/artist-follow/constants";
import { useFollowList } from "@hooks/api/queries/artist-follow/useFollowList";

import { hintText, statusBox } from "./styles";

export function CalendarIndexSection() {
  const { t } = useTranslation("follows");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const list = useFollowList(FOLLOW_FIRST_PAGE);
  const total = list.data?.total;
  const query = searchParams.toString();

  useEffect(() => {
    if (total === undefined) return;
    const tab = total === 0 ? "following" : "calendar";
    router.replace(`${pathname}/${tab}${query ? `?${query}` : ""}`);
  }, [total, router, pathname, query]);

  if (list.isError && total === undefined) {
    return (
      <div className={statusBox()} role="alert">
        <p className={hintText()}>{t("following.loadError")}</p>
        <Button variant="secondary" size="sm" onClick={() => void list.refetch()}>
          {t("releases.retry")}
        </Button>
      </div>
    );
  }

  return null;
}
