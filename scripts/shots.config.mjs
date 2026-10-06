/**
 * What to capture for each project. `slug` matches the project definition in
 * src/data/projects.js; files land in src/assets/screenshots/<slug>/ and are
 * shown in that order (by file name) on the case-study page.
 *
 * shot options: name, path, viewport ("desktop" | "mobile"), wait, scrollY,
 * scrollTo (selector), script (runs in-page before capture), settle.
 */
const clickFirst = (selector) =>
  `document.querySelector(${JSON.stringify(selector)})?.click();`;

export const shots = [
  {
    slug: "shitblej",
    url: "https://shitblej.netlify.app",
    shots: [
      { name: "01-home", wait: 6000 },
      { name: "02-trending", scrollY: 800, wait: 6000 },
      { name: "03-collection", path: "/collections/ladies", wait: 7000 },
      {
        name: "04-product",
        path: "/collections/ladies",
        wait: 7000,
        script: clickFirst('a[href^="/products/"]'),
        settle: 4000,
      },
      { name: "05-mobile", viewport: "mobile", wait: 6000 },
    ],
  },
  {
    slug: "alfa-rent",
    url: "https://alfa-rent.vercel.app",
    shots: [
      { name: "01-home" },
      { name: "02-fleet", path: "/car" },
      { name: "03-car-details", path: "/car/mercedes-benz-e-class-2025" },
      { name: "04-fleet-grid", path: "/car", scrollY: 740 },
      { name: "05-mobile", viewport: "mobile" },
    ],
  },
  {
    slug: "minimalist-e-commerce",
    url: "https://endrits-e-commerce.netlify.app",
    shots: [
      { name: "01-home" },
      { name: "02-catalog", path: "/collections/all", wait: 3000 },
      { name: "03-electronics", path: "/collections/electronics", wait: 3000 },
      { name: "04-mobile", viewport: "mobile" },
    ],
  },
  {
    slug: "alfa-trade",
    url: "https://alfa-trade.netlify.app",
    shots: [
      { name: "01-home" },
      { name: "02-about", path: "/about", scrollY: 640 },
      { name: "03-products", path: "/products", scrollY: 640 },
      { name: "04-fleet", path: "/fleet", scrollY: 640 },
      { name: "05-services", scrollY: 1000 },
      { name: "06-mobile", viewport: "mobile" },
    ],
  },
  {
    // Captured from the local dev server (npm run dev), since it shows this
    // repo's own unreleased work. Start the server first.
    slug: "portfolio",
    url: "http://localhost:5173",
    shots: [
      { name: "01-home", wait: 2500 },
      { name: "02-projects", scrollTo: "#projects", wait: 2500 },
      { name: "03-case-study", path: "/projects/shitblej", wait: 3000, scrollY: 380 },
      { name: "04-mobile", viewport: "mobile", wait: 2500 },
    ],
  },
];
