
# Portfólio Interativo Constitution


## Core Principles

### I. Modularidade e Especificação Independente
Cada funcionalidade principal (Dashboard, Documentação, User Stories, Showcase) deve ser especificada, implementada e testada como módulo independente. Especificações modulares facilitam evolução, manutenção e rastreabilidade.

### II. Critérios de Aceite e Testabilidade
Cada feature deve ter critérios de aceite claros, derivados do PRD e do plano de tarefas. Todo módulo precisa ser testável de forma independente, com exemplos de uso e cenários de teste automatizáveis.

### III. Documentação Viva e Rastreabilidade
As decisões arquiteturais (ADRs), requisitos (PRD) e plano de tarefas (plan) devem ser mantidos atualizados e versionados. Mudanças relevantes exigem atualização imediata dos docs correspondentes. Toda tarefa implementada deve ser rastreável até uma especificação e/ou ADR.

### IV. Design e Experiência do Usuário
O design deve seguir a paleta definida (azul escuro, verde tecnológico, laranja vibrante), tipografia moderna e layout minimalista. Responsividade e usabilidade são obrigatórias. Mudanças visuais relevantes devem ser documentadas.

### V. Evolução Guiada por Roadmap
O desenvolvimento deve seguir o roadmap (docs/plan), com fases e entregas incrementais. Mudanças de escopo, prioridades ou arquitetura exigem atualização do roadmap e ADRs.

## Requisitos e Restrições Técnicas

- Frontend: React + TypeScript (ADR-001)
- Componentização obrigatória
- Tipagem estática em todo o código
- Uso de bibliotecas modernas para estado, markdown e drag-and-drop
- Testes automatizados para cada módulo
- Documentação obrigatória para cada decisão relevante (ADRs)

## Workflow de Desenvolvimento e Qualidade

- Cada feature inicia com especificação detalhada (spec-kit)
- Critérios de aceite derivados do PRD e plano de tarefas
- Implementação em branches de feature
- Revisão obrigatória de código e docs
- Testes automatizados antes de merge
- Atualização contínua de docs/plan, docs/prd e docs/adr


## Governance

- Esta constituição tem precedência sobre outras práticas do projeto.
- Alterações exigem documentação, aprovação e plano de migração.
- Todo PR/review deve verificar aderência aos princípios e rastreabilidade.
- Versão e datas devem ser atualizadas a cada emenda.
- Use docs/adr e docs/prd como referência para decisões e requisitos.

**Version**: 1.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08
<!--
Sync Impact Report
- Versão inicial 1.0.0 criada
- Princípios definidos a partir do README, PRD, ADR-001 e plano de tarefas
- Seções templates atualizadas para refletir modularidade, rastreabilidade e workflow incremental
- Templates de spec-kit (plan, spec, tasks) permanecem compatíveis, mas recomenda-se reforçar critérios de aceite e rastreabilidade
- TODO: Revisar docs/adr e docs/plan a cada nova feature ou decisão relevante
-->
