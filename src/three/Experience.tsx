import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import Particles from './Particles';
import BlackBox from './BlackBox';
import { store } from '../lib/store';
import { smoothstep } from '../lib/math';

/* Camera keyframes per stage: [position, target]. The x offset frames the
 * 3D shape beside the text on wide screens. */
type Key = [number, number, number, number, number, number];
const DESKTOP: Key[] = [
  [0, 0, 8, 0, 0, 0],
  [-2.4, 0.8, 9.2, -2.0, 0, 0],
  [-3.0, 2.0, 8.2, -2.6, 0, 0],
  [-3.0, 0.6, 8.4, -2.6, 0, 0],
  [-2.4, -0.4, 7.4, -2.2, 0, 0],
  [0, 2.6, 7.6, 0, -0.6, 0],
  [0, 0.2, 8.5, 0, 0, 0],
  [-2.6, 2.6, 7.2, -2.4, -1.1, 0],
];
const MOBILE: Key[] = [
  [0, 0, 10.5, 0, 0, 0],
  [0, 0.4, 10, 0, 1.2, 0],
  [0, 2.4, 11, 0, 1.6, 0],
  [0, 0.6, 11, 0, 1.4, 0],
  [0, -0.4, 10, 0, 1.4, 0],
  [0, 2.6, 10, 0, 0.6, 0],
  [0, 0.2, 9, 0, 0, 0],
  [0, 4.4, 9, 0, -1.6, 0],
];

const BG_DARK = new THREE.Color('#0b0e0f');
const BG_LIGHT = new THREE.Color('#e7ebe7');

function Rig({ mobile }: { mobile: boolean }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const goalPos = useMemo(() => new THREE.Vector3(), []);
  const goalTarget = useMemo(() => new THREE.Vector3(), []);
  const bg = useMemo(() => new THREE.Color(), []);
  const lastBg = useRef('');

  useFrame((_, dt) => {
    const keys = mobile ? MOBILE : DESKTOP;
    const s = store.stage;
    const k = Math.min(Math.floor(s), keys.length - 1);
    const n = Math.min(k + 1, keys.length - 1);
    const m = smoothstep(0.58, 1.0, s - k);
    const a = keys[k];
    const b = keys[n];
    goalPos.set(a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m, a[2] + (b[2] - a[2]) * m);
    goalTarget.set(a[3] + (b[3] - a[3]) * m, a[4] + (b[4] - a[4]) * m, a[5] + (b[5] - a[5]) * m);

    // Journey: the camera scans along the seismograph as you move through it.
    if (k === 6) {
      const scan = (smoothstep(0.1, 0.9, s - 6) - 0.5) * (mobile ? 9 : 8);
      goalPos.x += scan * (1 - m);
      goalTarget.x += scan * (1 - m);
    }

    const par = store.reducedMotion ? 0 : 1;
    goalPos.x += store.pointer.x * 0.45 * par;
    goalPos.y += store.pointer.y * 0.3 * par;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, goalPos.x, 3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, goalPos.y, 3, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, goalPos.z, 3, dt);
    target.current.lerp(goalTarget, 1 - Math.exp(-dt * 3));
    camera.lookAt(target.current);

    // Page background follows the scene: the Web Lumina chapter turns to light.
    const light = smoothstep(4.9, 5.02, s) * (1 - smoothstep(5.88, 6.0, s));
    bg.copy(BG_DARK).lerp(BG_LIGHT, light);
    const hex = '#' + bg.getHexString();
    if (hex !== lastBg.current) {
      lastBg.current = hex;
      document.documentElement.style.setProperty('--page-bg', hex);
      document.documentElement.dataset.theme = light > 0.5 ? 'light' : 'dark';
    }
  });
  return null;
}

export default function Experience({ onReady }: { onReady: () => void }) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const count = mobile ? 4200 : 9000;

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <Canvas
      className="!fixed inset-0 !h-[100lvh] !w-full"
      dpr={[1, mobile ? 1.5 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 8], fov: 42, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(0x000000, 0);
        requestAnimationFrame(onReady);
      }}
      aria-hidden
    >
      <Rig mobile={mobile} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[3, 4, 5]} intensity={0.6} color="#f1f5f7" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#f3f6f8" position={[0, 5, -6]} scale={[12, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
        <Lightformer form="ring" intensity={4} color="#ff4f8b" position={[5, -2, 3]} scale={3} />
        <Lightformer form="rect" intensity={0.8} color="#9fb8b2" position={[0, -5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>
      <BlackBox />
      <Particles count={count} />
    </Canvas>
  );
}
