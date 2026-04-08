# Tasks: GitHub Users Login (Frontend-Only)

**Input**: Design documents from `/specs/001-github-oauth-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup

- [ ] T001 Criar estrutura auth em DevPortfolio/src/services/auth e DevPortfolio/src/pages/auth
- [ ] T002 Criar serviço GitHub Users API em DevPortfolio/src/services/auth/githubAuthService.ts
- [ ] T003 [P] Criar chave de sessão e utilitários de storage em DevPortfolio/src/services/auth/authStorage.ts
- [ ] T004 [P] Criar estilo base de login em DevPortfolio/src/pages/auth/LoginPage.module.css
- [ ] T005 [P] Criar ambiente frontend de API base em DevPortfolio/.env.example

## Phase 2: Foundational

- [ ] T006 Implementar AuthContext em DevPortfolio/src/context/AuthContext.tsx
- [ ] T007 Implementar ProtectedRoute em DevPortfolio/src/router/ProtectedRoute.tsx
- [ ] T008 Implementar rota home/login em DevPortfolio/src/App.tsx
- [ ] T009 Implementar persistência/restauração de sessão local em DevPortfolio/src/services/auth/authStorage.ts
- [ ] T010 Implementar tratamento central de erro de autenticação em DevPortfolio/src/services/auth/authError.ts

## Phase 3: US1 - Login inicial por username GitHub (P1)

- [ ] T011 [P] [US1] Teste da página de login em DevPortfolio/src/pages/auth/LoginPage.test.tsx
- [ ] T012 [P] [US1] Teste do serviço githubAuthService em DevPortfolio/src/services/auth/githubAuthService.test.ts
- [ ] T013 [US1] Implementar LoginPage em DevPortfolio/src/pages/auth/LoginPage.tsx
- [ ] T014 [US1] Integrar chamada à API GitHub users no submit em DevPortfolio/src/pages/auth/LoginPage.tsx
- [ ] T015 [US1] Redirecionar para dashboard após login válido em DevPortfolio/src/App.tsx

## Phase 4: US2 - Sessão local (P1)

- [ ] T016 [P] [US2] Teste de persistência em DevPortfolio/src/services/auth/authStorage.test.ts
- [ ] T017 [US2] Persistir sessão local após login em DevPortfolio/src/context/AuthContext.tsx
- [ ] T018 [US2] Restaurar sessão no boot da aplicação em DevPortfolio/src/context/AuthContext.tsx
- [ ] T019 [US2] Expor perfil mínimo no contexto em DevPortfolio/src/context/AuthContext.tsx

## Phase 5: US3 - Logout e rotas protegidas (P2)

- [ ] T020 [P] [US3] Teste de ProtectedRoute em DevPortfolio/src/router/ProtectedRoute.test.tsx
- [ ] T021 [P] [US3] Teste de logout em DevPortfolio/src/context/AuthContext.test.tsx
- [ ] T022 [US3] Implementar logout limpando sessão local em DevPortfolio/src/context/AuthContext.tsx
- [ ] T023 [US3] Redirecionar não autenticado para home em DevPortfolio/src/router/ProtectedRoute.tsx

## Phase 6: US4 - Erros da API e retry (P3)

- [ ] T024 [P] [US4] Teste de erro 404/rate-limit em DevPortfolio/src/pages/auth/LoginPage.error.test.tsx
- [ ] T025 [US4] Exibir mensagem de usuário não encontrado em DevPortfolio/src/pages/auth/LoginPage.tsx
- [ ] T026 [US4] Exibir mensagem para falha de rede/rate-limit em DevPortfolio/src/pages/auth/LoginPage.tsx
- [ ] T027 [US4] Implementar ação de tentar novamente no fluxo de login em DevPortfolio/src/pages/auth/LoginPage.tsx

## Phase 7: Polish

- [ ] T028 [P] Ajustar quickstart frontend-only em specs/001-github-oauth-auth/quickstart.md
- [ ] T029 [P] Atualizar PRD com escopo frontend-only desta fase em docs/prd/PRD.md
- [ ] T030 Executar testes do frontend e corrigir regressões em DevPortfolio/src/

## Notes

- Escopo desta entrega: frontend-only, sem backend e sem MongoDB.
- Integração backend pode ser adicionada em feature futura sem quebrar UX atual.
