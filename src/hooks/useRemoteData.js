import { useEffect, useState } from "react";

// One request per URL per page load, shared by every component that asks.
const cache = new Map();

const load = (url) => {
  const entry = cache.get(url) ?? {};
  if (entry.data) return Promise.resolve(entry.data);
  if (!entry.promise) {
    entry.promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        entry.data = data;
        return data;
      })
      .catch((error) => {
        // The failed promise stays cached: one request and one warning per
        // page load, however many components ask for this data.
        console.warn(`Using the bundled snapshot for ${url}:`, error.message);
        throw error;
      });
    cache.set(url, entry);
  }
  return entry.promise;
};

/**
 * Renders `snapshot` immediately, then swaps in the live response from `url`.
 * If the request fails (local dev, offline, API down) the snapshot stays.
 *
 * `isLive` is true once the live data has arrived.
 */
export function useRemoteData(url, snapshot) {
  const cached = cache.get(url)?.data;
  const [data, setData] = useState(cached ?? snapshot);
  const [isLive, setIsLive] = useState(Boolean(cached));

  useEffect(() => {
    let ignore = false;

    load(url)
      .then((next) => {
        if (!ignore) {
          setData(next);
          setIsLive(true);
        }
      })
      .catch(() => {
        // Keep the snapshot; load() already logged why.
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, isLive };
}
