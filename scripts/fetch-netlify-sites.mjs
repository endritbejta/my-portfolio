/* eslint-env node */
/**
 * Fetches all Netlify sites for this account and writes them to
 * src/data/netlify-sites.json, which the Deployments section renders.
 *
 * Runs automatically before `npm run build` (see "prebuild" script).
 * Auth, in order of preference:
 *   1. NETLIFY_AUTH_TOKEN env var (set this in Netlify → Site settings →
 *      Environment variables, so every deploy refreshes the list)
 *   2. The local Netlify CLI login (~/.netlify/config.json)
 *
 * If neither is available the script exits gracefully and the last
 * committed JSON snapshot is used — builds never fail because of this.
 */
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/netlify-sites.json"
);

/** Sites to hide from the portfolio (test sites, duplicates, this site itself). */
const EXCLUDED_SITES = [
  "endritsportfolio", // this portfolio
  "glittery-yeot-af4710", // unpublished test site
  "papaya-eclair-6280bf", // unpublished test site
  "seat-allocation-municipality-kosovo", // older duplicate of endrit-seat-allocation-kosovo
  "my-valentines-gift-to-you", // personal
];

/** Netlify CLI config locations (varies by platform/version). */
const CLI_CONFIG_PATHS = [
  join(homedir(), "Library", "Preferences", "netlify", "config.json"), // macOS
  join(homedir(), ".config", "netlify", "config.json"), // Linux
  join(homedir(), ".netlify", "config.json"), // legacy
];

async function getToken() {
  if (process.env.NETLIFY_AUTH_TOKEN) return process.env.NETLIFY_AUTH_TOKEN;
  for (const path of CLI_CONFIG_PATHS) {
    try {
      const config = JSON.parse(await readFile(path, "utf8"));
      const users = Object.values(config.users ?? {});
      const token = users[0]?.auth?.token;
      if (token) return token;
    } catch {
      // try next location
    }
  }
  return null;
}

const token = await getToken();
if (!token) {
  console.warn(
    "[netlify-sites] No NETLIFY_AUTH_TOKEN and no local CLI login — keeping existing snapshot."
  );
  process.exit(0);
}

const response = await fetch(
  "https://api.netlify.com/api/v1/sites?per_page=100",
  { headers: { Authorization: `Bearer ${token}` } }
);
if (!response.ok) {
  console.warn(
    `[netlify-sites] API request failed (${response.status}) — keeping existing snapshot.`
  );
  process.exit(0);
}

const sites = await response.json();

/**
 * Disabled/deleted Netlify sites still appear in the API but serve a 404 —
 * probe each one so dead sites never reach the portfolio.
 */
async function isLive(url) {
  const probe = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const head = await probe("HEAD");
    if (head.ok) return true;
    if (head.status === 405 || head.status === 501) {
      return (await probe("GET")).ok;
    }
    return false;
  } catch {
    return false;
  }
}

const candidates = sites
  .filter(
    (site) =>
      site.published_deploy && !EXCLUDED_SITES.includes(site.name)
  )
  .map((site) => ({
    id: site.name,
    url: site.ssl_url || site.url,
    screenshot: site.screenshot_url ?? null,
    repo: site.build_settings?.repo_url ?? null,
    updated: site.updated_at,
  }));

const liveness = await Promise.all(candidates.map((site) => isLive(site.url)));
const dead = candidates.filter((_, i) => !liveness[i]);
if (dead.length > 0) {
  console.log(
    `[netlify-sites] Skipping ${dead.length} unreachable site(s): ${dead
      .map((site) => site.id)
      .join(", ")}`
  );
}

const deployments = candidates
  .filter((_, i) => liveness[i])
  .sort((a, b) => new Date(b.updated) - new Date(a.updated));

await writeFile(OUT_FILE, `${JSON.stringify(deployments, null, 2)}\n`);
console.log(`[netlify-sites] Wrote ${deployments.length} sites to netlify-sites.json`);
