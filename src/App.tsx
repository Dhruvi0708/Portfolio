import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Cursor from './components/Cursor';
import Hero from './sections/Hero';
import About from './sections/About';
import Tech from './sections/Tech';
import Projects from './sections/Projects';
import Journey from './sections/Journey';
import Contact from './sections/Contact';
import { initSmoothScroll } from './lib/smooth';
import { store } from './lib/store';

// The WebGL layer is split out so text paints before three.js downloads.
const Experience = lazy(() => import('./three/Experience'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function App() {
  const [webgl] = useState(hasWebGL);
  const [ready, setReady] = useState(!webgl);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    return initSmoothScroll();
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onDone = useCallback(() => {
    store.entered = true;
    setEntered(true);
    // layout is final once fonts are in; let ScrollTrigger re-measure
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <a href="#about" className="label fixed left-4 top-4 z-[100] -translate-y-20 bg-accent px-3 py-2 text-ink focus:translate-y-0">
        Skip to content
      </a>
      {webgl ? (
        <Suspense fallback={null}>
          <Experience onReady={onReady} />
        </Suspense>
      ) : (
        <div aria-hidden className="fixed inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(255,79,139,0.18),transparent_70%)]" />
      )}
      <div className="vignette" aria-hidden />
      <div className="grain" aria-hidden />

      <Nav visible={entered} />
      <main className="relative z-10">
        <Hero entered={entered} />
        <About />
        <Tech />
        <Projects />
        <Journey />
        <Contact />
      </main>

      <Cursor />
      <Loader ready={ready} onDone={onDone} />
    </>
  );
}
