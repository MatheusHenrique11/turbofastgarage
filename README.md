# TurboFast Garage — site institucional

Site one-page da TurboFast Garage (São José dos Campos/SP): manutenção, diagnóstico, preparação e detailing.

**Stack:** Vite · JavaScript puro (ES modules) · GSAP + ScrollTrigger + SplitText · Lenis · sharp (pipeline de imagens).
Sem framework de UI: o HTML final é estático (bom para SEO e velocidade) e o JavaScript só adiciona as animações.

## Rodando

```bash
npm install
npm run dev       # desenvolvimento em http://localhost:5173
npm run build     # gera o site final em dist/
npm run preview   # serve o dist/ para conferir o build
```

Node 18+ (o `npm audit` aponta um aviso no `sharp`, que só roda localmente para processar as fotos; a versão corrigida exige Node 20+).

## Deploy

O conteúdo de `dist/` é estático e funciona em qualquer hospedagem (Netlify, Vercel, Cloudflare Pages, hospedagem comum).

Antes do deploy, defina o domínio definitivo para gerar `canonical`, `og:url`, `og:image` absoluto e `sitemap.xml`:

```bash
SITE_URL=https://www.seudominio.com.br npm run build
```

(ou preencha `url` em `site.config.js`). Sem isso o site funciona normalmente, só sem essas tags.

## Estrutura

```
assets/                 fotos originais (fonte — não vão para o site)
public/img/             fotos otimizadas geradas (AVIF + WebP, várias larguras)
public/fonts/           Anton, Inter e JetBrains Mono (self-hosted, com preload)
scripts/images.mjs      tratamento de cor + geração das imagens, logo sem fundo, ícones, og-image
index.html              todo o conteúdo e textos do site
site.config.js          dados do negócio para SEO (Schema.org AutoRepair)
vite.config.js          plugin <tf-img> e plugin de SEO
src/styles/             base.css (tokens, tipografia, botões) · layout.css · sections.css
src/js/                 um módulo por responsabilidade (preloader, hero, header, seções...)
```

## Fotos

1. Coloque a foto original em `assets/`.
2. Adicione uma linha em `photos` no `scripts/images.mjs` (nome + tratamento: `cine` para seções escuras, `clean` para detailing).
3. Rode `npm run images` (ou `npm run images -- nome` para reprocessar só uma).
4. Use no HTML: `<tf-img name="nome" alt="descrição" sizes="50vw"></tf-img>` — no build isso vira um `<picture>` com AVIF/WebP responsivos.

Fotos que valorizariam ainda mais o site (hoje não existem no acervo e **não** foram simuladas):
scanner automotivo em uso, elevador, mecânico trabalhando, polimento, rodas e fachada da oficina.
A seção de diagnóstico e a galeria recebem novas fotos sem mudar o layout.

## Links e mensagens

- Todos os botões de WhatsApp apontam para `https://wa.me/5512934857571` com mensagem pré-preenchida conforme o contexto (diagnóstico, preparação, detailing, visita). Para mudar, edite o `?text=` no `index.html`.
- No contato, os botões de assunto trocam a mensagem do botão principal (`src/js/contact.js`).
- Instagram da oficina, Instagram do detailing e TikTok ficam separados em todos os pontos do site.

## Acessibilidade e desempenho

- `prefers-reduced-motion`: sem smooth scroll, sem animações de entrada, preloader curto, todo o conteúdo visível.
- Sem JavaScript o site continua completo (preloader some, imagens abrem direto).
- Cursor personalizado apenas em mouse; em touch o scroll é nativo.
- Imagens com `loading="lazy"`, dimensões fixas (sem layout shift), hero com `fetchpriority="high"` + preload.
- Code splitting: GSAP/Lenis em chunk próprio; cursor e lightbox baixados só quando usados.
# turbofastgarage
