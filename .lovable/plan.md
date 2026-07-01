# Plano — SEO/Performance Invisível (Avance Modas)

Regra inegociável: **zero mudanças visuais** (layout, cores, tipografia, componentes, banners, menus). Todo o trabalho acontece em `<head>`, JSON-LD, HTML semântico, rotas novas para SEO, imagens e bundle.

## 1. Auditoria técnica (bastidor)
- Rodar `seo_chat--trigger_scan` + `seo_chat--list_findings` e corrigir tudo que estiver failing.
- Rodar `code--dependency_scan` para pegar libs pesadas removíveis.
- Verificar Heading hierarchy em todas as páginas (`H1` único por rota, `H2/H3` semânticos). Onde hoje o `<h2>` visual for na verdade o título principal (ex.: `CategoriesSection`), converter para `h2` real e garantir um único `h1` acima (ex.: `h1` visualmente presente ou `sr-only` quando o design não permitir).
- `alt` descritivo em imagens (`CategoriesSection`, hero, produtos, testimonials, footer).
- `width`/`height` em todas as `<img>` estáticas para eliminar CLS.
- `loading="lazy"` + `decoding="async"` em imagens abaixo da dobra; `fetchpriority="high"` só no LCP.

## 2. Meta titles & descriptions comerciais (CTR)
Reescrever em todas as rotas com foco em conversão (poliamida premium, sem transparência, atacado/varejo, UV50+, fábrica própria):
- `/` (StoreSelector), `/varejo`, `/atacado`, `/sobre`, `/contato`, `/sac`, `/rastreio`, `/private-label`, `/depoimentos`, `/guias`.
- Todas as `/categoria/:slug` recebem título + descrição próprios via `CategorySEO` (já existe) — enriquecer copy.
- Todos os `/produto/:handle` já usam `ProductSEO`; reforçar copy comercial no fallback.

## 3. Novas landing pages comerciais (SEO puro, sem quebrar layout)
Criar rotas novas que **reusam componentes existentes** (`ShopifyProductGridFiltered` + `RouteSEO` + bloco FAQ). Sem novo design.

URLs (301 dos slugs equivalentes que já existirem):
- `/legging-poliamida`
- `/legging-cintura-alta`
- `/legging-sem-transparencia`
- `/calca-fitness`
- `/short-fitness`
- `/conjunto-fitness`
- `/roupa-fitness-feminina`
- `/moda-fitness`
- `/moda-fitness-atacado`
- `/fornecedor-moda-fitness`
- `/moda-praia` (só se houver produtos — senão fica fora do sitemap)

Cada uma:
- `<h1>` com a keyword primária
- 600–1000 palavras de copy original (comercial, EEAT, sem keyword stuffing)
- Grid filtrado por keyword/tipo (Shopify search query)
- Bloco FAQ visível + `FAQPage` JSON-LD
- `BreadcrumbList` + `CollectionPage` + `ItemList` schemas
- Link interno para categorias relacionadas, atacado, guias

Componente compartilhado: `src/components/seo/CommercialLanding.tsx` (reaproveita estilo já existente do site — nada novo visual).

## 4. Copy 600–1000 palavras nas categorias existentes
Adicionar bloco de texto SEO **abaixo do grid** em `CategoryPage` (respeitando o design atual — tipografia/cores herdadas). Conteúdo carregado de um objeto `src/content/category-copy.ts` (Leggings, Shorts, Tops, Conjuntos, Bermudas, Blusas, Promoções). Inclui H2/H3 semânticos + FAQ + FAQ Schema.

## 5. Schemas ricos (Rich Snippets)
- `Organization` + `LocalBusiness` (endereço da fábrica) — no `index.html`
- `WebSite` + `SearchAction` (busca interna `?q=`) — `index.html`
- `BreadcrumbList` em todas as rotas via `RouteSEO`
- `Product` com `Offer`, `AggregateRating` **apenas** quando houver reviews reais (política anti-fake mantida)
- `FAQPage` nas categorias e landings
- `ItemList` nos hubs

## 6. Linkagem interna
- Bloco "Categorias relacionadas" em `CategoryPage`, `ShopifyProductPage`, `GuideDetail`, novas landings.
- Cross-links `/varejo` ↔ `/atacado` ↔ `/private-label`.
- Rodapé já linka; adicionar links contextuais dentro dos textos SEO.

## 7. Performance (Core Web Vitals)
- Confirmar `React.lazy` em rotas pesadas (`AdminPanel`, `WholesaleCheckout`, `SACPage`, `ProductPage`, `CategoryPage`) — já iniciado.
- Adicionar `vite-plugin-compression` (gzip+brotli) e `rollup` `manualChunks` (react, shopify, supabase, ui).
- `preconnect`/`dns-prefetch` para `cdn.shopify.com`, Supabase, Google Fonts.
- Fontes: `font-display: swap` + preload da fonte usada no LCP.
- Imagens estáticas `src/assets/*.jpg` — passar por `vite-imagetools` gerando `.webp`.
- Remover CSS não usado via `tailwind` purge (já ativo) e conferir `content` globs.

## 8. Sitemap / robots / llms.txt
- Regenerar `sitemap.xml` incluindo novas landings e mantendo URLs indexadas.
- Manter `Disallow` para checkout/admin/suporte.
- Atualizar `llms.txt` com as novas landings.

## 9. Redirects 301
Se alguma URL antiga entrar em conflito com nova landing, adicionar redirect via `<Route>` React (`<Navigate replace>`) — nada muda visualmente. Nenhuma URL indexada atual será removida.

## 10. Relatório final
Ao concluir, entrego resumo com: findings corrigidos, páginas criadas, schemas adicionados, ganhos esperados de performance, oportunidades futuras (backlinks, GSC follow-up).

---

## Ordem de execução
1. Scan SEO + fixes rápidos (meta/heading/alt).
2. `CommercialLanding` + 10 novas rotas + sitemap + links internos.
3. Copy SEO + FAQ nas 7 categorias.
4. Schemas complementares (`LocalBusiness`, `WebSite SearchAction`).
5. Performance (compression, chunks, preconnect, imagetools).
6. Rescan + relatório.

## Confirmações que preciso antes de codar
1. Posso criar as **10 novas rotas** listadas em §3 (aparecem só no sitemap/links internos, não entram no menu visual)?
2. Posso adicionar **bloco de texto SEO ao fim das categorias** (§4) — herda tipografia atual, não muda cores/layout, mas *adiciona conteúdo* na página. Confirma que isso não fere a regra "não alterar layout"?
3. Instalar `vite-plugin-compression` e `vite-imagetools` (§7)?
