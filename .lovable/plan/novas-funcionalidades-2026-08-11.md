---
title: Marketing Request Tool
description: Implementation of the marketing inventory request PDF generator in the admin panel.
---

### 🚀 Novas Funcionalidades
- **Menu de Solicitação:** Novo item "Solicitação" adicionado à categoria **Vendas** no Painel Admin.
- **Gerador de PDF:** Interface para preenchimento manual de itens (SKU, Tamanho, Cor, Tecido).
- **Protocolo de Assinatura:** O PDF gerado inclui campos para assinaturas do Marketing, Diretoria e E-commerce, duplicados para as etapas de **Retirada** e **Devolução**.
- **Prazos de Marketing:** Campos configuráveis para tempo mínimo e máximo de permanência das peças com a equipe.

### 🛠️ Detalhes Técnicos
- **Biblioteca:** Utilizado `jspdf` e `jspdf-autotable` para geração de documentos client-side.
- **Componente:** `MarketingRequestManager.tsx` isola a lógica de formulário e exportação.
- **Integração:** Registrado no roteamento interno do `AdminPanel.tsx`.

### 📦 Dependências Adicionadas
- `jspdf`
- `jspdf-autotable`
