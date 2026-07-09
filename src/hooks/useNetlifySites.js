import { useEffect, useState } from "react";
import staticSnapshot from "../data/netlify-sites.json";

let cachedSites = null;
let sitesPromise = null;

const loadSites = () => {
  if (cachedSites) return Promise.resolve(cachedSites);
  if (!sitesPromise) {
    sitesPromise = fetch("/api/fetch-sites")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((sites) => {
        cachedSites = sites;
        return sites;
      });
  }
  return sitesPromise;
};

export function useNetlifySites() {
  const [sites, setSites] = useState(cachedSites ?? staticSnapshot);
  const [status, setStatus] = useState(cachedSites ? "ready" : "loading");

  useEffect(() => {
    let ignore = false;

    loadSites()
      .then((nextSites) => {
        if (!ignore) {
          setSites(nextSites);
          setStatus("ready");
        }
      })
      .catch((error) => {
        console.warn("Falling back to static Netlify snapshot:", error);
        if (!ignore) {
          // Use the static snapshot so the section still renders in local dev
          setSites(staticSnapshot);
          setStatus("ready");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return { sites, status };
}
