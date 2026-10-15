/**
 * The projects on the site: this list is the only source. Nothing is fetched,
 * so a project shows up (or not) because it is written down here, in this
 * order, whether or not its repository is public.
 *
 * Each entry holds everything the card and the case-study page need:
 *
 *   slug        the URL: /projects/<slug>
 *   title       card and page heading
 *   problem     the one-paragraph pitch on the card and under the page title
 *   role, year  the facts on the case-study page and the year badge on the card
 *   tags        technology chips
 *   highlights  short bullets (the card shows the first two)
 *   links       { live, github }. Leave github out (null) for a private repo
 *               (and set `private: true` so the page says so), live for a
 *               project with no site
 *   preview     true to embed the live site on the case-study page. Only for
 *               a site that allows being framed (no X-Frame-Options, and no
 *               CSP frame-ancestors that excludes this site) or the frame is
 *               blank; otherwise leave it off and the cover image is shown
 *   captions    captions for the app screenshots, keyed by file name
 *   caseStudy   { overview, problem, architecture, decisions[], challenges[],
 *               lessons[], future[] }; without one the card has no page
 *
 * Images are picked up by file name, not set here:
 *
 * - Cover images live in src/assets/covers/<slug>.webp (and <slug>-mobile.webp
 *   for the phone view) — see scripts/capture-covers.mjs. They're the card
 *   image on the home page and the poster in the live preview.
 * - App screenshots (for projects with no live site to embed, like a desktop
 *   app) live in src/assets/shots/<slug>/, named "NN-what-it-shows.webp". They
 *   appear in order in a Screenshots section on the case study, captioned from
 *   `captions` (or from the file name), and the first is the card image when
 *   the project has no cover of its own.
 */

const coverFiles = import.meta.glob("../assets/covers/*.webp", {
  eager: true,
  import: "default",
});

const shotFiles = import.meta.glob("../assets/shots/*/*.webp", {
  eager: true,
  import: "default",
});

/** { slug: [{ name: "01-switcher", src }] }, in file-name order. */
const shotsBySlug = Object.entries(shotFiles).reduce((bySlug, [filePath, src]) => {
  const [, slug, name] = filePath.match(/shots\/([^/]+)\/([^/]+)\.webp$/);
  (bySlug[slug] ??= []).push({ name, src });
  return bySlug;
}, {});
Object.values(shotsBySlug).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));

/** Cover image for a project: "<slug>.webp", plus an optional "<slug>-mobile.webp". */
const coverFor = (slug, suffix = "") =>
  coverFiles[`../assets/covers/${slug}${suffix}.webp`] ?? null;

