"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Notice } from "@components/ui/Notice";
import { Spinner } from "@components/ui/Spinner";
import { useLoadPlaylistFromLink } from "@hooks/api/mutations/library-source/useLoadPlaylistFromLink";
import { resolveFriendlyError, type FriendlyError } from "@modules/errors";
import { announce } from "@utils/announcer";

import { linkBar, linkForm, linkLabel, linkNote } from "../styles";
import type { PlaylistLinkFieldProps } from "./types";

export function PlaylistLinkField({ source, connected, onLoaded }: PlaylistLinkFieldProps) {
  const { t } = useTranslation("library");
  const load = useLoadPlaylistFromLink();
  const inFlight = useRef(false);
  const [link, setLink] = useState("");
  const [failure, setFailure] = useState<FriendlyError | null>(null);
  const fieldId = useId();
  const provider = source.name;
  const blocked = source.capabilities.playlistLinks.needsConnection && !connected;
  const busy = load.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = link.trim();
    if (trimmed === "" || blocked || inFlight.current) return;
    inFlight.current = true;
    setFailure(null);
    announce(t("librarySource.link.busy", { provider }));
    load
      .mutateAsync({ provider: source.provider, link: trimmed })
      .then((item) => {
        setLink("");
        announce(t("librarySource.link.loaded", { name: item.name }));
        onLoaded(item);
      })
      .catch((caught: unknown) => setFailure(resolveFriendlyError(caught)))
      .finally(() => {
        inFlight.current = false;
      });
  };

  return (
    <div className={linkBar()} data-playlist-link>
      <label htmlFor={fieldId} className={linkLabel()}>
        {t("librarySource.link.label")}
      </label>
      <form className={linkForm()} onSubmit={handleSubmit}>
        <Input
          id={fieldId}
          size="sm"
          type="text"
          inputMode="url"
          value={link}
          readOnly={busy}
          disabled={blocked}
          autoComplete="off"
          spellCheck={false}
          placeholder={t("librarySource.link.placeholder", { provider })}
          onChange={(event) => {
            setLink(event.target.value);
            setFailure(null);
          }}
        />
        <Button type="submit" size="sm" disabled={blocked || busy || link.trim() === ""}>
          {busy ? <Spinner size="sm" decorative /> : null}
          {busy ? t("librarySource.link.loading") : t("librarySource.link.load")}
        </Button>
      </form>
      {blocked ? <p className={linkNote()}>{t("librarySource.link.needsConnection", { provider })}</p> : null}
      {busy ? <p className={linkNote()}>{t("librarySource.link.busy", { provider })}</p> : null}
      {failure ? (
        <Notice variant="danger" title={failure.title}>
          {failure.description}
        </Notice>
      ) : null}
    </div>
  );
}
