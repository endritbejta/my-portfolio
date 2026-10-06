// Whether a site lets this portfolio put it in a frame.
//
// A site refuses with `X-Frame-Options: DENY|SAMEORIGIN`, or a CSP
// `frame-ancestors` that does not list the embedding origin. The browser then
// shows a blank frame and gives the page no way to tell, so the portfolio asks
// the site's headers up front. Shared by the Netlify function, the pin sync
// script and `npm run check:embed`.

/** Returns null when framing is allowed, otherwise the reason it is blocked. */
export const blockedReason = (headers, origin) => {
  const xfo = headers.get("x-frame-options");
  if (xfo && /^(deny|sameorigin)/i.test(xfo.trim())) return `X-Frame-Options: ${xfo}`;

  const csp = headers.get("content-security-policy") ?? "";
  const directive = csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith("frame-ancestors"));
  if (directive) {
    const sources = directive.split(/\s+/).slice(1).map((source) => source.replace(/\/$/, ""));
    const host = new URL(origin).host;
    const allowed = sources.some(
      (source) =>
        source === "*" ||
        source === origin ||
        (source.startsWith("https://*.") && host.endsWith(source.slice("https://*".length)))
    );
    if (!allowed) return `CSP ${directive}`;
  }
  return null;
};

/**
 * Fetches `url` and reports whether `origin` may frame it.
 * `embeddable` is false on any failure — a page that can't be reached can't
 * be shown either.
 */
export const probeEmbeddable = async (url, origin, timeoutMs = 6000) => {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    response.body?.cancel();
    const reason = response.ok ? blockedReason(response.headers, origin) : `HTTP ${response.status}`;
    return { embeddable: reason === null, reason };
  } catch (error) {
    return { embeddable: false, reason: error.message };
  }
};
