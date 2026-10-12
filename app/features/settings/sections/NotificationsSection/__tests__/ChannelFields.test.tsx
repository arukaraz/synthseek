import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { SECRET_SENTINEL } from "../../../components/constants";
import { ChannelFields } from "../components/ChannelFields";

const reveal = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api", () => ({ useRevealNotificationSecret: () => reveal }));

const onChange = vi.fn();
const fields = enSettings.notifications.fields;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ChannelFields", () => {
  it("asks for a saved secret of this channel by its own field when its eye is clicked", async () => {
    reveal.mockResolvedValue("123456:token");
    render(
      <ChannelFields
        channel="telegram"
        config={{ botToken: SECRET_SENTINEL, chatId: "-1001" }}
        ntfyServers={null}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByLabelText(enSettings.shell.secretInput.reveal));

    expect(reveal).toHaveBeenCalledWith({ channel: "telegram", field: "botToken" });
    expect(screen.getByDisplayValue("123456:token")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("names the ntfy servers a member may use under the server field", () => {
    render(
      <ChannelFields
        channel="ntfy"
        config={{ serverUrl: "https://ntfy.sh", topic: "", accessToken: "" }}
        ntfyServers={["https://ntfy.sh", "https://push.example.org"]}
        onChange={onChange}
      />
    );

    expect(screen.getByText("Servers you can use: https://ntfy.sh, https://push.example.org")).toBeInTheDocument();
  });

  it("leaves the server unrestricted, without the list, when there is none", () => {
    render(
      <ChannelFields
        channel="ntfy"
        config={{ serverUrl: "https://ntfy.sh", topic: "", accessToken: "" }}
        ntfyServers={null}
        onChange={onChange}
      />
    );

    expect(screen.queryByText(/Servers you can use/)).not.toBeInTheDocument();
  });

  it("hides secrets and reports each edit with its field name", () => {
    render(
      <ChannelFields channel="telegram" config={{ botToken: "", chatId: "" }} ntfyServers={null} onChange={onChange} />
    );

    const token = screen.getByLabelText(fields.botToken.label);
    expect(token).toHaveAttribute("type", "password");
    fireEvent.change(token, { target: { value: "1:AA" } });
    fireEvent.change(screen.getByLabelText(fields.chatId.label), { target: { value: "-100" } });

    expect(onChange).toHaveBeenNthCalledWith(1, "botToken", "1:AA");
    expect(onChange).toHaveBeenNthCalledWith(2, "chatId", "-100");
  });

  it("shows only the fields of the chosen channel", () => {
    render(<ChannelFields channel="discord" config={{ webhookUrl: "" }} ntfyServers={null} onChange={onChange} />);

    expect(screen.getByLabelText(fields.webhookUrl.label)).toBeInTheDocument();
    expect(screen.queryByLabelText(fields.topic.label)).not.toBeInTheDocument();
  });
});
