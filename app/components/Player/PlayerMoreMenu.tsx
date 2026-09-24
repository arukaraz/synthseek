"use client";

import { cn } from "@utils/cn";
import {
  Info,
  ListMusic,
  Mic2,
  MonitorSpeaker,
  MoreVertical,
  Radio,
  RadioTower,
  Repeat,
  Repeat1,
  Settings2,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";

import { MODE_MENU_ICON, RESTORE_MODE_ICON } from "./constants";
import { keepMenuOpen, labelled, moreAttention } from "./helpers";
import { iconButton, menuState, moreBadge } from "./styles";
import type { PlayerProps } from "./types";

export function PlayerMoreMenu({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const attention = moreAttention(view);
  const attentionText =
    attention === "remote"
      ? t("menu.playingOn", { device: view.activeDevice.name })
      : attention === "warning"
        ? t("scrobble.retrying")
        : attention === "danger"
          ? t("scrobble.failed")
          : null;
  const name = attentionText === null ? t("controls.more") : `${t("controls.more")}: ${attentionText}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(iconButton({ tone: attention === "remote" ? "remote" : "muted" }), "@player:hidden relative")}
          data-player-more-toggle
          {...labelled(name)}
        >
          <MoreVertical className="size-5" />
          {attention === null ? null : <span className={moreBadge({ tone: attention })} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={10}>
        <DropdownMenuLabel>{t("menu.playback")}</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={view.shuffle}
          onCheckedChange={actions.toggleShuffle}
          onSelect={keepMenuOpen}
        >
          <Shuffle className="size-4" />
          {t("controls.shuffle")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuItem
          inset
          onSelect={(event) => {
            keepMenuOpen(event);
            actions.cycleRepeat();
          }}
        >
          {view.repeat === "one" ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
          {t("menu.repeat")}
          <span className={menuState({ tone: view.repeat === "off" ? "muted" : "on" })}>
            {t(`menu.repeatState.${view.repeat}`)}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("menu.track")}</DropdownMenuLabel>
        {view.mode === "mini" ? null : (
          <DropdownMenuItem inset onSelect={actions.toggleQueue}>
            <ListMusic className="size-4" />
            {t("queue.title")}
            <span className={menuState()}>
              {t("menu.upNext", { count: view.queue.upNext.length + view.queue.autoplay.length })}
            </span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem inset onSelect={actions.openLyrics}>
          <Mic2 className="size-4" />
          {t("controls.lyrics")}
        </DropdownMenuItem>
        <DropdownMenuItem inset onSelect={actions.startRadio} disabled={!view.activeDevice.local}>
          <RadioTower className="size-4" />
          {t("menu.startRadio")}
        </DropdownMenuItem>
        <DropdownMenuItem inset onSelect={actions.searchBetterQuality} disabled={view.upgrading}>
          <Sparkles className="size-4" />
          {t("menu.upgrade")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("menu.sound")}</DropdownMenuLabel>
        <DropdownMenuItem inset onSelect={actions.toggleDevices}>
          <MonitorSpeaker className="size-4" />
          {t("controls.devices")}
          <span className={menuState({ tone: view.activeDevice.local ? "muted" : "remote" })}>
            {view.activeDevice.local ? t("devices.thisBrowser") : view.activeDevice.name}
          </span>
        </DropdownMenuItem>
        {view.mode === "mini" ? null : (
          <DropdownMenuItem inset onSelect={actions.toggleSettings}>
            <Settings2 className="size-4" />
            {t("controls.settings")}
          </DropdownMenuItem>
        )}
        <DropdownMenuCheckboxItem
          checked={view.chainVisible}
          onCheckedChange={actions.toggleChain}
          onSelect={keepMenuOpen}
        >
          <Info className="size-4" />
          {t("controls.chain")}
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
        {view.scrobbleActionable ? (
          <DropdownMenuCheckboxItem
            checked={view.scrobble !== "off"}
            onCheckedChange={actions.toggleScrobbling}
            onSelect={keepMenuOpen}
          >
            <Radio className="size-4" />
            {t("menu.scrobbling")}
            <span className={menuState({ tone: view.scrobble })}>{t(`menu.scrobblingState.${view.scrobble}`)}</span>
          </DropdownMenuCheckboxItem>
        ) : (
          <DropdownMenuItem inset disabled>
            <Radio className="size-4" />
            {t("menu.scrobbling")}
            <span className={menuState({ tone: view.scrobble })}>{t(`menu.scrobblingState.${view.scrobble}`)}</span>
          </DropdownMenuItem>
        )}
        {view.mode === "normal" ? (
          <DropdownMenuItem inset onSelect={actions.toggleModes}>
            <MODE_MENU_ICON className="size-4" />
            {t("controls.modes")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem inset onSelect={() => actions.selectMode("normal")}>
            <RESTORE_MODE_ICON className="size-4" />
            {view.mode === "mini" ? t("controls.exitMini") : t("controls.restoreMode")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
