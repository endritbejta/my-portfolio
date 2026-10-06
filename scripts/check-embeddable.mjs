/* eslint-env node */
/**
 * Reports which pinned projects' live sites let this portfolio embed them in
 * the live preview on a case-study page.
 *
 *   npm run check:embed
 *
 * A site refuses to be framed if it sends `X-Frame-Options: DENY|SAMEORIGIN`
 * or a CSP `frame-ancestors` that doesn't include this portfolio. The site
 * itself makes the same check at runtime (netlify/functions/pinned-repos.mjs)
 * and only shows the live preview for sites that pass, so a blocked site falls
 * back to its cover image by itself and starts embedding as soon as it allows
 * framing. This script is for finding out why a preview isn't showing.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { probeEmbeddable } from "../netlify/lib/embeddable.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTFOLIO = "https://endritsportfolio.netlify.app";
const pins = JSON.parse(await readFile(path.join(ROOT, "src/data/pinned-repos.json"), "utf8"));

for (const pin of pins) {
  if (!pin.homepage) {
    console.log(`—  ${pin.name.padEnd(24)} no live site`);
    continue;
  }
  const { embeddable, reason } = await probeEmbeddable(pin.homepage, PORTFOLIO, 15000);
  console.log(
    `${embeddable ? "✓" : "✗"}  ${pin.name.padEnd(24)} ${pin.homepage}${embeddable ? "" : `\n      blocked: ${reason}`}`
  );
}
