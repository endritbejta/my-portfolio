import alfaglobe2 from "../assets/images/alfaglobe/alfaglobe2.png";
import alfaglobe3 from "../assets/images/alfaglobe/alfaglobe3.png";
import alfaglobe4 from "../assets/images/alfaglobe/alfaglobe4.png";

import multiform2 from "../assets/images/multistepform/multiform2.png";
import multiform3 from "../assets/images/multistepform/multiform3.png";
import multiform4 from "../assets/images/multistepform/multiform4.png";
import multiform5 from "../assets/images/multistepform/multiform5.png";

import notes from "../assets/images/notesapp/notes_screenshot.png";
import notes2 from "../assets/images/notesapp/notes_Screenshot_2.png";
import notes3 from "../assets/images/notesapp/notes_Screenshot_3.png";
import notes4 from "../assets/images/notesapp/notes_Screenshot_4.png";

/**
 * Featured project definitions. Live URLs and Netlify screenshots are hydrated
 * at runtime from /api/fetch-sites, which returns only starred, published sites.
 *
 * Everything editorial (problem, highlights, case study) lives here.
 */
export const projectDefinitions = [
  {
    siteId: "shitblej",
    slug: "shitblej",
    title: "Shitblej",
    problem:
      "Kosovo has no real peer-to-peer marketplace — second-hand trade happens in Facebook groups, where there is no search, no categories and no way to judge a seller.",
    role: "Solo developer",
    year: "2026",
    tags: ["React", "React Router", "Vite", "i18next", "REST API"],
    highlights: [
      "Listing, browsing and buying flows end-to-end",
      "Nine categories with per-collection routes",
      "Buyer/seller inbox and wishlist",
      "Bilingual UI via i18next",
    ],
    github: "https://github.com/endritbejta/shitblej",
    images: [],
    caseStudy: {
      overview:
        "A peer-to-peer marketplace for second-hand goods in Kosovo — list an item in a few minutes, browse nine categories, save what you like and message the seller. Listings carry a graded condition, a price and a location, and the home page is merchandised rather than a raw feed: trending, recently added, curated collections and an editor's luxury edit.",
      problem:
        "Second-hand trade here happens in Facebook groups. There is no structured search, no categories, no condition grading and no way to tell a serious seller from a dead post. The goal was the boring infrastructure a marketplace actually needs — findable listings, a real listing flow, and a place for buyer and seller to talk.",
      architecture:
        "React SPA on Vite with React Router, talking to a REST API of its own at /api/v1 hosted on Render, with Bearer-token auth. Routes and heavy components are code-split — the product grid, product card, wishlist button and image component each load on demand, so the category and product routes do not pay for the home page's merchandising sections. Copy runs through i18next with a fallback language and an in-header switcher.",
      decisions: [
        "A REST API of its own rather than a backend-as-a-service, so listings, users and messages are modelled explicitly and the contract is mine to change.",
        "No global state library — React state and context carry the app, which keeps the bundle honest for a catalogue that mostly renders server data.",
        "Wishlist kept in localStorage as well as on the account, so saving something does not force a signup first.",
        "A single SmartImage component for every listing photo, because a marketplace is mostly user-uploaded images of unpredictable size.",
      ],
      challenges: [
        "Merchandising an empty marketplace: trending and curated sections have to look intentional before there is real traffic to derive them from.",
        "Condition and price are the whole trust model when there are no reviews yet, so both had to be unavoidable in the listing flow and legible on every card.",
        "Keeping a free-tier API responsive enough that browsing does not feel broken on a cold start.",
      ],
      lessons: [
        "A marketplace is two products — the buying flow and the selling flow — and the selling side is where people give up. It deserved the most iteration.",
        "Internationalisation is far cheaper to wire in from the first screen than to retrofit once copy is scattered through components.",
      ],
      future: [
        "Reviews and seller ratings",
        "Image upload straight from the phone camera",
        "Saved searches with notifications",
      ],
    },
  },
  {
    siteId: "endrits-e-commerce",
    slug: "minimalist-e-commerce",
    title: "Minimalist E-commerce",
    problem:
      "A storefront stripped to what sells: fast product browsing, a frictionless cart and checkout — nothing else.",
    role: "Solo developer",
    year: "2026",
    tags: ["React", "Tailwind CSS"],
    highlights: [
      "Product browsing, cart & checkout",
      "Code splitting & lazy loading",
      "Image optimization",
      "Conversion-focused, responsive UX",
    ],
    github: "https://github.com/endritbejta/minimalist-e-commerce",
    images: [],
    caseStudy: {
      overview:
        "A high-performance minimalist storefront covering the full buying flow — product browsing, cart and checkout — built with React and Tailwind CSS.",
      problem:
        "Most demo storefronts are either visually rich but slow, or fast but skeletal. The goal was a storefront that treats performance as a feature: minimal UI, instant navigation, and a buying flow with zero distractions.",
      architecture:
        "React SPA styled with Tailwind CSS. Routes are code-split so the catalog, product detail and checkout load independently; images are lazy-loaded and sized to their containers to avoid layout shift.",
      decisions: [
        "Tailwind over component libraries — a constrained utility palette keeps the UI consistent without shipping unused CSS.",
        "Code splitting along user intent (browse / inspect / buy) rather than by page count.",
      ],
      challenges: [
        "Keeping cart state consistent across routes without a heavy state library.",
        "Making 'minimalist' feel deliberate rather than unfinished — spacing and typography do the work that decoration usually does.",
      ],
      lessons: [
        "Performance budgets are easiest to hit when the design philosophy agrees with them from day one.",
      ],
      future: ["Hook up a headless commerce backend", "Add checkout form validation tests"],
    },
  },
  {
    siteId: "alfa-trade",
    slug: "alfa-trade",
    title: "Alfa Trade",
    problem:
      "A petroleum company needed a credible corporate web presence — products, divisions, locations and company info in one place.",
    role: "Solo developer (client project)",
    year: "2023 — 2026",
    tags: ["React", "Tailwind CSS", "Framer Motion"],
    highlights: [
      "Full corporate site with 10+ pages",
      "Products, fleet & agriculture divisions",
      "Station locations map",
      "Redesigned in 2026 (Vite + Tailwind v4)",
    ],
    github: "https://github.com/endritbejta/alfa_globe",
    images: [alfaglobe2, alfaglobe3, alfaglobe4],
    caseStudy: {
      overview:
        "A corporate website for a petroleum and energy company, first shipped in 2023 and fully redesigned in 2026 into a premium, multi-page corporate site — company overview, services, product catalog, fleet solutions, agriculture division, careers, locations with an interactive map, and contact.",
      problem:
        "The company had no web presence; customers had no way to browse products, find stations or evaluate the company. The 2026 redesign had a second goal: make the site feel like an established international fuel brand, not a template.",
      architecture:
        "React SPA on Vite with Tailwind CSS v4 for the design system and Framer Motion for scroll-triggered reveals. Content is fully data-driven — services, products, stations, milestones and FAQs live in data modules, so the client's copy changes never touch components. Pages are lazy-loaded; the Leaflet stations map loads only on the locations route.",
      decisions: [
        "Tailwind v4 design tokens for brand colors and spacing instead of per-component CSS — one visual system across 10+ pages.",
        "Data/UI separation strict enough that adding a product or station is a one-file change.",
        "Kept the original brand identity (reds, dark grays) while rebuilding the visual hierarchy around it.",
      ],
      challenges: [
        "Translating loose brand material (a logo and a few photos) into a coherent corporate design system.",
        "Writing realistic corporate content for an industry with strict trust expectations — no lorem ipsum anywhere.",
        "Keeping an image-heavy, animation-rich site fast on mobile connections.",
      ],
      lessons: [
        "Corporate credibility is mostly information architecture — the same facts, structured well, read as trustworthy.",
        "Client work is communication: small iterations with visible previews beat big reveals.",
      ],
      future: ["CMS integration so the client edits products themselves", "Multi-language support (Albanian/English)"],
    },
  },
  {
    siteId: "srt-albanian-translator",
    slug: "srt-albanian-translator",
    title: "SRT Albanian Translator",
    problem:
      "Albanian subtitles are scarce — this tool translates .srt subtitle files into Albanian while keeping timestamps intact.",
    role: "Solo developer",
    year: "2026",
    tags: ["JavaScript", "Tooling"],
    highlights: [
      "Parses & rebuilds .srt files",
      "Preserves cue timing exactly",
      "Runs entirely in the browser",
    ],
    github: null,
    images: [],
    caseStudy: null,
  },
  {
    siteId: "save-notes-site",
    slug: "notes-app",
    title: "Notes App",
    problem:
      "A place to capture and organize notes quickly — folders, editing and instant navigation without friction.",
    role: "Solo developer",
    year: "2023",
    tags: ["React", "Redux Toolkit", "SCSS"],
    highlights: [
      "Create, edit & delete notes",
      "Folder organization",
      "Redux-managed state",
      "URL-driven views",
    ],
    github: "https://github.com/endritbejta/notes",
    images: [notes, notes2, notes3, notes4],
    caseStudy: {
      overview:
        "A note-taking app where notes live in folders and every action — create, edit, move, delete — is instant.",
      problem:
        "Built from an online challenge: implement a multi-view notes product with real state management, not just a toy list.",
      architecture:
        "React with Redux Toolkit as the single source of truth for notes and folders, react-router for the folder/note views, SCSS modules for styling.",
      decisions: [
        "Modeled folders and notes as normalized entities so moving a note is an id swap, not an array shuffle.",
        "Kept routing state (selected folder/note) in the URL so views are shareable and refresh-safe.",
      ],
      challenges: [
        "Getting edit-in-place UX right: autosave timing, dirty state, and not losing input on navigation.",
      ],
      lessons: ["URL-as-state simplifies a surprising amount of UI logic."],
      future: ["Persist to a backend with auth", "Full-text search", "Markdown support"],
    },
  },
  {
    siteId: "endrits-multistepform",
    slug: "multi-step-form",
    title: "Multi-step Form",
    problem:
      "A checkout-style signup flow that guides users through plan selection without overwhelming them.",
    role: "Solo developer",
    year: "2023",
    tags: ["React", "CSS"],
    highlights: [
      "4-step wizard with validation",
      "Plan & add-on selection",
      "Order summary with editing",
      "Pixel-accurate to the design spec",
    ],
    github: "https://github.com/endritbejta/multistepform",
    images: [multiform2, multiform3, multiform4, multiform5],
    caseStudy: {
      overview:
        "A faithful implementation of a multi-step form challenge: personal info, plan selection, add-ons and a summary step with inline editing.",
      problem:
        "Long forms kill conversion; the challenge was to break signup into digestible steps while preserving entered state across navigation.",
      architecture:
        "React with a single form-state object lifted to the wizard container; each step is a controlled component receiving state + validators.",
      decisions: [
        "Validation runs per-step on 'next', not per-keystroke — fewer interruptions, clearer errors.",
      ],
      challenges: [
        "Keeping the summary step in sync with earlier steps, including the monthly/yearly billing toggle affecting every price shown.",
      ],
      lessons: ["A wizard is a state machine — naming the states first makes the UI fall out naturally."],
      future: ["Persist progress to localStorage", "Add keyboard-only flow testing"],
    },
  },
  {
    siteId: "endrits-movie-rating-overview-app",
    slug: "movie-ratings",
    title: "Movie Ratings",
    problem:
      "Movie fans want a fast way to check what's trending and how it's rated, without wading through a bloated site.",
    role: "Solo developer",
    year: "2023",
    tags: ["JavaScript", "CSS"],
    highlights: [
      "Trending feed from a public API",
      "Live search",
      "Zero frameworks — vanilla JS",
    ],
    github: null,
    images: [],
    caseStudy: null,
  },
];

