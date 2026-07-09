import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Reveal from "../components/ui/Reveal";
import Section from "../components/ui/Section";
import { skillGroups } from "../data/skills";
import classes from "./Skills.module.css";

const Skills = () => (
  <Section
    id="skills"
    eyebrow="Toolbox"
    title="Technical skills"
    description="Grouped by where they live in the stack — strongest first."
  >
    <div className={classes.grid}>
      {skillGroups.map((group, index) => (
        <Reveal key={group.title} delay={(index % 3) * 80}>
          <Card className={classes.group}>
            <h3>{group.title}</h3>
            <ul role="list">
              {group.skills.map((skill) => (
                <li key={skill}>
                  <Badge>{skill}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      ))}
    </div>
  </Section>
);

export default Skills;
