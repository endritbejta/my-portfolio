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

const pins = nodes.map((repo) => ({
  name: repo.name,
  description: repo.description,
  homepage: repo.homepageUrl || null,
  url: repo.url,
  language: repo.primaryLanguage?.name ?? null,
  topics: repo.repositoryTopics.nodes.map((n) => n.topic.name),
  pushedAt: repo.pushedAt,
}));

await writeFile(OUT, `${JSON.stringify(pins, null, 2)}\n`);
console.log(`Wrote ${pins.length} pinned repos → ${path.relative(process.cwd(), OUT)}`);
