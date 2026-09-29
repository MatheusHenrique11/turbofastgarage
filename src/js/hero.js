import { gsap } from 'gsap';
import { qs, qsa } from './env.js';

// Hero: estados iniciais (escondidos sob o preloader), intro, parallax do mouse,
// parallax de scroll e partículas discretas em canvas.
export function initHero({ reduced, fine }) {
  const hero = qs('.hero');
  const wrap = qs('.hero__img-wrap');
  const img = qs('.hero__img');
  const lines = qsa('.hero__line-in');
  const eyebrow = qs('.hero__eyebrow');
  const sub = qs('.hero__sub');
  const actions = qsa('.hero__actions > *');
  const bottom = qs('.hero__bottom');
  const glows = qsa('.hero__glow');
  const glint = qs('.hero__glint');
  const header = qs('.header');

  if (reduced) return { intro: () => gsap.timeline() };

  gsap.set(lines, { yPercent: 115 });
  gsap.set([eyebrow, sub, ...actions, bottom], { autoAlpha: 0, y: 26 });
  gsap.set(wrap, { clipPath: 'inset(0% 0% 100% 0%)' });
  gsap.set(img, { scale: 1.32 });
  gsap.set(glows, { autoAlpha: 0 });
  gsap.set(header, { yPercent: -100, autoAlpha: 0 });

  // saída do hero no scroll: foto desce devagar, conteúdo sobe e apaga
  const scrollOut = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to(img, { yPercent: 14, ease: 'none', scrollTrigger: scrollOut });
  gsap.to('.hero__content', { y: -90, opacity: 0, ease: 'none', scrollTrigger: { ...scrollOut, end: '75% top' } });

  particles(qs('.hero__particles'), hero);
  if (fine) mouseParallax(hero, wrap, glows);

  const intro = () =>
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(wrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.9, ease: 'expo.inOut' }, 0)
      .to(img, { scale: 1.08, duration: 2.6 }, 0.1)
      .to(glows, { autoAlpha: 1, duration: 2.2, ease: 'power2.out' }, 0.4)
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: 1.1 }, 0.55)
      .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.6)
      .to(sub, { autoAlpha: 1, y: 0, duration: 1.2 }, 0.9)
      .to(actions, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 1)
      .to(bottom, { autoAlpha: 1, y: 0, duration: 1.2 }, 1.15)
      .to(header, { yPercent: 0, autoAlpha: 1, duration: 1.2 }, 0.8)
      .fromTo(glint, { xPercent: -120 }, { xPercent: 120, duration: 1.8, ease: 'power2.inOut' }, 1.2);

  return { intro };
}

function mouseParallax(hero, wrap, glows) {
  const opts = { duration: 1.2, ease: 'power3' };
  const wx = gsap.quickTo(wrap, 'x', opts);
  const wy = gsap.quickTo(wrap, 'y', opts);
  const gx = glows.map((g) => gsap.quickTo(g, 'x', { ...opts, duration: 1.8 }));
  const gy = glows.map((g) => gsap.quickTo(g, 'y', { ...opts, duration: 1.8 }));
  const beam = qs('.hero__beam');
  const bx = gsap.quickTo(beam, 'x', { ...opts, duration: 2 });

  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    wx(nx * -22);
    wy(ny * -14);
    gx.forEach((fn, i) => fn(nx * (i ? -40 : 60)));
    gy.forEach((fn, i) => fn(ny * (i ? -24 : 36)));
    bx(nx * 50);
  });
  hero.addEventListener('pointerleave', () => {
    wx(0);
    wy(0);
    gx.forEach((fn) => fn(0));
    gy.forEach((fn) => fn(0));
    bx(0);
  });
}

// Poeira iluminada: poucas partículas, pausadas fora da tela ou com a aba oculta
function particles(canvas, hero) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = ['245,245,245', '245,245,245', '255,212,0', '155,92,255'];
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const count = window.innerWidth < 768 ? 26 : 60;
  let w = 0;
  let h = 0;
  let raf = 0;
  let visible = true;

  const resize = () => {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (p, anywhere) => {
    p.x = Math.random() * w;
    p.y = anywhere ? Math.random() * h : h + 10;
    p.r = 0.4 + Math.random() * 1.4;
    p.vy = -(0.08 + Math.random() * 0.35);
    p.vx = (Math.random() - 0.5) * 0.12;
    p.a = 0.15 + Math.random() * 0.55;
    p.t = Math.random() * Math.PI * 2;
    p.c = colors[(Math.random() * colors.length) | 0];
    return p;
  };

  resize();
  const parts = Array.from({ length: count }, () => spawn({}, true));

  const frame = (time) => {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx + Math.sin(time / 1400 + p.t) * 0.08;
      p.y += p.vy;
      if (p.y < -10) spawn(p, false);
      const alpha = p.a * (0.55 + 0.45 * Math.sin(time / 700 + p.t));
      ctx.fillStyle = `rgba(${p.c},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  start();
}
