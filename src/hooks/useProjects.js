import { useMemo } from "react";
import { buildProjects } from "../data/projects";
import { usePinnedRepos } from "./usePinnedRepos";

/** Featured projects (GitHub pins + editorial content), plus the raw pins. */
export function useProjects() {
  const { pins } = usePinnedRepos();
  const projects = useMemo(() => buildProjects(pins), [pins]);
  return { projects, pins };
}
