"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ImageWithFallback } from "@components/ImageWithFallback";
import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import { Spinner } from "@components/ui/Spinner";
import { Switch } from "@components/ui/Switch";
import { useFollowNotice } from "@hooks/api/queries/artist-follow/useFollowNotice";
import { useMostPlayedCandidates } from "@hooks/api/queries/artist-follow/useMostPlayedCandidates";

import {
  bodyColumn,
  candidateAvatar,
  candidateCopy,
  candidateList,
  candidateName,
  candidatePlays,
  candidateRow,
  footerButtons,
  footerError,
  footerHint,
  footerStack,
  selectAllLabel,
  selectedCount,
  selectRow,
  statusBlock,
  switchCopy,
  switchLabel,
  switchRow,
} from "./styles";
import type { MostPlayedBodyProps } from "./types";

export function MostPlayedBody({ follow, running, progress, onClose }: MostPlayedBodyProps) {
  const { t } = useTranslation("follows");
  const candidates = useMostPlayedCandidates(true);
  const notice = useFollowNotice();
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  const [autoRequest, setAutoRequest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const items = candidates.data?.candidates ?? [];
  const chosen = items.filter((item) => !skipped.has(item.name));
  const allChosen = items.length > 0 && chosen.length === items.length;
  const busy = submitting || running;

  useEffect(() => {
    if (started && !running) onClose();
  }, [started, running, onClose]);

  const toggle = (name: string) => {
    setSkipped((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAll = () => setSkipped(allChosen ? new Set(items.map((item) => item.name)) : new Set());

  const confirm = async () => {
    setFailed(false);
    setSubmitting(true);
    const ok = await follow({ names: chosen.map((item) => item.name), autoRequest });
    setSubmitting(false);
    if (ok) setStarted(true);
    else setFailed(true);
  };

  if (candidates.isLoading) {
    return (
      <div className={statusBlock()}>
        <Spinner label={t("mostPlayed.loading")} />
        <span>{t("mostPlayed.loading")}</span>
      </div>
    );
  }

  if (candidates.isError) {
    return (
      <div className={statusBlock()} role="alert">
        <span>{t("mostPlayed.loadError")}</span>
        <Button variant="secondary" size="sm" onClick={() => void candidates.refetch()}>
          {t("releases.retry")}
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={statusBlock()}>
        <span>{t("mostPlayed.emptyAllFollowed")}</span>
        <Button variant="secondary" size="sm" onClick={onClose}>
          {t("mostPlayed.cancel")}
        </Button>
      </div>
    );
  }

  return (
    <div className={bodyColumn()}>
      <div className={selectRow()}>
        <label className={selectAllLabel()}>
          <Checkbox
            checked={allChosen ? true : chosen.length === 0 ? false : "indeterminate"}
            onCheckedChange={toggleAll}
            disabled={busy}
          />
          {t("mostPlayed.selectAll")}
        </label>
        <span className={selectedCount()} aria-live="polite">
          {t("mostPlayed.selectedOf", { selected: chosen.length, total: items.length })}
        </span>
      </div>
      <ul className={candidateList()} aria-label={t("mostPlayed.listLabel")}>
        {items.map((item) => (
          <li key={item.name}>
            <label className={candidateRow()}>
              <Checkbox
                checked={!skipped.has(item.name)}
                onCheckedChange={() => toggle(item.name)}
                disabled={busy}
                aria-label={t("mostPlayed.selectRow", { artist: item.name })}
              />
              <span className={candidateAvatar()}>
                <ImageWithFallback src={item.image} alt="" fill sizes="36px" />
              </span>
              <span className={candidateCopy()}>
                <span className={candidateName()}>{item.name}</span>
                <span className={candidatePlays()}>{t("mostPlayed.plays", { count: item.plays })}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className={footerStack()}>
        <div className={switchRow()}>
          <span className={switchCopy()}>
            <span id="most-played-auto" className={switchLabel()}>
              {t("mostPlayed.autoLabel")}
            </span>
            <span className={footerHint()}>
              {t("mostPlayed.autoHint")}
              {notice === "approval" ? ` ${t("popover.approval")}` : null}
              {notice === "quota" ? ` ${t("popover.quota")}` : null}
            </span>
          </span>
          <Switch
            checked={autoRequest}
            onCheckedChange={setAutoRequest}
            disabled={busy}
            aria-labelledby="most-played-auto"
          />
        </div>
        {chosen.length === 0 ? <p className={footerHint()}>{t("mostPlayed.pickOne")}</p> : null}
        {failed ? (
          <p className={footerError()} role="alert">
            {t("mostPlayed.failed")}
          </p>
        ) : null}
        {running && progress ? (
          <p className={footerHint()} role="status">
            {t("mostPlayed.progress", { done: progress.done, total: progress.total })}
          </p>
        ) : null}
        <div className={footerButtons()}>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {t("mostPlayed.cancel")}
          </Button>
          <Button onClick={() => void confirm()} disabled={chosen.length === 0 || busy}>
            {t("mostPlayed.confirm", { count: chosen.length })}
          </Button>
        </div>
      </div>
    </div>
  );
}
