import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { APP_TITLE, MINI_WINDOW_HEIGHT_PX, MINI_WINDOW_WIDTH_PX, PLAYER_MODE_ATTRIBUTE } from "../constants";

interface OpenedWindow extends EventTarget {
  document: Document;
  closed: boolean;
  innerHeight: number;
  outerHeight: number;
  outerWidth: number;
  close: ReturnType<typeof vi.fn>;
  resizeTo: ReturnType<typeof vi.fn>;
}

let opened: OpenedWindow | null = null;
let refuses = false;
let resizeThrows = false;

function fakeWindow(): OpenedWindow {
  const frame = document.implementation.createHTMLDocument("mini");
  const target = new EventTarget();
  const created: OpenedWindow = Object.assign(target, {
    document: frame,
    closed: false,
    innerHeight: 200,
    outerHeight: 240,
    outerWidth: 400,
    close: vi.fn(() => {
      created.closed = true;
    }),
    resizeTo: vi.fn(() => {
      if (resizeThrows) throw new Error("the browser refused to resize the window");
    }),
  });
  return created;
}

function installApi(present: boolean): void {
  if (!present) {
    Reflect.deleteProperty(window, "documentPictureInPicture");
    return;
  }
  Object.defineProperty(window, "documentPictureInPicture", {
    configurable: true,
    writable: true,
    value: {
      requestWindow: vi.fn(async () => {
        if (refuses) throw new Error("the browser refused the window");
        opened = fakeWindow();
        return opened;
      }),
    },
  });
}

async function freshMiniWindow(): Promise<typeof import("../miniWindow")> {
  vi.resetModules();
  return import("../miniWindow");
}

beforeEach(() => {
  opened = null;
  refuses = false;
  resizeThrows = false;
  installApi(true);
  document.documentElement.setAttribute("data-theme", "midnight");
  document.documentElement.setAttribute("lang", "es");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("lang");
});

describe("miniPlayerSupported", () => {
  it("says yes on a browser that can detach a document", async () => {
    const mini = await freshMiniWindow();

    expect(mini.miniPlayerSupported()).toBe(true);
  });

  it("says no on a browser without the API", async () => {
    installApi(false);
    const mini = await freshMiniWindow();

    expect(mini.miniPlayerSupported()).toBe(false);
  });
});

describe("opening the detached window", () => {
  it("asks the browser for a window the player fits in", async () => {
    const mini = await freshMiniWindow();

    await expect(mini.openMiniWindow(vi.fn())).resolves.toBe(true);

    expect(window.documentPictureInPicture?.requestWindow).toHaveBeenCalledWith(
      expect.objectContaining({ width: MINI_WINDOW_WIDTH_PX, height: MINI_WINDOW_HEIGHT_PX })
    );
  });

  it("carries the theme and the language over, so the detached player does not look foreign", async () => {
    const mini = await freshMiniWindow();

    await mini.openMiniWindow(vi.fn());

    expect(opened?.document.documentElement.getAttribute("data-theme")).toBe("midnight");
    expect(opened?.document.documentElement.getAttribute("lang")).toBe("es");
    expect(opened?.document.documentElement.getAttribute(PLAYER_MODE_ATTRIBUTE)).toBe("mini");
    expect(opened?.document.title).toBe(APP_TITLE);
  });

  it("carries the page styles over so the detached player is not unstyled", async () => {
    const sheet = document.createElement("style");
    sheet.textContent = ".mini-probe { color: red; }";
    document.head.appendChild(sheet);
    const mini = await freshMiniWindow();

    await mini.openMiniWindow(vi.fn());

    const adopted = Array.from(opened?.document.head.querySelectorAll("style") ?? []);
    expect(adopted.some((style) => style.textContent?.includes(".mini-probe"))).toBe(true);
    sheet.remove();
  });

  it("offers the detached window a body to render into", async () => {
    const mini = await freshMiniWindow();

    await mini.openMiniWindow(vi.fn());

    expect(mini.miniWindowBody()).toBe(opened?.document.body);
  });

  it("reports the refusal rather than throwing at the caller", async () => {
    refuses = true;
    const mini = await freshMiniWindow();

    await expect(mini.openMiniWindow(vi.fn())).resolves.toBe(false);
    expect(mini.miniWindowBody()).toBeNull();
  });

  it("refuses on a browser without the API at all", async () => {
    installApi(false);
    const mini = await freshMiniWindow();

    await expect(mini.openMiniWindow(vi.fn())).resolves.toBe(false);
  });

  it("tells the player when the listener closes the detached window", async () => {
    const mini = await freshMiniWindow();
    const onClosed = vi.fn();
    await mini.openMiniWindow(onClosed);

    opened?.dispatchEvent(new Event("pagehide"));

    expect(onClosed).toHaveBeenCalled();
    expect(mini.miniWindowBody()).toBeNull();
  });

  it("wakes every subscriber when the detached window appears and goes", async () => {
    const mini = await freshMiniWindow();
    const listener = vi.fn();
    const unsubscribe = mini.subscribeMiniWindow(listener);

    await mini.openMiniWindow(vi.fn());
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    mini.closeMiniWindow();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe("closing the detached window", () => {
  it("closes a window that is open", async () => {
    const mini = await freshMiniWindow();
    await mini.openMiniWindow(vi.fn());

    mini.closeMiniWindow();

    expect(opened?.close).toHaveBeenCalled();
    expect(mini.miniWindowBody()).toBeNull();
  });

  it("does nothing when no window was ever opened", async () => {
    const mini = await freshMiniWindow();

    expect(() => mini.closeMiniWindow()).not.toThrow();
  });

  it("treats a window the listener already closed as gone", async () => {
    const mini = await freshMiniWindow();
    await mini.openMiniWindow(vi.fn());
    if (opened !== null) opened.closed = true;

    mini.closeMiniWindow();

    expect(opened?.close).not.toHaveBeenCalled();
    expect(mini.miniWindowBody()).toBeNull();
  });
});

describe("keeping the detached window tall enough", () => {
  it("grows the window when the player needs more room than it has", async () => {
    const mini = await freshMiniWindow();
    await mini.openMiniWindow(vi.fn());

    mini.ensureMiniHeight(300);

    expect(opened?.resizeTo).toHaveBeenCalledWith(400, 340);
  });

  it("leaves a window that is already tall enough alone", async () => {
    const mini = await freshMiniWindow();
    await mini.openMiniWindow(vi.fn());

    mini.ensureMiniHeight(100);

    expect(opened?.resizeTo).not.toHaveBeenCalled();
  });

  it("does nothing when there is no detached window", async () => {
    const mini = await freshMiniWindow();

    expect(() => mini.ensureMiniHeight(300)).not.toThrow();
  });

  it("survives a browser that refuses to resize the window", async () => {
    resizeThrows = true;
    const mini = await freshMiniWindow();
    await mini.openMiniWindow(vi.fn());

    expect(() => mini.ensureMiniHeight(300)).not.toThrow();
  });
});
