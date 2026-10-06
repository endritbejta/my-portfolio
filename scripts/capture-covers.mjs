/* eslint-env node */
/**
 * Captures each project's cover images into src/assets/covers/.
 *
 *   npm run covers                  # every project in covers.config.mjs
 *   npm run covers -- alfa-rent     # just one
 *
 * Drives the locally installed Google Chrome over the DevTools protocol, so
 * there are no npm dependencies. Override the binary with CHROME_PATH.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connect, launchChrome, shutdown, sleep } from "./lib/chrome.mjs";
import { covers } from "./covers.config.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "src/assets/covers");

const VIEWPORTS = {
  "": { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  "-mobile": { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
};

async function capture(cdp, project, suffix, viewport) {
  await cdp.send("Emulation.setDeviceMetricsOverride", viewport);
  // Reveal animations would otherwise be caught half-faded.
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: project.url });
  await loaded;
  await sleep(project.wait ?? 2000);

  const { data } = await cdp.send("Page.captureScreenshot", { format: "webp", quality: 82 });
  const file = path.join(OUT_DIR, `${project.slug}${suffix}.webp`);
  await writeFile(file, Buffer.from(data, "base64"));
  console.log(`  ✓ ${path.relative(ROOT, file)}`);
}

const only = process.argv[2];
const targets = only ? covers.filter((project) => project.slug === only) : covers;
if (targets.length === 0) {
  console.error(`No project "${only}" in covers.config.mjs`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const session = await launchChrome();
const cdp = await connect(session.wsUrl);
session.cdp = cdp;
await cdp.send("Page.enable");

try {
  for (const project of targets) {
    console.log(`${project.slug} (${project.url})`);
    for (const [suffix, viewport] of Object.entries(VIEWPORTS)) {
      try {
        await capture(cdp, project, suffix, viewport);
      } catch (error) {
        console.error(`  ✗ ${project.slug}${suffix}: ${error.message}`);
      }
    }
  }
} finally {
  await shutdown(session);
}
