const EXCLUDED_SITES = [
  "endritsportfolio", // this portfolio
  "glittery-yeot-af4710", // unpublished test site
  "papaya-eclair-6280bf", // unpublished test site
  "seat-allocation-municipality-kosovo", // older duplicate of endrit-seat-allocation-kosovo
  "my-valentines-gift-to-you", // personal
];

async function isLive(url) {
  const probe = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000); // 6s timeout to keep it fast
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

export default async (req, context) => {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({ error: "NETLIFY_AUTH_TOKEN is not configured on Netlify server." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const [response, userResponse] = await Promise.all([
      fetch(
        "https://api.netlify.com/api/v1/sites?per_page=100",
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        "https://api.netlify.com/api/v1/user",
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ]);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Netlify API error: ${response.status}` }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Netlify user API error: ${userResponse.status}` }),
        {
          status: userResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const sites = await response.json();
    const user = await userResponse.json();
    const favoriteSiteIds = new Set(user.favorite_sites ?? []);

    const candidates = sites
      .filter(
        (site) =>
          site.published_deploy &&
          favoriteSiteIds.has(site.site_id) &&
          !EXCLUDED_SITES.includes(site.name)
      )
      .map((site) => ({
        id: site.name,
        netlifyId: site.site_id,
        url: site.ssl_url || site.url,
        screenshot: site.screenshot_url ?? null,
        repo: site.build_settings?.repo_url ?? null,
        updated: site.updated_at,
      }));

    const liveness = await Promise.all(candidates.map((site) => isLive(site.url)));
    const deployments = candidates
      .filter((_, i) => liveness[i])
      .sort((a, b) => new Date(b.updated) - new Date(a.updated));

    return new Response(JSON.stringify(deployments), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600, s-maxage=600",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Serverless function error: ${error.message}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const config = {
  path: "/api/fetch-sites",
  method: ["GET"],
};
