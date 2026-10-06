import { useState } from "react";
import {
  FiCheck,
  FiCopy,
  FiDownload,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMapPin,
} from "react-icons/fi";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { profile, socials } from "../data/profile";
import classes from "./Contact.module.css";

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — the mailto link still works.
    }
  };

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let's build something"
      description="I reply fastest by email — usually within a day."
    >
      <Reveal>
        <Card className={classes.card}>
          <div className={classes.info}>
            <div className={classes.status}>
              <span className={classes.location}>
                <FiMapPin aria-hidden="true" /> {profile.location} · CET
              </span>
            </div>
            <a href={`mailto:${profile.email}`} className={classes.email}>
              {profile.email}
            </a>
            <p className={classes.note}>
              Open to software engineering roles across frontend and commerce
              platforms, freelance work and interesting collaborations —
              remote-first.
            </p>
          </div>
          <div className={classes.actions}>
            <Button href={`mailto:${profile.email}`} icon={<FiMail />}>
              Email me
            </Button>
            <Button
              variant="secondary"
              onClick={copyEmail}
              icon={copied ? <FiCheck /> : <FiCopy />}
              aria-live="polite"
            >
              {copied ? "Copied!" : "Copy email"}
            </Button>
            <Button href={profile.resume} variant="secondary" icon={<FiDownload />} download="Endrit-Bejta-Resume.pdf">
              Resume
            </Button>
            <Button href={socials.github} variant="secondary" icon={<FiGithub />}>
              GitHub
            </Button>
            <Button href={socials.linkedin} variant="secondary" icon={<FiLinkedin />}>
              LinkedIn
            </Button>
          </div>
        </Card>
      </Reveal>
    </Section>
  );
};

export default Contact;
