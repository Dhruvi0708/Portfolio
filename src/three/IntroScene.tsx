import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { store } from '../lib/store';

/*
 * The opening portrait: every particle is one pixel of the photo. They start
 * as drifting noise, converge centre-first into the picture (with depth taken
 * from brightness and a soft dome, so it reads as a relief you can tilt), part
 * around the cursor, and finally spiral apart into the site.
 */

const vertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aColor;
  attribute float aRand;
  attribute float aDelay;
  uniform float uForm;
  uniform float uExit;
  uniform float uTime;
  uniform float uSize;
  uniform float uPR;
  uniform vec3 uMouse;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float f = clamp((uForm * 1.9 - aDelay) / 0.9, 0.0, 1.0);
    f = f * f * (3.0 - 2.0 * f);

    vec3 drift = vec3(sin(uTime * 0.3 + aRand * 30.0), cos(uTime * 0.25 + aRand * 20.0), sin(uTime * 0.2 + aRand * 10.0)) * 0.4;
    vec3 p = mix(aStart + drift, position, f);
    p.z += sin(uTime * 1.3 + position.y * 3.0 + aRand * 6.0) * 0.02 * f;

    // exit: a vortex that throws the portrait outwards and towards the camera
    float e = clamp(uExit * 1.7 - aRand * 0.7, 0.0, 1.0);
    e = e * e;
    float ang = e * 3.5 * (1.3 - length(position.xy) * 0.25);
    float c = cos(ang), s = sin(ang);
    p.xy = mat2(c, -s, s, c) * p.xy;
    p.xy *= 1.0 + e * 3.0;
    p.z += e * 5.0;

    vec4 wp = modelMatrix * vec4(p, 1.0);
    vec2 d = wp.xy - uMouse.xy;
    float m = smoothstep(0.42, 0.0, length(d)) * f * (1.0 - e);
    wp.xy += normalize(d + 0.0001) * m * 0.16;
    wp.z += m * 0.5;

    vec4 mv = viewMatrix * wp;
    gl_Position = projectionMatrix * mv;

    float grey = dot(aColor, vec3(0.299, 0.587, 0.114));
    vec3 noiseCol = mix(vec3(grey), vec3(0.56, 0.84, 0.78), 0.35) * 0.75;
    vColor = mix(noiseCol, aColor, f);
    vColor = mix(vColor, vec3(1.0, 0.31, 0.55), m * 0.5);
    vAlpha = mix(0.32, 1.0, f) * (1.0 - e);
    gl_PointSize = min(uSize * uPR * (0.8 + aRand * 0.45) * (1.0 + m * 0.9) / -mv.z, 7.0 * uPR);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.18, d));
  }
