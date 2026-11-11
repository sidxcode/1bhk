import Image from "next/image";
import Link from "next/link";

const skills = [
  "Brand Identity",
  "Websites",
  "Product Design",
  "Framer",
  "Shopify",
  "Pitch Decks",
  "Design Systems",
  "Development",
  "+ More",
];

export default function ProfilePanel() {
  return (
    <aside className="profile-panel">
      <h1>I love making rectangles for the internet.</h1>

      <p className="profile-role">
        Design generalist, who can code.<br />
        Currently working with @studiocanine as a<br className="desktop-break" /> product designer.
      </p>

      <div className="profile-actions">
        <Link className="button button-secondary" href="/#about">About me</Link>
        <a className="button button-primary" href="mailto:hello@siddharthborman.com">
          <span>Let&apos;s talk</span>
          <Image className="button-arrow" src="/arrow-right.svg" alt="" width={14} height={14} aria-hidden="true" />
        </a>
      </div>

      <p className="profile-about" id="about">
        Started out with a love of developing websites to now curating thoughtful work for startups and established brands.
      </p>

      <div className="skill-list" aria-label="Skills">
        {skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}
      </div>
    </aside>
  );
}