const entries = [
  {
    preview: true,
    slug: "shitblej",
    title: "Shitblej",
    links: { live: "https://shitblej.netlify.app", github: null },
    private: true,
    problem:
      "A peer-to-peer marketplace for second-hand goods in Kosovo, replacing Facebook-group trading with searchable listings, graded conditions and a server-enforced offer-to-order flow.",
    role: "Solo developer",
    year: "2026",
    tags: ["React", "Node.js", "Express", "MongoDB", "Socket.IO"],
    highlights: [
      "Offer, counteroffer, checkout and order flow enforced on the server",
      "Real-time buyer and seller messaging over Socket.IO",
      "Nine categories, with a graded condition and location on every listing",
      "Bilingual UI (i18next), wishlist and inbox",
    ],
    caseStudy: {
      overview:
        "A peer-to-peer marketplace for second-hand goods in Kosovo. Sellers list an item in a few minutes; buyers browse nine categories, save what they like and negotiate through an offer, counteroffer, checkout and order flow that the server enforces, with real-time messaging between the two. Listings carry a graded condition, a price and a location, and the home page is merchandised rather than a raw feed: trending, recently added, curated collections and an editor's luxury edit. The source repository is private.",
      problem:
        "Second-hand trade here happens in Facebook groups. There is no structured search, no categories, no condition grading and no way to tell a serious seller from a dead post. The goal was the boring infrastructure a marketplace actually needs — findable listings, a real listing flow, and a place for buyer and seller to talk.",
      architecture:
        "A React 19 single-page app on Vite with React Router, talking to the project's own Express 5 REST API at /api/v1 (MongoDB for data, Socket.IO for real-time messaging) hosted on Render, with Bearer-token auth. Routes and heavy components are code-split — the product grid, product card, wishlist button and image component each load on demand, so the category and product routes do not pay for the home page's merchandising sections. Copy runs through i18next with a fallback language and an in-header switcher.",
      decisions: [
        "A REST API of its own rather than a backend-as-a-service, so listings, users, offers and messages are modelled explicitly and the contract is mine to change.",
        "The offer flow is enforced on the server rather than the client, so a step can't be skipped or faked from the browser.",
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
    preview: true,
    slug: "alfa-rent",
    title: "Alfa Rent a Car",
    links: { live: "https://alfa-rent.vercel.app", github: "https://github.com/endritbejta/alfa-rent" },
    role: "Solo developer",
    year: "2026",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
    problem:
      "A car-rental platform with a public booking site and an admin dashboard on one codebase, where the database itself rejects overlapping reservations so a car can never be double-booked.",
    highlights: [
      "Public site: fleet browsing, car details and online booking",
      "Admin dashboard for vehicles, reservations and customers",
      "Overlapping reservations rejected by a PostgreSQL exclusion constraint",
      "Role-based auth; Albanian-first with a language switch",
    ],
    caseStudy: {
      overview:
        "Alfa Rent a Car is a rental management platform: a customer-facing website where visitors browse the fleet and book, plus an authenticated admin dashboard for managing vehicles, reservations and customers.",
      problem:
        "A rental business lives or dies on availability. The booking site has to be fast and clear for customers, while the back office needs one trustworthy source of truth — and two customers must never end up holding the same car on the same dates.",
      architecture:
        "Next.js 16 (App Router) with TypeScript. Route groups — (website) and (dashboard) — separate the public site from the admin app without affecting URLs, so each gets its own layout and auth boundary. All business logic lives in a services/ layer; pages, server actions and route handlers stay thin: validate, call a service, shape the response. Data is PostgreSQL through Prisma (Supabase in production), auth is Auth.js with role-based credentials, images go through Cloudinary, and the app deploys to Vercel.",
      decisions: [
        "Integrity in the database, not just the app: a reservations_no_overlap exclusion constraint (btree_gist), row-level security and CHECK constraints guarantee no double-booking even if application code has a bug.",
        "Migrations are written by hand and applied with prisma migrate deploy, because the constraints above aren't modelled in schema.prisma and Prisma's dev commands would drop them. An integration test fails if any is missing.",
        "Zod schemas are shared by client and server, so one definition validates a form and the payload it submits.",
        "Server Components by default, with one response envelope for every API: { success, data } or { success: false, error }.",
      ],
      challenges: [
        "Modelling date-range availability correctly, including back-to-back bookings.",
        "Keeping the public site and the admin app independent while sharing services and validation.",
        "Making local setup one command: a script starts Postgres in Docker, creates the env file and applies migrations.",
      ],
      lessons: [
        "A constraint in the database holds when every layer above it is wrong; validation in code only holds when it's right.",
        "A thin pages-and-actions layer over a services layer makes both apps easy to test without a browser.",
      ],
      future: ["Online payments at booking", "Calendar view of fleet availability in the dashboard"],
    },
  },

  {
    slug: "window-switcher",
    title: "WindowSwitcher",
    links: { live: null, github: "https://github.com/endritbejta/WindowSwitcher" },
    role: "Solo developer",
    year: "2026",
    tags: ["Swift", "SwiftUI", "macOS", "ScreenCaptureKit"],
    // Keyed by file name in src/assets/shots/window-switcher/.
    captions: {
      "01-switcher": "The switcher: every window is its own tile, with a live thumbnail, the app icon and a badge for the display it is on. (Thumbnail contents are blurred here for privacy.)",
      "02-settings": "Settings: the shortcut, the window order and which display to use.",
      "03-launch": "Open it like any Mac app; it then settles into the menu bar.",
    },
    problem:
      "A native macOS menu-bar app that gives Command+Tab Windows-style behaviour: every window is its own entry, in most-recently-used order, with a live thumbnail.",
    highlights: [
      "Every window is its own entry, with a live thumbnail and the app icon",
      "A quick tap flips between your two most recent windows",
      "Rebindable shortcut, and display-aware with a badge per screen",
      "Menu-bar agent that does nothing while idle",
    ],
    caseStudy: {
      overview:
        "A lightweight macOS utility that replaces the app-only Command+Tab with a Windows-style Alt+Tab that cycles through individual windows — three Chrome windows are three entries — each shown with a live thumbnail and the app icon.",
      problem:
        "macOS groups windows by app, so reaching a specific window of an app with several open takes extra steps. Windows' Alt+Tab treats every window as a switchable item, and that's the behaviour this app brings to macOS.",
      architecture:
        "A native SwiftUI menu-bar agent with no Dock icon. A CGEvent tap reads the shortcut and the Accessibility API raises the selected window. Live thumbnails come from ScreenCaptureKit, and the overlay uses system materials so Light and Dark mode work automatically. Nothing runs while idle: windows and previews are captured only while the switcher is open.",
      decisions: [
        "Only Accessibility is required. Screen Recording is optional — without it the switcher still works, showing app icons instead of live thumbnails.",
        "Recently-used ordering by default so a quick tap toggles between your two most recent windows, with a Fixed mode that keeps tiles in place.",
        "The hot-key handler reads its binding live, so changed settings take effect on the next keystroke with no restart.",
        "Multi-display aware: windows are badged with their display, the overlay opens where you're working, and the list can be limited to that display.",
      ],
      challenges: [
        "macOS records a privacy grant against an app's code-signing designated requirement, not its name. When that changes, the switch still reads “on” while the app isn't trusted. The app detects the cases at launch and offers the matching repair.",
        "Taking over Command+Tab from the system switcher by swallowing the event.",
        "Keeping the overlay instant to open while only capturing thumbnails on demand.",
      ],
      lessons: [
        "Permissions are part of the product on macOS: setup, failure states and recovery deserve as much design as the happy path.",
      ],
      future: ["A signed, notarised release to remove the build-from-source step"],
    },
  },

  {
    preview: true,
    slug: "minimalist-e-commerce",
    title: "Minimalist E-commerce",
    links: { live: "https://endrits-e-commerce.netlify.app", github: "https://github.com/endritbejta/minimalist-e-commerce" },
    role: "Solo developer",
    year: "2026",
    tags: ["React", "Tailwind CSS", "Vite", "Vitest"],
    problem:
      "A storefront whose pricing, cart and checkout rules live in plain, unit-tested modules instead of components, so the logic can be tested without rendering anything.",
    highlights: [
      "Collections, product pages, cart drawer and a one-page checkout",
      "Business logic in framework-free modules covered by Vitest",
      "React 19 with the React Compiler",
      "Fly-to-cart animation on the Web Animations API",
    ],
    caseStudy: {
      overview:
        "Minimalist Essentials is a storefront covering the full buying flow: collections, product pages, a cart drawer and a checkout. It is client-side only — the catalog is static data and the cart and placed orders live in localStorage.",
      problem:
        "In most storefront demos the rules — price formatting, cart lines, totals, validation — end up scattered through components, where they can drift. Here they live in plain modules that can be tested without rendering anything.",
      architecture:
        "React 19 with the React Compiler, built with Vite and styled with Tailwind; routing by React Router 7 with code-split pages. src/lib holds framework-free logic: catalog lookups, cart line identity, checkout totals and validation, order records and price formatting. Contexts are split into a context file and a provider so Fast Refresh keeps working, and Vitest covers the logic modules.",
      decisions: [
        "Nothing imports the product data to look something up — lib/catalog.js owns lookups and the collection registry, so a new collection is reachable automatically and unknown URLs 404 properly.",
        "A cart line is identified by variant and customization, not product id, so two colours of one shirt are two lines.",
        "Checkout arithmetic is one pure function, rendered through one shared row component, so the cart drawer and checkout can't disagree about a total.",
        "Checkout is one page, not a stepper. There is no payment step, so the steps were costing more attention than the form.",
        "No card form at all: a realistic payment form on a demo store is a phishing layout with a friendly name, so a notice says plainly that nothing is charged.",
      ],
      challenges: [
        "Fly-to-cart: a disc arcs from the button to the cart icon on the compositor, and the item is added when it lands.",
        "Overlays that don't fight each other — a reference-counted scroll lock so overlapping drawers can't unlock the page early, and closed overlays marked inert.",
        "Form errors that appear only after a field has been left once, then update live — noisy mid-typing, helpful afterwards.",
      ],
      lessons: [
        "Keeping logic out of components pays back immediately in tests, and again every time the UI changes.",
        "Deleting a step (the stepper, the payment form) did more for the experience than polishing it would have.",
      ],
      future: ["Connect a headless commerce backend", "End-to-end checkout tests"],
    },
  },

  {
    preview: true,
    slug: "alfa-trade",
    title: "Alfa Trade",
    links: { live: "https://alfa-trade.netlify.app", github: "https://github.com/endritbejta/alfa_globe" },
    role: "Solo developer (client project)",
    year: "2023 — 2026",
    tags: ["React", "Tailwind CSS", "Framer Motion", "Vite"],
    problem:
      "A corporate website for a petroleum distributor in Kosovo (a client project): products, fleet programme, stations and company information, in Albanian and English.",
    highlights: [
      "Ten routes, from the home page to careers and contact",
      "Product catalog with specifications and detail pages",
      "Albanian / English switch",
      "Redesigned in 2026 on Vite and Tailwind v4",
    ],
    caseStudy: {
      overview:
        "A premium corporate website for Alfa Trade, a petroleum distribution company operating fuel stations and a bulk-delivery network across Kosovo. First shipped in 2023, then fully redesigned in 2026.",
      problem:
        "The company needed customers to be able to browse products, understand the fleet programme, find stations and evaluate the business. The redesign had a second goal: make the site feel like an established fuel brand, not a template.",
      architecture:
        "React 18 on Vite with React Router 6 and route-level code splitting via React.lazy. Tailwind CSS v4 carries the brand tokens in @theme, Framer Motion handles scroll reveals and the drawer navigation, and Leaflet powers the stations map and loads only where it's needed. Content is data: services, products, stations and milestones live in src/data, so copy changes never touch components.",
      decisions: [
        "Tailwind v4 design tokens for brand colours and spacing, instead of per-component CSS — one visual system across every page.",
        "A strict data/UI split — adding a product or a station is a one-file change.",
        "Kept the original brand identity (red and dark greys) while rebuilding the visual hierarchy around it.",
        "Composable page sections (Hero, StatsBand, StationsMap…) assembled by thin route components.",
      ],
      challenges: [
        "Turning loose brand material — a logo and a few photos — into a coherent corporate design system.",
        "Writing realistic corporate content for an industry with strict trust expectations; no lorem ipsum anywhere.",
        "Keeping an image-heavy, animated site fast on mobile connections.",
      ],
      lessons: [
        "Corporate credibility is mostly information architecture — the same facts, structured well, read as trustworthy.",
        "Client work is communication: small previews beat big reveals.",
      ],
      future: ["CMS integration so the client edits products themselves"],
    },
  },

  {
    preview: true,
    slug: "portfolio",
    title: "This Portfolio",
    links: { live: "https://endritsportfolio.netlify.app", github: "https://github.com/endritbejta/my-portfolio" },
    role: "Solo developer",
    year: "2026",
    tags: ["React", "Vite", "CSS Modules"],
    problem:
      "This site: a hand-built React portfolio whose project pages embed the live sites, with a command palette, light and dark themes and a few interactions written without an animation library.",
    highlights: [
      "Case studies with a live, interactive preview of each site",
      "Command palette, scroll-spy and a dark / light theme",
      "Dot background painted on one canvas, with a Reduce motion switch",
      "No animation library; motion respects reduced-motion settings",
    ],
    caseStudy: {
      overview:
        "A single-page React app with dedicated case-study pages, a dark / light theme and a command palette. All of its content lives in a few plain data files, and each project page can embed the deployed site so a visitor can use it without leaving.",
      problem:
        "A portfolio has to let someone judge the work quickly. Screenshots go stale and say little, so the aim was for each project page to show the real, running site, and for the whole thing to stay light enough to feel smooth on an ordinary laptop.",
      architecture:
        "React 18 and Vite with React Router (lazy-loaded case-study routes) and CSS Modules over a design-token layer, with no CSS framework. Content is data: projects, experience and skills are plain modules, and images are picked up from the file system by name. A case-study page embeds the live site in an iframe, with a cover image in its place when a site doesn't allow framing. The background dots are painted on a single canvas, and the dots, the cursor dot and the footer eyes share one mouse listener.",
      decisions: [
        "One list of projects in a single file, in display order: adding, reordering or hiding a project is a one-file change, and a project can be shown without its repository being public.",
        "The live preview is opt-in per project, because a site that forbids framing renders a blank frame the page can't detect; those projects keep their cover image instead.",
        "Motion is built from small hooks — scroll-spy, scroll progress, intersection reveals — with no animation library, and is disabled under prefers-reduced-motion — including the dot background, which is not drawn at all — or with the site's own Reduce motion switch.",
        "Theme is set before first paint by an inline script, so there's no flash.",
      ],
      challenges: [
        "Keeping the dot background cheap. As roughly a thousand styled elements it cost about 9 ms of every frame on a fast laptop and fell to a few frames per second on a slowed CPU, so it is now painted on one canvas.",
        "Embedding other sites: each one has to allow framing, and a refusal is silent, so the preview is checked per project rather than assumed.",
        "Making the command palette fully keyboard-driven and accessible.",
      ],
      lessons: [
        "Measure animation on a slowed CPU, not only on a fast machine: the dot field looked fine at 60 fps on a new laptop and was the heaviest thing on the page.",
        "Plain data files beat a clever pipeline for a list this size.",
      ],
      future: ["Writing section", "Per-project analytics of which case studies get read"],
    },
  },
];

const prettify = (name) =>
  name
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/** The projects, in the order they appear on the site. */
export const projects = entries.map((entry) => {
  const shots = (shotsBySlug[entry.slug] ?? []).map(({ name, src }) => ({
    src,
    caption: entry.captions?.[name] ?? prettify(name.replace(/^\d+-/, "")),
  }));

  return {
    role: null,
    highlights: [],
    caseStudy: null,
    private: false,
    ...entry,
    cover: coverFor(entry.slug) ?? shots[0]?.src ?? null,
    coverMobile: coverFor(entry.slug, "-mobile"),
    shots,
    links: { live: null, github: null, ...entry.links },
    preview: Boolean(entry.preview && entry.links?.live),
  };
});

export const getProjectBySlug = (slug) => projects.find((project) => project.slug === slug);
