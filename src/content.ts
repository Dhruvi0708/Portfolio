/*
 * ─────────────────────────────────────────────────────────────
 *  EVERYTHING PERSONAL LIVES HERE.
 *  Edit this file to change any text, link or project on the site.
 *
 *  Any string that starts with "TODO:" is rendered as a visibly
 *  marked placeholder, so nothing invented ever ships as fact.
 *  Replace it with the real detail (or delete the field).
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: 'Dhruvi Patel',
  role: 'Software · AI · Digital experiences',
  // One line, shown under the name in the hero.
  intro:
    'I take systems apart to see how they think — then build the ones that should exist.',
  location: 'TODO: City, Country',
  status: 'Open to internships, collaborations & hackathon teams',
};

export const links = {
  // Leave a value empty ('') and its button renders as "add link" instead of a dead link.
  email: '',
  github: '',
  linkedin: '',
  // Drop your resume at /public/resume.pdf, then set this to '/resume.pdf'.
  resume: '',
};

export const about = {
  // Scroll-revealed manifesto. Written from what you told me about yourself.
  manifesto:
    'I am drawn to the parts of software nobody can see. The black boxes, the hidden rules, the logic behind the interface. I like taking an idea past the version that merely works, until it becomes technically interesting — and then making it beautiful enough that people want to use it.',
  principles: [
    {
      k: 'Curiosity first',
      v: 'Unconventional ideas are worth prototyping before they are worth debating.',
    },
    {
      k: 'Depth over demos',
      v: 'A project is not done when it runs. It is done when it holds up to scrutiny.',
    },
    {
      k: 'Craft is a feature',
      v: 'Design is how people feel the engineering. Both deserve the same care.',
    },
    {
      k: 'Compete to learn',
      v: 'Hackathons and technical events compress months of learning into a weekend.',
    },
  ],
  interests: [
    'Software engineering',
    'Artificial intelligence',
    'Web development',
    'Complex products',
    'Creative problem-solving',
    'Hackathons',
    'Digital experiences',
    'Unconventional ideas',
  ],
  ambition:
    'TODO: One or two sentences on where you want to be in a few years — the kind of problems you want to own.',
};

/*
 * Technologies. Defaults are based only on evidence found on this machine
 * (the AUTOPSY codebase and your project folders). Add / remove freely.
 */
export const stack: { id: string; label: string; note: string; items: string[] }[] = [
  {
    id: 'programming',
    label: 'Programming',
    note: 'The languages I think in',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    note: 'Interfaces & motion',
    items: ['React', 'Next.js', 'Tailwind CSS', 'Three.js', 'React Three Fiber', 'Framer Motion', 'GSAP'],
  },
  {
    id: 'backend',
    label: 'Backend',
    note: 'APIs & services',
    items: ['FastAPI', 'Node.js', 'REST API design', 'Pydantic'],
  },
  {
    id: 'ai',
    label: 'AI & ML',
    note: 'Models, statistics, inference',
    items: ['NumPy', 'Statistical testing', 'Experiment design', 'LLM integration'],
  },
  {
    id: 'data',
    label: 'Databases',
    note: 'Where state lives',
    items: ['SQLite', 'SQLAlchemy', 'MongoDB', 'PostgreSQL'],
  },
  {
    id: 'tools',
    label: 'Tools',
    note: 'The workbench',
    items: ['Git', 'VS Code', 'Cursor', 'Postman', 'pytest', 'Vite'],
  },
];

export type Project = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  oneLiner: string;
  year: string;
  role: string;
  theme: 'forensic' | 'cipher' | 'lumina';
  problem: string;
  why: string;
  how: string;
  architecture: { label: string; detail: string }[];
  tech: string[];
  contribution: string;
  challenges: { title: string; body: string }[];
  link?: string;
};