const toProject = (def, site = null) => ({
  ...def,
  cover: site?.screenshot ?? null,
  links: {
    live: site?.url ?? null,
    github: def.github ?? site?.repo ?? null,
  },
  updated: site?.updated ?? null,
});

export const projects = projectDefinitions.map((def) => toProject(def));

/** "shitblej" → "Shitblej" (fallback for sites without a definition) */
const prettify = (id) =>
  id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export const hydrateProjects = (sites) => {
  const sitesById = new Map(sites.map((site) => [site.id, site]));
  const definedIds = new Set(projectDefinitions.map((d) => d.siteId));

  // 1. Defined projects that have a matching starred site
  const defined = projectDefinitions
    .filter((def) => sitesById.has(def.siteId))
    .map((def) => toProject(def, sitesById.get(def.siteId)));

  // 2. Starred sites that have NO editorial definition — auto-generate one
  const undeclared = sites
    .filter((site) => !definedIds.has(site.id))
    .map((site) =>
      toProject(
        {
          siteId: site.id,
          slug: site.id,
          title: prettify(site.id),
          problem: null,
          role: null,
          year: new Date(site.updated).getFullYear().toString(),
          tags: [],
          highlights: [],
          github: site.repo ?? null,
          images: [],
          caseStudy: null,
        },
        site
      )
    );

  return [...defined, ...undeclared].sort(
    (a, b) => new Date(b.updated) - new Date(a.updated)
  );
};

/** Netlify site ids already shown as featured projects. */
export const featuredSiteIds = new Set(projectDefinitions.map((p) => p.siteId));

export const getProjectBySlug = (slug) =>
  projects.find((project) => project.slug === slug);
