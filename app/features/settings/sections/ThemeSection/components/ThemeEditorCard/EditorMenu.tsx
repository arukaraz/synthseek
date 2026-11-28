"use client";

import { MoreHorizontal } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { SelectMenu } from "@components/ui/SelectMenu";
import { useThemeFetchers } from "@hooks/api/queries/theme";
import { errorToast } from "@modules/errors";
import { THEME_PRESET_IDS } from "@theme/contract";
import type { ThemePresetId, ThemeScheme } from "@theme/contract";
import { withPreset } from "@theme/custom";

import type { SharePanelKind } from "../SharePanel";
import { MenuRow } from "./MenuRow";
import { menuPanel, outlineButton } from "./styles";
import { TipIconButton } from "./TipIconButton";
import type { EditorMenuProps } from "./types";

export function EditorMenu({ editor, panel, onShare }: EditorMenuProps) {
  const { t } = useTranslation("themeEditor");
  const fetchers = useThemeFetchers();
  const content = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { draft } = editor;

  const presetOptions = useMemo(() => THEME_PRESET_IDS.map((id) => ({ value: id, label: t(`presets.${id}`) })), [t]);
  const schemeOptions = useMemo<{ value: ThemeScheme; label: string }[]>(
    () => [
      { value: "dark", label: t("menu.dark") },
      { value: "light", label: t("menu.light") },
    ],
    [t]
  );

  const startFrom = (id: ThemePresetId) => {
    void fetchers
      .preset(id)
      .then((preset) => editor.change(withPreset(draft, preset, id)))
      .catch((error: unknown) => errorToast(error, "theme.selectFailed"));
  };

  const share = (kind: SharePanelKind) => {
    setOpen(false);
    onShare(kind);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TipIconButton icon={MoreHorizontal} variant="ghost" size="lg" label={t("editor.options")} />
      </PopoverTrigger>
      <PopoverContent
        ref={content}
        align="end"
        className={menuPanel()}
        aria-label={t("editor.options")}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          content.current?.focus();
        }}
      >
        <MenuRow label={t("menu.startFrom")} tip={t("menu.startFromTip")}>
          <SelectMenu
            value={draft.meta.startedFrom}
            options={presetOptions}
            onChange={startFrom}
            ariaLabel={t("menu.startFrom")}
          />
        </MenuRow>
        <MenuRow label={t("menu.scheme")} tip={t("menu.schemeTip")}>
          <SegmentedControl
            value={draft.meta.scheme}
            options={schemeOptions}
            onChange={(scheme) => editor.change({ ...draft, meta: { ...draft.meta, scheme } })}
            ariaLabel={t("menu.scheme")}
          />
        </MenuRow>
        <MenuRow label={t("menu.share")} tip={t("menu.shareTip")}>
          <Button
            size="sm"
            variant="ghost"
            className={outlineButton()}
            aria-expanded={panel === "import"}
            onClick={() => share("import")}
          >
            {t("menu.import")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={outlineButton()}
            aria-expanded={panel === "export"}
            onClick={() => share("export")}
          >
            {t("menu.export")}
          </Button>
        </MenuRow>
      </PopoverContent>
    </Popover>
  );
}
