"use client";

import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/Dialog";
import { Input } from "@components/ui/Input";
import { Notice } from "@components/ui/Notice";
import { useCreateLibraryPath, useUpdateLibraryPath } from "@hooks/api/mutations/library/useLibraryPaths";
import { useLibraryNamingCurrent, useLibraryNamingPreview } from "@hooks/api/queries/useLibraryNaming";
import { useCheckLibraryFolder, useJudgeLibraryFolder } from "@hooks/api/queries/useLibraryPaths";
import { useDebounce } from "@hooks/ui/useDebounce";

import { SettingsField } from "../../components/SettingsField";
import { FOLDER_DEBOUNCE_MS, PATH_LABEL_MAX_LENGTH, PREVIEW_DEBOUNCE_MS } from "./constants";
import { DefaultPathToggle } from "./DefaultPathToggle";
import { FolderCheckNotice } from "./FolderCheckNotice";
import { FolderField } from "./FolderField";
import { blockerText, comparableFolder, songsOnlyBlocker, withExtension, withoutExtension } from "./helpers";
import { NamingField } from "./NamingField";
import { PathRulesPicker } from "./PathRulesPicker";
import { RemovePathAction } from "./RemovePathAction";
import { fieldMessage, footerStart, formGrid, formStack, modalFooter } from "./styles";
import type { LibraryPathModalProps, PathWriteRefusal, PathWriteResult, RemoveBlocker } from "./types";

