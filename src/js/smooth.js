import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Lenis sincronizado com o ticker do GSAP (um único loop de animação).
// Em touch o Lenis mantém o scroll nativo; com movimento reduzido nem é criado.
export function initSmoothScroll({ reduced }) {
  if (reduced) return null;
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollToTarget(el, lenis, { immediate = false } = {}) {
  if (!el) return;
  const toTop = el.id === 'inicio';
  if (lenis) {
    lenis.scrollTo(toTop ? 0 : el, { duration: 1.6, immediate, force: true });
    return;
  }
  const top = toTop ? 0 : el.getBoundingClientRect().top + window.scrollY;
  const smooth = !immediate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}
