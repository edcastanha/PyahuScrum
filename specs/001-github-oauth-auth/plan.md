# Implementation Plan: GitHub OAuth Authentication with Login Home

**Branch**: `001-feature-login-github` | **Date**: 2026-04-08 | **Spec**: `/home/edson/REPOS/PortifolioInterativo/specs/001-github-oauth-auth/spec.md`
**Input**: Feature specification from `/specs/001-github-oauth-auth/spec.md`

## Summary

Implementar autenticação GitHub OAuth2 com home como tela de login, persistindo usuários e sessões em MongoDB, protegendo rotas internas e mantendo UX consistente com o design system existente. A abordagem técnica será web app com frontend React/TypeScript já existente em `DevPortfolio` e novo backend Node.js/TypeScript para fluxo OAuth, sessão e integração com MongoDB.

## Technical Context

**Language/Version**: TypeScript 4.9+ (frontend) e TypeScript 5.x (backend Node 20 LTS)  
**Primary Dependencies**: React 18, react-router-dom, backend com Express, Mongoose, OAuth client HTTP (fetch/axios), jsonwebtoken, cookie-parser, dotenv, zod  
**Storage**: MongoDB (coleções `users` e `sessions`)  
**Testing**: Frontend com React Testing Library/Jest; backend com Vitest + Supertest + testes de contrato HTTP  
**Target Platform**: Navegadores modernos (frontend) + Linux container/server (backend API)
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Callback OAuth completo em < 3s (sem latência externa), validação de sessão < 150ms p95 no backend, logout < 500ms  
**Constraints**: Segredo OAuth somente no backend; tokens criptografados em repouso; rotas protegidas sem autenticação anônima; aderência à paleta/UX existente; tratamento de rate-limit GitHub  
**Scale/Scope**: Escopo inicial para autenticação e perfil GitHub do usuário logado; 1-5k usuários ativos/mês; sem suporte mobile nesta release

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Princípio I - Modularidade**: PASS. Feature isolada no módulo Auth (frontend + backend) com contratos explícitos.
- **Princípio II - Critérios de aceite e testabilidade**: PASS. Critérios do spec são mensuráveis e cobertos por testes unitários, integração e contrato.
- **Princípio III - Documentação viva e rastreabilidade**: PASS. Artefatos de plan/research/data-model/contracts/quickstart serão gerados em `specs/001-github-oauth-auth`.
- **Princípio IV - Design e UX**: PASS. Home/login seguirá linguagem visual atual (azul/verde/laranja, responsivo, feedback claro de erro).
- **Princípio V - Roadmap**: PASS. Feature encaixa nas fases atuais (autenticação como base para módulos subsequentes).

**Post-Design Re-check**: PASS. Data model, contratos e quickstart mantêm separação modular, rastreabilidade e critérios testáveis sem violação constitucional.

## Project Structure

### Documentation (this feature)

```text
specs/001-github-oauth-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── auth-api.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
DevPortfolio/
├── src/
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   └── dashboard/
│   ├── services/
│   │   └── auth/
│   ├── context/
│   │   └── AuthContext.tsx
│   └── router/
│       └── ProtectedRoute.tsx
└── tests/

backend/
├── src/
│   ├── api/
│   │   └── auth.routes.ts
│   ├── services/
│   │   ├── github-oauth.service.ts
│   │   └── session.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── session.model.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   └── app.ts
└── tests/
    ├── contract/
    ├── integration/
    └── unit/
```

**Structure Decision**: Adotado modelo web app com frontend existente em `DevPortfolio` e backend dedicado em `backend`, pois OAuth GitHub exige segredo no servidor e persistência segura no MongoDB.

## Complexity Tracking

Sem violações constitucionais que exijam justificativa adicional nesta fase.
