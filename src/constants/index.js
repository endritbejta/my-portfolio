/** Section ids double as anchor targets and scroll-spy keys. */
export const NAV_LINKS = [
  { id: "projects", label: "Projects" },
  { id: "deployments", label: "Deployments" },
  { id: "open-source", label: "Open Source" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export const SECTION_IDS = ["hero", ...NAV_LINKS.map((link) => link.id)];
