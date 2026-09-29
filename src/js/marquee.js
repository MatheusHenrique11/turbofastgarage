import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { qs } from './env.js';

// Faixa infinita: velocidade e direção reagem ao scroll. Pausada fora da tela.
export function initMarquee({ reduced }) {
  const marquee = qs('.marquee');
  const track = qs('.marquee__track');
  if (!marquee || !track || reduced) return;

  const originals = [...track.children];
  const measure = () => track.children[originals.length].offsetLeft - track.children[0].offsetLeft;
  const fill = () => {
    const copies = Math.ceil(window.innerWidth / Math.max(track.scrollWidth, 1)) + 1;
    for (let c = 0; c < copies; c++) originals.forEach((n) => track.appendChild(n.cloneNode(true)));
  };
  fill();
  let unit = measure();

  let x = 0;
  let dir = -1;
  let boost = 0;
  let visible = false;

  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(marquee);
  ScrollTrigger.create({
    trigger: marquee,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      dir = self.direction === 1 ? -1 : 1;
      boost = Math.min(Math.abs(self.getVelocity()) / 90, 14);
    },
  });

  gsap.ticker.add((time, delta) => {
    if (!visible) return;
    x += dir * (70 + boost * 40) * (delta / 1000);
    boost *= 0.94;
    if (x <= -unit) x += unit;
    if (x > 0) x -= unit;
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
  });

  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      unit = measure();
      if (track.scrollWidth < unit + window.innerWidth) fill();
    }, 200);
  });
}
