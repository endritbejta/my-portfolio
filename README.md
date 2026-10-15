# Endrit Bejta — Portfolio

Personal portfolio of **Endrit Bejta**, a software engineer specializing in commerce platforms and frontend architecture. A single-page React application with dedicated engineering case-study pages, a dark/light theme, a command palette, and a featured-projects section driven by a single hand-written list.

**Live demo → [endritsportfolio.netlify.app](https://endritsportfolio.netlify.app/)**

---

## Highlights

- **One list of projects.** The *Featured projects* section, the case-study pages and the command palette all read `src/data/projects.js`, in the order written there. Nothing is fetched, so a project can be shown whether or not its repository is public (a private one just has no code link).
- **Live previews.** Case studies for sites that allow framing embed the deployed site in a browser frame, with a Desktop / Mobile switch, reload and open-in-new-tab. It loads on click, so visiting a case study doesn't fetch third-party sites, and the whole frame is sized to fit the visible window under the header.
- **Engineering case studies.** Each featured project links to a dedicated page: a live preview of the deployed site (or, where the site blocks framing, a snapshot linking to it), then overview → problem → architecture → technical decisions → challenges → lessons learned → future work.
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
- Deployed on **Netlify**

## Project structure

```
src/
  components/      Reusable UI (Navbar, Footer, CommandPalette, ProjectCard, ui/*)
  sections/        Home-page sections (Hero, About, FeaturedProjects, Skills, ...)
  pages/           Route components (Home, CaseStudy, NotFound)
  data/            profile, skills, experience,
                   projects.js (every project: card, links, case study, captions)
  assets/covers/     One cover image per project (card image + preview poster)
  hooks/           useTheme, useScrollSpy, useScrollProgress, useInView, useCountUp
  constants/       Nav links and section ids
  styles/          Global design tokens
scripts/           capture-covers.mjs, covers.config.mjs, build-cv.mjs
public/            favicon, robots.txt, sitemap.xml, _redirects (SPA fallback)
```

Content is separated from presentation: nearly everything shown on the site is defined in `src/data/*`. `src/data/projects.js` is the only source for the projects: each entry holds its card text, tags, links and case study, and the list's order is the order on the site.

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev      # start the dev server (Vite)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
npm run lint     # run ESLint
npm run covers        # re-capture the cover images (see below)
npm run build:cv      # rebuild the downloadable CV PDF (uses local Chrome)
```

## Projects

Everything about a project is one entry in `src/data/projects.js`: `slug`, `title`, `problem` (the card's pitch), `role`, `year`, `tags`, `highlights`, `links` (`{ live, github }`), `preview`, `captions` and the `caseStudy` itself. The file's header comment describes each field.

- **Add a project:** add an entry and, for a live site, an entry in `scripts/covers.config.mjs` so its cover image is captured (`npm run covers`).
- **Reorder or hide one:** move or remove its entry.
- **Private repository:** set `links.github` to `null` and `private: true`; the card and page show no code link and the page's Source fact reads "Private repository".
- **No live site:** set `links.live` to `null` and add screenshots (see below).

## CV

The downloadable CV (`src/assets/pdf/Endrit-Bejta-CV.pdf`) is generated, not hand-edited: `npm run build:cv` lays it out as HTML and prints a one-page, tagged A4 PDF with headless Chrome. Experience and skills come from `src/data`, so the CV and the site stay in sync; the summary, project blurbs, contact details and education live in `scripts/build-cv.mjs`. The script fails if the CV spills onto a second page.

## Live previews

A case study shows a live, interactive embed of the deployed site when its project has `preview: true` in `src/data/projects.js`. Set it only for a site that allows being framed: a site that sends `X-Frame-Options: DENY|SAMEORIGIN`, or a CSP `frame-ancestors` that doesn't list this portfolio, renders a blank frame the page can't detect. A project without `preview` shows its cover image in the same frame, linking to the live site. To check a site, look at its headers:

```bash
curl -sI https://example.netlify.app | grep -i -E 'x-frame-options|content-security-policy'
```

To make a project embeddable, allow this site in *that* project's own headers (`Content-Security-Policy: frame-ancestors 'self' https://endritsportfolio.netlify.app`, and drop any `X-Frame-Options`, which can't name an origin). Be deliberate about sites with logins or admin areas: allow it on the public pages only. The frame's title bar has window controls in the visitor's own OS style (macOS traffic lights on the left; Windows caption buttons on the right; plain round buttons for Linux, ChromeOS and anything else; macOS, iPadOS and iOS count as macOS). The navbar's command-palette hint follows the same detection: ⌘ K on macOS, Ctrl K elsewhere (the icon is always a search magnifier). They do real things to the frame: minimize folds it down to the title bar, and maximize / the green light goes fullscreen. A preview can't be closed, so ✕ shakes the container and shows an alert in the same OS style saying so (in fullscreen ✕ simply leaves fullscreen, and minimize is unavailable). The title bar holds only the controls and the address; Desktop / Mobile, reload and open-in-new-tab sit on a row beneath it. Under `npm run dev` a small "DEV system" switch (bottom-left) forces macOS, Windows or other, for both; it lives in `src/dev/OsSwitch.jsx` and is not part of a production build.

Note that a site may allow only the production origin, in which case its preview is blank under `npm run dev` (origin `localhost`).

## App screenshots

For a project with no live site to embed (a desktop app, say), drop screenshots in `src/assets/shots/<slug>/`, named `NN-what-it-shows.webp` (for example `src/assets/shots/window-switcher/01-switcher.webp`). They appear in order in a Screenshots section on the case-study page, captioned from the `captions` map in that project's entry in `src/data/projects.js` (or from the file name), and the first one becomes the card image if the project has no cover of its own.

## Cover images

Each project has two small images in `src/assets/covers/`: `<slug>.webp` (desktop) and `<slug>-mobile.webp` (phone). They are the card image on the home page and the poster in the live preview. A dependency-free script captures them from the live sites with your local Google Chrome:

```bash
npm run covers                  # everything in scripts/covers.config.mjs
npm run covers -- alfa-rent     # one project
```

The `portfolio` entry captures this site from `npm run dev`, so start the dev server first.

## Deployment

Deployed on Netlify. `public/_redirects` provides the SPA fallback so deep links (e.g. `/projects/alfa-rent`) resolve to `index.html` and are handled by the client router.

---

Built by Endrit Bejta · [GitHub](https://github.com/endritbejta) · [LinkedIn](https://linkedin.com/in/endritbejta)
