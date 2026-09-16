# Separar menus e categorias por loja

## Alterações
- Criar endereços de categoria exclusivos para cada loja: `/atacado/categoria/...` e `/varejo/categoria/...`.
- Fazer o menu da página Atacado apontar somente para categorias atacadistas.
- Manter o menu da página Varejo apontando somente para categorias varejistas.
- Fazer a página de categoria determinar a loja pelo endereço, sem depender de uma seleção salva anteriormente.
- Preservar os filtros atuais de Shorts, Bermudas, Leggings, Tops, Blusas, Conjuntos e Promoções.

## Validação
- Abrir o Atacado, acessar Produtos e confirmar que a categoria exibe apenas títulos com `ATACADO`.
- Abrir o Varejo, acessar Produtos e confirmar que a categoria exibe apenas títulos com `VAREJO`.
- Conferir os dois menus em computador e celular.

## Detalhes técnicos
- A separação será feita no cabeçalho, nas rotas e na página compartilhada de categorias.
- A rota antiga de categoria será mantida para compatibilidade, usando o contexto atual da loja.
