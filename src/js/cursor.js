import { gsap } from 'gsap';

// Cursor minimalista (somente mouse). Estados:
//   imagem → anel cresce · botão → círculo "OPEN" deslocado (não cobre o texto)
//   card / galeria → círculo "OPEN" / "VIEW" · link → anel amarelo · mapa → oculto
const STATES = ['is-link', 'is-img', 'is-open', 'is-view', 'is-offset', 'is-hidden'];

function pick(target) {
  if (!target.closest) return [];
  if (target.closest('iframe, .location__map')) return ['is-hidden'];
  if (target.closest('[data-cursor="view"]')) return ['is-view', 'VIEW'];
  if (target.closest('[data-cursor="open"], .card, .social__card')) return ['is-open', 'OPEN'];
  if (target.closest('.btn')) return ['is-open is-offset', 'OPEN'];
  if (target.closest('[data-cursor="img"], img')) return ['is-img'];
  if (target.closest('a, button, .chip')) return ['is-link'];
  return [];
}

export function initCursor() {
  const root = document.createElement('div');
  root.className = 'cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="cursor__ring"><span class="cursor__label"></span></div><div class="cursor__dot"></div>';
  document.body.append(root);
  document.documentElement.classList.add('has-cursor');

  const dot = root.querySelector('.cursor__dot');
  const ring = root.querySelector('.cursor__ring');
  const label = root.querySelector('.cursor__label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
  let shown = false;
  let current = '';

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!shown) {
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        root.classList.add('is-visible');
        shown = true;
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    },
    { passive: true }
  );
  document.documentElement.addEventListener('pointerleave', () => {
    root.classList.remove('is-visible');
    shown = false;
  });
  window.addEventListener('pointerdown', () => root.classList.add('is-down'));
  window.addEventListener('pointerup', () => root.classList.remove('is-down'));

  document.addEventListener('pointerover', (e) => {
    const [state = '', text = ''] = pick(e.target);
    if (state === current) return;
    current = state;
    root.classList.remove(...STATES);
    if (state) root.classList.add(...state.split(' '));
    if (text) label.textContent = text;
  });
}
