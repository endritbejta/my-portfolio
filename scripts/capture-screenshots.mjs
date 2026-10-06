/* eslint-env node */
/**
 * Captures screenshots of live project deployments into src/assets/screenshots/<slug>/.
 *
 *   node scripts/capture-screenshots.mjs            # every project in shots.config.mjs
 *   node scripts/capture-screenshots.mjs alfa-rent # just one
 *
 * Drives the locally installed Google Chrome over the DevTools protocol, so
 * there are no npm dependencies. Override the binary with CHROME_PATH.
 */
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { shots } from "./shots.config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src/assets/screenshots");
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function launchChrome() {
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

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const waiters = [];

  ws.addEventListener("message", ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
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

  return new Promise((resolve) =>
    ws.addEventListener("open", () => resolve({ send, once, close: () => ws.close() }))
  );
}

async function evaluate(cdp, expression) {
  const { result, exceptionDetails } = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? "eval failed");
  return result.value;
}

async function capture(cdp, project, shot) {
  const viewport = VIEWPORTS[shot.viewport ?? "desktop"];
  await cdp.send("Emulation.setDeviceMetricsOverride", viewport);
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: new URL(shot.path ?? "/", project.url).href });
  await loaded;
  await sleep(shot.wait ?? 2000);

  // Optional in-page setup: click through a flow, open a menu, fill a form...
  if (shot.script) {
    await evaluate(cdp, `(async () => { ${shot.script} })()`);
    await sleep(shot.settle ?? 1200);
  }
  if (shot.scrollY) {
    await evaluate(cdp, `window.scrollTo(0, ${shot.scrollY})`);
    await sleep(900);
  }
  if (shot.scrollTo) {
    await evaluate(
      cdp,
      `document.querySelector(${JSON.stringify(shot.scrollTo)})?.scrollIntoView({ block: "start" })`
    );
    await sleep(800);
  }

  const { data } = await cdp.send("Page.captureScreenshot", {
    format: "webp",
    quality: 82,
    captureBeyondViewport: false,
  });

  const dir = path.join(OUT_DIR, project.slug);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${shot.name}.webp`);
  await writeFile(file, Buffer.from(data, "base64"));
  console.log(`  ✓ ${path.relative(ROOT, file)}`);
}

const only = process.argv[2];
const targets = only ? shots.filter((p) => p.slug === only) : shots;
if (targets.length === 0) {
  console.error(`No project "${only}" in shots.config.mjs`);
  process.exit(1);
}

const { chrome, profile, wsUrl } = await launchChrome();
const cdp = await connect(wsUrl);
await cdp.send("Page.enable");

try {
  for (const project of targets) {
    console.log(`${project.slug} (${project.url})`);
    for (const shot of project.shots) {
      try {
        await capture(cdp, project, shot);
      } catch (error) {
        console.error(`  ✗ ${shot.name}: ${error.message}`);
      }
    }
  }
} finally {
  cdp.close();
  chrome.kill();
  await sleep(500);
  await rm(profile, { recursive: true, force: true, maxRetries: 5 }).catch(() => {});
}
