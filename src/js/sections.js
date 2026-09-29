import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs, qsa } from './env.js';

// Animações específicas de cada seção. Tudo que é movimento fica dentro do
// gsap.matchMedia: é recriado ao trocar desktop/mobile e ignorado com
// prefers-reduced-motion. Estados funcionais (passo ativo etc.) funcionam sempre.
export function initSections({ reduced, fine }) {
  diagSteps(reduced);
  if (reduced) qsa('.path__stop').forEach((s) => s.classList.add('is-on'));
  if (fine && !reduced) prepPreview();

  const mm = gsap.matchMedia();
  mm.add(
    { desktop: '(min-width: 900px)', mobile: '(max-width: 899px)', motion: '(prefers-reduced-motion: no-preference)' },
    ({ conditions }) => {
      if (!conditions.motion) return;
      const { desktop } = conditions;
      manifesto(desktop); // pin primeiro: os gatilhos abaixo dele dependem do espaço que ele cria
      about(desktop);
      owner();
      services(desktop);
      diag();
      prep(desktop);
      details(desktop);
      gallery(desktop);
      footer();
    }
  );
}

const scrub = (trigger, extra = {}) => ({ trigger, start: 'top bottom', end: 'bottom top', scrub: true, ...extra });

/* ---------- A TurboFast: trajetória ---------- */
function about(desktop) {
  const path = qs('[data-path]');
  const stops = qsa('.path__stop');
  const prop = desktop ? 'scaleX' : 'scaleY';
  gsap.fromTo(
    '.path__fill',
    { [prop]: 0 },
    {
      [prop]: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: path,
        start: 'top 78%',
        end: desktop ? 'bottom 55%' : 'bottom 60%',
        scrub: 0.6,
        onUpdate: (self) =>
          stops.forEach((s, i) => s.classList.toggle('is-on', self.progress >= i / (stops.length - 1) - 0.02)),
      },
    }
  );
  gsap.from(stops, {
    y: 30,
    autoAlpha: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.08,
    scrollTrigger: { trigger: path, start: 'top 85%', once: true },
  });
}

/* ---------- Matheus ---------- */
function owner() {
  const once = { trigger: '.owner__figure', start: 'top 78%', once: true };
  gsap.fromTo('.owner__img-wrap', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'expo.out', scrollTrigger: once });
  gsap.fromTo('.owner__img', { scale: 1.25, yPercent: 8 }, { scale: 1, yPercent: 0, duration: 2.2, ease: 'expo.out', scrollTrigger: once });
  gsap.from('.owner__halo', { scale: 0.5, autoAlpha: 0, duration: 2.4, ease: 'expo.out', scrollTrigger: once });
  gsap.from('.owner__tag', { x: -40, autoAlpha: 0, duration: 1.2, delay: 0.6, ease: 'expo.out', scrollTrigger: once });
  gsap.fromTo('.owner__name-bg span', { xPercent: 4 }, { xPercent: -38, ease: 'none', scrollTrigger: scrub('.owner') });
}

/* ---------- Serviços ---------- */
function services(desktop) {
  const cards = qsa('[data-card]');
  gsap.from(cards, {
    y: 110,
    autoAlpha: 0,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.cards', start: 'top 86%', once: true },
  });
  if (!desktop) return;
  cards.forEach((card) => {
    const media = card.querySelector('.card__media');
    gsap.set(media, { top: '-8%', bottom: '-8%' });
    gsap.fromTo(media, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: scrub(card) });
  });
}

