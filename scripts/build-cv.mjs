/* eslint-env node */
/**
 * Builds the downloadable CV (src/assets/pdf/Endrit-Bejta-CV.pdf).
 *
 *   npm run build:cv
 *
 * Experience and skills come from src/data (the same data the site renders),
 * so the CV and the site can't drift. The summary, project blurbs, contact
 * details, education and languages live below. The page is laid out as HTML
 * and printed to a tagged, selectable-text A4 PDF by headless Chrome.
 */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { timeline } from "../src/data/experience.js";
import { skillGroups } from "../src/data/skills.js";
import { connect, launchChrome, shutdown } from "./lib/chrome.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src/assets/pdf/Endrit-Bejta-CV.pdf");

const person = {
  name: "Endrit Bejta",
  headline: "Software Engineer · Commerce Platforms & Frontend Architecture",
  location: "Fushë Kosovë, Kosovo",
  contact: [
    { text: "+383 49 487 989", href: "tel:+38349487989" },
    { text: "endrit.bejta@hotmail.com", href: "mailto:endrit.bejta@hotmail.com" },
    { text: "linkedin.com/in/endritbejta", href: "https://linkedin.com/in/endritbejta" },
    { text: "github.com/endritbejta", href: "https://github.com/endritbejta" },
    { text: "endritsportfolio.netlify.app", href: "https://endritsportfolio.netlify.app" },
  ],
  summary:
    "Software engineer with four years of experience owning production commerce storefronts for international brands. Strong in React, TypeScript and performance engineering, with measurable improvements to speed, accessibility and conversion. Comfortable across the stack — from storefront architecture and API integrations to full-stack applications — and in working directly with designers, marketers and product owners.",
};

const projects = [
  {
    name: "Shitblej",
    stack: "React · Node.js · Express · MongoDB · Socket.IO",
    description:
      "Full-stack peer-to-peer marketplace with a server-enforced offer, counteroffer, checkout and order flow, real-time messaging and an AI-assisted listing tool.",
    link: "github.com/endritbejta/shitblej",
  },
  {
    name: "Alfa Rent a Car",
    stack: "Next.js · TypeScript · Prisma · PostgreSQL",
    description:
      "Rental platform with a public booking site and a role-based admin dashboard; double-booking is prevented by a database exclusion constraint.",
    link: "github.com/endritbejta/alfa-rent",
  },
  {
    name: "Alfa Trade",
    stack: "React · Tailwind CSS · Framer Motion",
    description:
      "Corporate website for a petroleum distributor (client project): ten routes, product catalog and a bilingual Albanian/English interface.",
    link: "alfa-trade.netlify.app",
  },
  {
    name: "Minimalist E-commerce",
    stack: "React 19 · Vite · Tailwind CSS · Vitest",
    description:
      "Storefront with cart and one-page checkout; business logic kept framework-free and unit-tested outside the components.",
    link: "github.com/endritbejta/minimalist-e-commerce",
  },
  {
    name: "Offline Music Player",
    stack: "React Native (New Architecture) · TypeScript",
    description:
      "Cross-platform mobile music app with offline playback; patched a native audio library for New Architecture compatibility.",
  },
];

const education = {
  degree: "Bachelor of Engineering (BE), Electrical Engineering",
  school: "Universiteti i Prishtinës “Hasan Prishtina”",
  place: "Prishtina, Kosovo",
};

const languages = "Albanian — native · English — C1 (advanced)";

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const link = ({ text, href }) =>
  href ? `<a href="${href}">${escapeHtml(text)}</a>` : escapeHtml(text);

const experienceHtml = timeline
  .map((job) => {
    const [role, company] = job.title.split(" — ");
    return `
      <article class="job">
        <div class="row">
          <h3>${escapeHtml(role)} <span class="at">·</span> ${escapeHtml(company)}</h3>
          <p class="when">${escapeHtml(job.period)}</p>
        </div>
        ${job.meta ? `<p class="meta">${escapeHtml(job.meta)}</p>` : ""}
        <ul>${job.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </article>`;
  })
  .join("");

const projectsHtml = projects
  .map(
    (project) => `
      <article class="project">
        <div class="row">
          <h3>${escapeHtml(project.name)} <span class="stack">${escapeHtml(project.stack)}</span></h3>
          ${project.link ? `<p class="when">${escapeHtml(project.link)}</p>` : ""}
        </div>
        <p>${escapeHtml(project.description)}</p>
      </article>`
  )
  .join("");

