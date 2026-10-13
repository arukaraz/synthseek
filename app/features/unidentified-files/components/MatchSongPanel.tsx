"use client";

import { AlertTriangle, Ban, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Notice } from "@components/ui/Notice";
import { Spinner } from "@components/ui/Spinner";
import {
  useAssignUnidentified,
  useIgnoreUnidentified,
  useResolveUnidentifiedLink,
} from "@hooks/api/mutations/library/useUnidentifiedActions";
import { useUnidentifiedSongCandidates } from "@hooks/api/queries/useUnidentifiedFiles";

import { lengthLabel } from "../helpers";
import {
  centered,
  errorText,
  footerActions,
  footerButtons,
  footerNote,
  noticeStack,
  panelBody,
  panelFooter,
  panelTools,
  resultList,
  stepGrid,
  toolField,
  toolRow,
} from "../styles";
import type { MatchSongPanelProps, SongCandidate } from "../types";
import { LinkField } from "./LinkField";
import { SongCandidateRow } from "./SongCandidateRow";
import { StepHeader } from "./StepHeader";

export function MatchSongPanel({ group, file, onBack }: MatchSongPanelProps) {
  const { t } = useTranslation("settings");
  const startArtist = file.artist ?? group.artist ?? "";
  const [artist, setArtist] = useState(startArtist);
  const [title, setTitle] = useState(file.title);
  const [query, setQuery] = useState({ artist: startArtist, title: file.title });
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [linked, setLinked] = useState<SongCandidate | null>(null);
  const [linkMissed, setLinkMissed] = useState(false);

  const search = useUnidentifiedSongCandidates({ fileId: file.id, ...query }, true);
  const assign = useAssignUnidentified();
  const ignore = useIgnoreUnidentified();
  const resolveLink = useResolveUnidentifiedLink();

  const found = search.data?.candidates ?? [];
  const shown = linked && !found.some((candidate) => candidate.trackId === linked.trackId) ? [linked, ...found] : found;
  const firstSame = shown[0]?.verdict === "same" ? shown[0].trackId : null;
  const pickedId = chosenId ?? firstSame;
  const picked = shown.find((candidate) => candidate.trackId === pickedId) ?? null;
  const risky = picked?.verdict === "different_version" || picked?.verdict === "different_song";

  return (
    <div className={stepGrid()}>
      <StepHeader
        title={t("libraryScan.review.actions.matchSong")}
        description={`${file.relativePath} · ${lengthLabel(file.durationSeconds)}`}
        onBack={onBack}
      />

      <div className={panelTools()}>
        <form
          className={toolRow()}
          onSubmit={(event) => {
            event.preventDefault();
            setChosenId(null);
            setQuery({ artist, title });
          }}
        >
          <div className={toolField()}>
            <Input
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder={t("libraryScan.review.match.artist")}
              aria-label={t("libraryScan.review.match.artist")}
            />
          </div>
          <div className={toolField()}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("libraryScan.review.match.song")}
              aria-label={t("libraryScan.review.match.song")}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            <Search aria-hidden />
            {t("libraryScan.review.match.search")}
          </Button>
        </form>
        <LinkField
          placeholder={t("libraryScan.review.match.linkForSong")}
          pending={resolveLink.isPending}
          notFound={linkMissed}
          onSubmit={(url) =>
            resolveLink.mutate(
              { url, fileId: file.id },
              {
                onSuccess: (result) => {
                  setLinkMissed(!result.found);
                  if (!result.found) return;
                  setLinked(result.song);
                  setChosenId(result.song.trackId);
                },
              }
            )
          }
        />
      </div>

      <div className={panelBody()}>
        {search.isLoading ? (
          <div className={centered()}>
            <Spinner size="md" label={t("libraryScan.review.match.searching")} />
          </div>
        ) : search.isError ? (
          <p className={errorText()}>{t("libraryScan.review.match.searchFailed")}</p>
        ) : shown.length === 0 ? (
          <Notice variant="info" icon={Search} title={file.title}>
            {t("libraryScan.review.match.noSongs")}
          </Notice>
        ) : (
          <>
            <div className={resultList()}>
              {shown.map((candidate) => (
                <SongCandidateRow
                  key={candidate.trackId}
                  candidate={candidate}
                  fileDurationSeconds={file.durationSeconds}
                  picked={candidate.trackId === pickedId}
                  onPick={() => setChosenId(candidate.trackId)}
                />
              ))}
            </div>
            {picked && risky ? (
              <div className={noticeStack()}>
                <Notice variant="warning" icon={AlertTriangle} title={picked.title}>
                  {picked.verdict === "different_song"
                    ? t("libraryScan.review.match.differentSong")
                    : t("libraryScan.review.match.versionWarning", { file: file.title, song: picked.title })}
                </Notice>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className={panelFooter()}>
        <div className={footerActions()}>
          <span className={footerNote()}>{t("libraryScan.review.match.secondCopy")}</span>
          <div className={footerButtons()}>
            <Button
              variant="secondary"
              size="sm"
              disabled={ignore.isPending}
              onClick={() => ignore.mutate({ fileIds: [file.id] }, { onSuccess: onBack })}
            >
              <Ban aria-hidden />
              {t("libraryScan.review.match.ignore")}
            </Button>
            <Button
              size="sm"
              disabled={picked === null || assign.isPending}
              onClick={() => {
                if (picked === null) return;
                assign.mutate({ pairs: [{ fileId: file.id, trackId: picked.trackId }] }, { onSuccess: onBack });
              }}
            >
              {assign.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {risky ? t("libraryScan.review.match.addAnyway") : t("libraryScan.review.match.addToLibrary")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
