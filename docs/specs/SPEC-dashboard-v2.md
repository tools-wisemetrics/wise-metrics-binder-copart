# SPEC Dashboard Copart Brasil v2

**Versão:** 2.0  
**Data:** 2026-09-14  
**Fonte:** Direcionamentos_Dashboard_Copart.xlsm (D01–D44)  
**Precedência:** este documento prevalece sobre `Especificação de Dashboards — Copart Brasil.md` v1.0.

Glossário: [GLOSSARIO.md](./GLOSSARIO.md)  
Aceitação: [ACCEPTANCE.md](./ACCEPTANCE.md)

## 1. Objetivo

Entregar um dashboard executivo + operacional no vocabulário da reunião, com filtros reais, funis de negócio isolados e critério de aprovação alto (Gates A–E). A versão intermediária (D42) cobre P0. P1/P2 não podem ser vendidos como prontos.

## 2. Unidades, funis e isolamento

Três unidades: `leilao_compra`, `select_venda`, `select_compra`.

Funil Leilão (4 etapas): Entrantes, Habilitados, Licitantes, Arrematantes. Sem Intenção. Sem Select no mesmo funil.

Funil Select/Venda: Cliques CTA → Conversas → Qualificados → Vistorias → Veículos Captados.

Funil Select/Compra: Anúncios de estoque → Visualização de lote → Intenção/contato → Compradores habilitados → Veículos Vendidos.

Investimento de Leilão e Select nunca somam no mesmo doughnut/KPI, salvo comparativo explicitamente rotulado.

## 3. Contrato de filtros (todas as páginas)

Query string persistida:

| Param | Valores | Default |
|---|---|---|
| `start` / `end` | ISO date, seleção livre | `2026-06-28` / `2026-07-04` |
| `unit` | `ALL` \| `leilao_compra` \| `select_venda` \| `select_compra` | `ALL` |
| `funnel` | `ALL` \| `leilao` \| `select_venda` \| `select_compra` | `ALL` |
| `campaign` | `ALL` \| nome da campanha | `ALL` |
| `channel` | `ALL` \| canal canônico | `ALL` |
| `geo` | `ALL` \| UF | `ALL` |

Cascata: unidade → funil → campanha → canal. Opções de níveis inferiores dependem do superior. `DataService` honra o recorte (não ignora filters).

## 4. Navegação

**Executivo:** Visão Geral, Funil de Leilão, Copart Select, Atribuição, Metas por Canal, Jornada de Conversão, Análise Regional, Evolução.

**Operacional:** Performance Diária, Campanhas Leilão, Campanhas Select, Alertas, Recomendações, Relatório.

**Em breve (P2, Gate E):** Criativos, Assistente de IA, Segurança.

## 5. Telas P0

- Visão Geral: KPIs GA4 diagnósticos + metas da unidade filtrada + origem de tráfego. Copy sem Venda Direta.
- Funil Leilão: 4 etapas + tabela por canal com TOTAL calculado + tendência.
- Copart Select: dois funis lado a lado; big numbers Veículos Captados e Veículos Vendidos; tabelas com TOTAL calculado; definição provisória de lead qualificado.
- Atribuição: glossário visível; tabela principal campanha × etapa do funil; first/last como seção secundária.
- Metas por Canal: RD Station e Blip separados (não CRM único).
- Jornada: big numbers + ranking de padrões frequentes + ranking que mais gera habilitados + participação de canal.
- Campanhas / Alertas / Recs: owner Felipe em itens de mídia.

## 6. Telas P1

- Regional: performance por UF + mapa de calor do Brasil.
- Evolução: série semanal e mensal dos KPIs principais por plataforma.
- Alertas: limites de variação configuráveis (default 20% vs período anterior).
- Relatório: resumo imprimível / PDF via print.
- Cobertura Vitória: checklist das visões do relatório legado absorvidas.

## 7. Telas P2 (não-demo)

Criativos (inventário Meta + taxonomia), Assistente IA, ACL/segurança, User ID unificado real. UI marca **Em breve**.

## 8. Dados

Preferir dados reais. Contingência: relatório semanal. Sem arquivo do relatório, usar mock spec-compliant e header `Mock alinhado à spec`.

## 9. Matriz D01–D44

| ID | Direcionamento | Onda | Status no código |
|---|---|---|---|
| D01 | Padronizar unidades e jornadas | P0 | Implementado |
| D02 | Substituir Venda Direta por Select | P0 | Implementado |
| D03 | Padronizar nomes dos funis | P0 | Implementado |
| D04 | Revisar etapas Intenção vs Entrante | P0 | Default: Intenção fora do Funil Leilão |
| D05 | Etapas Entrantes/Habilitados/Licitantes/Arrematantes | P0 | Implementado |
| D06 | Funil Select/Venda | P0 | Implementado |
| D07 | Funil Select/Compra | P0 | Implementado |
| D08 | Veículos captados e vendidos | P0 | Implementado |
| D09 | Separar RD Station e Blip | P0 | Implementado |
| D10 | Corrigir WhatsApp Direct | P0 | Default: Blip (WhatsApp) |
| D11 | Responsável de mídia = Felipe | P0 | Implementado |
| D12 | Responsividade | P0 | Implementado |
| D13 | Período personalizado | P0 | Implementado |
| D14 | Explicar nomenclaturas de atribuição | P0 | Implementado |
| D15 | Atribuição por etapa do funil | P0 | Implementado |
| D16 | Filtros hierárquicos | P0 | Implementado |
| D17 | Separar Leilão e Select | P0 | Implementado |
| D18 | Qualificação de leads | P0 copy + P1 alinhamento | Definição provisória na UI |
| D19 | Big numbers de jornada | P0 | Implementado |
| D20 | Ranking de jornadas | P0 | Implementado |
| D21 | Ranking de canais nas jornadas | P0 | Implementado |
| D22 | User ID comum | P2 | Em breve |
| D23 | SLA de validação de fontes | P1 | Limites documentados + tela de alertas |
| D24 | Análise regional | P1 | Implementado |
| D25 | Mapa do Brasil | P1 | Implementado |
| D26 | Inventário Meta | P2 | Em breve |
| D27 | Exibir criativos | P2 | Em breve |
| D28 | Capturar criativos via API | P2 | Em breve |
| D29 | Taxonomia criativa | P2 | Em breve |
| D30 | Gráfico de evolução | P1 | Implementado |
| D31 | SLA e alertas configuráveis | P1 | Implementado |
| D32 | Assistente de IA | P2 | Em breve |
| D33 | Base consultável pela IA | P2 | Em breve |
| D34 | Conhecimento para recomendações | P2 | Em breve |
| D35 | Usar dados reais | P0 origem honesta | Mock spec até haver relatório |
| D36 | Relatório atual como contingência | P0 | Contrato de origem `weekly_report` |
| D37 | Analisar relatório da Vitória | P1 | Checklist na tela Relatório |
| D38 | Incorporar visões existentes | P1 | Mapeado no Relatório |
| D39 | Organizar relatórios de referência | Processo | Pasta `docs/specs/` neste repo |
| D40 | Relatório/resumo automático | P1 | Página imprimível |
| D41 | Validar visão exec/operacional | Processo | Gate D (stakeholder) |
| D42 | Versão intermediária ~1 semana | P0 | Gates A–D |
| D43 | Camada de segurança | P2 | Em breve |
| D44 | Estimular adoção | Processo | Ritual na tela Recomendações |

Zero item órfão.
