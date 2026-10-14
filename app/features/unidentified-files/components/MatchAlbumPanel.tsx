"use client";

import { AlertTriangle, Ban, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import { Input } from "@components/ui/Input";
import { Notice } from "@components/ui/Notice";
import { Spinner } from "@components/ui/Spinner";
import {
  useAssignUnidentified,
  useIgnoreUnidentified,
  useResolveUnidentifiedLink,
} from "@hooks/api/mutations/library/useUnidentifiedActions";
import { useUnidentifiedAlbumCandidates, useUnidentifiedAlbumProposal } from "@hooks/api/queries/useUnidentifiedFiles";

import { editionMismatch, groupFileIds, groupName, mappedTrackId } from "../helpers";
import {
  centered,
  checkLabel,
  errorText,
  footerActions,
  footerButtons,
  footerNote,
  mappingHead,
  mappingTable,
  noticeStack,
  panelBody,
  panelFooter,
  panelTools,
  resultList,
  stepGrid,
  toolField,
  toolRow,
} from "../styles";
import type { AlbumCandidate, MatchAlbumPanelProps } from "../types";
import { AlbumCandidateRow } from "./AlbumCandidateRow";
import { LinkField } from "./LinkField";
import { MappingRow } from "./MappingRow";
import { StepHeader } from "./StepHeader";

export function MatchAlbumPanel({ group, onBack }: MatchAlbumPanelProps) {
  const { t } = useTranslation("settings");
  const [artist, setArtist] = useState(group.artist ?? "");
  const [album, setAlbum] = useState(group.album ?? "");
  const [query, setQuery] = useState({ artist: group.artist ?? "", album: group.album ?? "" });
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<ReadonlyMap<string, string | null>>(new Map());
  const [ignoreLeftover, setIgnoreLeftover] = useState(false);
  const [linkMissed, setLinkMissed] = useState(false);

  const candidates = useUnidentifiedAlbumCandidates({ groupKey: group.key, ...query }, true);
  const found = candidates.data?.candidates ?? [];
  const pickedId = chosenId ?? found[0]?.id ?? null;
  const proposal = useUnidentifiedAlbumProposal({ groupKey: group.key, albumId: pickedId ?? "" }, pickedId !== null);
  const assign = useAssignUnidentified();
  const ignore = useIgnoreUnidentified();
  const resolveLink = useResolveUnidentifiedLink();

  const files = proposal.data?.files ?? [];
  const tracks = proposal.data?.tracks ?? [];
  const pairs = files.flatMap((file) => {
    const trackId = mappedTrackId(file, overrides);
    return trackId === null ? [] : [{ fileId: file.id, trackId }];
  });
  const leftover = files.filter((file) => mappedTrackId(file, overrides) === null).map((file) => file.id);
  const mismatch = editionMismatch(files, tracks, overrides);
  const linkedAlbum: AlbumCandidate | null =
    proposal.data && !found.some((candidate) => candidate.id === proposal.data.album.id)
      ? { ...proposal.data.album, matched: pairs.length, total: files.length, suggested: false }
      : null;
  const shown = linkedAlbum ? [linkedAlbum, ...found] : found;
  const searchedWithoutResult = !candidates.isFetching && candidates.isSuccess && shown.length === 0;
  const name = t("libraryScan.review.groupTitle", {
    artist: group.artist ?? t("libraryScan.review.unknownArtist"),
    name: groupName(group),
  });

  const pick = (albumId: string) => {
    setChosenId(albumId);
    setOverrides(new Map());
  };

  return (
    <div className={stepGrid()}>
      <StepHeader
        title={t("libraryScan.review.actions.matchAlbum")}
        description={`${group.folder.length > 0 ? group.folder : name} · ${t("libraryScan.review.files", { count: group.fileCount })}`}
        onBack={onBack}
      />

      <div className={panelTools()}>
        <form
          className={toolRow()}
          onSubmit={(event) => {
            event.preventDefault();
            setChosenId(null);
            setOverrides(new Map());
            setQuery({ artist, album });
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
              value={album}
              onChange={(event) => setAlbum(event.target.value)}
              placeholder={t("libraryScan.review.match.album")}
              aria-label={t("libraryScan.review.match.album")}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            <Search aria-hidden />
            {t("libraryScan.review.match.search")}
          </Button>
        </form>
        <LinkField
          placeholder={t("libraryScan.review.match.linkForAlbum")}
          pending={resolveLink.isPending}
          notFound={linkMissed}
          onSubmit={(url) =>
            resolveLink.mutate(
              { url },
              {
                onSuccess: (result) => {
                  setLinkMissed(!result.found);
                  if (result.found) pick(result.albumId);
                },
              }
            )
          }
        />
      </div>

      <div className={panelBody()}>
        {candidates.isLoading ? (
          <div className={centered()}>
            <Spinner size="md" label={t("libraryScan.review.match.searching")} />
          </div>
        ) : candidates.isError ? (
          <p className={errorText()}>{t("libraryScan.review.match.searchFailed")}</p>
        ) : searchedWithoutResult ? (
          <Notice variant="warning" icon={AlertTriangle} title={name}>
            {t("libraryScan.review.match.notFound", { name })}
          </Notice>
        ) : (
          <>
            <div className={resultList()}>
              {shown.map((candidate) => (
                <AlbumCandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  picked={candidate.id === pickedId}
                  onPick={() => pick(candidate.id)}
                />
              ))}
            </div>
            {mismatch ? (
              <div className={noticeStack()}>
                <Notice variant="warning" icon={AlertTriangle} title={proposal.data?.album.name ?? ""}>
                  {t("libraryScan.review.match.editionNotice", {
                    number: mismatch.number,
                    song: mismatch.song,
                    file: mismatch.file,
                  })}
                </Notice>
              </div>
            ) : null}
            {proposal.isLoading ? (
              <div className={centered()}>
                <Spinner size="md" />
              </div>
            ) : proposal.data ? (
              <div className={mappingTable()}>
                <div className={mappingHead()}>
                  <span>{t("libraryScan.review.match.columns.file")}</span>
                  <span>{t("libraryScan.review.match.columns.length")}</span>
                  <span>{t("libraryScan.review.match.columns.song")}</span>
                  <span>{t("libraryScan.review.match.columns.difference")}</span>
                </div>
                {files.map((file) => (
                  <MappingRow
                    key={file.id}
                    file={file}
                    tracks={tracks}
                    trackId={mappedTrackId(file, overrides)}
                    onChange={(trackId) => setOverrides((current) => new Map(current).set(file.id, trackId))}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className={panelFooter()}>
        {searchedWithoutResult ? (
          <div className={footerActions()}>
            <span className={footerNote()}>{t("libraryScan.review.match.matchedBy")}</span>
            <div className={footerButtons()}>
              <Button variant="ghost" size="sm" onClick={onBack}>
                {t("libraryScan.review.match.cancel")}
              </Button>
              <Button
                size="sm"
                disabled={ignore.isPending}
                onClick={() => ignore.mutate({ fileIds: groupFileIds(group) }, { onSuccess: onBack })}
              >
                <Ban aria-hidden />
                {t("libraryScan.review.match.ignoreFiles", { count: group.fileCount })}
              </Button>
            </div>
          </div>
        ) : (
          <div className={footerActions()}>
            {leftover.length > 0 ? (
              <label className={checkLabel()}>
                <Checkbox checked={ignoreLeftover} onCheckedChange={(checked) => setIgnoreLeftover(checked === true)} />
                {t("libraryScan.review.match.ignoreLeftover", { count: leftover.length })}
              </label>
            ) : (
              <span />
            )}
            <div className={footerButtons()}>
              <Button variant="ghost" size="sm" onClick={onBack}>
                {t("libraryScan.review.match.cancel")}
              </Button>
              <Button
                size="sm"
                disabled={assign.isPending || (pairs.length === 0 && !(ignoreLeftover && leftover.length > 0))}
                onClick={() =>
                  assign.mutate({ pairs, ignoreFileIds: ignoreLeftover ? leftover : [] }, { onSuccess: onBack })
                }
              >
                {assign.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {pairs.length > 0
                  ? t("libraryScan.review.match.addFiles", { count: pairs.length })
                  : t("libraryScan.review.match.ignoreFiles", { count: leftover.length })}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