export function LibraryPathModal({ target, paths, rules, members, organise, onClose }: LibraryPathModalProps) {
  const { t } = useTranslation("settings");
  const labelId = useId();
  const path = target.mode === "edit" ? (paths.find((entry) => entry.id === target.pathId) ?? null) : null;
  const current = useLibraryNamingCurrent();
  const create = useCreateLibraryPath();
  const update = useUpdateLibraryPath();

  const [label, setLabel] = useState(path?.label ?? "");
  const [folder, setFolder] = useState(path?.folder ?? "");
  const [isDefault, setIsDefault] = useState(path?.isDefault ?? false);
  const [ruleIds, setRuleIds] = useState<readonly string[]>(path?.ruleIds ?? []);
  const [templateDraft, setTemplateDraft] = useState<string | null>(null);
  const [refusal, setRefusal] = useState<PathWriteRefusal | null>(null);
  const [blockers, setBlockers] = useState<readonly RemoveBlocker[] | null>(null);
  const [checkFor, setCheckFor] = useState<string | null>(null);

  const fromEnvironment = path?.fromEnvironment === true;
  const songsOnly = blockers === null ? null : songsOnlyBlocker(blockers);
  const typedFolder = comparableFolder(folder);
  const settledFolder = comparableFolder(useDebounce(folder, { delay: FOLDER_DEBOUNCE_MS }));
  const folderChanged = !fromEnvironment && (path === null || typedFolder !== comparableFolder(path.folder));
  const judgeable = folderChanged && settledFolder.length > 0;
  const judge = useJudgeLibraryFolder({ folder: settledFolder, exceptPathId: path?.id ?? null }, judgeable);
  const verdict = judgeable && settledFolder === typedFolder ? judge.data : undefined;
  const judging = folderChanged && typedFolder.length > 0 && verdict === undefined && !judge.isError;
  const folderUsable = !folderChanged || verdict?.outcome === "usable";
  const readonly = folderChanged
    ? verdict?.outcome === "usable" && verdict.access === "readonly"
    : path?.access === "readonly";

  const needsCheck = path !== null && folderChanged && path.files > 0;
  const check = useCheckLibraryFolder(
    { pathId: path?.id ?? "", folder: checkFor ?? "" },
    needsCheck && checkFor !== null && checkFor === typedFolder
  );
  const checkResult = checkFor === typedFolder ? check.data : undefined;
  const checkPassed =
    !needsCheck || (checkResult !== undefined && checkResult !== null && checkResult.found === checkResult.sampled);

  const edited = templateDraft ?? withoutExtension(path?.namingTemplate ?? current.data?.defaultTemplate ?? "");
  const settledEdit = useDebounce(edited, { delay: PREVIEW_DEBOUNCE_MS });
  const preview = useLibraryNamingPreview(
    { pathId: path?.id ?? "", template: withExtension(settledEdit) },
    path !== null && settledEdit.trim().length > 0
  );
  const settled = settledEdit === edited && !preview.isFetching;
  const templateInvalid = preview.data?.outcome === "invalid";

  const saving = create.isPending || update.isPending;
  const canSave =
    label.trim().length > 0 &&
    folderUsable &&
    (fromEnvironment || typedFolder.length > 0) &&
    checkPassed &&
    edited.trim().length > 0 &&
    !(path !== null && templateInvalid) &&
    !saving;

  const currentDefaultLabel = paths.find((entry) => entry.isDefault)?.label ?? null;

  const edit = (apply: () => void) => {
    setRefusal(null);
    apply();
  };

  const settle = (result: PathWriteResult) => {
    if (result.outcome === "saved" || result.outcome === "not_found") {
      onClose();
      return;
    }
    setRefusal(result);
  };

  const submit = () => {
    if (!canSave) return;
    const input = {
      label: label.trim(),
      folder: path !== null && fromEnvironment ? path.folder : folder.trim(),
      isDefault: isDefault && !readonly,
      ruleIds: [...ruleIds],
      namingTemplate: withExtension(edited),
    };
    if (path === null) {
      create.mutate(input, { onSuccess: settle });
      return;
    }
    update.mutate({ id: path.id, ...input }, { onSuccess: settle });
  };

  if (target.mode === "edit" && path === null) return null;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {path === null
              ? t("libraryPaths.modal.addTitle")
              : t("libraryPaths.modal.editTitle", { label: path.label })}
          </DialogTitle>
        </DialogHeader>

        <form
          className={formStack()}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className={formGrid()}>
            <SettingsField
              label={t("libraryPaths.label.label")}
              htmlFor={labelId}
              helper={
                refusal?.outcome === "label_taken" ? (
                  <span className={fieldMessage({ tone: "danger" })}>{t("libraryPaths.label.taken")}</span>
                ) : undefined
              }
            >
              <Input
                id={labelId}
                value={label}
                maxLength={PATH_LABEL_MAX_LENGTH}
                placeholder={t("libraryPaths.label.placeholder")}
                aria-invalid={refusal?.outcome === "label_taken"}
                onChange={(event) => edit(() => setLabel(event.target.value))}
              />
            </SettingsField>
            <FolderField
              path={path}
              folder={folder}
              onFolderChange={(next) =>
                edit(() => {
                  setFolder(next);
                  setCheckFor(null);
                })
              }
              verdict={verdict}
              judging={judging}
              refusal={refusal}
            />
          </div>

          {needsCheck && folderUsable ? (
            <FolderCheckNotice
              path={path}
              check={checkResult}
              checking={check.isFetching}
              canCheck={verdict?.outcome === "usable"}
              onCheck={() => edit(() => setCheckFor(typedFolder))}
              refusal={refusal}
            />
          ) : null}

          <DefaultPathToggle
            checked={isDefault}
            onCheckedChange={(next) => edit(() => setIsDefault(next))}
            path={path}
            readonly={readonly}
            currentDefaultLabel={currentDefaultLabel}
            refused={refusal?.outcome === "readonly_default"}
          />

          <PathRulesPicker
            pathId={path?.id ?? null}
            rules={rules}
            paths={paths}
            members={members}
            selected={ruleIds}
            onToggle={(ruleId, checked) =>
              edit(() => setRuleIds((chosen) => (checked ? [...chosen, ruleId] : chosen.filter((id) => id !== ruleId))))
            }
            refusal={refusal}
          />

          <NamingField
            path={path}
            edited={edited}
            onEditedChange={(next) => edit(() => setTemplateDraft(next))}
            tokens={current.data?.tokens ?? []}
            preview={path === null ? undefined : preview.data}
            settled={settled}
            organise={organise}
            refused={refusal?.outcome === "invalid_template"}
          />

          {blockers === null || path === null ? null : (
            <Notice variant="warning" title={t("libraryPaths.remove.blockedTitle", { label: path.label })}>
              <ul className="list-disc pl-4">
                {blockers.map((blocker) => (
                  <li key={blocker.reason}>{blockerText(blocker)}</li>
                ))}
              </ul>
              {songsOnly === null ? null : (
                <RemovePathAction path={path} songCount={songsOnly} onRemoved={onClose} onBlocked={setBlockers} />
              )}
            </Notice>
          )}

          <DialogFooter className={modalFooter()}>
            {path === null ? null : (
              <div className={footerStart()}>
                <RemovePathAction path={path} onRemoved={onClose} onBlocked={setBlockers} />
              </div>
            )}
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              {t("libraryPaths.modal.cancel")}
            </Button>
            <Button type="submit" disabled={!canSave}>
              {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {path === null ? t("libraryPaths.modal.add") : t("libraryPaths.modal.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
