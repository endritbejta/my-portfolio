/* eslint-env node */
/**
 * Reports which pinned projects' live sites can be embedded in the live
 * preview on a case-study page.
 *
 *   npm run check:embed
 *
 * A site refuses to be framed if it sends `X-Frame-Options: DENY|SAMEORIGIN`
 * or a CSP `frame-ancestors` that doesn't include this portfolio. Browsers
 * then show a blank frame with no error the page can detect, so the preview
 * is opt-in per project (`preview: true` in src/data/projects.js) and this is
 * how to decide.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTFOLIO = "https://endritsportfolio.netlify.app";
const pins = JSON.parse(await readFile(path.join(ROOT, "src/data/pinned-repos.json"), "utf8"));

/** Returns null when framing is allowed, otherwise the reason it is blocked. */
const blockedReason = (headers) => {
  const xfo = headers.get("x-frame-options");
  if (xfo && /^(deny|sameorigin)/i.test(xfo.trim())) return `X-Frame-Options: ${xfo}`;

  const csp = headers.get("content-security-policy") ?? "";
  const directive = csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith("frame-ancestors"));
  if (directive) {
    const sources = directive.split(/\s+/).slice(1).map((source) => source.replace(/\/$/, ""));
    const allowed = sources.some(
      (source) =>
        source === "*" ||
        source === PORTFOLIO ||
        (source.startsWith("https://*.") && PORTFOLIO.endsWith(source.slice(9)))
    );
    if (!allowed) return `CSP ${directive}`;
  }
  return null;
};

for (const pin of pins) {
  if (!pin.homepage) {
    console.log(`—  ${pin.name.padEnd(24)} no live site`);
    continue;
  }
  try {
    const response = await fetch(pin.homepage, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    const reason = blockedReason(response.headers);
    console.log(
      `${reason ? "✗" : "✓"}  ${pin.name.padEnd(24)} ${pin.homepage}${reason ? `\n      blocked by ${reason}` : ""}`
    );
  } catch (error) {
    console.log(`?  ${pin.name.padEnd(24)} ${pin.homepage} — ${error.message}`);
  }
}
