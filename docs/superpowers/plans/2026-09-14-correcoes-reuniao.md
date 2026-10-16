# Correções da Reunião Copart — Plano executável

> Spec: `docs/specs/SPEC-dashboard-v2.md`  
> Glossário: `docs/specs/GLOSSARIO.md`  
> Aceitação: `docs/specs/ACCEPTANCE.md`

**Goal:** Alinhar o dashboard ao vocabulário e aos 44 direcionamentos da reunião, com Gates A–E.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Chart.js, Vitest.

## Global Constraints

- Labels canônicos: Leilão/Compra, Select/Venda, Select/Compra.
- Funil Leilão: 4 etapas. Sem Intenção. Sem Venda Direta.
- Filtros na URL. DataService honra filters.
- Totais calculados, nunca hardcoded.
- P2 marcado Em breve.
- Sem commit até o usuário pedir.
