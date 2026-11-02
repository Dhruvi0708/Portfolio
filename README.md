# Signal / Noise — portfolio

A personal portfolio built as one continuous WebGL experience. A field of particles starts as noise around a closed black box. As you scroll, it resolves into a different structure for each chapter.

| Chapter | Scene |
| --- | --- |
| Hero | Turbulent noise around a black box that opens as you scroll |
| Field notes (About) | A "mind": a fibonacci shell with filaments |
| Instruments (Tech) | Six orbits, one per category. Picking a category lights its ring |
| AUTOPSY | An evidence graph |
| Debug Decrypt 3.0 | A double helix |
| Web Lumina | A light field. The whole page inverts to light |
| Signal log (Journey) | A seismograph the camera scans along |
| Transmit (Contact) | A singularity |

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
```

## Edit your content

Everything personal lives in **`src/content.ts`**: name, intro, links, manifesto, stack, projects and journey.

- Any string that starts with `TODO:` shows up on the page as a dashed, italic placeholder. Replace it with the real detail.
- A link left empty (`''`) shows as "add link" instead of a dead link.
- For the resume, put the file at `public/resume.pdf` and set `links.resume = '/resume.pdf'`.

## Stack

React 18, TypeScript, Vite, Tailwind CSS 3.4, Three.js with React Three Fiber and Drei, GSAP ScrollTrigger, Lenis and Framer Motion.

## Notes

- The WebGL layer is lazy-loaded, so text paints before three.js arrives. Phones get fewer particles and a lower pixel ratio.
- `prefers-reduced-motion` turns off smooth scrolling and the horizontal pinning, and slows the idle motion.
- Without WebGL, the page falls back to a static glow.
- Particle shapes are in `src/three/shapes.ts`. Camera keyframes are in `src/three/Experience.tsx`.
