# Implementation Plan: Exibição de Perfil Autenticado no Sidebar

**Branch**: `002-sidebar-github-profile` | **Date**: 2026-04-08 | **Spec**: /home/edson/REPOS/PortifolioInterativo/specs/002-sidebar-github-profile/spec.md
**Input**: Feature specification from `/specs/002-sidebar-github-profile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar a projeção de perfil autenticado no sidebar com regras claras de fallback para nome, localização e avatar, além de refresh de perfil em entrada de rota protegida (mudança de pathname) e reload. O plano mantém escopo frontend-only em DevPortfolio, preserva fluxo de sessão local e reforça redirecionamento para login em ausência de sessão válida.

## Technical Context

**Language/Version**: TypeScript 4.9+ (React 18 frontend)  
**Primary Dependencies**: React, react-router-dom, Context API, fetch API, CSS Modules  
**Storage**: localStorage (sessão autenticada)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web (desktop e mobile responsivo)
**Project Type**: single-project web app frontend (DevPortfolio)  
**Performance Goals**: manter navegação fluida com refresh por pathname/reload sem chamadas redundantes em re-renderizações internas  
**Constraints**: frontend-only, sem backend dedicado nesta fase, dependência da API pública do GitHub e rate limit público  
**Scale/Scope**: mudanças concentradas em sidebar, contexto de auth, roteamento protegido e serviços de auth

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I. Modularidade e Especificação Independente: PASS. Escopo limitado ao módulo de sidebar e auth/session.
- II. Critérios de Aceite e Testabilidade: PASS. Critérios e cenários definidos na spec com cobertura para fallback e redirecionamento.
- III. Documentação Viva e Rastreabilidade: PASS. Artefatos da feature em specs/002-sidebar-github-profile e rastreio com FR/SC.
- IV. Design e Experiência do Usuário: PASS. Regras de fallback preservam clareza visual e consistência responsiva.
- V. Evolução Guiada por Roadmap: PASS. Entrega incremental sem introdução de backend fora de escopo.

**Gate Result (pre-research)**: PASS

**Gate Result (post-design)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
DevPortfolio/
├── src/
│   ├── components/
│   │   └── sidebar/
│   ├── context/
│   ├── router/
│   └── services/
│       └── auth/
└── (tests co-localizados em *.test.ts[x])

specs/
└── 002-sidebar-github-profile/
```

**Structure Decision**: manter arquitetura frontend única no diretório DevPortfolio, com alterações restritas a sidebar e serviços/contexto de autenticação.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
