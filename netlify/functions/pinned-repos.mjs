// Returns the repositories pinned on the owner's GitHub profile, in pin order.
// Pinned items are only exposed through GitHub's GraphQL API, which requires a
// token (any token works — no scopes are needed for public data).
import { probeEmbeddable } from "../lib/embeddable.mjs";

const OWNER = "endritbejta";

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            homepageUrl
            url
            pushedAt
            primaryLanguage { name }
            repositoryTopics(first: 8) { nodes { topic { name } } }
          }
        }
      }
    }
  }
`;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

export default async (req) => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return json({ error: "GITHUB_TOKEN is not configured on the Netlify site." }, 500);
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio-pinned-repos",
      },
      body: JSON.stringify({ query: QUERY, variables: { login: OWNER } }),
    });

    if (!response.ok) {
      return json({ error: `GitHub API error: ${response.status}` }, 502);
    }

    const { data, errors } = await response.json();
    if (errors?.length || !data?.user) {
      return json({ error: errors?.[0]?.message ?? "GitHub returned no user." }, 502);
    }

    // The origin asking is the origin that will frame the sites.
    const origin = new URL(req.url).origin;

    const pins = await Promise.all(
      data.user.pinnedItems.nodes.map(async (repo) => ({
        name: repo.name,
        description: repo.description,
        homepage: repo.homepageUrl || null,
        url: repo.url,
        language: repo.primaryLanguage?.name ?? null,
        topics: repo.repositoryTopics.nodes.map((node) => node.topic.name),
        pushedAt: repo.pushedAt,
        embeddable: repo.homepageUrl
          ? (await probeEmbeddable(repo.homepageUrl, origin)).embeddable
          : false,
      }))
    );

    return json(pins, 200, { "Cache-Control": "public, max-age=600, s-maxage=600" });
  } catch (error) {
    return json({ error: `Serverless function error: ${error.message}` }, 500);
  }
};

export const config = {
  path: "/api/pinned-repos",
  method: ["GET"],
};
