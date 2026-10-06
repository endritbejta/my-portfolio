/**
 * Featured projects = the repositories pinned on GitHub, in pin order.
 *
 * GitHub supplies the facts that change (which repos, their order, description,
 * homepage URL, topics). This file supplies the editorial layer that GitHub
 * can't: the case study, role, highlights and screenshot captions, keyed by
 * repository name. A pinned repo with no entry here still renders as a card,
 * built from its GitHub description and topics.
 *
 * Screenshots live in src/assets/screenshots/<slug>/ (see
 * scripts/capture-screenshots.mjs) and are picked up automatically.
 */

const screenshotFiles = import.meta.glob("../assets/screenshots/*/*.webp", {
  eager: true,
  import: "default",
});

/** { slug: [{ name: "01-home", src }] } with files in name order. */
const screenshotsBySlug = Object.entries(screenshotFiles).reduce(
  (bySlug, [filePath, src]) => {
    const [, slug, file] = filePath.match(/screenshots\/([^/]+)\/([^/]+)\.webp$/);
    (bySlug[slug] ??= []).push({ name: file, src });
    return bySlug;
  },
  {}
);
Object.values(screenshotsBySlug).forEach((list) =>
  list.sort((a, b) => a.name.localeCompare(b.name))
);

/** Keyed by GitHub repository name. */
const editorial = {
  shitblej: {
    slug: "shitblej",
    title: "Shitblej",
    role: "Solo developer · full-stack",
    year: "2026",
    tags: ["React", "Node.js", "MongoDB", "Socket.IO"],
    problem:
      "Peer-to-peer selling in Kosovo needs more than a listings page — a marketplace where price negotiation, checkout and messaging follow one enforced flow.",
    highlights: [
      "Offer → counteroffer → checkout → order flow",
      "Real-time updates and order-gated messaging",
      "Search, filters, saved items, profiles",
      "AI listing assistant: photo → draft listing",
    ],
    captions: {
      "01-home": "Landing page — search, category navigation and popular categories.",
      "02-trending": "Category browsing and the trending carousel, fed by the live API.",
      "03-collection": "A category page with condition, price and sort filters.",
      "04-product": "Product detail — gallery, condition, seller card and chat entry point.",
      "05-mobile": "Mobile layout with a bottom tab bar for the core actions.",
    },
    caseStudy: {
      overview:
        "Shitblej (Albanian for “sell” + “buy”) is a full-stack marketplace for discovering, listing, negotiating, buying and selling products. One repository holds a versioned REST API, a real-time layer and a responsive React web app.",
      problem:
        "Casual classifieds leave the hard part — agreeing a price and trusting the deal — to loose chat threads. The goal was to make negotiation a first-class, structured flow: a buyer makes an offer, the seller accepts, declines or counters, and only an accepted offer can be checked out into an order.",
      architecture:
        "A monorepo with four parts. The backend is Node.js with Express 5, MongoDB via Mongoose, Socket.IO for real-time events, JWT auth, Zod validation and Cloudinary for images. The web app is React 19 on Vite with Tailwind, React Router, Axios, i18next and Swiper. A separate TypeScript service (Fastify + the Anthropic SDK with vision) turns a photo into a draft listing. Playwright drives a browser against the real stack. The frontend deploys to Netlify and the API to Render.",
      decisions: [
        "The transaction flow is enforced on the server. The UI hides invalid actions, but the API is the boundary — messaging between two users is only authorised once an order exists.",
        "Two health probes with different jobs: /health says the process is alive and checks nothing external; /health/ready pings MongoDB and returns 503 so a load balancer routes around a sick instance.",
        "Every request carries an X-Request-Id that is echoed back and attached to every log line, and the logger redacts credentials itself so no call site can leak one.",
        "Image storage is pluggable: a local driver lets a fresh clone list a product without a Cloudinary account, and the API refuses to start with it in production.",
      ],
      challenges: [
        "Rate limiting behind a reverse proxy — without trusting the proxy hop, every client appears to share one IP and one user can exhaust the login limit for everyone.",
        "Keeping a state machine (offers, counteroffers, orders) consistent across REST calls and real-time events.",
        "Testing across layers: Jest + Supertest with an in-memory MongoDB for the API, Vitest + Testing Library for the UI, and Playwright end to end.",
      ],
      lessons: [
        "Put the rule where it can't be bypassed. Client-side checks are UX; the server is the security boundary.",
        "Operational details — probes, request IDs, log redaction — are cheap early and expensive to retrofit.",
      ],
      future: [
        "Translate page copy (the English / Albanian / Serbian locale files currently cover the site chrome only)",
        "Payments integration at checkout",
      ],
    },
  },

  "alfa-rent": {
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
    captions: {
      "01-home": "Landing page — hero with a date and category search bar.",
      "02-fleet": "The fleet page with category, transmission, budget and sort filters.",
      "03-car-details": "Car detail page — specs, daily price and a date picker for the booking.",
      "04-fleet-grid": "The vehicle grid, with availability badges and daily prices.",
      "05-mobile": "Mobile layout of the landing page.",
    },
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
    captions: {
      "01-home": "Home — hero carousel with Our Favourite / Best Sellers tabs.",
      "02-catalog": "Shop All, with sort and a switchable grid density.",
      "03-electronics": "A collection page — collections are driven by the catalog data.",
      "04-mobile": "Mobile layout of the home page.",
    },
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
    slug: "alfa-globe",
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
    captions: {
      "01-home": "Home — hero with delivery options and certifications.",
      "02-about": "About — company story, mission and values.",
      "03-products": "Product catalog — fuels, lubricants and AdBlue®.",
      "04-fleet": "Fleet programme — controlled access, reporting and invoicing.",
      "05-services": "Services section of the home page.",
      "06-mobile": "Mobile layout of the home page.",
    },
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
    slug: "portfolio",
    title: "This Portfolio",
    role: "Solo developer",
    year: "2026",
    tags: ["React", "Vite", "CSS Modules"],
    problem:
      "A portfolio that stays current by itself: it reads my GitHub pins and live Netlify deployments instead of a hand-edited list.",
    highlights: [
      "Featured projects driven by GitHub pins",
      "Live Netlify deployments with a liveness check",
      "Command palette, scroll-spy, dark / light theme",
      "No animation library, respects reduced motion",
    ],
    captions: {
      "01-home": "Home — hero, with the command palette hint in the nav.",
      "02-projects": "Featured projects, with tag filtering and search.",
      "03-case-study": "A case-study page with its screenshot gallery.",
      "04-mobile": "Mobile layout of the home page.",
    },
    caseStudy: {
      overview:
        "A single-page React app with dedicated case-study pages, a dark / light theme and a command palette. Nearly everything on it is data, and the project list is not hand-maintained: it follows the repositories pinned on my GitHub profile.",
      problem:
        "Portfolios go stale because the project list lives in code. I wanted re-pinning a repository on GitHub — or starring a site on Netlify — to be the only step needed to change what a visitor sees.",
      architecture:
        "React 18 and Vite with React Router (lazy-loaded case-study routes) and CSS Modules over a design-token layer, with no CSS framework. Two Netlify functions feed it: one reads the GitHub profile's pinned repositories through the GraphQL API, the other lists starred Netlify sites and probes each URL so dead deployments drop out. A shared hook renders a committed JSON snapshot immediately and swaps in the live response, so the site works offline and in local dev. An editorial layer keyed by repository name adds case studies and captions on top.",
      decisions: [
        "Snapshot-first data: the UI never shows a loading state for content that is already in the bundle.",
        "Editorial content is separate from live data, so a newly pinned repo appears as a basic card until a case study is written for it.",
        "Motion is built from small hooks — scroll-spy, scroll progress, intersection reveals — with no animation library, and is disabled under prefers-reduced-motion.",
        "Theme is set before first paint by an inline script, so there's no flash.",
      ],
      challenges: [
        "Keeping live data and hand-written content consistent when either can change independently.",
        "Making the command palette fully keyboard-driven and accessible.",
      ],
      lessons: [
        "Let the source of truth live where I already maintain it (GitHub, Netlify) rather than copying it into code.",
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

const toImages = (slug, captions = {}) =>
  (screenshotsBySlug[slug] ?? []).map(({ name, src }) => ({
    src,
    caption: captions[name] ?? prettify(name.replace(/^\d+-/, "")),
    mobile: name.includes("mobile"),
  }));

/** Turns the GitHub pins into the project list, in pin order. */
export const buildProjects = (pins) =>
  pins.map((pin) => {
    const extra = editorial[pin.name] ?? {};
    const slug = extra.slug ?? slugify(pin.name);
    const images = toImages(slug, extra.captions);

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
      images,
      cover: images[0]?.src ?? null,
      links: { live: pin.homepage, github: pin.url },
      updated: pin.pushedAt,
    };
  });

export const getProjectBySlug = (projects, slug) =>
  projects.find((project) => project.slug === slug);

const hostOf = (url) => {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
};

const repoKey = (url) => url?.toLowerCase().replace(/\.git$/, "").replace(/\/$/, "") ?? null;

/** True when a Netlify site is already shown as a featured (pinned) project. */
export const isFeaturedSite = (site, pins) =>
  pins.some(
    (pin) =>
      (pin.homepage && hostOf(pin.homepage) === hostOf(site.url)) ||
      (pin.url && repoKey(pin.url) === repoKey(site.repo))
  );
