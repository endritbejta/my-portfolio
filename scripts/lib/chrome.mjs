/* eslint-env node */
/**
 * Minimal headless-Chrome driver over the DevTools protocol (no npm
 * dependencies). Shared by the cover-image and CV scripts. Override the
 * binary with CHROME_PATH.
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function launchChrome() {
  const profile = await mkdtemp(path.join(tmpdir(), "capture-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--hide-scrollbars",
      "--no-first-run",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === "page");
      if (page) return { chrome, profile, wsUrl: page.webSocketDebuggerUrl };
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  chrome.kill();
  throw new Error("Chrome did not start");
}

export function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const waiters = [];
  const handlers = new Map(); // method -> listener, for event streams

  ws.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      handlers.get(msg.method)?.(msg.params);
      for (const w of [...waiters]) {
        if (w.method === msg.method) {
          waiters.splice(waiters.indexOf(w), 1);
          w.resolve(msg.params);
        }
      }
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const once = (method, timeout = 30000) =>
    new Promise((resolve) => {
      const waiter = { method, resolve };
      waiters.push(waiter);
      setTimeout(() => resolve(null), timeout);
    });

  const on = (method, handler) => handlers.set(method, handler);

  return new Promise((resolve) =>
    ws.addEventListener("open", () => resolve({ send, once, on, close: () => ws.close() }))
  );
}

/** Closes the connection, stops Chrome and removes its temporary profile. */
export async function shutdown({ cdp, chrome, profile }) {
  cdp.close();
  chrome.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true, maxRetries: 5 }).catch(() => {});
}
