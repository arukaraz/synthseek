import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PRELOAD = path.resolve(__dirname, "../append-peer-address.mjs");
const ECHO_SERVER = [
  "const server = require('node:http').createServer((request, response) => {",
  "  response.end(String(request.headers['x-forwarded-for']));",
  "});",
  "server.listen(0, '127.0.0.1', () => process.stdout.write(String(server.address().port) + '\\n'));",
].join("\n");

let child: ChildProcess;
let baseUrl: string;

beforeAll(async () => {
  child = spawn(process.execPath, ["--import", PRELOAD, "-e", ECHO_SERVER], { stdio: ["ignore", "pipe", "inherit"] });
  const port = await new Promise<string>((resolve, reject) => {
    child.stdout?.once("data", (chunk: Buffer) => resolve(chunk.toString().trim()));
    child.once("exit", (code) => reject(new Error(`echo server exited with ${code}`)));
  });
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(() => {
  child.kill();
});

async function forwardedForSeen(sent?: string): Promise<string> {
  const response = await fetch(baseUrl, { headers: sent === undefined ? {} : { "x-forwarded-for": sent } });
  return response.text();
}

describe("append-peer-address preload for the web tier", () => {
  it("records the peer when the client sent no X-Forwarded-For", async () => {
    expect(await forwardedForSeen()).toBe("127.0.0.1");
  });

  it("appends the peer after an X-Forwarded-For the client wrote, so the client cannot name the last hop", async () => {
    expect(await forwardedForSeen("203.0.113.9")).toBe("203.0.113.9, 127.0.0.1");
  });

  it("keeps a chain a reverse proxy built and appends the proxy's own address", async () => {
    expect(await forwardedForSeen("1.2.3.4, 198.51.100.7")).toBe("1.2.3.4, 198.51.100.7, 127.0.0.1");
  });
});
