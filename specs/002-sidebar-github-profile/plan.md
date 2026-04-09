# Implementation Plan: Exibicao de Perfil Autenticado no Sidebar

**Branch**: `002-sidebar-github-profile` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-sidebar-github-profile/spec.md`

## Summary

Implementar o resumo de perfil autenticado no sidebar com dados da conta GitHub, incluindo regras de fallback para nome, localizacao e avatar, refresh controlado por entrada em rota protegida (pathname/reload) e encerramento de sessao com redirecionamento para login quando o refresh falhar.

## Technical Context

**Language/Version**: TypeScript 4.9+ (React 18 frontend)  
**Primary Dependencies**: React, react-router-dom, Context API, fetch API, CSS Modules  
**Storage**: localStorage (sessao autenticada)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web SPA (desktop e mobile responsivo)
**Project Type**: Frontend web application  
**Performance Goals**: render do resumo sem regressao visual; evitar refresh redundante em re-render interno  
**Constraints**: frontend-only nesta fase; sem backend dedicado; manter layout existente do sidebar  
**Scale/Scope**: feature focada em Sidebar + AuthContext + ProtectedRoute + servicos de auth

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Gate I - Modularidade e Especificacao Independente: PASS (escopo isolado em modulo de autenticacao/sidebar)
- Gate II - Criterios de Aceite e Testabilidade: PASS (FRs claros e contratos testaveis; testes automatizados definidos)
- Gate III - Documentacao Viva e Rastreabilidade: PASS (spec, research, data-model, contracts e quickstart versionados)
- Gate IV - Design e Experiencia do Usuario: PASS (fallbacks preservam legibilidade e estabilidade visual)
- Gate V - Evolucao Guiada por Roadmap: PASS (alinhado ao fluxo incremental atual da feature)

## Project Structure

### Documentation (this feature)

```text
specs/002-sidebar-github-profile/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sidebar-profile-summary.md
└── tasks.md
```

### Source Code (repository root)

```text
DevPortfolio/
├── src/
│   ├── components/
│   │   └── sidebar/
│   ├── context/
│   ├── pages/
│   │   └── auth/
│   ├── router/
│   ├── services/
│   │   └── auth/
│   └── tests (arquivos *.test.tsx e *.test.ts no proprio src)
└── package.json
```

**Structure Decision**: manter arquitetura frontend existente em `DevPortfolio/src`, com mudancas pontuais nos modulos de autenticacao, roteamento e componente de sidebar.

## Phase 0: Research Output

Arquivo: [research.md](./research.md)

Resumo:
- Regras de fallback validadas para nome, localizacao e avatar.
- Estrategia de refresh definida apenas em pathname/reload.
- Decisao de frontend-only mantida.
- Tratamento de falha de refresh definido para encerrar sessao e redirecionar login (FR-012).

## Phase 1: Design Output

Arquivos:
- [data-model.md](./data-model.md)
- [contracts/sidebar-profile-summary.md](./contracts/sidebar-profile-summary.md)
- [quickstart.md](./quickstart.md)

Resumo:
- Modelo de dados cobre `AuthenticatedProfile`, `AuthSession` e `SidebarProfileSummary`.
- Contrato de UI, acesso e refresh formalizados.
- Quickstart inclui validacao automatizada e manual.

## Post-Design Constitution Check

- Gate I - Modularidade e Especificacao Independente: PASS
- Gate II - Criterios de Aceite e Testabilidade: PASS
- Gate III - Documentacao Viva e Rastreabilidade: PASS
- Gate IV - Design e Experiencia do Usuario: PASS
- Gate V - Evolucao Guiada por Roadmap: PASS

## Complexity Tracking

> Nao ha violacoes de constituicao que exijam justificativa.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
