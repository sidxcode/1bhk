import Image from "next/image";
import Link from "next/link";
import ProfilePanel from "./profile-panel";

type Project = {
  slug: string;
  title: string;
  subtitle: string;
  tags: string[];
  description: string;
  image?: { src: string; width: number; height: number };
};

const projects: Project[] = [
  {
    slug: "canine-studio",
    title: "Studio Canine.",
    subtitle: "Multidisciplinary Design Studio",
    tags: ["Brand Identity", "Development"],
    description: "Studio Canine is a Delhi-based design studio creating websites, apps, online stores and brands for startups and established companies worldwide. Detail-driven and without a fixed house style, every project is designed around what it needs to become.",
    image: { src: "/canine-studio-logo.png", width: 620, height: 620 },
  },
  {
    slug: "jagdish-store",
    title: "Jagdish Store.",
    subtitle: "Luxury Ecommerce Redesign & Development",
    tags: ["Websites", "Development"],
    description: "A redesign and development project for one of India’s trusted premium home-furnishing retailers. The new ecommerce experience brings an extensive catalogue of fabrics, bedding, rugs and décor into a refined, easier-to-browse storefront while preserving the brand’s sense of luxury.",
  },
  {
    slug: "asanjo",
    title: "Asanjo.",
    subtitle: "A brand built from the wordmark out",
    tags: ["Brand Identity", "Websites"],
    description: "Asanjo began with a name and a rough thesis. The identity, iconography and website grow from one visual idea, giving the company a system that can expand as the product matures.",
  },
  {
    slug: "eatree",
    title: "Eatree.",
    subtitle: "A warmer, clearer food court website",
    tags: ["Websites", "Development"],
    description: "A website redesign that brings Eatree's proposition forward and lets the spaces carry the story. The new structure turns the page into a clear sequence instead of a wall of features.",
    image: { src: "/eatree.png", width: 2916, height: 1736 },
  },
  {
    slug: "tata",
    title: "Tata Group & Sons.",
    subtitle: "A prioritised review workflow",
    tags: ["Product Design", "Design Systems"],
    description: "An internal review tool redesigned around priority. Comments carry a clear state and weight, helping reviewers find the decisions that block progress without sorting through every thread.",
    image: { src: "/tata-prioritized-comment-queue-19653c72.png", width: 4164, height: 2984 },
  },
  {
    slug: "spread-home",
    title: "Spread Home.",
    subtitle: "A storefront the team can run themselves",
    tags: ["Product Design", "Development"],
    description: "A Shopify redesign and build made from a focused set of reusable sections. The system gives the team room to merchandise without introducing visual drift or waiting on a developer.",
  },
  {
    slug: "happiness-coach",
    title: "Happiness Coach.",
    subtitle: "A thoughtful product for guided reflection",
    tags: ["Product Design", "Brand Identity"],
    description: "A coaching experience shaped around supportive language and calm interaction. Sessions and reflections replace streaks, scores and the pressure to keep up.",
  },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card" id={project.slug}>
      <Link className="project-link" href={`/work/${project.slug}`} aria-label={`View ${project.title} case study`}>
        <div className="project-visual">
          {project.image ? (
            <Image
              src={project.image.src}
              width={project.image.width}
              height={project.image.height}
              sizes="(max-width: 700px) calc(100vw - 48px), 67vw"
              loading={project.slug === "canine-studio" ? "eager" : "lazy"}
              alt=""
            />
          ) : null}
        </div>

        <div className="project-meta">
          <div className="tag-list" aria-label={`${project.title} disciplines`}>
            {project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
          <h2><span>{project.title}</span><br />{project.subtitle}</h2>
          <p>{project.description}</p>
        </div>
      </Link>
    </article>
  );
}

export default function Page() {
  return (
    <main className="portfolio">
      <ProfilePanel />

      <section className="projects" aria-label="Selected work">
        {projects.map((project) => <ProjectCard project={project} key={project.slug} />)}
      </section>
    </main>
  );
}
