import snapshot from "../data/netlify-sites.json";
import { useRemoteData } from "./useRemoteData";

/** Starred, live Netlify sites (snapshot until /api/fetch-sites responds). */
export function useNetlifySites() {
  const { data: sites } = useRemoteData("/api/fetch-sites", snapshot);
  return { sites };
}
