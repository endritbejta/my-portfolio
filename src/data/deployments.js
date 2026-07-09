import netlifySites from "./netlify-sites.json";

/**
 * Live deployments, sourced automatically from the Netlify API.
 *
 * `netlify-sites.json` is regenerated on every `npm run build` by
 * scripts/fetch-netlify-sites.mjs (deploy a new site → it appears here
 * on the next portfolio deploy). The map below adds the human details
 * the API doesn't know: display name, description, tech stack.
 * Sites without an entry still render, with a prettified name.
 * To hide a site, add it to EXCLUDED_SITES in the fetch script.
 */
const META = {
  "endrits-e-commerce": {
    name: "Minimalist E-commerce",
    description:
      "High-performance storefront with product browsing, cart and checkout — code-split and image-optimized.",
    stack: ["React", "Tailwind CSS"],
  },
  "srt-albanian-translator": {
    name: "SRT Albanian Translator",
    description: "Translates .srt subtitle files into Albanian in the browser.",
    stack: ["JavaScript"],
  },
  vaktiaramazan: {
    name: "Vakti i Ramazanit",
    description: "Ramadan prayer-time schedule for cities in Kosovo.",
    stack: ["JavaScript", "CSS"],
  },
  "endrit-seat-allocation-kosovo": {
    name: "Seat Allocation Kosovo",
    description: "Calculates parliamentary seat allocation from election results.",
    stack: ["JavaScript"],
  },
  "endrits-loan-calculator": {
    name: "Loan Calculator",
    description: "Loan payment calculator with amortization breakdown.",
    stack: ["JavaScript"],
  },
  slidingshop: {
    name: "Sliding Shop",
    description: "Animated shop UI concept with sliding product panels.",
    stack: ["JavaScript", "CSS"],
  },
  tnzshop: {
    name: "TNZ Shop",
    description: "E-commerce storefront built as a client task.",
    stack: ["React"],
  },
  "save-notes-site": {
    name: "Notes App",
    description: "Note-taking app with folders, editing and Redux-managed state.",
    stack: ["React", "Redux Toolkit", "SCSS"],
  },
  alfaglobe: {
    name: "Alfa Globe",
    description: "Marketing site for a gas company — products, locations, company info.",
    stack: ["React", "SCSS"],
  },
  "endrits-multistepform": {
    name: "Multi-step Form",
    description: "Multi-step checkout flow with per-step validation and add-ons.",
    stack: ["React", "CSS"],
  },
  "endrits-movie-rating-overview-app": {
    name: "Movie Ratings",
    description: "Trending-movie explorer with live search on a public API.",
    stack: ["JavaScript", "Fetch API"],
  },
  "endrit-movie-app": {
    name: "Movie App",
    description: "Movie browsing app built with vanilla JavaScript.",
    stack: ["JavaScript"],
  },
  "endrits-bankist-app": {
    name: "Bankist",
    description: "Banking UI with transfers, loans and session timeout.",
    stack: ["JavaScript"],
  },
  "endrits-bank-page": {
    name: "Bankist Landing",
    description: "Marketing page with lazy images, tabs and slider components.",
    stack: ["JavaScript", "CSS"],
  },
  "endrits-maps-ty": {
    name: "Mapty",
    description: "Workout tracker that pins runs and rides on a live map.",
    stack: ["JavaScript", "Leaflet", "Geolocation"],
  },
  myfirstrecipesite: {
    name: "Forkify",
    description: "Recipe search with bookmarks and interactive servings.",
    stack: ["JavaScript", "MVC"],
  },
  "endrits-trillo-app": {
    name: "Trillo",
    description: "All-in-one booking UI built entirely with flexbox.",
    stack: ["HTML", "SCSS"],
  },
  "endrits-retail-site": {
    name: "Nexter",
    description: "Real-estate landing page built entirely with CSS Grid.",
    stack: ["HTML", "SCSS"],
  },
  "endrits-pig-game": {
    name: "Pig Game",
    description: "Two-player dice game — first to 100 wins.",
    stack: ["JavaScript"],
  },
};

/** "endrits-pig-game" → "Endrits Pig Game" (fallback for unmapped sites) */
const prettify = (id) =>
  id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const mapSitesToDeployments = (sites) =>
  sites.map((site) => ({
    id: site.id,
    name: META[site.id]?.name ?? prettify(site.id),
    description: META[site.id]?.description ?? null,
    stack: META[site.id]?.stack ?? [],
    screenshot: site.screenshot,
    live: site.url,
    github: site.repo,
    updated: site.updated,
  }));

export const deployments = mapSitesToDeployments(netlifySites);
