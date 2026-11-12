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
  role: 'B.Tech CSE · Software · AI · Digital experiences',
  // One line, shown under the name in the hero.
  intro:
    'I take systems apart to see how they think — then build the ones that should exist.',
  location: 'Gurugram, India',
  status: 'Open to internships, collaborations & hackathon teams',
};

export const links = {
  // Leave a value empty ('') and its button renders as "add link" instead of a dead link.
  email: 'dhruvipatel6249@gmail.com',
  github: 'https://github.com/Dhruvi0708',
  linkedin: 'https://www.linkedin.com/in/dhruvipatel78',
  resume: '/resume.pdf',
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
    'To build AI-driven products that make complex, opaque systems understandable — and to keep growing as a full-stack and AI engineer who ships work that holds up to scrutiny.',
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
    id: 'astrion',
    index: '02',
    title: 'ASTRION',
    kicker: 'The living intelligence engine',
    oneLiner:
      'Turns fragmented information into an interconnected, evolving knowledge universe — sources become documents, documents yield claims and evidence, and claims connect into a traceable knowledge graph.',
    year: '2026',
    role: 'Full-stack developer',
    theme: 'cipher',
    problem:
      'Research lives in scattered documents, notes and sources. The connections between claims — where they agree, contradict or leave gaps — stay invisible unless someone maps them by hand.',
    why: 'I wanted a system where knowledge is not a pile of files but a graph you can explore, question and trust — every claim traceable back to its source.',
    how: 'Each user works in private workspaces. Sources and their document files are stored and tracked, and a Neo4j graph layer holds the knowledge network. The visual product — a landing page, a 3D knowledge universe and eight app environments — runs on a real, authenticated API. Document parsing, claim extraction and multi-agent investigation are the next phases, and every screen labels sample content as sample.',
    architecture: [
      { label: 'Frontend', detail: 'React 18 + TypeScript + Vite + Tailwind CSS + React Three Fiber 3D universe' },
      { label: 'API', detail: 'FastAPI service — auth, workspaces, sources, documents, health checks' },
      { label: 'Accounts', detail: 'Register, sign in, sign out everywhere, silent session refresh; cross-user access blocked' },
      { label: 'Relational data', detail: 'PostgreSQL via SQLAlchemy 2 with Alembic migrations' },
      { label: 'Knowledge graph', detail: 'Neo4j repository with constraints and transactions' },
      { label: 'Storage', detail: 'Validated document upload/download on local disk or S3-compatible storage' },
    ],
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Three Fiber', 'FastAPI', 'Python', 'PostgreSQL', 'Neo4j', 'SQLAlchemy', 'Alembic', 'Vitest', 'Playwright', 'pytest'],
    contribution: 'Designed and built the full stack — the 3D interface, the authenticated FastAPI backend, per-user workspaces, document storage and the Neo4j graph layer, with CI covering lint, types, unit, integration and end-to-end tests.',
    challenges: [
      {
        title: 'Ownership everywhere',
        body: 'Every workspace, source and document is scoped to its owner, and tests confirm one user can never read or change another user’s data.',
      },
      {
        title: 'Two databases, one truth',
        body: 'Relational records live in PostgreSQL while the knowledge network lives in Neo4j — each with its own constraints, transactions and live health checks.',
      },
      {
        title: 'Honest product surface',
        body: 'Planned features are visible but always labelled as sample or planned, so the interface never claims more than the engine can do yet.',
      },
    ],
    link: 'https://github.com/Dhruvi0708/Astrion',
  },
  {
    id: 'truthlens',
    index: '03',
    title: 'TruthLensAI',
    kicker: 'AI fake news detection',
    oneLiner: 'An AI-powered fake news detection system using NLP and machine learning — 99.58% accuracy, with a Streamlit app for real-time detection and confidence scores.',
    year: 'June 2026',
    role: 'Developer',
    theme: 'lumina',
    problem: 'Fake news spreads faster than it can be checked by hand. Readers need a quick, explainable signal of whether an article is likely to be real.',
    why: 'I wanted to take a machine learning model past the notebook stage and ship it as a tested, usable product.',
    how: 'Political and world news datasets are merged and cleaned, then preprocessed (lowercasing, URL and HTML removal, stopword filtering, lemmatization). TF-IDF features feed a Linear SVM classifier, and a Streamlit app returns a verdict with a confidence score in real time.',
    architecture: [
      { label: 'Data', detail: 'Merged political & world news datasets, cleaned and explored (EDA)' },
      { label: 'Preprocessing', detail: 'Text cleaning, stopword filtering and lemmatization' },
      { label: 'Model', detail: 'TF-IDF vectorizer + Linear SVM — 99.58% accuracy' },
      { label: 'Interface', detail: 'Streamlit web app with live confidence visualization' },
      { label: 'Engineering', detail: 'pytest unit tests, GitHub Actions CI and Docker container' },
    ],
    tech: ['Python', 'Streamlit', 'TF-IDF', 'Scikit-learn', 'Pandas', 'NLP'],
    contribution: 'Built the complete pipeline — data cleaning, feature engineering, model training and evaluation — and the Streamlit app around it.',
    challenges: [
      {
        title: 'Clean text, clean signal',
        body: 'Raw articles carry URLs, HTML and noise; a careful preprocessing pipeline made the difference between a guessing model and a reliable one.',
      },
      {
        title: 'From notebook to product',
        body: 'Automated tests, CI and a Docker image turned a one-off experiment into an application anyone can run.',
      },
    ],
    link: 'https://github.com/Dhruvi0708/TruthLens-AI',
  },
];

/* Journey — rendered as a seismograph. `kind` sets the waveform spike. */
export const journey: { when: string; kind: 'hackathon' | 'event' | 'build' | 'learning' | 'work' | 'next'; title: string; body: string }[] = [
  {
    when: '2024',
    kind: 'learning',
    title: 'Where it started',
    body: 'Began B.Tech in Computer Science at Dronacharya College of Engineering, Gurugram — currently holding a 9.1 CGPA.',
  },
  {
    when: 'Club',
    kind: 'event',
    title: 'Deviators Club',
    body: 'Web Development Lead — helped organise and run technical events including Debug Decrypt 3.0 and Web Lumina.',
  },
  {
    when: '2025',
    kind: 'hackathon',
    title: 'On stage',
    body: 'Third Prize at Techpreneur 2.0, and a Top 15 team at Rethink, Adhunik’25 (Maharaja Agrasen College, University of Delhi).',
  },
  {
    when: 'June 2026',
    kind: 'build',
    title: 'TruthLensAI',
    body: 'AI fake news detection with NLP and machine learning — 99.58% accuracy, shipped as a Streamlit app.',
  },
  {
    when: 'July 2026',
    kind: 'work',
    title: 'Fleetx.ai',
    body: 'Quality Assurance Intern — automated end-to-end testing with Playwright, plus manual, UI and API testing.',
  },
  {
    when: 'Aug 2026',
    kind: 'build',
    title: 'AUTOPSY',
    body: 'Black-box investigation platform with a statistical discovery engine and an adaptive experiment planner.',
  },
  {
    when: 'Nov 2026',
    kind: 'build',
    title: 'ASTRION',
    body: 'A living intelligence engine that turns scattered information into a traceable 3D knowledge graph.',
  },
  {
    when: 'Ahead',
    kind: 'next',
    title: 'What’s next',
    body: 'AI-driven products that make complex, opaque systems understandable — built to hold up to scrutiny.',
  },
];
