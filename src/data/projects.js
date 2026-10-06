/**
 * Featured projects = the repositories pinned on GitHub, in pin order.
 *
 * GitHub supplies the facts that change (which repos, their order, description,
 * homepage URL, topics). This file supplies the editorial layer that GitHub
 * can't: the case study, role and highlights, keyed by
 * repository name. A pinned repo with no entry here still renders as a card,
 * built from its GitHub description and topics.
 *
 * Cover images live in src/assets/covers/<slug>.webp (and <slug>-mobile.webp
 * for the phone view) — see scripts/capture-covers.mjs. They're the card image
 * on the home page and the poster in the live preview.
 *
 * `preview: true` asks for the live site to be embedded on the case-study
 * page. It is only honoured for a site that allows being framed — one that
 * sends X-Frame-Options or a restrictive CSP frame-ancestors would show a blank
 * frame — and that is decided from the site's own headers (`embeddable` on
 * each pin, probed by the Netlify function and by `npm run sync:pins`). So it
 * is safe to set for every project: a site that blocks framing keeps its cover
 * image, and switches to the live preview by itself once it stops blocking.
 */

const coverFiles = import.meta.glob("../assets/covers/*.webp", {
  eager: true,
  import: "default",
});

/** Cover image for a project: "<slug>.webp", plus an optional "<slug>-mobile.webp". */
const coverFor = (slug, suffix = "") =>
  coverFiles[`../assets/covers/${slug}${suffix}.webp`] ?? null;

/** Keyed by GitHub repository name. */
const editorial = {
  shitblej: {
    preview: true,
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

  "alfa-rent": {
    preview: true,
    slug: "alfa-rent",
    title: "Alfa Rent a Car",
    role: "Solo developer",
    year: "2026",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
    problem:
      "A car rental business needs a public booking site and an internal dashboard on one codebase — with a database that can't double-book a car.",
    highlights: [
      "Public site: fleet browsing, car details, booking",
      "Admin dashboard for vehicles, reservations, customers",
      "Overlapping reservations rejected by the database itself",
      "Role-based auth, Albanian-first with a language switch",
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

  WindowSwitcher: {
    slug: "window-switcher",
    title: "WindowSwitcher",
    role: "Solo developer",
    year: "2026",
    tags: ["Swift", "SwiftUI", "macOS", "ScreenCaptureKit"],
    problem:
      "macOS's Command+Tab switches between apps, not windows. WindowSwitcher gives it Windows-style per-window Alt+Tab, with live thumbnails.",
    highlights: [
      "Each window is its own entry, with a live thumbnail",
      "Quick tap flips between your two most recent windows",
      "Rebindable shortcut, multi-display aware",
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

  "minimalist-e-commerce": {
    preview: true,
    slug: "minimalist-e-commerce",
    title: "Minimalist E-commerce",
    role: "Solo developer",
    year: "2026",
    tags: ["React", "Tailwind CSS", "Vite", "Vitest"],
    problem:
      "A storefront with the business logic kept out of the components — so pricing, cart and checkout rules are testable on their own.",
    highlights: [
      "Collections, product pages, cart drawer and one-page checkout",
      "Business logic in framework-free, unit-tested modules",
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

  alfa_globe: {
    preview: true,
    slug: "alfa-trade",
    title: "Alfa Trade",
    role: "Solo developer (client project)",
    year: "2023 — 2026",
    tags: ["React", "Tailwind CSS", "Framer Motion", "Vite"],
    problem:
      "A petroleum distributor needed a corporate site that reads as an established international brand — products, fleet programme, stations and company info in one place.",
    highlights: [
      "Ten routes: home, about, services, products, fleet, careers, contact…",
      "Product catalog with specifications and detail pages",
      "Albanian / English switch",
      "Redesigned in 2026 (Vite + Tailwind v4)",
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

  "my-portfolio": {
    preview: true,
    slug: "portfolio",
    title: "This Portfolio",
    role: "Solo developer",
    year: "2026",
    tags: ["React", "Vite", "CSS Modules"],
    problem:
      "A portfolio that stays current by itself: it reads my GitHub pins instead of a hand-edited list.",
    highlights: [
      "Featured projects driven by GitHub pins",
      "Case studies with a live site preview",
      "Command palette, scroll-spy, dark / light theme",
      "No animation library, respects reduced motion",
    ],
    caseStudy: {
      overview:
        "A single-page React app with dedicated case-study pages, a dark / light theme and a command palette. Nearly everything on it is data, and the project list is not hand-maintained: it follows the repositories pinned on my GitHub profile.",
      problem:
        "Portfolios go stale because the project list lives in code. I wanted re-pinning a repository on GitHub to be the only step needed to change what a visitor sees.",
      architecture:
        "React 18 and Vite with React Router (lazy-loaded case-study routes) and CSS Modules over a design-token layer, with no CSS framework. A Netlify function reads the GitHub profile's pinned repositories through the GraphQL API, and a shared hook renders a committed JSON snapshot immediately and swaps in the live response, so the site works offline and in local dev. An editorial layer keyed by repository name adds case studies on top.",
      decisions: [
        "Snapshot-first data: the UI never shows a loading state for content that is already in the bundle.",
        "Editorial content is separate from live data, so a newly pinned repo appears as a basic card until a case study is written for it.",
        "Motion is built from small hooks — scroll-spy, scroll progress, intersection reveals — with no animation library, and is disabled under prefers-reduced-motion — including the dot background, which is not drawn at all — or with the site's own Reduce motion switch.",
        "Theme is set before first paint by an inline script, so there's no flash.",
      ],
      challenges: [
        "Keeping live data and hand-written content consistent when either can change independently.",
        "Making the command palette fully keyboard-driven and accessible.",
      ],
      lessons: [
        "Let the source of truth live where I already maintain it (GitHub) rather than copying it into code.",
      ],
      future: ["Writing section", "Per-project analytics of which case studies get read"],
    },
  },
};

const prettify = (name) =>
  name
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Turns the GitHub pins into the project list, in pin order. */
export const buildProjects = (pins) =>
  pins.map((pin) => {
    const extra = editorial[pin.name] ?? {};
    const slug = extra.slug ?? slugify(pin.name);

    return {
      repo: pin.name,
      slug,
      title: extra.title ?? prettify(pin.name),
      problem: extra.problem ?? pin.description ?? "",
      role: extra.role ?? null,
      year: extra.year ?? new Date(pin.pushedAt).getFullYear().toString(),
      tags: extra.tags ?? [pin.language, ...pin.topics].filter(Boolean).slice(0, 4),
      highlights: extra.highlights ?? [],
      caseStudy: extra.caseStudy ?? null,
      cover: coverFor(slug),
      coverMobile: coverFor(slug, "-mobile"),
      preview: Boolean(extra.preview && pin.homepage && pin.embeddable === true),
      links: { live: pin.homepage, github: pin.url },
      updated: pin.pushedAt,
    };
  });

export const getProjectBySlug = (projects, slug) =>
  projects.find((project) => project.slug === slug);
