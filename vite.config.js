import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { SITE } from './site.config.js';

const manifestPath = new URL('./src/data/images.json', import.meta.url);

// <tf-img name="bmw-435i" alt="..." sizes="50vw" class="..."></tf-img>
// vira um <picture> com AVIF + WebP responsivos (gerados por `npm run images`).
// O HTML final é estático: nada disso depende de JavaScript no navegador.
function tfImg() {
  return {
    name: 'tf-img',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        return html.replace(/<tf-img\b([^>]*)><\/tf-img>/g, (_, attrString) => {
          const attrs = {};
          attrString.replace(/([\w-]+)(?:="([^"]*)")?/g, (__, key, value) => {
            attrs[key] = value ?? '';
          });
          const { name, sizes = '100vw', loading = 'lazy', ...rest } = attrs;
          const img = manifest[name];
          if (!img) throw new Error(`<tf-img>: imagem "${name}" não está em src/data/images.json`);

          const srcset = (ext) => img.widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ');
          const fallback = img.widths.find((w) => w >= 800) ?? img.widths[img.widths.length - 1];
          const extra = Object.entries(rest)
            .map(([k, v]) => (v === '' && k !== 'alt' ? k : `${k}="${v}"`))
            .join(' ');

          return (
            `<picture>` +
            `<source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}">` +
            `<source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}">` +
            `<img src="/img/${name}-${fallback}.webp" width="${img.w}" height="${img.h}" loading="${loading}" decoding="async" ${extra}>` +
            `</picture>`
          );
        });
      },
    },
  };
}

// SEO local: JSON-LD (AutoRepair ⊂ AutomotiveBusiness), canonical, robots e sitemap.
function seo() {
  const abs = (path) => (SITE.url ? SITE.url + path : path);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: SITE.name,
    description: SITE.description,
    image: abs('/og-image.jpg'),
    logo: abs('/img/logo-1400.png'),
    telephone: SITE.telephone,
    founder: { '@type': 'Person', name: SITE.founder },
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${SITE.address.streetAddress} - ${SITE.address.neighborhood}`,
      addressLocality: SITE.address.addressLocality,
      addressRegion: SITE.address.addressRegion,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.addressCountry,
    },
    areaServed: { '@type': 'City', name: 'São José dos Campos' },
    hasMap: SITE.mapsUrl,
    sameAs: SITE.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE.telephone,
      contactType: 'customer service',
      availableLanguage: 'Portuguese',
    },
    makesOffer: SITE.services.map((name) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name },
    })),
    ...(SITE.url ? { url: SITE.url + '/', '@id': SITE.url + '/#oficina' } : {}),
  };

  return {
    name: 'tf-seo',
    transformIndexHtml(html) {
      const tags = [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(schema),
          injectTo: 'head',
        },
        { tag: 'meta', attrs: { property: 'og:image', content: abs('/og-image.jpg') }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: abs('/og-image.jpg') }, injectTo: 'head' },
      ];
      if (SITE.url) {
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: SITE.url + '/' }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: SITE.url + '/' }, injectTo: 'head' }
        );
      }
      return { html, tags };
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /'];
      if (SITE.url) {
        robots.push(`Sitemap: ${SITE.url}/sitemap.xml`);
        const today = new Date().toISOString().slice(0, 10);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source:
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            `  <url><loc>${SITE.url}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>\n` +
            `</urlset>\n`,
        });
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' });
    },
  };
}

export default defineConfig({
  plugins: [tfImg(), seo()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // gsap + lenis em um chunk próprio: cache longo e independente do código do site
        manualChunks: { vendor: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'] },
      },
    },
  },
  server: { host: true },
});