export const projects: Project[] = [
  {
    id: 'autopsy',
    index: '01',
    title: 'AUTOPSY',
    kicker: 'Black-box algorithm investigation',
    oneLiner:
      'An investigation platform that runs controlled experiments against an opaque system and reconstructs the rules hidden inside it — with evidence for every claim.',
    year: '2026',
    role: 'TODO: Your role (e.g. Lead engineer, Team Oblivion)',
    theme: 'forensic',
    problem:
      'Algorithms that set prices, rank content or decide eligibility are black boxes. People affected by them can only see inputs and outputs, never the logic. AUTOPSY asks: how much of a hidden rulebook can you recover purely by observation?',
    why: 'TODO: Why you personally built it — the moment or question that started it.',
    how: 'An investigator opens a case with a fixed query budget. Each experiment sends one input to the black box and records the output. A discovery engine then analyses the stored observations, proposes hypotheses, and an adaptive planner recommends the next most informative experiment — until the budget runs out.',
    architecture: [
      { label: 'Workbench', detail: 'Next.js + React Three Fiber interface with an evidence graph view' },
      { label: 'API', detail: 'FastAPI service — investigations, experiments, evidence, graph, rulebook' },
      { label: 'Simulator boundary', detail: 'Synthetic black-box targets; ground truth isolated from discovery code' },
      { label: 'Discovery engine', detail: 'Permutation tests, Benjamini–Hochberg correction, piecewise thresholds, interaction screens' },
      { label: 'Adaptive planner', detail: 'Transparent 0–100 evidence-coverage score picks the next experiment' },
      { label: 'Persistence', detail: 'SQLAlchemy over SQLite with full provenance for every finding' },
    ],
    tech: ['Python', 'FastAPI', 'NumPy', 'SQLAlchemy', 'SQLite', 'pytest', 'Next.js', 'TypeScript', 'React Three Fiber', 'Tailwind CSS'],
    contribution: 'TODO: What you specifically designed and built.',
    challenges: [
      {
        title: 'Honest statistics',
        body: 'Findings are labelled candidate, supported or validated — never "causal". A held-out split by input group keeps repeated inputs from leaking between training and confirmation.',
      },
      {
        title: 'No peeking at the answer',
        body: 'The discovery package never imports the ground-truth module; an import audit test enforces the boundary so the engine cannot cheat.',
      },
      {
        title: 'Thresholds that hide',
        body: 'Nonlinear behaviour is detected with BIC-penalised piecewise fits. Verification showed two real transitions merging into one estimate — documented as a limitation, not hidden.',
      },
      {
        title: 'Stale recommendations',
        body: 'Every proposal is tied to an observation fingerprint; an intervening experiment makes it stale, and execution re-checks freshness under a database lock.',
      },
    ],
  },
  {
    id: 'debug-decrypt',
    index: '02',
    title: 'Debug Decrypt 3.0',
    kicker: 'Technical event & platform',
    oneLiner:
      'The third edition of a technical event — and the platform that runs it.',
    year: 'TODO: Year',
    role: 'TODO: Your role (organiser / platform developer / …)',
    theme: 'cipher',
    problem: 'TODO: What Debug Decrypt is and what problem the platform solves for participants and organisers.',
    why: 'TODO: Why you got involved / why a 3.0 edition.',
    how: 'TODO: How the event and platform work — rounds, challenges, scoring.',
    architecture: [
      { label: 'TODO: Frontend', detail: 'TODO: e.g. participant portal' },
      { label: 'TODO: Backend', detail: 'TODO: e.g. challenge + scoring service' },
      { label: 'TODO: Data', detail: 'TODO: e.g. database / leaderboard' },
    ],
    tech: ['TODO: stack'],
    contribution: 'TODO: What you designed, built or led.',
    challenges: [{ title: 'TODO: Challenge', body: 'TODO: A real technical or organisational challenge and how you solved it.' }],
  },
  {
    id: 'web-lumina',
    index: '03',
    title: 'Web Lumina',
    kicker: 'Web design hackathon',
    oneLiner: 'A hackathon about the craft of the web — where design is judged as seriously as code.',
    year: 'TODO: Year',
    role: 'TODO: Your role (organiser / participant / winner …)',
    theme: 'lumina',
    problem: 'TODO: What Web Lumina set out to do.',
    why: 'TODO: Why it mattered to you.',
    how: 'TODO: Format, themes, judging.',
    architecture: [
      { label: 'TODO: Format', detail: 'TODO' },
      { label: 'TODO: Platform', detail: 'TODO' },
    ],
    tech: ['TODO: stack'],
    contribution: 'TODO: Your contribution.',
    challenges: [{ title: 'TODO: Challenge', body: 'TODO' }],
  },
];

/* Journey — rendered as a seismograph. `kind` sets the waveform spike. */
export const journey: { when: string; kind: 'hackathon' | 'event' | 'build' | 'learning' | 'next'; title: string; body: string }[] = [
  {
    when: 'TODO: Year',
    kind: 'learning',
    title: 'TODO: Where it started',
    body: 'TODO: The first thing you built or the moment you got hooked on software.',
  },
  {
    when: 'TODO: Year',
    kind: 'hackathon',
    title: 'Web Lumina',
    body: 'TODO: Web design hackathon — your role and what came of it.',
  },
  {
    when: 'TODO: Year',
    kind: 'event',
    title: 'Debug Decrypt 3.0',
    body: 'TODO: Technical event and platform — your role: organising, building, leading.',
  },
  {
    when: '2026',
    kind: 'build',
    title: 'AUTOPSY',
    body: 'Black-box investigation platform with a statistical discovery engine and an adaptive experiment planner.',
  },
  {
    when: 'Ahead',
    kind: 'next',
    title: 'TODO: Ambition',
    body: 'TODO: What you are working towards next.',
  },
];
