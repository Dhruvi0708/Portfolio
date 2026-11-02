/*
 * A tiny mutable store shared between the DOM (scroll, pointer) and the
 * WebGL scene. It is deliberately not React state: the scene reads it every
 * frame and nothing needs to re-render when it changes.
 */
export const STAGES = ['hero', 'about', 'tech', 'autopsy', 'debug-decrypt', 'web-lumina', 'journey', 'contact'] as const;

export const store = {
  /** Continuous stage value, e.g. 2.4 = 40% through the "tech" section. */
  stage: 0,
  /** Pointer in normalised device coordinates (-1..1). */
  pointer: { x: 0, y: 0 },
  /** False until the pointer first moves, so effects don't react to a cursor that isn't there. */
  pointerSeen: false,
  /** Scroll velocity from Lenis, used for subtle distortion. */
  velocity: 0,
  /** Technology ring highlighted in the "tech" section (-1 = none). */
  activeRing: -1,
  /** Set once the intro has finished, so the hero can animate in. */
  entered: false,
  /** Intro portrait: `form` 0 = noise → 1 = portrait; `exit` 0 → 1 = spiralling away. */
  intro: { form: 0, exit: 0 },
  reducedMotion: false,
};

export function computeStage() {
  const els = document.querySelectorAll<HTMLElement>('[data-stage]');
  const ref = window.innerHeight * 0.5;
  let stage = 0;
  els.forEach((el) => {
    const i = Number(el.dataset.stage);
    const r = el.getBoundingClientRect();
    if (r.top <= ref && r.bottom > ref) {
      stage = i + (ref - r.top) / Math.max(r.height, 1);
    } else if (r.bottom <= ref) {
      stage = Math.max(stage, i + 0.999);
    }
  });
  store.stage = stage;
  return stage;
}
