"use client";

import { BottomSheet, BottomSheetHeader, bottomSheetBody } from "@components/ui/BottomSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { PHONE_QUERY } from "@hooks/ui/constants";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";
import { MoreVertical } from "lucide-react";
import { Fragment, useState } from "react";

import { libraryMenuItem, libraryMenuItemDanger } from "../../styles";
import { shieldOwnClick } from "../LibraryCard/helpers";
import { sheetMenuItem, sheetSeparator } from "../LibraryShelf/styles";
import { actionMenuShield } from "./styles";
import type { LibraryActionMenuProps } from "./types";

export function LibraryActionMenu({
  actions,
  title,
  subtitle,
  triggerLabel,
  triggerClassName,
  iconClassName = "size-4",
}: LibraryActionMenuProps) {
  const phone = useMediaQuery(PHONE_QUERY);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (phone) {
    return (
      <div className={actionMenuShield()} onClick={shieldOwnClick} onKeyDown={(event) => event.stopPropagation()}>
        <button
          type="button"
          className={triggerClassName}
          aria-label={triggerLabel}
          aria-haspopup="dialog"
          data-state={sheetOpen ? "open" : "closed"}
          onClick={() => setSheetOpen(true)}
        >
          <MoreVertical className={iconClassName} aria-hidden />
        </button>
        <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} size="compact" showClose={false}>
          <BottomSheetHeader title={title} subtitle={subtitle} />
          <div className={bottomSheetBody()}>
            {actions.map((action) => (
              <Fragment key={action.key}>
                {action.separated ? <div className={sheetSeparator()} /> : null}
                <button
                  type="button"
                  className={sheetMenuItem({ tone: action.tone })}
                  disabled={action.disabled}
                  onClick={() => {
                    setSheetOpen(false);
                    action.onSelect();
                  }}
                >
                  <action.icon className="size-5 shrink-0" aria-hidden />
                  {action.label}
                </button>
              </Fragment>
            ))}
          </div>
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className={actionMenuShield()} onClick={shieldOwnClick} onKeyDown={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger className={triggerClassName} aria-label={triggerLabel}>
          <MoreVertical className={iconClassName} aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <Fragment key={action.key}>
              {action.separated ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                className={action.tone === "danger" ? libraryMenuItemDanger() : libraryMenuItem()}
                disabled={action.disabled}
                onSelect={action.onSelect}
              >
                <action.icon className="size-4" aria-hidden />
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
