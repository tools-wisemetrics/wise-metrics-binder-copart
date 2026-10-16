# Glossário Copart Brasil — Dashboard v2

Fonte: Direcionamentos da reunião (D01–D21, D14). Este arquivo é a verdade de nomenclatura. A spec v1.0 fica subordinada a este glossário.

## Unidades de negócio

| ID interno | Label UI | O que é |
|---|---|---|
| `leilao_compra` | Leilão/Compra | Jornada do comprador no leilão Copart. |
| `select_venda` | Select/Venda | Captação de veículos para o estoque Copart Select. |
| `select_compra` | Select/Compra | Venda de veículos já no estoque Copart Select. |

As três unidades nunca compartilham o mesmo KPI de investimento. Comparativos explícitos devem rotular cada unidade.

## Funis

| Label UI | Unidade | Etapas canônicas |
|---|---|---|
| Funil Leilão | Leilão/Compra | Entrantes → Habilitados → Licitantes → Arrematantes |
| Funil Select | Select/Venda e Select/Compra | Dois funis irmãos, nunca misturados |

**Intenção** (GA4 `registration_start`) não é etapa do Funil Leilão. É métrica diagnóstica de site, se exibida.

## Etapas de negócio

| Termo | Definição |
|---|---|
| Entrante | Usuário que concluiu cadastro e entrou na base Copart. |
| Habilitado | Usuário apto a licitar (KYC/habilitação concluída). |
| Licitante | Usuário que deu pelo menos um lance no período. |
| Arrematante | Usuário que venceu um lote no período. |
| Veículos Captados | Veículos que aceitaram oferta e entraram no estoque Select/Venda. |
| Veículos Vendidos | Veículos do estoque Select/Compra efetivamente vendidos. |
| Contato Qualificado | Default provisório (D18): veículo dentro do perfil Select; fonte RD Station ou Blip. |

## Canais

| ID | Label UI | Owner de mídia |
|---|---|---|
| `META` | Meta Ads | Felipe |
| `GOOGLE` | Google Ads | Felipe |
| `TIKTOK` | TikTok Ads | Felipe |
| `ORGANIC` | Orgânico | — |
| `DIRECT` | Direto | — |
| `RD_STATION` | RD Station | — |
| `BLIP` | Blip (WhatsApp) | Felipe (confirmação D10) |

`WhatsApp Direct` e `CRM` (genérico) estão **proibidos** na UI. RD Station e Blip aparecem sempre separados.

## Atribuição

| Termo | Definição curta |
|---|---|
| Contribuição por etapa | Quantas conversões de cada etapa do funil a campanha ajudou a gerar no recorte. Métrica principal da tela. |
| Primeiro toque | Canal/campanha do primeiro touchpoint conhecido da jornada. |
| Último toque | Canal/campanha imediatamente anterior à conversão. |
| Linear | Crédito dividido igualmente entre os touchpoints. |
| Decaimento temporal | Crédito maior para toques mais próximos da conversão. |
| Atribuição confiável | Conversão com campanha e UTM válidos. |
| Atribuição questionável | UTM inválido, campanha nula ou dados incompletos. |

## Proibições de copy

Não usar na UI, constantes user-facing, tabelas ou filtros:

- Venda Direta, venda_direta, VD
- Trazer para Vender, Venha Comprar
- WhatsApp Direct
- Below target (usar Abaixo da meta)
- First Touch / Last Touch / Time Decay sem tradução + definição

## Origem dos dados (D35–D36)

| Valor | Quando usar |
|---|---|
| `mock_spec` | Integrações indisponíveis; mock no vocabulário desta spec. |
| `weekly_report` | Contingência: extrações reais (Meta, Google Ads, GA4, Copart). Header atual: Meta + GA4 ago/2026 · Copart set/2026. |

O header deve dizer a origem com honestidade. Não rotular mock como BigQuery live.
