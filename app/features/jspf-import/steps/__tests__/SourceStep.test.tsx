import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { SourceStep } from "../SourceStep";

function playlistFile(name: string, read: () => Promise<string> = () => Promise.resolve("{}")): File {
  const file = new File(["{}"], name);
  Object.defineProperty(file, "text", { configurable: true, value: read });
  return file;
}

function renderSource() {
  const onLoaded = vi.fn();
  const { container } = render(<SourceStep onLoaded={onLoaded} />);
  const input = container.querySelector("input[type=file]");
  if (!(input instanceof HTMLInputElement)) throw new Error("the step offers no file input");
  return { onLoaded, input, user: userEvent.setup() };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("choosing a file", () => {
  it("hands the contents up once a playlist file is chosen", async () => {
    const { onLoaded, input } = renderSource();

    await userEvent.upload(
      input,
      playlistFile("summer.jspf", () => Promise.resolve('{"playlist":{}}'))
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalledWith('{"playlist":{}}', "jspf", "summer.jspf"));
  });

  it("refuses a file the importer cannot parse, and says so", async () => {
    const { onLoaded } = renderSource();
    const zone = screen.getByRole("button", { name: enLibrary.jspfImport.source.uploadAria });

    fireEvent.drop(zone, { dataTransfer: { files: [playlistFile("summer.m3u")] } });

    expect(await screen.findByText(enLibrary.jspfImport.source.errorWrongFile)).toBeInTheDocument();
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("reports why a file could not be read", async () => {
    const { onLoaded } = renderSource();
    const zone = screen.getByRole("button", { name: enLibrary.jspfImport.source.uploadAria });
    const file = playlistFile("summer.jspf", () => Promise.reject(new Error("The disk went away")));

    fireEvent.drop(zone, { dataTransfer: { files: [file] } });

    expect(await screen.findByText("The disk went away")).toBeInTheDocument();
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("takes a file dropped onto the zone", async () => {
    const { onLoaded } = renderSource();
    const zone = screen.getByRole("button", { name: enLibrary.jspfImport.source.uploadAria });

    fireEvent.drop(zone, { dataTransfer: { files: [playlistFile("dropped.csv", () => Promise.resolve("a,b"))] } });

    await waitFor(() => expect(onLoaded).toHaveBeenCalledWith("a,b", "csv", "dropped.csv"));
  });

  it("ignores a drop that carried no file", async () => {
    const { onLoaded } = renderSource();
    const zone = screen.getByRole("button", { name: enLibrary.jspfImport.source.uploadAria });

    fireEvent.drop(zone, { dataTransfer: { files: [] } });

    await waitFor(() => expect(onLoaded).not.toHaveBeenCalled());
  });

  it("opens the file picker from the keyboard as well as the pointer", async () => {
    const { input } = renderSource();
    const click = vi.spyOn(input, "click").mockImplementation(() => undefined);
    const zone = screen.getByRole("button", { name: enLibrary.jspfImport.source.uploadAria });

    fireEvent.click(zone);
    fireEvent.keyDown(zone, { key: "Enter" });
    fireEvent.keyDown(zone, { key: " " });

    expect(click).toHaveBeenCalledTimes(3);
  });

  it("leaves the picker shut for a key that means nothing here", async () => {
    const { input } = renderSource();
    const click = vi.spyOn(input, "click").mockImplementation(() => undefined);
    const zone = screen.getByRole("button", { name: enLibrary.jspfImport.source.uploadAria });

    fireEvent.keyDown(zone, { key: "a" });

    expect(click).not.toHaveBeenCalled();
  });

  it("highlights the zone while a file is held over it, and stops when it leaves", () => {
    renderSource();
    const zone = screen.getByRole("button", { name: enLibrary.jspfImport.source.uploadAria });
    const resting = zone.className;

    fireEvent.dragOver(zone);
    expect(zone.className).not.toBe(resting);

    fireEvent.dragLeave(zone);
    expect(zone.className).toBe(resting);
  });
});

describe("fetching from a URL", () => {
  it("keeps the fetch button out of reach until a URL is typed", async () => {
    renderSource();

    expect(screen.getByRole("button", { name: enLibrary.jspfImport.source.fetch })).toBeDisabled();
  });

  it("fetches the playlist and hands it up", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response('{"playlist":{}}', { status: 200 }))
    );
    const { onLoaded, user } = renderSource();

    await user.type(screen.getByPlaceholderText(enLibrary.jspfImport.source.urlPlaceholder), "https://host/mix.jspf");
    await user.click(screen.getByRole("button", { name: enLibrary.jspfImport.source.fetch }));

    await waitFor(() => expect(onLoaded).toHaveBeenCalledWith('{"playlist":{}}', "jspf", "mix.jspf"));
  });

  it("refuses a URL whose path names no format it can parse", async () => {
    const { onLoaded, user } = renderSource();

    await user.type(screen.getByPlaceholderText(enLibrary.jspfImport.source.urlPlaceholder), "https://host/mix");
    await user.click(screen.getByRole("button", { name: enLibrary.jspfImport.source.fetch }));

    expect(await screen.findByText(enLibrary.jspfImport.source.errorWrongUrl)).toBeInTheDocument();
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("reports a fetch the server refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 403 }))
    );
    const { onLoaded, user } = renderSource();

    await user.type(screen.getByPlaceholderText(enLibrary.jspfImport.source.urlPlaceholder), "https://host/mix.jspf");
    await user.click(screen.getByRole("button", { name: enLibrary.jspfImport.source.fetch }));

    expect(
      await screen.findByText(enLibrary.jspfImport.errors.fetchFailed.replace("{{status}}", "403"))
    ).toBeInTheDocument();
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("puts the button back within reach once the fetch has finished failing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 }))
    );
    const { user } = renderSource();

    await user.type(screen.getByPlaceholderText(enLibrary.jspfImport.source.urlPlaceholder), "https://host/mix.jspf");
    await user.click(screen.getByRole("button", { name: enLibrary.jspfImport.source.fetch }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: enLibrary.jspfImport.source.fetch })).not.toBeDisabled()
    );
  });
});
