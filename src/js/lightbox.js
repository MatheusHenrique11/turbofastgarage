import { gsap } from 'gsap';

// Lightbox acessível: Esc fecha, setas navegam, foco preso no diálogo,
// swipe no touch e retorno do foco para a foto de origem ao fechar.
let ui;
let imgEl;
let items = [];
let index = 0;
let opener = null;
let lenisRef = null;

const pad = (n) => String(n).padStart(2, '0');

function build() {
  ui = document.createElement('div');
  ui.className = 'lightbox';
  ui.setAttribute('role', 'dialog');
  ui.setAttribute('aria-modal', 'true');
  ui.setAttribute('aria-label', 'Galeria de fotos');
  ui.innerHTML = `
    <div class="lightbox__top">
      <span class="lightbox__count" aria-live="polite"></span>
      <button type="button" class="lightbox__close">Fechar
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="lightbox__stage"><img class="lightbox__img" alt="" /></div>
    <div class="lightbox__bottom">
      <div class="lightbox__cap"><span class="lightbox__title"></span><span class="lightbox__meta"></span></div>
      <div class="lightbox__nav">
        <button type="button" class="lightbox__prev" aria-label="Foto anterior"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>
        <button type="button" class="lightbox__next" aria-label="Próxima foto"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>
      </div>
    </div>`;
  document.body.append(ui);
  imgEl = ui.querySelector('.lightbox__img');

  ui.querySelector('.lightbox__close').addEventListener('click', close);
  ui.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1, -1));
  ui.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1, 1));
  ui.querySelector('.lightbox__stage').addEventListener('click', (e) => e.target === e.currentTarget && close());

  ui.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(index + 1, 1);
    else if (e.key === 'ArrowLeft') show(index - 1, -1);
    else if (e.key === 'Tab') {
      const focusables = [...ui.querySelectorAll('button')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  let startX = null;
  ui.addEventListener('pointerdown', (e) => (startX = e.clientX));
  ui.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
}

function show(i, dir = 0) {
  index = (i + items.length) % items.length;
  const link = items[index];
  const thumb = link.querySelector('img');
  ui.querySelector('.lightbox__count').textContent = `${pad(index + 1)} / ${pad(items.length)}`;
  ui.querySelector('.lightbox__title').textContent = link.dataset.title || '';
  ui.querySelector('.lightbox__meta').textContent = link.dataset.meta || '';

  const next = new Image();
  next.src = link.href;
  const swap = () => {
    imgEl.src = next.src;
    imgEl.alt = thumb ? thumb.alt : '';
    gsap.fromTo(imgEl, { autoAlpha: 0, x: dir * 50, scale: 0.98 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.7, ease: 'expo.out' });
  };
  gsap.to(imgEl, {
    autoAlpha: 0,
    x: -dir * 50,
    duration: dir ? 0.25 : 0,
    ease: 'power2.in',
    onComplete: () => (next.decode ? next.decode().catch(() => {}).then(swap) : swap()),
  });
}

export function openLightbox(group, i, { lenis }) {
  if (!ui) build();
  items = group;
  opener = document.activeElement;
  lenisRef = lenis;
  lenis ? lenis.stop() : (document.body.style.overflow = 'hidden');
  document.documentElement.classList.add('lb-open');
  ui.classList.add('is-open');
  show(i);
  ui.querySelector('.lightbox__close').focus();
}

function close() {
  ui.classList.remove('is-open');
  document.documentElement.classList.remove('lb-open');
  lenisRef ? lenisRef.start() : (document.body.style.overflow = '');
  opener?.focus?.({ preventScroll: true });
}
