import { gsap } from 'gsap';
import { qsa } from './env.js';

// Microinterações de botões (apenas mouse): texto que "rola" no hover e efeito magnético
export function initButtons({ fine, reduced }) {
  if (!fine) return;

  qsa('.btn__label').forEach((label) => {
    const text = label.textContent.trim();
    const roll = document.createElement('span');
    roll.className = 'btn__roll';
    const a = document.createElement('span');
    const b = document.createElement('span');
    a.textContent = text;
    b.textContent = text;
    b.setAttribute('aria-hidden', 'true');
    roll.append(a, b);
    label.replaceChildren(roll);
  });

  if (reduced) return;
  qsa('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.34);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)', overwrite: true });
    });
  });
}
