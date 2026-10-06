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
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connect, launchChrome, shutdown, sleep } from "./lib/chrome.mjs";
import { shots } from "./shots.config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src/assets/screenshots");
const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};

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

const session = await launchChrome();
const cdp = await connect(session.wsUrl);
session.cdp = cdp;
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
  await shutdown(session);
}
