import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, caseStudyBySlug, type TextBlock } from "../../case-studies";
import CaseMediaGallery from "./case-media-gallery";

const aliases: Record<string, string> = { "jagdish-store": "jagdish" };
const displayTitles: Record<string, string> = { "canine-studio": "Studio Canine" };

export function generateStaticParams() {
  return [
    ...caseStudies.map((study) => ({ slug: study.slug })),
    { slug: "jagdish-store" },
  ];
}

function CaseBlock({ block }: { block: TextBlock }) {
  if ("sub" in block) return <h3>{block.sub}</h3>;
  if ("pair" in block) {
    return (
      <div className="detail-pair">
        <span>{block.pair[0]}</span>
        <p>{block.pair[1]}</p>
      </div>
    );
  }
  return <p>{block.p}</p>;
}

function JagdishPanel() {
  return (
    <aside className="project-panel jagdish-panel">
      <nav className="panel-nav" aria-label="Project navigation">
        <Link className="panel-nav-link" href="/">← <span>Back</span></Link>
        <Link className="panel-nav-link" href="/work/asanjo"><span>Next Project</span> →</Link>
      </nav>

      <header className="jagdish-intro">
        <h1>Jagdish Store</h1>
        <p>2026–2027</p>
      </header>

      <div className="jagdish-summary">
        <p>A long-running retail business moving its catalogue online.</p>
        <p>The design had to fit the way the shop already works rather than ask the shop to change.</p>
      </div>

      <div className="tag-list" aria-label="Jagdish Store disciplines">
        <span className="tag">Shopify Development</span>
        <span className="tag">E-commerce</span>
        <span className="tag">Design Systems</span>
      </div>

      <div className="profile-actions jagdish-actions">
        <Link className="button button-secondary" href="/#about">About me</Link>
        <a className="button button-primary" href="mailto:hello@siddharthborman.com">
          <span>Let&apos;s talk</span><span aria-hidden="true">→</span>
        </a>
      </div>

      <section className="jagdish-detail">
        <h2>Problem Statement</h2>
        <p>The website was attracting strong traffic, but too few visitors were converting into customers.</p>
      </section>

      <section className="jagdish-detail">
        <h2>Team</h2>
        <p>Siddharth Borman (me)<br />Prabhav Khandelwal</p>
      </section>

      <p className="next-project-prompt">
        Want to see more? Check out my <Link href="/work/asanjo">next project</Link>
      </p>
    </aside>
  );
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudyBySlug.get(aliases[slug] ?? slug);
  if (!study) notFound();

  const title = displayTitles[study.slug] ?? study.title;
  const media = study.sections.flatMap((section) => section.media ?? []);

  return (
    <main className="portfolio case-layout">
      {study.slug === "jagdish" ? <JagdishPanel /> : <aside className="project-panel">
        <Link className="detail-back" href="/">← Back to work</Link>
        <div className="project-panel-heading">
          <span className="tag">{study.discipline}</span>
          <h1>{title}</h1>
        </div>

        {study.sections.map((section, sectionIndex) => (
          <section className="project-info" key={section.heading}>
            {sectionIndex > 0 && <h2>{section.heading}</h2>}
            <div className="detail-copy">
              {section.blocks.map((block, index) => <CaseBlock block={block} key={index} />)}
            </div>
          </section>
        ))}

        {study.site?.map((site) => (
          <a className="project-site" href={site.href} target="_blank" rel="noreferrer" key={site.href}>
            {site.label} ↗
          </a>
        ))}
      </aside>}

      <CaseMediaGallery media={media} title={title} />
    </main>
  );
}
