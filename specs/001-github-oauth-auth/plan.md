# Implementation Plan: GitHub Users Login (Frontend-Only)

**Branch**: `001-feature-login-github` | **Date**: 2026-04-08 | **Spec**: `/home/edson/REPOS/PortifolioInterativo/specs/001-github-oauth-auth/spec.md`
**Input**: Feature specification from `/specs/001-github-oauth-auth/spec.md`

## Summary

Implementar login inicial com username GitHub na home, validando usuário via API pública `api.github.com/users`, persistindo sessão local no frontend e protegendo rotas internas. Escopo desta fase: somente `DevPortfolio`, sem backend.

## Technical Context

**Language/Version**: TypeScript 4.9+ (frontend)  
**Primary Dependencies**: React 18, react-router-dom, fetch API, React Testing Library/Jest  
**Storage**: localStorage (sessão local)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Navegadores modernos
**Project Type**: SPA frontend-only  
**Performance Goals**: Login concluído em < 3s em rede estável, logout < 500ms  
**Constraints**: Sem backend nesta fase; sem segredo de servidor; tratamento de rate-limit/erros de rede obrigatório  
**Scale/Scope**: Autenticação inicial por username GitHub e proteção de rotas no frontend

## Constitution Check

- **Princípio I - Modularidade**: PASS. Módulo Auth isolado no frontend.
- **Princípio II - Critérios de aceite/testabilidade**: PASS. Critérios mensuráveis e testáveis com testes de UI/integrados.
- **Princípio III - Documentação viva**: PASS. Spec/plan/tasks alinhados ao escopo frontend-only.
- **Princípio IV - Design e UX**: PASS. Home/login integrada ao visual existente.
- **Princípio V - Roadmap**: PASS. Fase atual prepara base para integração futura.

## Project Structure

### Documentation (this feature)

```text
specs/001-github-oauth-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── github-users.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
DevPortfolio/
├── src/
│   ├── pages/
│   │   └── auth/
│   │       ├── LoginPage.tsx
│   │       └── LoginPage.module.css
│   ├── services/
│   │   └── auth/
│   │       └── githubAuthService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── router/
│   │   └── ProtectedRoute.tsx
│   └── App.tsx
└── src/**/*.test.tsx
```

**Structure Decision**: Frontend-only em `DevPortfolio`, sem `backend/` nesta etapa.

## Complexity Tracking

Sem violações constitucionais.
