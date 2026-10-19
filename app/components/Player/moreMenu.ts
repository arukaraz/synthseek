import type { TFunction } from "i18next";
import {
  Info,
  ListMusic,
  Mic2,
  MonitorSpeaker,
  Radio,
  RadioTower,
  Repeat,
  Repeat1,
  Settings2,
  Shuffle,
  Sparkles,
} from "lucide-react";

import { MODE_MENU_ICON, RESTORE_MODE_ICON } from "./constants";
import type { MoreMenuEntry, MoreMenuGroup, PlayerActions, PlayerView } from "./types";

function trackEntries(view: PlayerView, actions: PlayerActions, t: TFunction<"player">): MoreMenuEntry[] {
  const queue: MoreMenuEntry[] =
    view.mode === "mini"
      ? []
      : [
          {
            kind: "action",
            key: "queue",
            icon: ListMusic,
            label: t("queue.title"),
            state: {
              text: t("menu.upNext", {
                count: view.queue.upNext.length + view.queue.autoplay.length + view.queue.loop.length,
              }),
              tone: "muted",
            },
            keepOpen: false,
            onSelect: actions.toggleQueue,
          },
        ];
  return [
    ...queue,
    {
      kind: "action",
      key: "lyrics",
      icon: Mic2,
      label: t("controls.lyrics"),
      keepOpen: false,
      onSelect: actions.openLyrics,
    },
    {
      kind: "action",
      key: "radio",
      icon: RadioTower,
      label: t("menu.startRadio"),
      disabled: !view.activeDevice.local,
      keepOpen: false,
      onSelect: actions.startRadio,
    },
    {
      kind: "action",
      key: "upgrade",
      icon: Sparkles,
      label: t("menu.upgrade"),
      disabled: view.upgrading,
      keepOpen: false,
      onSelect: actions.searchBetterQuality,
    },
  ];
}

function soundEntries(view: PlayerView, actions: PlayerActions, t: TFunction<"player">): MoreMenuEntry[] {
  const settings: MoreMenuEntry[] =
    view.mode === "mini"
      ? []
      : [
          {
            kind: "action",
            key: "settings",
            icon: Settings2,
            label: t("controls.settings"),
            keepOpen: false,
            onSelect: actions.toggleSettings,
          },
        ];
  return [
    {
      kind: "action",
      key: "devices",
      icon: MonitorSpeaker,
      label: t("controls.devices"),
      state: {
        text: view.activeDevice.local ? t("devices.thisBrowser") : view.activeDevice.name,
        tone: view.activeDevice.local ? "muted" : "remote",
      },
      keepOpen: false,
      onSelect: actions.toggleDevices,
    },
    ...settings,
    {
      kind: "toggle",
      key: "chain",
      icon: Info,
      label: t("controls.chain"),
      checked: view.chainVisible,
      onToggle: actions.toggleChain,
    },
  ];
}

function sessionEntries(view: PlayerView, actions: PlayerActions, t: TFunction<"player">): MoreMenuEntry[] {
  const scrobbleState = { text: t(`menu.scrobblingState.${view.scrobble}`), tone: view.scrobble };
  const scrobbling: MoreMenuEntry = view.scrobbleActionable
    ? {
        kind: "toggle",
        key: "scrobbling",
        icon: Radio,
        label: t("menu.scrobbling"),
        state: scrobbleState,
        checked: view.scrobble !== "off",
        onToggle: actions.toggleScrobbling,
      }
    : {
        kind: "action",
        key: "scrobbling",
        icon: Radio,
        label: t("menu.scrobbling"),
        state: scrobbleState,
        disabled: true,
        keepOpen: false,
        onSelect: actions.toggleScrobbling,
      };
  const mode: MoreMenuEntry =
    view.mode === "normal"
      ? {
          kind: "action",
          key: "modes",
          icon: MODE_MENU_ICON,
          label: t("controls.modes"),
          keepOpen: false,
          onSelect: actions.toggleModes,
        }
      : {
          kind: "action",
          key: "modes",
          icon: RESTORE_MODE_ICON,
          label: view.mode === "mini" ? t("controls.exitMini") : t("controls.restoreMode"),
          keepOpen: false,
          onSelect: () => actions.selectMode("normal"),
        };
  return [scrobbling, mode];
}

export function moreMenuGroups(view: PlayerView, actions: PlayerActions, t: TFunction<"player">): MoreMenuGroup[] {
  return [
    {
      key: "playback",
      label: t("menu.playback"),
      entries: [
        {
          kind: "toggle",
          key: "shuffle",
          icon: Shuffle,
          label: t("controls.shuffle"),
          checked: view.shuffle,
          onToggle: actions.toggleShuffle,
        },
        {
          kind: "action",
          key: "repeat",
          icon: view.repeat === "one" ? Repeat1 : Repeat,
          label: t("menu.repeat"),
          state: { text: t(`menu.repeatState.${view.repeat}`), tone: view.repeat === "off" ? "muted" : "on" },
          keepOpen: true,
          onSelect: actions.cycleRepeat,
        },
      ],
    },
    { key: "track", label: t("menu.track"), entries: trackEntries(view, actions, t) },
    { key: "sound", label: t("menu.sound"), entries: soundEntries(view, actions, t) },
    { key: "session", label: null, entries: sessionEntries(view, actions, t) },
  ];
}
