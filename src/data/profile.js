import resume from "../assets/pdf/Endrit-Bejta-CV.pdf";
import portrait from "../assets/images/coolPhotoOfMe.jpg";

/**
 * Single source of truth for personal info — mirrors the CV.
 * Update it here and it propagates everywhere.
 */
export const profile = {
  name: "Endrit Bejta",
  role: "Software Engineer",
  specialization: "Commerce platforms · Frontend architecture",
  location: "Fushë Kosovë, Kosovo",
  yearsOfExperience: "4+",
  email: "endrit.bejta@hotmail.com",
  resume,
  portrait,
  currentStack: ["React", "TypeScript", "Shopify", "Hydrogen", "Node.js"],
  summary:
    "For the past four years I've owned storefront engineering for international e-commerce brands — systems where a slow page is lost revenue and an inaccessible checkout is a lost customer. I work across the stack with React, TypeScript, Liquid and Hydrogen, and I measure my work in Core Web Vitals, conversion lifts and code the next engineer can maintain.",
  about: [
    "I came to software from electrical engineering. Before writing code professionally I managed distribution projects at KEDS, Kosovo's electricity distribution company — coordinating field teams, contractors and deadlines on infrastructure people depend on. That's where I learned to think in systems, constraints and failure modes before touching an implementation.",
    "From 2022 to 2026 I was the engineer behind four production storefronts at GRENION Brands (Berlin, remote) — Banana Beauty, HelloBody, MyRapunzel and Sophie Rosenburg. I owned them end-to-end: reusable component architecture in Liquid, TypeScript and React across three theme codebases, headless work with Hydrogen, API and app integrations, and A/B experiments designed with marketing. Sustained performance work lifted Google PageSpeed scores by up to 20 points per storefront.",
    "How I approach engineering: understand the system before writing code; treat the unhappy paths — loading, errors, empty states — as the actual product; treat performance and accessibility as requirements, not polish; and measure instead of guessing. Most of what looks like frontend work is really API contract design and state modeling, and getting those right is what keeps a codebase maintainable.",
    "Outside work I build things that stretch me: an offline-first React Native music player (where I patched a native audio library for New Architecture compatibility), a minimalist React storefront, and currently .NET — deliberately deepening the backend half of my stack. Longer term I'm most interested in headless commerce architecture and the engineering that sits between storefront and platform.",
  ],
  education: {
    school: "Universiteti i Prishtinës 'Hasan Prishtina'",
    degree: "BE Electrical Engineering",
  },
  languages: ["Albanian — native", "English — C1"],
};

export const socials = {
  github: "https://github.com/endritbejta",
  linkedin: "https://linkedin.com/in/endritbejta",
};

export const site = {
  url: "https://endritsportfolio.netlify.app",
  repo: "https://github.com/endritbejta/my-portfolio",
  version: "2.1.0",
  lastUpdated: "July 2026",
  builtWith: ["React", "Vite", "CSS Modules"],
};

/**
 * Honest, CV-backed numbers — shown as animated counters.
 */
export const stats = [
  { value: 4, suffix: "+", label: "Years of professional experience" },
  { value: 4, suffix: "", label: "Production storefronts owned end-to-end" },
  { value: 12, suffix: "+", label: "Technologies used in production" },
];