`;

type Sample = { pos: Float32Array; start: Float32Array; color: Float32Array; rand: Float32Array; delay: Float32Array; count: number };

/** Reads the photo into a grid and keeps pixels inside a soft oval around the subject. */
async function samplePhoto(src: string, cols: number): Promise<Sample> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const rows = Math.round((cols * img.naturalHeight) / img.naturalWidth);
  const cv = document.createElement('canvas');
  cv.width = cols;
  cv.height = rows;
  const ctx = cv.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const px = ctx.getImageData(0, 0, cols, rows).data;

  const H = 4.2;
  const W = (H * cols) / rows;
  const pos: number[] = [];
  const start: number[] = [];
  const color: number[] = [];
  const rand: number[] = [];
  const delay: number[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = x / cols;
      const v = y / rows;
      // soft oval centred on the subject (face sits slightly left and high in the frame)
      const r = Math.hypot((u - 0.47) / 0.47, (v - 0.5) / 0.56);
      if (r > 1 || (r > 0.72 && Math.random() > (1 - r) / 0.28)) continue;
      const i = (y * cols + x) * 4;
      const cr = px[i] / 255;
      const cg = px[i + 1] / 255;
      const cb = px[i + 2] / 255;
      const lum = 0.299 * cr + 0.587 * cg + 0.114 * cb;
      pos.push((u - 0.5) * W + (Math.random() - 0.5) * 0.01, -(v - 0.5) * H, (lum - 0.5) * 0.16 + (1 - r * r) * 0.55);
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const R = 3 + Math.random() * 6;
      start.push(R * Math.sin(ph) * Math.cos(th) * 1.4, R * Math.cos(ph) * 0.8, R * Math.sin(ph) * Math.sin(th) - 2);
      color.push(cr, cg, cb);
      const k = Math.random();
      rand.push(k);
      delay.push(r * 0.6 + k * 0.3);
    }
  }
  return {
    pos: new Float32Array(pos),
    start: new Float32Array(start),
    color: new Float32Array(color),
    rand: new Float32Array(rand),
    delay: new Float32Array(delay),
    count: rand.length,
  };
}

function PortraitPoints({ sample, mobile }: { sample: Sample; mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { camera, gl, size, viewport } = useThree();
  const fit = useRef({ scale: 1 });
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), dir: new THREE.Vector3() }), []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(sample.pos, 3));
    g.setAttribute('aStart', new THREE.BufferAttribute(sample.start, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(sample.color, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(sample.rand, 1));
    g.setAttribute('aDelay', new THREE.BufferAttribute(sample.delay, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
    return g;
  }, [sample]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uForm: { value: 0 },
      uExit: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 30 },
      uPR: { value: Math.min(gl.getPixelRatio(), 2) },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
    }),
    [gl],
  );

  useFrame((state, dt) => {
    const u = uniforms;
    u.uForm.value = store.intro.form;
    u.uExit.value = store.intro.exit;
    u.uTime.value += dt;
    // keep particles the same on-screen size whatever the window height
    u.uSize.value = (mobile ? 40 : 27) * (size.height / 800) * fit.current.scale;

    tmp.v.set(store.pointer.x, store.pointer.y, 0.5).unproject(camera);
    tmp.dir.copy(tmp.v).sub(camera.position).normalize();
    const t = -camera.position.z / tmp.dir.z;
    const target = store.pointerSeen ? tmp.v.copy(camera.position).addScaledVector(tmp.dir, t) : tmp.v.set(99, 99, 0);
    u.uMouse.value.lerp(target, store.pointerSeen ? 1 - Math.exp(-dt * 10) : 1);

    const g = group.current;
    if (g) {
      // fit the portrait to the viewport: right half on wide screens, upper area on phones
      const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
      const W = (4.2 * 3) / 4;
      const sc = mobile ? Math.min((vp.height * 0.46) / 4.2, (vp.width * 0.9) / W) : Math.min((vp.height * 0.84) / 4.2, (vp.width * 0.44) / W);
      fit.current.scale = sc;
      g.scale.setScalar(sc);
      g.position.set(mobile ? 0 : vp.width * 0.24, mobile ? vp.height * 0.21 : 0, 0);
      const tt = state.clock.elapsedTime;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, store.pointer.x * 0.35 - 0.1 + Math.sin(tt * 0.4) * 0.05, 3, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -store.pointer.y * 0.2, 3, dt);
    }
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 7.5 - store.intro.exit * 2.5, 4, dt);
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
      </points>
    </group>
  );
}

export default function IntroScene({ onLoaded }: { onLoaded: () => void }) {
  const mobile = window.innerWidth < 768;
  const [sample, setSample] = useState<Sample | null>(null);

  useEffect(() => {
    let alive = true;
    samplePhoto('/dhruvi.jpg', mobile ? 130 : 210)
      .then((s) => alive && setSample(s))
      .catch(() => alive && onLoaded());
    return () => {
      alive = false;
    };
  }, [mobile, onLoaded]);

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, mobile ? 1.5 : 2]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 7.5], fov: 35 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden
    >
      {sample && <PortraitPoints sample={sample} mobile={mobile} />}
      {sample && <Loaded onLoaded={onLoaded} />}
    </Canvas>
  );
}

/** Signals readiness after the first frame with the portrait mounted. */
function Loaded({ onLoaded }: { onLoaded: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(onLoaded);
  });
  return null;
}