/* ---------- Diagnóstico ---------- */
function diagSteps(reduced) {
  const steps = qsa('[data-step]');
  const imgs = qsa('[data-step-img]');
  const count = qs('[data-step-count]');
  const caption = qs('[data-step-caption]');
  let current = 0;

  const set = (i) => {
    if (i === current) return;
    current = i;
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    imgs.forEach((im, j) => {
      im.classList.toggle('is-shown', j <= i);
      im.classList.toggle('is-active', j === i);
    });
    count.textContent = String(i + 1).padStart(2, '0');
    caption.textContent = steps[i].querySelector('.diag__step-title').textContent;
    if (!reduced) gsap.fromTo(caption, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' });
  };

  steps.forEach((step, i) =>
    ScrollTrigger.create({
      trigger: step,
      start: 'top 62%',
      end: 'bottom 62%',
      onToggle: (self) => self.isActive && set(i),
    })
  );
}

function diag() {
  gsap.fromTo(
    '.diag__rail-fill',
    { scaleY: 0 },
    { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.diag__steps', start: 'top 62%', end: 'bottom 62%', scrub: 0.4 } }
  );
  gsap.from('.diag__frame', {
    clipPath: 'inset(12% 12% 12% 12%)',
    duration: 1.6,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.diag__layout', start: 'top 80%', once: true },
  });
}

/* ---------- Preparação ---------- */
function prep(desktop) {
  gsap.fromTo('.prep__turbo', { rotation: -40 }, { rotation: 320, ease: 'none', scrollTrigger: scrub('.prep') });
  const [band, line] = qsa('.prep__stripes span');
  gsap.fromTo(band, { x: '-8vw' }, { x: '8vw', ease: 'none', scrollTrigger: scrub('.prep') });
  gsap.fromTo(line, { x: '10vw' }, { x: '-10vw', ease: 'none', scrollTrigger: scrub('.prep') });

  qsa('.prep__fig').forEach((fig, i) => {
    const img = fig.querySelector('img');
    gsap
      .timeline({ scrollTrigger: { trigger: '.prep__media', start: 'top 80%', once: true } })
      .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', delay: i * 0.15 })
      .fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out' }, '<');
    if (desktop) gsap.fromTo(fig, { yPercent: i ? 18 : 6 }, { yPercent: i ? -14 : -6, ease: 'none', scrollTrigger: scrub('.prep__media') });
  });

  gsap.from('.prep__item', {
    x: -50,
    autoAlpha: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.07,
    scrollTrigger: { trigger: '.prep__list', start: 'top 85%', once: true },
  });
}

// prévia de imagem que segue o cursor sobre a lista de especialidades
function prepPreview() {
  const list = qs('[data-prep-list]');
  const preview = qs('.prep__preview');
  if (!list || !preview) return;
  const imgs = qsa('img', preview);
  const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
  const rTo = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'power3' });
  let lastX = 0;
  let placed = false;

  list.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const w = preview.offsetWidth;
    const h = preview.offsetHeight;
    const x = e.clientX > window.innerWidth * 0.58 ? e.clientX - w - 36 : e.clientX + 36;
    const y = Math.min(Math.max(e.clientY - h / 2, 80), window.innerHeight - h - 20);
    if (!placed) {
      gsap.set(preview, { x, y });
      placed = true;
    }
    xTo(x);
    yTo(y);
    rTo(gsap.utils.clamp(-9, 9, (e.clientX - lastX) * 0.5));
    lastX = e.clientX;
  });
  qsa('.prep__item', list).forEach((item) =>
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      const i = Number(item.dataset.prepImg);
      imgs.forEach((im, j) => im.classList.toggle('is-active', j === i));
      preview.classList.add('is-visible');
    })
  );
  list.addEventListener('pointerleave', () => {
    preview.classList.remove('is-visible');
    placed = false;
  });
}

/* ---------- Details ---------- */
function details(desktop) {
  gsap.fromTo(
    '.details__panel',
    { clipPath: desktop ? 'inset(140px 48px 0px 48px round 32px)' : 'inset(40px 14px 0px 14px round 18px)' },
    {
      clipPath: 'inset(0px 0px 0px 0px round 0px)',
      ease: 'none',
      scrollTrigger: { trigger: '.details', start: 'top bottom', end: 'top 10%', scrub: true },
    }
  );
  gsap.fromTo(
    '.wash',
    { '--p': 0 },
    { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.wash', start: 'top 72%', end: 'bottom 38%', scrub: 0.5 } }
  );
  qsa('.dg').forEach((el) => {
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out' })
      .fromTo(el.querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'transform' }, 0);
  });
}

/* ---------- Galeria ---------- */
function gallery(desktop) {
  if (desktop) {
    qsa('.gallery__col').forEach((col) => {
      const s = parseFloat(col.dataset.speed) || 0;
      gsap.fromTo(col, { y: s * 600 }, { y: -s * 600, ease: 'none', scrollTrigger: scrub('.gallery__cols') });
    });
  }
  qsa('.g-item').forEach((el) => {
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out' })
      .fromTo(el.querySelector('img'), { scale: 1.35 }, { scale: 1, duration: 1.9, ease: 'expo.out', clearProps: 'transform' }, 0);
  });
}

/* ---------- Frase de impacto: palavra por palavra ---------- */
function manifesto(desktop) {
  const words = qsa('.manifesto .w');
  if (desktop) {
    gsap
      .timeline({
        scrollTrigger: { trigger: '.manifesto', start: 'top top', end: '+=140%', pin: true, scrub: 0.6, refreshPriority: 1 },
      })
      .to(words, { opacity: 1, stagger: 0.5, duration: 1, ease: 'none' })
      .fromTo('.manifesto__glow', { scale: 0.5, autoAlpha: 0.3 }, { scale: 1.25, autoAlpha: 1, duration: words.length * 0.5, ease: 'none' }, 0);
  } else {
    gsap.to(words, {
      opacity: 1,
      stagger: 0.5,
      ease: 'none',
      scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: 0.5 },
    });
  }
}

/* ---------- Footer ---------- */
function footer() {
  gsap.fromTo(
    '.footer__word',
    { yPercent: 60 },
    { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } }
  );
}
