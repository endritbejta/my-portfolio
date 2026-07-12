# Endrit Bejta — Portfolio

Personal portfolio of **Endrit Bejta**, a software engineer specializing in commerce platforms and frontend architecture. A single-page React application with dedicated engineering case-study pages, a dark/light theme, a command palette, and a featured-projects section that hydrates from live Netlify deployments at runtime.

**Live demo → [endritsportfolio.netlify.app](https://endritsportfolio.netlify.app/)**

---

## Highlights

- **Data-driven, self-updating projects.** The *Featured projects* and *More deployments* sections are backed by my actual Netlify account. A serverless function returns my starred, published sites — with a liveness probe so disabled or dead deployments drop out automatically — and the UI hydrates from it at runtime. A committed JSON snapshot is used as a fallback so the site renders in local dev and if the API is unreachable.
- **Engineering case studies.** Each featured project links to a dedicated page (overview → problem → architecture → technical decisions → challenges → lessons learned → future work), not just a screenshot gallery.
- **Command palette** (`⌘K` / `Ctrl+K`) for jumping to any section or case study.
- **Dark / light theme** set before first paint to avoid a flash, persisted to `localStorage`.
- **Motion, done tastefully.** Scroll-spy nav, scroll-progress bar, and intersection-triggered reveals — all built with custom hooks, no animation library, and fully disabled under `prefers-reduced-motion`.
- **SEO & accessibility.** Meta / OpenGraph / Twitter tags, JSON-LD structured data, `sitemap.xml`, `robots.txt`, semantic landmarks, focus states, ARIA, and a skip link.
- **Performance-minded.** Route-level code splitting, lazy-loaded images, and optimized assets.

## Tech stack

- **React 18** + **Vite**
- **React Router** (client-side routing with lazy-loaded routes)
- **CSS Modules** with a design-token layer (`src/styles/global.css`) — no CSS framework
- **react-icons**
- **Netlify serverless function** for the live-deployment data
- Deployed on **Netlify**

## Project structure

```
src/
  components/      Reusable UI (Navbar, Footer, CommandPalette, ProjectCard, ui/*)
  sections/        Home-page sections (Hero, About, FeaturedProjects, Skills, ...)
  pages/           Route components (Home, CaseStudy, NotFound)
  data/            Single source of truth: profile, projects, skills, experience, repos
  hooks/           useTheme, useScrollSpy, useScrollProgress, useInView, useCountUp, useNetlifySites
  constants/       Nav links and section ids
  styles/          Global design tokens
netlify/functions/ fetch-sites.mjs — returns starred, live Netlify deployments
public/            favicon, robots.txt, sitemap.xml, _redirects (SPA fallback)
```

Content is separated from presentation: nearly everything shown on the site is defined in `src/data/*`, so updating copy or adding a project is a one-file change.

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev      # start the dev server (Vite)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

In local development the featured-projects section renders from the committed snapshot (`src/data/netlify-sites.json`); the live serverless function runs in the Netlify environment.

## Live-deployment data

The *Featured projects* and *More deployments* sections read from the serverless function at `/api/fetch-sites` (`netlify/functions/fetch-sites.mjs`). It:

1. calls the Netlify API for the account's sites and the user's starred (favorite) sites,
2. keeps only published, starred sites (minus an explicit exclude list),
3. probes each URL so unreachable deployments are filtered out, and
4. returns the survivors, newest first, with a 10-minute cache.

To run it against a real account, set `NETLIFY_AUTH_TOKEN` in the Netlify site's environment variables. Star a site in the Netlify UI to feature it; unstar or disable it to remove it — no code change needed.

## Deployment

Deployed on Netlify. `public/_redirects` provides the SPA fallback so deep links (e.g. `/projects/alfa-globe`) resolve to `index.html` and are handled by the client router.

---

Built by Endrit Bejta · [GitHub](https://github.com/endritbejta) · [LinkedIn](https://linkedin.com/in/endritbejta)
