# Plano de SEO profundo — Avance Modas

Foco 100% em bastidores. Nenhuma mudança em layout, cores, tipografia, navegação ou UX. Tudo é incremental e preserva URLs já indexadas.

## Fase 1 — Fundação técnica (rápido, alto impacto)

1. **Head sitewide (`index.html`)** — revisar title, description, Organization + WebSite + SearchAction JSON-LD, og/twitter, `lang="pt-BR"`, theme-color, preconnect (cdn Shopify, fonts, supabase), favicon.
2. **Helmet por rota** — auditar todas as páginas (`Index`, `InicioVarejo`, `InicioAtacado`, `StoreSelector`, `AboutPage`, `ContactPage`, `SACPage`, `PrivateLabelPage`, `TestimonialsPage`, `TrackingPage`, `SupportPage`, `WholesaleCheckout`, `WholesaleConfirmation`, `NotFound`) garantindo title único, description única, canonical self-referencing, og:url consistente.
3. **`NotFound`** — adicionar `<meta name="robots" content="noindex">` via Helmet e links internos para hubs principais.
4. **Páginas internas (checkout, confirmação, admin, suporte)** — `noindex,follow` onde apropriado.
5. **`robots.txt`** — manter; adicionar `Disallow: /atacado/checkout`, `/atacado/confirmacao`, `/suporte` se forem privadas.
6. **`sitemap.xml`** — migrar de estático para gerador (`scripts/generate-sitemap.ts` + `predev`/`prebuild`) puxando categorias do código e produtos do Shopify, mantendo URLs já listadas.
7. **`llms.txt`** — expandir com hubs de conteúdo novos.

## Fase 2 — Schema.org rico

- **Product** já existe em `ProductSEO.tsx`: adicionar `aggregateRating` quando houver avaliações, `material` (Poliamida/Suplex), `gtin`/`mpn` quando disponíveis, `additionalProperty` (UV 50+, Aloe Vera, compressão), `hasMerchantReturnPolicy`, `shippingDetails`.
- **BreadcrumbList** em produto, categoria, artigos.
- **FAQPage** em produto (FAQ por peça) e em guias.
- **CollectionPage + ItemList** em categoria (`CategorySEO` já tem base — completar com `itemListElement`).
- **Organization/LocalBusiness** sitewide com CNPJ, endereço, telefone, sameAs (Instagram, etc.).
- **Article/BlogPosting** para guias (Fase 4).

## Fase 3 — Conteúdo de produto (sem mudar layout)

Sem alterar visual do `ShopifyProductPage`, expandir o que o componente injeta no head e em seções colapsáveis/abas já existentes:
- descrição enriquecida puxando metafields do Shopify (gramatura, elasticidade, compressão, UV, respirabilidade, cuidados);
- FAQ por produto (4–6 perguntas padrão renderizadas em accordion já existente ou em `<details>` semântico invisível-amigável);
- bloco "Produtos relacionados" reforçando linkagem interna por categoria/cor/tecido.

## Fase 4 — Autoridade temática (hub semântico)

Criar estrutura de blog/guias **sem mudar o menu**. Acesso via footer + links internos contextuais.

- Rota nova `/guias` (hub) + `/guias/:slug` (artigo) com `Article` JSON-LD, breadcrumb, TOC, FAQ.
- Conteúdo gerenciado por tabela `guides` no Lovable Cloud (com RLS pública leitura, admin escrita; novo painel em `/admin`).
- Páginas pilares iniciais (geradas com conteúdo seed pronto):
  - Guia da Poliamida
  - Guia da Legging (como escolher, evitar transparência, melhor p/ academia)
  - Poliamida x Poliéster x Suplex
  - Como lavar roupa fitness de poliamida
  - Guia de Revenda Fitness (atacado)
  - Moda Fitness para Pilates / Yoga / Musculação / Corrida
- Sitemap inclui todos os guias dinamicamente.

## Fase 5 — Links internos automáticos

- Componente `RelatedLinks` reutilizável que cruza categoria atual ↔ guias ↔ produtos ↔ pilares. Inserido em rodapés de seção já existentes (não cria seção visual nova; substitui blocos hoje vazios).
- Breadcrumbs semânticas (HTML + JSON-LD) onde já existe breadcrumb visual (CategoryPage, ProductPage).
- Anchor text rico em palavras-chave-alvo.

## Fase 6 — Performance / Core Web Vitals

- `vite-imagetools` para imagens locais (`src/assets/*`) com `?format=avif` + `?format=webp` + fallback.
- `loading="lazy"` + `decoding="async"` revisado em todas as `<img>`; LCP da home com `fetchpriority="high"` + `<link rel="preload">`.
- `preconnect` para `cdn.shopify.com`, `*.myshopify.com`, Supabase, Google Fonts.
- Font-display swap e subset; remover fontes não usadas.
- Code-split agressivo de rotas pesadas (admin já é rota separada; garantir `React.lazy`).
- Remover libs não usadas (audit com `bunx depcheck`).

## Fase 7 — IA / Answer Engine Optimization

- Em todo guia e FAQ: blocos curtos "Resumo" + "Resposta direta" no início, perguntas como H2 explícitos, listas e tabelas comparativas, glossário de termos.
- `llms.txt` expandido com mapa de hubs.
- JSON-LD `Speakable` em respostas curtas.

## Detalhes técnicos

- **Stack:** Vite/React 18/TS/Tailwind. Helmet via `react-helmet-async` já instalado.
- **Backend dos guias:** tabela `public.guides (id, slug unique, title, excerpt, body_md, hero_image, category, tags[], reading_minutes, published, published_at, updated_at)` + `GRANT SELECT TO anon, authenticated`, `GRANT ALL TO service_role`, RLS `published = true` para leitura pública, admin via `has_role`.
- **Sitemap gerado:** consulta Supabase (`guides where published`) + Shopify Storefront API (produtos VAREJO + ATACADO) + rotas estáticas. Roda em `predev` e `prebuild`.
- **Sem mudar URLs:** todas as rotas atuais permanecem. Apenas adicionamos `/guias` e `/guias/:slug`.

## Ordem de execução proposta

1. Fase 1 + 2 num único passo (head, schema, sitemap dinâmico, robots) — ganho imediato sem risco visual.
2. Fase 6 (perf) — sem efeito visual.
3. Fase 3 (enriquecimento de produto via metafields/FAQ).
4. Fase 4 + 5 + 7 (hub de guias + linkagem + AEO) — maior, entrego em incrementos.

## O que NÃO vou tocar

- Layout, paleta, fontes, espaçamentos, componentes visuais.
- Menu/header/footer (estrutura), exceto adicionar 1 link "Guias" no footer na Fase 4 — confirmo antes.
- URLs existentes, rotas atuais, comportamento do carrinho/checkout.

## Confirmações antes de executar

1. Posso seguir nessa ordem (Fase 1+2 primeiro), ou prefere priorizar outra fase?
2. Posso criar `/guias` e `/guias/:slug` (rotas novas, sem mexer no menu — acesso via footer e links internos)?
3. Posso adicionar tabela `guides` no Lovable Cloud para o hub de conteúdo?
