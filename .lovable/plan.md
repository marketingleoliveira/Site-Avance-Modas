# Plano de Implementação - Refatoração do Gestor de Solicitações de Marketing

Aprimorar a interface de criação de solicitações de marketing no painel administrativo, substituindo a entrada manual de SKU por um sistema de busca de produtos em tempo real integrado ao Shopify, com preenchimento automático de variantes e seleção restrita de tecidos.

## Alterações Propostas

### 1. Integração com Shopify API
- Utilizar a função `fetchProducts` existente em `src/lib/shopify-api.ts` para buscar produtos conforme o usuário digita.
- Implementar debounce na busca para otimizar chamadas à API.

### 2. Interface do Usuário (UI Architect)
- **Busca de Produto:** Substituir o campo de `Input` de SKU por um componente de Combobox (Popover + Command) que permite pesquisar produtos pelo título.
- **Seleção de Variantes:**
    - Ao selecionar um produto, carregar suas opções de `Tamanho` e `Cor` diretamente das variantes do Shopify.
    - Transformar os campos de `Input` de Tamanho e Cor em `Select` (dropdown) com as opções disponíveis para o produto escolhido.
- **Tipo de Tecido:** Substituir o campo de texto livre por um `Select` fixo com as opções: **Milano** e **Velocity**.

### 3. Lógica de Componente (MarketingRequestManager)
- Adicionar estado para armazenar os produtos pesquisados.
- Atualizar o objeto `RequestItem` para incluir a referência do produto selecionado.
- Garantir que, ao trocar o produto, os campos de tamanho e cor sejam resetados para forçar a nova seleção.

## Detalhes Técnicos
- **Arquivo Principal:** `src/components/admin/MarketingRequestManager.tsx`
- **Componentes UI:** `Select`, `Popover`, `Command` (shadcn/ui).
- **Data Source:** Shopify Storefront API (via `src/lib/shopify-api.ts`).

## Passos de Execução
1. Modificar `MarketingRequestManager.tsx` para importar os componentes de UI e as funções da API do Shopify.
2. Implementar o componente de busca de produto dentro do loop de itens.
3. Atualizar a função `updateItem` para lidar com a seleção complexa.
4. Validar se os dados selecionados estão sendo passados corretamente para o gerador de PDF e para o Supabase.
