import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { store } from '../lib/store';
import { smoothstep } from '../lib/math';

/*
 * The hero object: a black box made of eight cubelets. Scrolling out of the
 * hero "opens" it — the cubelets drift apart and reveal the signal inside.
 */
const OFFSETS = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => new THREE.Vector3(x, y, z))));

export default function BlackBox() {
  const group = useRef<THREE.Group>(null);
  const cubes = useRef<(THREE.Group | null)[]>([]);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const appear = useRef(0);

  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(0.92, 0.92, 0.92)), []);
  const haloTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,140,80,1)');
    grd.addColorStop(0.25, 'rgba(255,91,31,0.45)');
    grd.addColorStop(1, 'rgba(255,91,31,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state, dt) => {
    const s = store.stage;
    appear.current = THREE.MathUtils.damp(appear.current, store.entered ? 1 : 0, 2.2, dt);
    const open = smoothstep(0.52, 1.05, s);
    const vanish = smoothstep(0.82, 1.12, s);
    const g = group.current;
    if (!g) return;
    g.visible = vanish < 0.999;
    const scale = appear.current * (1 - vanish) * (0.86 + open * 0.2);
    g.scale.setScalar(Math.max(scale, 0.0001));

    const t = state.clock.elapsedTime;
    const px = store.pointer.x;
    const py = store.pointer.y;
    const idle = store.reducedMotion ? 0 : 1;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * 0.6 + t * 0.15 * idle + open * 1.2, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.4 + 0.45 + open * 0.4, 3, dt);
    g.position.y = Math.sin(t * 0.8) * 0.06 * idle;

    const breathe = (Math.sin(t * 1.4) * 0.5 + 0.5) * 0.02 * idle;
    cubes.current.forEach((c, i) => {
      if (!c) return;
      const d = 0.47 + breathe + open * 0.7 * (1 + (i % 3) * 0.18);
      c.position.copy(OFFSETS[i]).multiplyScalar(d);
      c.rotation.set(open * (i % 2 ? 0.8 : -0.6), open * (i % 3 ? 0.7 : -0.9), 0);
    });

    const glow = 0.25 + open * 0.75;
    if (core.current) core.current.scale.setScalar(0.06 + open * 0.08);
    if (halo.current) {
      halo.current.scale.setScalar(1 + open * 1.8);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = glow;
      halo.current.quaternion.copy(state.camera.quaternion);
    }
    if (light.current) light.current.intensity = 2 + open * 30;
  });

  return (
    <group ref={group}>
      <pointLight ref={light} color="#ff5b1f" distance={6} decay={2} />
      <mesh ref={core}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#fff1e6" toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={haloTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {OFFSETS.map((_, i) => (
        <group key={i} ref={(el) => (cubes.current[i] = el)}>
          <RoundedBox args={[0.9, 0.9, 0.9]} radius={0.07} smoothness={4}>
            <meshPhysicalMaterial color="#0e0d0c" metalness={0.85} roughness={0.28} clearcoat={1} clearcoatRoughness={0.15} envMapIntensity={1.2} />
          </RoundedBox>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color="#ff5b1f" transparent opacity={0.22} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
