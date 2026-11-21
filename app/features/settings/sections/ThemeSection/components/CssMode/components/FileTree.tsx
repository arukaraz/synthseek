"use client";

import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { SelectMenu } from "@components/ui/SelectMenu";
import { COMPONENTS_DIRECTORY, TOKENS_DIRECTORY } from "@theme/custom";

import { THEME_JSON_ENTRY, THEME_JSON_PATH } from "../constants";
import { allPaths, rootLabelOf } from "../helpers";
import { phoneBar, phoneSelect, treeColumn, treeDirectory, treeEmpty, treeRoot, treeRootLabel } from "../styles";
import type { FileTreeProps } from "../types";
import { NewFileForm } from "./NewFileForm";
import { TreeRow } from "./TreeRow";

export function FileTree({ folder, model, open, draft, onOpen, onDelete, onCreate }: FileTreeProps) {
  const { t } = useTranslation("themeEditor");
  const options = allPaths(model).map((path) => ({ value: path, label: path }));
  const removable = model.components.some((file) => file.path === open);

  return (
    <div className={treeColumn()}>
      <div className={phoneBar()}>
        <div className={phoneSelect()}>
          <SelectMenu value={open} options={options} onChange={onOpen} ariaLabel={t("css.file")} />
        </div>
        {removable ? (
          <IconButton
            type="button"
            icon={Trash2}
            variant="ghostRed"
            animated={false}
            aria-label={t("css.deleteFile", { file: open })}
            onClick={() => onDelete(open)}
          />
        ) : null}
      </div>
      <nav aria-label={t("css.files")} className={treeRoot()}>
        <div className={treeRootLabel()}>{rootLabelOf(folder)}</div>
        <ul>
          <TreeRow file={THEME_JSON_ENTRY} current={open === THEME_JSON_PATH} top onOpen={onOpen} />
        </ul>
        <div className={treeDirectory()}>{TOKENS_DIRECTORY}</div>
        <ul>
          {model.tokens.map((file) => (
            <TreeRow key={file.path} file={file} current={open === file.path} top={false} onOpen={onOpen} />
          ))}
        </ul>
        <div className={treeDirectory()}>{COMPONENTS_DIRECTORY}</div>
        {model.components.length === 0 ? (
          <div className={treeEmpty()}>{t("css.empty")}</div>
        ) : (
          <ul>
            {model.components.map((file) => (
              <TreeRow
                key={file.path}
                file={file}
                current={open === file.path}
                top={false}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
        {model.custom === null ? null : (
          <ul>
            <TreeRow file={model.custom} current={open === model.custom.path} top onOpen={onOpen} />
          </ul>
        )}
      </nav>
      <NewFileForm draft={draft} onCreate={onCreate} />
    </div>
  );
}
