"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";
import { useLibraryOrganiseStatus } from "@hooks/api/queries/useLibraryOrganise";
import { useLibraryPaths } from "@hooks/api/queries/useLibraryPaths";
import { useLibraryRules } from "@hooks/api/queries/useLibraryRules";
import { useUsers } from "@hooks/api/queries/useUsers";

import { SettingsCard } from "../../components/SettingsCard";
import { namingHint } from "../../styles";
import { LibraryPathModal } from "./LibraryPathModal";
import { LibraryPathRow } from "./LibraryPathRow";
import { listFrame, listHead, listHeadEnd } from "./styles";
import type { PathModalTarget } from "./types";

export function LibraryPathsCard() {
  const { t } = useTranslation("settings");
  const paths = useLibraryPaths();
  const rules = useLibraryRules();
  const users = useUsers();
  const organise = useLibraryOrganiseStatus();
  const [target, setTarget] = useState<PathModalTarget | null>(null);

  const title = t("libraryPaths.card.title");
  const description = t("libraryPaths.card.description");

  if (paths.isLoading) {
    return (
      <SettingsCard title={title} description={description}>
        <span className={namingHint()}>{t("libraryPaths.loading")}</span>
      </SettingsCard>
    );
  }

  if (paths.isError || paths.data === undefined) {
    return (
      <SettingsCard title={title} description={description}>
        <Notice variant="danger" title={t("libraryPaths.loadFailed")} />
      </SettingsCard>
    );
  }

  const list = paths.data;
  const unreachable = list.filter((path) => path.enabled && path.access === "unreachable");

  return (
    <SettingsCard
      title={title}
      description={description}
      trailing={
        <Button onClick={() => setTarget({ mode: "add" })}>
          <Plus className="size-4" aria-hidden />
          {t("libraryPaths.add")}
        </Button>
      }
    >
      <div className={listFrame()}>
        <div className={listHead({ layout: "paths" })} aria-hidden>
          <span>{t("libraryPaths.columns.path")}</span>
          <span>{t("libraryPaths.columns.files")}</span>
          <span>{t("libraryPaths.columns.free")}</span>
          <span>{t("libraryPaths.columns.rules")}</span>
          <span className={listHeadEnd()}>{t("libraryPaths.columns.enabled")}</span>
        </div>
        <ul aria-label={title}>
          {list.map((path) => (
            <LibraryPathRow
              key={path.id}
              path={path}
              organise={organise.data}
              onEdit={() => setTarget({ mode: "edit", pathId: path.id })}
            />
          ))}
        </ul>
      </div>

      {unreachable.map((path) => (
        <Notice key={path.id} variant="warning" title={t("libraryPaths.unreachableNotice", { label: path.label })} />
      ))}

      {target === null ? null : (
        <LibraryPathModal
          target={target}
          paths={list}
          rules={rules.data ?? []}
          members={users.data ?? []}
          organise={organise.data}
          onClose={() => setTarget(null)}
        />
      )}
    </SettingsCard>
  );
}
