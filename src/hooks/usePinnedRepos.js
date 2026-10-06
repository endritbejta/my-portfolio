import snapshot from "../data/pinned-repos.json";
import { useRemoteData } from "./useRemoteData";

/** Repos pinned on GitHub, in pin order (snapshot until /api/pinned-repos responds). */
export function usePinnedRepos() {
  const { data: pins } = useRemoteData("/api/pinned-repos", snapshot);
  return { pins };
}
