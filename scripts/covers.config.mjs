/**
 * Where each project's cover image comes from. Two images are captured per
 * project: "<slug>.webp" (desktop) and "<slug>-mobile.webp" (phone), saved to
 * src/assets/covers/. They are the card image on the home page and the poster
 * in the live preview. `slug` matches the project in src/data/projects.js.
 *
 * `wait` is how long to let the page settle (ms) — raise it for sites that
 * load data from a slow back end.
 */
export const covers = [
  { slug: "shitblej", url: "https://shitblej.netlify.app", wait: 6000 },
  { slug: "alfa-rent", url: "https://alfa-rent.vercel.app" },
  { slug: "minimalist-e-commerce", url: "https://endrits-e-commerce.netlify.app" },
  { slug: "alfa-trade", url: "https://alfa-trade.netlify.app" },
  // Captured from the local dev server (npm run dev) since it is this repo's
  // own unreleased work. Start the server first.
  { slug: "portfolio", url: "http://localhost:5173", wait: 2500 },
];
