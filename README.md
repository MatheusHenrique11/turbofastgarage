# Turbo Fast Garage — site institucional

Site one-page da Turbo Fast Garage, em São José dos Campos/SP, com foco em elétrica e eletrônica automotiva, som e acessórios e estética automotiva (Turbo Fast Details).

**Stack:** Vite · JavaScript ES modules · GSAP + ScrollTrigger + SplitText · Lenis · sharp.
O conteúdo principal é HTML estático; o JavaScript complementa a navegação e as animações.

## Rodando

```bash
npm install
npm run dev       # gera as imagens e inicia o Vite
npm run build     # otimiza as imagens e gera dist/
npm run preview   # serve o dist/ para conferir o build
```

O projeto requer Node 20.9+ e fixa Node 24 LTS em `.nvmrc`.

## Publicação e SEO

O endereço canônico padrão é `https://turbofastgarage.vercel.app`. Para gerar os metadados e o sitemap para outro domínio:

No PowerShell:

```powershell
$env:SITE_URL = "https://www.seudominio.com.br"
npm run build
```

O build gera `canonical`, Open Graph, JSON-LD, `robots.txt` e `sitemap.xml`.

## Estrutura e imagens

```
assets/                 originais das fotos e vídeos
public/img/             imagens otimizadas em AVIF e WebP
scripts/images.mjs      pipeline de imagens e imagem Open Graph
index.html              conteúdo e metadados do site
site.config.js          contatos, redes sociais e dados para SEO
vite.config.js          HTML responsivo e geração de SEO
src/styles/             estilos e animações
src/js/                 módulos de interação
```

Para incluir uma foto, adicione o arquivo a `assets/`, cadastre-o em `photos` no `scripts/images.mjs` e rode `npm run images`. O pipeline gera variantes responsivas, que podem ser exibidas com `<tf-img>`.

## Contatos

WhatsApp, e-mail e os perfis do Instagram ficam centralizados em `site.config.js`. As mensagens contextuais do WhatsApp são configuradas nos atributos `data-wa-message` do HTML; os assuntos do formulário definem mensagens próprias.

## Acessibilidade e desempenho

- Respeita `prefers-reduced-motion`; o conteúdo continua disponível sem JavaScript.
- Scroll nativo em telas de toque e cursor personalizado somente para mouse.
- Imagens responsivas em AVIF/WebP, com dimensões, carregamento tardio e preload da imagem principal.
- Estados de foco visíveis e navegação por teclado.
