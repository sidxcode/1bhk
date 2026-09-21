// Case study content. Text is placeholder scaffolding shaped like the real thing —
// replace the copy per project; the layout adapts to any number of sections and media.

export type TextBlock =
  | { p: string }
  | { sub: string }
  | { pair: [string, string] };

// A media card with no image renders as an empty frame, matching the gallery placeholders.
export type MediaBlock = {
  image?: { src: string; width: number; height: number };
  caption?: string;
};

export type CaseStudySection = {
  heading: string;
  blocks: TextBlock[];
  media?: MediaBlock[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  discipline: string;
  site?: { label: string; href: string }[];
  sections: CaseStudySection[];
};

const canineStudio = { src: "/canine-studio.png", width: 2914, height: 1736 };
const eatree = { src: "/eatree.png", width: 2916, height: 1736 };
const tata = { src: "/tata-prioritized-comment-queue-19653c72.png", width: 4164, height: 2984 };

export const caseStudies: CaseStudy[] = [
  {
    slug: "canine-studio",
    title: "Canine Studio",
    discipline: "Web & Brand Design",
    site: [{ label: "caninestudio.in", href: "https://caninestudio.in" }],
    sections: [
      {
        heading: "Canine Studio",
        blocks: [
          { p: "Canine Studio needed an identity and a site that read as a studio with a point of view, not a portfolio template." },
          { p: "The brief was less about explaining services and more about signalling taste — the site had to do the filtering, so the right clients recognised themselves in it before the first call." },
          { p: "I worked across the brand identity and the web design, building a visual language that stays quiet where it should and precise everywhere else." },
        ],
        media: [{ image: canineStudio, caption: "Home page" }, {}],
      },
      {
        heading: "About",
        blocks: [
          { pair: ["Studio", "An independent design studio working with early-stage product teams on brand, web and interface design."] },
          { pair: ["Team", "Siddharth Borman"] },
          { pair: ["Year", "2025"] },
        ],
      },
      {
        heading: "Approach",
        blocks: [
          { p: "The structure came first: a single continuous page where work, writing and contact sit on one plane, so nothing is more than a scroll away." },
          { p: "Type does most of the work. One family, a tight scale, and generous negative space around every block — the restraint is the identity." },
        ],
        media: [{}, {}],
      },
      {
        heading: "Visual style",
        blocks: [
          { sub: "Palette" },
          { p: "A warm neutral ground with a single adjustable accent, so the studio can shift tone across campaigns without redrawing the system." },
          { sub: "Motion" },
          { p: "Transitions are short and directional — they explain where you came from rather than decorating the arrival." },
        ],
        media: [{ caption: "Type specimen" }, {}, {}],
      },
    ],
  },
  {
    slug: "asanjo",
    title: "Asanjo",
    discipline: "Web & Brand Design",
    sections: [
      {
        heading: "Asanjo",
        blocks: [
          { p: "Asanjo came in with a name, a rough thesis and no visual language at all." },
          { p: "The work was to give the company a first identity it could grow into — something that would still hold once the product caught up with the ambition." },
        ],
        media: [{}, {}],
      },
      {
        heading: "About",
        blocks: [
          { pair: ["Scope", "Brand identity, web design"] },
          { pair: ["Team", "Siddharth Borman"] },
          { pair: ["Year", "2025"] },
        ],
      },
      {
        heading: "Approach",
        blocks: [
          { p: "We started from the wordmark and let it set the rules — the counters and the stroke weight ended up defining the grid, the iconography and eventually the site's rhythm." },
          { p: "Everything downstream is a consequence of that one drawing, which keeps the system cheap to extend." },
        ],
        media: [{ caption: "Wordmark iterations" }, {}],
      },
      {
        heading: "Visual style",
        blocks: [
          { p: "Explorations across the visual language — iconography, layout studies, and the first pass at the marketing site." },
        ],
        media: [{}, {}, {}],
      },
    ],
  },
  {
    slug: "eatree",
    title: "Eatree",
    discipline: "Web Design",
    sections: [
      {
        heading: "Eatree",
        blocks: [
          { p: "Eatree's site had the right content in the wrong order — the proposition was buried three screens down and the page asked for commitment before it had earned any." },
          { p: "The redesign reorders the argument and gets the product on screen immediately." },
        ],
        media: [{ image: eatree, caption: "Landing page" }, {}],
      },
      {
        heading: "About",
        blocks: [
          { pair: ["Scope", "Web design"] },
          { pair: ["Team", "Siddharth Borman"] },
          { pair: ["Year", "2025"] },
        ],
      },
      {
        heading: "Approach",
        blocks: [
          { p: "One idea per screen, each one resolving before the next begins. The page reads as a sequence of claims rather than a wall of features." },
          { p: "Imagery carries the warmth so the type can stay plain." },
        ],
        media: [{}, {}],
      },
      {
        heading: "Visual style",
        blocks: [
          { sub: "Layout" },
          { p: "A wide, generous grid that collapses to a single column early, so the mobile reading order is the same argument at the same pace." },
        ],
        media: [{}, {}],
      },
    ],
  },
  {
    slug: "tata",
    title: "Tata Group & Sons",
    discipline: "Product Design",
    sections: [
      {
        heading: "Tata Group & Sons",
        blocks: [
          { p: "An internal review tool where comment volume had outgrown the interface — reviewers were losing decisions inside threads that no longer had a shape." },
          { p: "The work was to give the queue a priority model and make the next action obvious from a standing start." },
        ],
        media: [{ image: tata, caption: "Prioritised comment queue" }, {}],
      },
      {
        heading: "About",
        blocks: [
          { pair: ["Scope", "Product design"] },
          { pair: ["Team", "Siddharth Borman"] },
          { pair: ["Year", "2024"] },
        ],
      },
      {
        heading: "Approach",
        blocks: [
          { p: "We stopped treating comments as a flat list. Each one carries a state and a weight, and the queue sorts on both — so the thing that blocks a release surfaces above the thing that is merely unresolved." },
          { p: "The reviewer never chooses what to look at next; the queue has already chosen." },
        ],
        media: [{}, {}],
      },
      {
        heading: "Interface",
        blocks: [
          { sub: "Density" },
          { p: "Built for people who live in this screen all day — compact rows, keyboard-first movement, and no decoration competing with status." },
          { sub: "States" },
          { p: "Every row reads its status without colour alone, which kept the system usable under the existing accessibility bar." },
        ],
        media: [{ caption: "Queue states" }, {}, {}],
      },
    ],
  },
  {
    slug: "jagdish",
    title: "Jagdish Store",
    discipline: "Product Design",
    sections: [
      {
        heading: "Jagdish Store",
        blocks: [
          { p: "A long-running retail business moving its catalogue online for the first time, with inventory habits that predate any of the software." },
          { p: "The design had to fit the way the shop already works rather than ask the shop to change." },
        ],
        media: [{}, {}],
      },
      {
        heading: "About",
        blocks: [
          { pair: ["Scope", "Product design"] },
          { pair: ["Team", "Siddharth Borman"] },
          { pair: ["Year", "2024"] },
        ],
      },
      {
        heading: "Approach",
        blocks: [
          { p: "We mapped the counter workflow first and let it dictate the data model — categories match how stock is physically shelved, not how a taxonomy would prefer it." },
          { p: "Familiarity was worth more than elegance here." },
        ],
        media: [{ caption: "Catalogue structure" }, {}],
      },
      {
        heading: "Interface",
        blocks: [
          { p: "Screens from the catalogue, the item detail, and the order flow." },
        ],
        media: [{}, {}, {}],
      },
    ],
  },
  {
    slug: "spread-home",
    title: "Spread Home",
    discipline: "Product Design",
    sections: [
      {
        heading: "Spread Home",
        blocks: [
          { p: "A Shopify storefront redesign and build, taken from an inherited theme that had been patched past the point of editing." },
          { p: "The goal was a store the team could actually run — merchandising changes without a developer in the loop." },
        ],
        media: [{}, {}],
      },
      {
        heading: "About",
        blocks: [
          { pair: ["Scope", "Product design, front-end"] },
          { pair: ["Team", "Siddharth Borman"] },
          { pair: ["Year", "2025"] },
        ],
      },
      {
        heading: "Approach",
        blocks: [
          { p: "Every page is assembled from a small set of sections with real constraints built in, so a bad layout is difficult to produce by accident." },
          { p: "The system is deliberately narrow — fewer options, fewer ways to drift off-brand." },
        ],
        media: [{ caption: "Section library" }, {}],
      },
      {
        heading: "Visual style",
        blocks: [
          { sub: "Product imagery" },
          { p: "Consistent crops and a single background treatment across the catalogue, which does more for the brand than any amount of layout variety." },
        ],
        media: [{}, {}],
      },
    ],
  },
  {
    slug: "happiness-coach",
    title: "Happiness Coach",
    discipline: "Product Design",
    sections: [
      {
        heading: "Happiness Coach",
        blocks: [
          { p: "A coaching product where the hard problem was tone — the interface had to feel supportive without being saccharine, and honest without being clinical." },
          { p: "Most of the design decisions here are really writing decisions." },
        ],
        media: [{}, {}],
      },
      {
        heading: "About",
        blocks: [
          { pair: ["Scope", "Product design"] },
          { pair: ["Team", "Siddharth Borman"] },
          { pair: ["Year", "2024"] },
        ],
      },
      {
        heading: "Approach",
        blocks: [
          { p: "Sessions are the unit, not streaks. The product deliberately avoids the engagement mechanics that would make it easy to grow and unpleasant to use." },
          { p: "Progress is shown as something you can read, not a number you can lose." },
        ],
        media: [{ caption: "Session flow" }, {}],
      },
      {
        heading: "Interface",
        blocks: [
          { p: "Screens from onboarding, the session view, and the reflection log." },
        ],
        media: [{}, {}, {}],
      },
    ],
  },
];

export const caseStudyBySlug = new Map(caseStudies.map((study) => [study.slug, study]));
