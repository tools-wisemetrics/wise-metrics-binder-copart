# Critérios de aceitação — Dashboard Copart v2

Barra alta. A versão intermediária (D42) só é aprovada com Gates A–D. Gate E impede vender P2 como pronto.

## Gate A — Spec

- [GLOSSARIO.md](./GLOSSARIO.md), [SPEC-dashboard-v2.md](./SPEC-dashboard-v2.md) e este arquivo existem.
- Matriz D01–D44 completa, sem item órfão.

## Gate B — Invariantes (automatizados)

Rodar `npm test`.

1. Nenhum label user-facing contém `Venda Direta`, `venda_direta`, `WhatsApp Direct`, `Below target`, `Trazer para Vender`, `Venha Comprar`.
2. Funil Leilão tem exatamente 4 stages, labels canônicos, valores monotônicos (cada etapa ≤ anterior).
3. Último estágio Select/Venda = Veículos Captados; Select/Compra = Veículos Vendidos.
4. `getChannelPerformance('leilao_compra')` não retorna canais Select; spend Leilão e spend Select são conjuntos distintos.
5. Alterar `dateRange` ou `unit` muda o payload do serviço.
6. TOTAL da tabela = soma das linhas (custo médio = gasto / volume).
7. Metas por canal incluem RD Station e Blip como séries distintas, sem `CRM`.

Score mínimo: 100% verdes.

## Gate C — QA de produto

11 rotas P0 + rotas P1 em 1280px, 768px e 375px:

- Filter bar visível; período customizável; cascata unidade → canal.
- Sem overflow horizontal blocker; grids quebram em `sm`/`lg`.
- Copy pt-BR.
- Walkthrough de 10 min só com nomes da reunião.

Zero blocker P0.

## Gate D — Stakeholder

1. Trocar unidade Leilão/Compra ↔ Select sem misturar investimento.
2. Funil Leilão com 4 etapas de negócio.
3. Select com dois funis e captados/vendidos.
4. Atribuição com definições + contribuição por etapa.
5. Jornadas com big numbers + 2 rankings.
6. Período customizado altera KPIs.

Sem aprovação humana, D42 não é declarado concluído pelo agente.

## Gate E — Não-demo

Criativos, Assistente IA, Segurança, User ID real aparecem como **Em breve**. É reprovação apresentá-los como feitos.

## Cenários Given/When/Then (P0)

**D01/D17**  
Given o filtro de unidade em Leilão/Compra  
When a Visão Geral e Campanhas carregam  
Then nenhum KPI de investimento Select entra no total.

**D05**  
Given a página Funil de Leilão  
When o funil visual renderiza  
Then as etapas são Entrantes, Habilitados, Licitantes, Arrematantes.

**D08**  
Given a página Copart Select  
When os big numbers abrem  
Then Veículos Captados e Veículos Vendidos estão visíveis.

**D09**  
Given Metas por Canal  
When a grade de canais renderiza  
Then RD Station e Blip existem e CRM genérico não existe.

**D13**  
Given start=2026-06-01 e end=2026-06-30  
When o serviço devolve funil  
Then os volumes diferem do recorte de 7 dias.

**D15**  
Given Atribuição  
When a tabela principal aparece  
Then as colunas são etapas do funil, não só primeiro/último toque.
