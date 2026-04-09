# Implementation Plan: Exibição de Perfil Autenticado no Sidebar

**Branch**: `002-sidebar-github-profile` | **Date**: 2026-04-08 | **Spec**: /home/edson/REPOS/PortifolioInterativo/specs/002-sidebar-github-profile/spec.md
**Input**: Feature specification from `/specs/002-sidebar-github-profile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implementar e estabilizar a projeção do perfil autenticado no sidebar usando dados da sessão e refresh a cada novo acesso autenticado, com fallback explícito para nome, avatar e localização. A abordagem técnica mantém o fluxo frontend-only existente, reforça validação de sessão/redirecionamento para login e adiciona contratos de apresentação/testabilidade para reduzir regressões visuais.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 4.9+ (React 18 frontend)  
**Primary Dependencies**: React, react-router-dom, Context API, fetch API, CSS Modules  
**Storage**: localStorage (sessão autenticada)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web (desktop e mobile responsivo)
**Project Type**: single-project web app frontend (DevPortfolio)  
**Performance Goals**: renderização do resumo de perfil sem bloqueio perceptível e refresh por acesso sem degradar navegação normal  
**Constraints**: frontend-only, sem backend dedicado nesta fase, dependência da API pública do GitHub e limites de rate limit  
**Scale/Scope**: ajuste focado no resumo de perfil do sidebar e fluxo de hidratação/refresh em rotas autenticadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Modularidade e Especificação Independente**: PASS. Escopo limitado ao módulo de navegação/sidebar com regras explícitas de sessão e fallback.
- **II. Critérios de Aceite e Testabilidade**: PASS. Critérios mensuráveis definidos na spec (SC-001..SC-005) e estratégia de testes por camada definida neste plano.
- **III. Documentação Viva e Rastreabilidade**: PASS. Artefatos da feature (`spec`, `plan`, `research`, `data-model`, `quickstart`, `contracts`) mantidos na pasta da feature.
- **IV. Design e Experiência do Usuário**: PASS. Ajustes visuais preservam legibilidade, fallback amigável e responsividade existente.
- **V. Evolução Guiada por Roadmap**: PASS. Mudança incremental alinhada ao roadmap frontend-only e sem ruptura de arquitetura.

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

docs/
├── prd/
└── adr/

specs/
└── 002-sidebar-github-profile/
```

**Structure Decision**: Manter arquitetura frontend única no diretório `DevPortfolio`, com mudanças concentradas em `components/sidebar`, `context/AuthContext`, `router/ProtectedRoute` e `services/auth`, preservando separação por domínio já existente.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
