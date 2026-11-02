/*
 * Point-cloud targets, one per stage. Every shape has exactly `n` points so
 * the shader can morph between any two of them.
 */
const TAU = Math.PI * 2;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Gen = (i: number, n: number, r: () => number, out: Float32Array) => void;

const set = (o: Float32Array, i: number, x: number, y: number, z: number) => {
  o[i * 3] = x;
  o[i * 3 + 1] = y;
  o[i * 3 + 2] = z;
};

const gauss = (r: () => number) => {
  const u = 1 - r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * r());
};

/* 0 — hero: turbulent noise with a hollow core where the black box sits. */
const noise: Gen = (i, _n, r, o) => {
  const d = 2.3 + Math.abs(gauss(r)) * 2.1;
  const th = r() * TAU;
  const ph = Math.acos(2 * r() - 1);
  set(o, i, d * Math.sin(ph) * Math.cos(th) * 1.6, d * Math.cos(ph) * 0.8, d * Math.sin(ph) * Math.sin(th));
};

/* 1 — about: a "mind" — fibonacci shell plus inner filaments. */
const mind: Gen = (i, n, r, o) => {
  if (i % 5 === 0) {
    const t = r() * TAU * 3;
    const rad = 0.4 + r() * 1.8;
    set(o, i, Math.cos(t) * rad, Math.sin(t * 1.3) * rad * 0.7, Math.sin(t) * rad);
    return;
  }
  const g = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / (n - 1)) * 2;
  const rr = Math.sqrt(1 - y * y);
  const R = 2.5 + (r() - 0.5) * 0.08;
  set(o, i, Math.cos(g * i) * rr * R, y * R, Math.sin(g * i) * rr * R);
};

/* 2 — tech: six tilted orbits, one per technology category. */
export const RING_COUNT = 6;
const orbits: Gen = (i, _n, r, o) => {
  const ring = i % RING_COUNT;
  const R = 1.1 + ring * 0.52;
  const a = r() * TAU;
  const tilt = (ring - 2.5) * 0.28;
  const x = Math.cos(a) * R;
  const z = Math.sin(a) * R;
  const j = gauss(r) * 0.03;
  set(o, i, x + j, z * Math.sin(tilt) + j, z * Math.cos(tilt) + j);
};

/* 3 — AUTOPSY: an evidence graph — nodes and the edges between them. */
const graphNodes = (() => {
  const r = rng(7);
  return Array.from({ length: 26 }, () => [(r() - 0.5) * 6, (r() - 0.5) * 3.6, (r() - 0.5) * 3]);
})();
const graphEdges = (() => {
  const r = rng(11);
  const e: [number, number][] = [];
  const has = (a: number, b: number) => e.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  graphNodes.forEach((q, a) => {
    for (let k = 0; k < 2; k++) {
      let best = -1;
      let bd = 1e9;
      graphNodes.forEach((p, b) => {
        if (b === a || has(a, b)) return;
        const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) * (0.7 + r() * 0.8);
        if (d < bd) {
          bd = d;
          best = b;
        }
      });
      if (best >= 0) e.push([a, best]);
    }
  });
  return e;
})();
const evidence: Gen = (i, _n, r, o) => {
  if (i % 3 === 0) {
    const p = graphNodes[i % graphNodes.length];
    const s = 0.14;
    set(o, i, p[0] + gauss(r) * s, p[1] + gauss(r) * s, p[2] + gauss(r) * s);
    return;
  }
  const [a, b] = graphEdges[i % graphEdges.length];
  const t = r();
  const p = graphNodes[a];
  const q = graphNodes[b];
  set(o, i, p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t);
};

/* 4 — Debug Decrypt: a double helix of ciphertext with rungs. */
const helix: Gen = (i, _n, r, o) => {
  const t = (r() - 0.5) * 9;
  if (i % 7 === 0) {
    const rung = Math.round(t * 2) / 2;
    const aa = rung * 1.25;
    const k = r() * 2 - 1;
    set(o, i, rung, Math.cos(aa) * 1.1 * k, Math.sin(aa) * 1.1 * k);
    return;
  }
  const a = t * 1.25 + (i % 2) * Math.PI;
  set(o, i, t, Math.cos(a) * 1.1 + gauss(r) * 0.04, Math.sin(a) * 1.1 + gauss(r) * 0.04);
};

/* 5 — Web Lumina: a field of light — an undulating plane. */
const field: Gen = (i, n, r, o) => {
  const side = Math.ceil(Math.sqrt(n * 1.6));
  const gx = (i % side) / side;
  const gz = Math.floor(i / side) / Math.ceil(n / side);
  const x = (gx - 0.5) * 12 + (r() - 0.5) * 0.03;
  const z = (gz - 0.5) * 7;
  const y = Math.sin(x * 0.9) * 0.45 + Math.cos(z * 1.3 + x * 0.3) * 0.35;
  set(o, i, x, y - 0.8, z);
};

/* 6 — Journey: a seismograph trace with events as spikes. */
export const SPIKES = [-5.2, -2.6, 0, 2.6, 5.2];
const trace: Gen = (i, _n, r, o) => {
  const x = (r() - 0.5) * 15;
  let y = Math.sin(x * 2.1) * 0.06 + Math.sin(x * 7.3) * 0.03;
  for (const s of SPIKES) {
    const d = x - s;
    y += Math.exp(-d * d * 14) * Math.sin(d * 36) * 1.3;
  }
  set(o, i, x, y + gauss(r) * 0.025, gauss(r) * 0.06);
};

/* 7 — Contact: a singularity — dense core inside an accretion disc. */
const singularity: Gen = (i, _n, r, o) => {
  if (i % 4 === 0) {
    const d = Math.abs(gauss(r)) * 0.18;
    const th = r() * TAU;
    const ph = Math.acos(2 * r() - 1);
    set(o, i, d * Math.sin(ph) * Math.cos(th), d * Math.cos(ph), d * Math.sin(ph) * Math.sin(th));
    return;
  }
  const R = 0.9 + Math.pow(r(), 2) * 3.8;
  const a = r() * TAU;
  set(o, i, Math.cos(a) * R, gauss(r) * 0.03 * R, Math.sin(a) * R);
};

const GENS: Gen[] = [noise, mind, orbits, evidence, helix, field, trace, singularity];

export function buildShapes(n: number) {
  return GENS.map((g, k) => {
    const out = new Float32Array(n * 3);
    const r = rng(1000 + k * 77);
    for (let i = 0; i < n; i++) g(i, n, r, out);
    return out;
  });
}
