import resume from "../assets/pdf/Endrit-Bejta-CV.pdf";
import portrait from "../assets/images/coolPhotoOfMe.jpg";

/**
 * Single source of truth for personal info — mirrors the CV.
 * Update it here and it propagates everywhere.
 */
export const profile = {
  name: "Endrit Bejta",
  role: "Software Engineer",
  specialization: "Commerce platforms · Frontend architecture",
  location: "Fushë Kosovë, Kosovo",
  yearsOfExperience: "4+",
  email: "endrit.bejta@hotmail.com",
  resume,
  portrait,
  currentStack: ["React", "TypeScript", "Shopify", "Hydrogen", "Node.js"],
  summary:
    "For four years I have owned four production commerce storefronts end to end at GRENION Brands in Berlin — Banana Beauty, HelloBody, MyRapunzel and Sophie Rosenburg — covering architecture, delivery, performance and reliability.",
  about: [
    "I came to software from electrical engineering. Managing infrastructure projects at KEDS, Kosovo's electricity distribution company, taught me to think in systems, constraints and failure modes before committing to an implementation.",
    "Since 2022 I have been the engineer behind production commerce storefronts at GRENION Brands, owning them end to end — from architecture and delivery to performance and reliability. I care about the unhappy paths as much as the happy ones, and I'm most interested in the architecture that connects storefronts to the platforms behind them.",
  ],
  education: {
    school: "Universiteti i Prishtinës 'Hasan Prishtina'",
    degree: "BE Electrical Engineering",
  },
  languages: ["Albanian — native", "English — C1"],
};

export const socials = {
  github: "https://github.com/endritbejta",
  linkedin: "https://linkedin.com/in/endritbejta",
};

export const site = {
  url: "https://endritsportfolio.netlify.app",
  repo: "https://github.com/endritbejta/my-portfolio",
  version: "2.1.0",
  lastUpdated: "July 2026",
  builtWith: ["React", "Vite", "CSS Modules"],
};
