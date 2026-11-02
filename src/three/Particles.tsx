import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildShapes, RING_COUNT } from './shapes';
import { store } from '../lib/store';
import { smoothstep } from '../lib/math';

const vertex = /* glsl */ `
  attribute vec3 aTo;
  attribute float aRand;
  attribute float aRing;
  uniform float uTime;
  uniform float uMix;
  uniform float uNoise;
  uniform float uSize;
  uniform float uPR;
  uniform float uRing;
  uniform vec3 uMouse;
  varying float vA;
  varying float vHi;
  varying float vAcc;

  void main() {
    float m = smoothstep(0.0, 1.0, clamp(uMix * 1.4 - aRand * 0.4, 0.0, 1.0));
    vec3 p = mix(position, aTo, m);
    float t = uTime * 0.35 + aRand * 20.0;
    p += vec3(sin(t + p.y * 1.4), cos(t * 0.8 + p.z * 1.2), sin(t * 0.9 + p.x * 1.1)) * uNoise * (0.4 + aRand);

    vec4 wp = modelMatrix * vec4(p, 1.0);
    vec3 d = wp.xyz - uMouse;
    float f = smoothstep(1.5, 0.0, length(d.xy));
    wp.xyz += normalize(d + vec3(0.0001)) * f * 0.6;

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;

    vHi = (uRing >= 0.0 && abs(aRing - uRing) < 0.5) ? 1.0 : 0.0;
    vAcc = step(0.965, aRand);
    gl_PointSize = min(uSize * uPR * (0.55 + aRand * 0.9) * (1.0 + vHi * 0.9 + f * 1.4) / -mv.z, 9.0 * uPR);
    vA = (0.3 + aRand * 0.7) * (1.0 - smoothstep(10.0, 18.0, -mv.z));
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBone;
  uniform vec3 uAccent;
  uniform vec3 uInkCol;
  uniform float uInk;
  uniform float uRingOn;
  uniform float uOpacity;
  varying float vA;
  varying float vHi;
  varying float vAcc;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    vec3 col = mix(uBone, uAccent, max(vAcc, vHi));
    col = mix(col, mix(uInkCol, uAccent, vAcc), uInk);
    float dim = mix(1.0, mix(0.28, 1.0, vHi), uRingOn);
    gl_FragColor = vec4(col, a * vA * dim * uOpacity);
  }
`;

const NOISE = [0.5, 0.1, 0.05, 0.08, 0.06, 0.1, 0.04, 0.07];
// Text-heavy chapters keep the field quieter so copy stays legible.
const OPACITY = [1, 0.55, 0.9, 0.8, 0.85, 0.7, 0.9, 0.75];

export default function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const base = useRef(-1);
  const { camera, gl } = useThree();
  const shapes = useMemo(() => buildShapes(count), [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(shapes[0].slice(), 3));
    g.setAttribute('aTo', new THREE.BufferAttribute(shapes[1].slice(), 3));
    const rand = new Float32Array(count);
    const ring = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      rand[i] = Math.random();
      ring[i] = i % RING_COUNT;
    }
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    g.setAttribute('aRing', new THREE.BufferAttribute(ring, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
    return g;
  }, [count, shapes]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMix: { value: 0 },
      uNoise: { value: NOISE[0] },
      uSize: { value: 26 },
      uPR: { value: Math.min(gl.getPixelRatio(), 2) },
      uRing: { value: -1 },
      uRingOn: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uBone: { value: new THREE.Color('#ece5d8') },
      uAccent: { value: new THREE.Color('#ff5b1f') },
      uInkCol: { value: new THREE.Color('#1a1714') },
      uInk: { value: 0 },
      uOpacity: { value: 0 },
    }),
    [gl],
  );

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  useFrame((state, dt) => {
    const s = store.stage;
    const k = Math.min(Math.floor(s), shapes.length - 1);
    if (k !== base.current) {
      base.current = k;
      const from = geometry.getAttribute('position') as THREE.BufferAttribute;
      const to = geometry.getAttribute('aTo') as THREE.BufferAttribute;
      (from.array as Float32Array).set(shapes[k]);
      (to.array as Float32Array).set(shapes[Math.min(k + 1, shapes.length - 1)]);
      from.needsUpdate = true;
      to.needsUpdate = true;
    }
    const frac = s - k;
    const mix = smoothstep(0.58, 1.0, frac);
    const u = uniforms;
    u.uMix.value = mix;
    u.uTime.value += store.reducedMotion ? dt * 0.15 : dt;
    const n = NOISE[k] + (NOISE[Math.min(k + 1, NOISE.length - 1)] - NOISE[k]) * mix;
    u.uNoise.value = THREE.MathUtils.damp(u.uNoise.value, n + Math.min(Math.abs(store.velocity) * 0.004, 0.25), 4, dt);
    const op = OPACITY[k] + (OPACITY[Math.min(k + 1, OPACITY.length - 1)] - OPACITY[k]) * mix;
    u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, store.entered ? op : 0, 1.6, dt);

    const lumina = smoothstep(4.9, 5.02, s) * (1 - smoothstep(5.88, 6.0, s));
    u.uInk.value = lumina;

    const ringActive = s > 1.6 && s < 3.0 && store.activeRing >= 0;
    u.uRing.value = ringActive ? store.activeRing : -1;
    u.uRingOn.value = THREE.MathUtils.damp(u.uRingOn.value, ringActive ? 1 : 0, 6, dt);

    // pointer → world point on the z=0 plane
    tmp.v.set(store.pointer.x, store.pointer.y, 0.5).unproject(camera);
    tmp.dir.copy(tmp.v).sub(camera.position).normalize();
    const t = -camera.position.z / tmp.dir.z;
    const target = tmp.v.copy(camera.position).addScaledVector(tmp.dir, t);
    u.uMouse.value.lerp(target, 1 - Math.exp(-dt * 8));

    if (ref.current) {
      const spin = k === 2 || k === 7 ? 0.12 : k === 6 || k === 5 ? 0 : 0.05;
      ref.current.rotation.y += dt * spin * (store.reducedMotion ? 0.2 : 1);
      if (k === 5 || k === 6) ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, Math.round(ref.current.rotation.y / (Math.PI * 2)) * Math.PI * 2, 2, dt);
    }
    state.invalidate();
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
