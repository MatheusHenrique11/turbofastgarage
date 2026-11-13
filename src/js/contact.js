import { gsap } from 'gsap';
import { qs, qsa } from './env.js';

const DEFAULT_MSG = 'Olá, Turbo Fast Garage! Vim pelo site e gostaria de falar sobre um serviço.';

// Seletor de assunto: pré-preenche a mensagem do botão principal de WhatsApp
export function initContact({ reduced }) {
  const phone = document.body.dataset.whatsappNumber;
  const waBase = `https://wa.me/${phone}?text=`;
  qsa('[data-wa-message]').forEach((link) => {
    link.href = waBase + encodeURIComponent(link.dataset.waMessage || DEFAULT_MSG);
  });

  const picker = qs('[data-wa-picker]');
  const main = qs('[data-wa-main]');
  if (picker && main) {
    picker.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const on = chip.getAttribute('aria-pressed') !== 'true';
      qsa('.chip', picker).forEach((c) => c.setAttribute('aria-pressed', String(c === chip && on)));
      main.href = waBase + encodeURIComponent(on ? chip.dataset.msg : DEFAULT_MSG);
      if (!reduced) gsap.fromTo(main, { scale: 0.96 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
    });
  }

  // brilho que acompanha o cursor nos cards de redes sociais
  qsa('.social__card').forEach((card) =>
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    })
  );
}
