# Endrit Bejta — Portfolio

Personal portfolio of **Endrit Bejta**, a software engineer specializing in commerce platforms and frontend architecture. A single-page React application with dedicated engineering case-study pages, a dark/light theme, a command palette, and a featured-projects section that follows the repositories pinned on my GitHub profile.

**Live demo → [endritsportfolio.netlify.app](https://endritsportfolio.netlify.app/)**

---

## Highlights

- **Featured projects follow my GitHub pins.** The *Featured projects* section shows the repositories pinned on my GitHub profile, in pin order — re-pin a repo and the site changes. A serverless function reads the pins from GitHub's GraphQL API; a committed JSON snapshot is rendered first and used as the fallback, so the site works in local dev and if the API is unreachable.
- **Live previews.** Case studies for sites that allow framing embed the deployed site in a browser frame, with a Desktop / Mobile switch, reload and open-in-new-tab. It loads on click, so visiting a case study doesn't fetch third-party sites.
- **Engineering case studies.** Each featured project links to a dedicated page: a framed screenshot walkthrough (captured from the live site, with a lightbox), then overview → problem → architecture → technical decisions → challenges → lessons learned → future work.
- **Command palette** (`⌘K` / `Ctrl+K`) for jumping to any section or case study.
- **Dark / light theme** set before first paint to avoid a flash, persisted to `localStorage`.
- **Motion, done tastefully.** Scroll-spy nav, scroll-progress bar, and intersection-triggered reveals — all built with custom hooks, no animation library, and fully disabled under `prefers-reduced-motion`. With reduced motion on, the interactive dot background and cursor-following dot aren't rendered at all. A "Reduce motion" switch in the footer (and the command palette) gives the same result to visitors who haven't set it in their OS; the OS setting always wins and is never overridden.
- **SEO & accessibility.** Meta / OpenGraph / Twitter tags, JSON-LD structured data, `sitemap.xml`, `robots.txt`, semantic landmarks, focus states, ARIA, and a skip link.
- **Performance-minded.** Route-level code splitting, lazy-loaded images, and optimized assets.

## Tech stack

- **React 18** + **Vite**
- **React Router** (client-side routing with lazy-loaded routes)
- **CSS Modules** with a design-token layer (`src/styles/global.css`) — no CSS framework
- **react-icons**
- **Netlify serverless function** for the GitHub pins
- Deployed on **Netlify**

## Project structure

```
src/
  components/      Reusable UI (Navbar, Footer, CommandPalette, ProjectCard, ui/*)
  sections/        Home-page sections (Hero, About, FeaturedProjects, Skills, ...)
  pages/           Route components (Home, CaseStudy, NotFound)
  data/            profile, skills, experience, pinned-repos.json (snapshot),
                   projects.js (editorial layer: case studies, captions)
  assets/screenshots/<slug>/   Live-site screenshots shown on case-study pages
  hooks/           useTheme, useScrollSpy, useScrollProgress, useInView, useCountUp,
                   useRemoteData, usePinnedRepos, useProjects
  constants/       Nav links and section ids
  styles/          Global design tokens
netlify/functions/ pinned-repos.mjs — returns the repos pinned on GitHub
scripts/           capture-screenshots.mjs, shots.config.mjs, sync-pins.mjs
public/            favicon, robots.txt, sitemap.xml, _redirects (SPA fallback)
```

Content is separated from presentation: nearly everything shown on the site is defined in `src/data/*`. GitHub decides *which* projects are featured and in what order; `src/data/projects.js` holds the editorial layer for each (keyed by repo name). A pinned repo with no entry still renders as a card from its GitHub description and topics.

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev      # start the dev server (Vite)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
npm run lint     # run ESLint
npm run sync:pins     # refresh src/data/pinned-repos.json from your GitHub pins (uses `gh`)
npm run screenshots   # re-capture live-site screenshots (see below)
npm run build:cv      # rebuild the downloadable CV PDF (uses local Chrome)
```

In local development the site renders from the committed snapshot (`src/data/pinned-repos.json`); the serverless function runs in the Netlify environment.

## Featured projects (GitHub pins)

`netlify/functions/pinned-repos.mjs` (`/api/pinned-repos`) returns the pinned repositories — name, description, homepage URL, topics — in pin order. Pins are only available through GitHub's GraphQL API, so set a `GITHUB_TOKEN` environment variable on the Netlify site (any token works; no scopes are needed for public data).

After changing your pins, run `npm run sync:pins` and commit the updated snapshot so local dev and the fallback stay current.

To give a newly pinned repo a case study, add an entry to `editorial` in `src/data/projects.js` (keyed by the repo name) and a block in `scripts/shots.config.mjs` for its screenshots.

## CV

The downloadable CV (`src/assets/pdf/Endrit-Bejta-CV.pdf`) is generated, not hand-edited: `npm run build:cv` lays it out as HTML and prints a one-page, tagged A4 PDF with headless Chrome. Experience and skills come from `src/data`, so the CV and the site stay in sync; the summary, project blurbs, contact details and education live in `scripts/build-cv.mjs`. The script fails if the CV spills onto a second page.

## Live previews

A case study shows a live, interactive embed when its project has `preview: true` in `src/data/projects.js`. That only works for sites that allow being framed: a site that sends `X-Frame-Options: DENY|SAMEORIGIN`, or a CSP `frame-ancestors` that doesn't list this portfolio, renders a blank frame (and the page can't detect it). Check before enabling:

```bash
npm run check:embed
```

To make another project embeddable, allow this site in *that* project's headers (`Content-Security-Policy: frame-ancestors 'self' https://endritsportfolio.netlify.app`, and drop any `X-Frame-Options`), re-run the check, then set `preview: true`. Projects without a preview keep the screenshot walkthrough.

## Screenshots

Case-study screenshots live in `src/assets/screenshots/<slug>/` and are picked up automatically, in file-name order (a name containing `mobile` is shown in a phone frame). They are captured from the live sites by a dependency-free script that drives your local Google Chrome:

```bash
npm run screenshots                    # everything in scripts/shots.config.mjs
npm run screenshots -- alfa-rent       # one project
```

`scripts/shots.config.mjs` lists, per project, the pages to capture and any in-page steps (scroll position, clicking through to a product). The `portfolio` entry captures this site from `npm run dev`, so start the dev server first.

## Deployment

Deployed on Netlify. `public/_redirects` provides the SPA fallback so deep links (e.g. `/projects/alfa-rent`) resolve to `index.html` and are handled by the client router.

---

Built by Endrit Bejta · [GitHub](https://github.com/endritbejta) · [LinkedIn](https://linkedin.com/in/endritbejta)
