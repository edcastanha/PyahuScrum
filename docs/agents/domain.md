# Domain Docs — Pyahu Scrum

## Layout: Single Context

Este projeto usa **single-context**: uma fonte única de verdade para `CONTEXT.md` e ADRs em `docs/adr/`. Não há monorepo com múltiplos contextos.

## Consumer Rules

### Reading CONTEXT.md

- Este arquivo é a **fonte primária de contexto** para agentes externos ao repo.
- Mantenha-o atualizado após cada mudança significativa de arquitetura, stack ou escopo.
- Seções obrigatórias: Project Overview, Tech Stack, Architecture, Key Modules, Domain Glossary, Open Questions.

### Reading ADRs

- Local: `docs/adr/<NN>-<slug>.md`
- Cada ADR deve conter: Status, Data, Contexto, Decisão, Justificativa (numérica), Alternativas Consideradas (quando aplicável), Consequências (Positivas/Negativas/Riscos).
- Nomenclatura: `<NN>` numérico com zero-padding de 3 dígitos, `<slug>` kebab-case descritivo.
- Estado inicial válido: `Proposto`, `Aceito`, `Depreciado`.

### Updating

- Agentes do Pyahu Scrum devem ler todos os ADRs vigentes antes de gerar specs ou tickets na área afetada.
- Novo ADR requer justificativa clara de por que o padrão existente não se aplica.
- `docs/agents/domain.md` contém este documento. Atualizar quando houver mudanças no layout ou nas rules.