// Soft skills are covered by the summary, so the CV lists technical groups only.
const skillsHtml = skillGroups
  .filter((group) => group.title !== "Professional")
  .map(
    (group) => `
      <dt>${escapeHtml(group.title)}</dt>
      <dd>${group.skills.map(escapeHtml).join(", ")}</dd>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${person.name} — CV</title>
<meta name="author" content="${person.name}">
<style>
  @page { size: A4; margin: 11mm 14mm 10mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 8.8pt/1.38 "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #1c212b;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  h1, h2, h3, p, ul, dl, dd { margin: 0; }

  header { padding-bottom: 8pt; border-bottom: 1.5pt solid #12305a; }
  h1 { font-size: 25pt; line-height: 1.1; letter-spacing: -0.015em; color: #0d1b30; }
  .top { margin-top: 3pt; }
  .headline { font-size: 10.5pt; font-weight: 600; color: #1d4f91; }
  .where { flex: none; font-size: 8.4pt; color: #4a5565; }
  .contact {
    display: flex; flex-wrap: wrap; gap: 1pt 11pt;
    margin-top: 6pt; padding: 0; list-style: none;
    font-size: 8.4pt; color: #4a5565;
  }

  section { margin-top: 9pt; }
  h2 {
    margin-bottom: 5pt; padding-bottom: 2pt;
    font-size: 8.4pt; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
    color: #12305a; border-bottom: 0.6pt solid #c9d3e0;
  }
  .summary { font-size: 9pt; line-height: 1.45; color: #2a3140; }

  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 12pt; }
  h3 { font-size: 9.6pt; font-weight: 700; color: #0d1b30; }
  .at { color: #98a3b3; font-weight: 400; }
  .when { flex: none; font-size: 8.4pt; color: #5a6575; font-variant-numeric: tabular-nums; }
  .meta { margin-top: 0.5pt; font-size: 8.4pt; color: #5a6575; }
  .job + .job, .project + .project { margin-top: 5.5pt; }
  .job ul { margin-top: 3pt; padding-left: 11pt; }
  .job li { margin-top: 1.5pt; padding-left: 1pt; }
  .job li::marker { color: #1d4f91; }

  .stack { margin-left: 4pt; font-size: 8.4pt; font-weight: 400; color: #5a6575; }
  .project p:not(.when) { margin-top: 0.5pt; color: #2a3140; }

  dl { display: grid; grid-template-columns: 38mm 1fr; gap: 2.5pt 8pt; }
  dt { font-weight: 700; color: #0d1b30; }
  dd { color: #2a3140; }

  .edu .row { align-items: baseline; }
  .edu p { color: #5a6575; }
  .edu .langs { margin-top: 3pt; color: #2a3140; }
  .edu .langs strong { color: #0d1b30; }
</style>
</head>
<body>
  <header>
    <h1>${person.name}</h1>
    <div class="row top">
      <p class="headline">${person.headline}</p>
      <p class="where">${person.location}</p>
    </div>
    <ul class="contact">${person.contact.map((c) => `<li>${link(c)}</li>`).join("")}</ul>
  </header>

  <section>
    <h2>Professional summary</h2>
    <p class="summary">${escapeHtml(person.summary)}</p>
  </section>

  <section>
    <h2>Experience</h2>
    ${experienceHtml}
  </section>

  <section>
    <h2>Selected projects</h2>
    ${projectsHtml}
  </section>

  <section>
    <h2>Skills</h2>
    <dl>${skillsHtml}</dl>
  </section>

  <section class="edu">
    <h2>Education</h2>
    <div class="row">
      <h3>${escapeHtml(education.degree)}</h3>
      <p class="when">${escapeHtml(education.place)}</p>
    </div>
    <p>${escapeHtml(education.school)}</p>
    <p class="langs"><strong>Languages</strong> &nbsp;${escapeHtml(languages)}</p>
  </section>
</body>
</html>
`;

const dir = await mkdtemp(path.join(tmpdir(), "cv-"));
const htmlFile = path.join(dir, "cv.html");
await writeFile(htmlFile, html);

const session = await launchChrome();
const cdp = await connect(session.wsUrl);
session.cdp = cdp;

try {
  await cdp.send("Page.enable");
  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url: `file://${htmlFile}` });
  await loaded;

  const { data } = await cdp.send("Page.printToPDF", {
    preferCSSPageSize: true,
    printBackground: true,
    generateTaggedPDF: true,
    generateDocumentOutline: true,
  });
  await writeFile(OUT, Buffer.from(data, "base64"));
} finally {
  await shutdown(session);
  await rm(dir, { recursive: true, force: true });
}

const pdf = await readFile(OUT);
const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
console.log(`Wrote ${path.relative(ROOT, OUT)} — ${pages} page(s), ${(pdf.length / 1024).toFixed(1)} kB`);
if (pages !== 1) {
  console.error("The CV should fit on one page — trim content in scripts/build-cv.mjs.");
  process.exit(1);
}
