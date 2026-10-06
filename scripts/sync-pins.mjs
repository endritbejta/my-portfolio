/* eslint-env node */
/**
 * Refreshes src/data/pinned-repos.json from the GitHub profile pins, using the
 * `gh` CLI's login. This is the offline snapshot the site falls back to; on
 * Netlify the same data is served live by netlify/functions/pinned-repos.mjs.
 *
 *   npm run sync:pins
 */
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { probeEmbeddable } from "../netlify/lib/embeddable.mjs";
import { fileURLToPath } from "node:url";

const OWNER = "endritbejta";
const OUT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/data/pinned-repos.json"
);

const query = `{ user(login: "${OWNER}") { pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository {
  name description homepageUrl url pushedAt primaryLanguage { name }
  repositoryTopics(first: 8) { nodes { topic { name } } } } } } } }`;

const raw = execFileSync("gh", ["api", "graphql", "-f", `query=${query}`], {
  encoding: "utf8",
});
const nodes = JSON.parse(raw).data.user.pinnedItems.nodes;

const PORTFOLIO = "https://endritsportfolio.netlify.app";
const DEV_ORIGIN = "http://localhost:5173"; // `npm run dev`

const pins = await Promise.all(nodes.map(async (repo) => ({
  name: repo.name,
  description: repo.description,
  homepage: repo.homepageUrl || null,
  url: repo.url,
  language: repo.primaryLanguage?.name ?? null,
  topics: repo.repositoryTopics.nodes.map((n) => n.topic.name),
  pushedAt: repo.pushedAt,
  // Whether the live site lets this portfolio frame it (see embeddable.mjs):
  // from the production origin, and from `npm run dev`. Sites usually allow
  // only the former, so a local page would get a blank frame where
  // production gets a working one.
  embeddable: repo.homepageUrl ? (await probeEmbeddable(repo.homepageUrl, PORTFOLIO)).embeddable : false,
  embeddableDev: repo.homepageUrl ? (await probeEmbeddable(repo.homepageUrl, DEV_ORIGIN)).embeddable : false,
})));

await writeFile(OUT, `${JSON.stringify(pins, null, 2)}\n`);
console.log(`Wrote ${pins.length} pinned repos → ${path.relative(process.cwd(), OUT)}`);
