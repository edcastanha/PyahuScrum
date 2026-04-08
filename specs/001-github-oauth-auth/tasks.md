# Tasks: GitHub OAuth Authentication with Login Home

**Input**: Design documents from `/specs/001-github-oauth-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Testes automatizados incluídos para aderência à constituição do projeto (testabilidade por módulo).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialização de estrutura de backend e configuração comum do módulo de autenticação.

- [ ] T001 Criar estrutura inicial do backend em backend/src/ e backend/tests/ com package.json e tsconfig em backend/package.json e backend/tsconfig.json
- [ ] T002 Instalar dependências do backend para OAuth e MongoDB em backend/package.json
- [ ] T003 [P] Configurar scripts de desenvolvimento e testes em backend/package.json
- [ ] T004 [P] Criar arquivos de ambiente de exemplo em backend/.env.example e DevPortfolio/.env.example
- [ ] T005 [P] Criar pasta de estilos da tela de login em DevPortfolio/src/pages/auth/LoginPage.module.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestrutura base que bloqueia qualquer user story até ficar pronta.

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [ ] T006 Implementar bootstrap do servidor Express em backend/src/app.ts e backend/src/server.ts
- [ ] T007 [P] Implementar carregamento e validação de variáveis de ambiente com zod em backend/src/config/env.ts
- [ ] T008 [P] Implementar conexão MongoDB com Mongoose em backend/src/config/mongo.ts
- [ ] T009 [P] Implementar utilitários de criptografia para token GitHub em backend/src/lib/crypto.ts
- [ ] T010 [P] Implementar utilitários JWT de sessão em backend/src/lib/jwt.ts
- [ ] T011 Implementar middleware de autenticação de sessão em backend/src/middleware/auth.middleware.ts
- [ ] T012 [P] Implementar cliente HTTP GitHub com timeout e tratamento base em backend/src/lib/github-client.ts
- [ ] T013 [P] Configurar base de testes backend com Vitest/Supertest em backend/vitest.config.ts e backend/tests/setup.ts
- [ ] T014 Criar serviço frontend de API auth base em DevPortfolio/src/services/auth/authApi.ts
- [ ] T015 Implementar contexto de autenticação frontend em DevPortfolio/src/context/AuthContext.tsx
- [ ] T016 Implementar guarda de rotas protegidas em DevPortfolio/src/router/ProtectedRoute.tsx

**Checkpoint**: Foundation pronta para iniciar stories.

---

## Phase 3: User Story 1 - Developer Login with GitHub (Priority: P1) 🎯 MVP

**Goal**: Login na home via OAuth GitHub e redirecionamento para dashboard com perfil carregado.

**Independent Test**: Abrir `/`, autenticar com GitHub e validar redirecionamento autenticado ao dashboard.

### Tests for User Story 1

- [ ] T017 [P] [US1] Criar teste de contrato para GET /api/auth/github/start em backend/tests/contract/auth-start.contract.test.ts
- [ ] T018 [P] [US1] Criar teste de contrato para GET /api/auth/github/callback em backend/tests/contract/auth-callback.contract.test.ts
- [ ] T019 [P] [US1] Criar teste de integração do fluxo callback OAuth em backend/tests/integration/auth-callback.integration.test.ts
- [ ] T020 [P] [US1] Criar teste de UI da home/login em DevPortfolio/src/pages/auth/LoginPage.test.tsx

### Implementation for User Story 1

- [ ] T021 [US1] Implementar serviço OAuth GitHub (authorize URL, code exchange, fetch profile) em backend/src/services/github-oauth.service.ts
- [ ] T022 [US1] Implementar rotas de início e callback OAuth em backend/src/api/auth.routes.ts
- [ ] T023 [US1] Registrar rotas de auth no app backend em backend/src/app.ts
- [ ] T024 [US1] Implementar página de login como home em DevPortfolio/src/pages/auth/LoginPage.tsx
- [ ] T025 [US1] Atualizar roteamento para usar LoginPage em `/` e dashboard protegido em DevPortfolio/src/App.tsx
- [ ] T026 [US1] Implementar ação de iniciar login GitHub no frontend em DevPortfolio/src/services/auth/authService.ts

**Checkpoint**: US1 funcional e testável de forma independente.

---

## Phase 4: User Story 2 - User Data Persistence in MongoDB (Priority: P1)

**Goal**: Persistir e atualizar usuário/sessão no MongoDB em cada login.

**Independent Test**: Fazer login duas vezes com a mesma conta GitHub e validar upsert de usuário e atualização de sessão.

### Tests for User Story 2

- [ ] T027 [P] [US2] Criar teste unitário do model User (validações e índice único) em backend/tests/unit/user.model.test.ts
- [ ] T028 [P] [US2] Criar teste unitário do model Session (TTL e revogação) em backend/tests/unit/session.model.test.ts
- [ ] T029 [P] [US2] Criar teste de integração de upsert por githubId em backend/tests/integration/user-upsert.integration.test.ts

### Implementation for User Story 2

- [ ] T030 [P] [US2] Implementar model User em backend/src/models/user.model.ts
- [ ] T031 [P] [US2] Implementar model Session em backend/src/models/session.model.ts
- [ ] T032 [P] [US2] Implementar model OAuthAuditEvent em backend/src/models/oauth-audit-event.model.ts
- [ ] T033 [US2] Implementar serviço de persistência e upsert de usuário em backend/src/services/user-persistence.service.ts
- [ ] T034 [US2] Integrar persistência no callback OAuth em backend/src/services/github-oauth.service.ts
- [ ] T035 [US2] Implementar endpoint de leitura de sessão atual em backend/src/api/auth.routes.ts
- [ ] T036 [US2] Integrar carregamento de sessão no AuthContext em DevPortfolio/src/context/AuthContext.tsx

**Checkpoint**: US1 e US2 funcionais e testáveis independentemente.

---

## Phase 5: User Story 3 - Session Management and Logout (Priority: P2)

**Goal**: Gerenciar sessão ativa, validação de token e logout com revogação.

**Independent Test**: Login, navegação em rota protegida, logout e bloqueio de acesso pós-logout.

### Tests for User Story 3

- [ ] T037 [P] [US3] Criar teste de contrato para GET /api/auth/session em backend/tests/contract/auth-session.contract.test.ts
- [ ] T038 [P] [US3] Criar teste de contrato para POST /api/auth/logout em backend/tests/contract/auth-logout.contract.test.ts
- [ ] T039 [P] [US3] Criar teste de integração de revogação de sessão no logout em backend/tests/integration/logout.integration.test.ts
- [ ] T040 [P] [US3] Criar teste frontend de bloqueio em rota protegida após logout em DevPortfolio/src/router/ProtectedRoute.test.tsx

### Implementation for User Story 3

- [ ] T041 [US3] Implementar serviço de sessão (criação, validação, revogação) em backend/src/services/session.service.ts
- [ ] T042 [US3] Implementar endpoint de logout com revogação em backend/src/api/auth.routes.ts
- [ ] T043 [US3] Integrar middleware de sessão nas rotas protegidas backend em backend/src/app.ts
- [ ] T044 [US3] Implementar ação de logout no frontend em DevPortfolio/src/services/auth/authService.ts
- [ ] T045 [US3] Adicionar controle de estado de sessão expirada no AuthContext em DevPortfolio/src/context/AuthContext.tsx

**Checkpoint**: US3 funcional e testável independentemente.

---

## Phase 6: User Story 4 - Error Handling and Retry (Priority: P3)

**Goal**: Tratar erros OAuth/API com feedback claro e retry para falhas transitórias.

**Independent Test**: Simular falha de rede/rate-limit e validar mensagens de erro e retry controlado.

### Tests for User Story 4

- [ ] T046 [P] [US4] Criar teste unitário de política de retry exponencial em backend/tests/unit/retry-policy.test.ts
- [ ] T047 [P] [US4] Criar teste de integração para falha transitória da API GitHub em backend/tests/integration/github-retry.integration.test.ts
- [ ] T048 [P] [US4] Criar teste frontend de feedback de erro na tela de login em DevPortfolio/src/pages/auth/LoginPage.error.test.tsx

### Implementation for User Story 4

- [ ] T049 [US4] Implementar política de retry e classificação de erro GitHub em backend/src/lib/retry-policy.ts
- [ ] T050 [US4] Integrar retry policy no cliente GitHub em backend/src/lib/github-client.ts
- [ ] T051 [US4] Implementar padronização de erros de auth no backend em backend/src/api/auth-error.mapper.ts
- [ ] T052 [US4] Implementar feedback de erro amigável e ação de retry na login page em DevPortfolio/src/pages/auth/LoginPage.tsx
- [ ] T053 [US4] Registrar eventos de falha de autenticação em backend/src/services/oauth-audit.service.ts

**Checkpoint**: Todas as user stories funcionais e testáveis de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Acabamento final, documentação e validações transversais.

- [ ] T054 [P] Atualizar quickstart com comandos e validações finais em specs/001-github-oauth-auth/quickstart.md
- [ ] T055 [P] Atualizar documentação de requisitos e rastreabilidade em docs/prd/PRD.md
- [ ] T056 [P] Registrar decisão arquitetural de autenticação GitHub em docs/adr/002-github-oauth-auth.md
- [ ] T057 Executar suíte de testes frontend e backend e corrigir regressões em DevPortfolio/src/ e backend/src/
- [ ] T058 Validar fluxo fim-a-fim manual conforme quickstart em specs/001-github-oauth-auth/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependências
- **Phase 2 (Foundational)**: depende de Phase 1 e bloqueia todas as user stories
- **Phase 3-6 (User Stories)**: dependem da conclusão de Phase 2
- **Phase 7 (Polish)**: depende da conclusão das user stories planejadas

### User Story Dependencies

- **US1 (P1)**: inicia após Foundational, entrega o MVP de autenticação
- **US2 (P1)**: depende da base de US1 para persistência completa, mas mantém teste independente
- **US3 (P2)**: depende da criação de sessão em US2
- **US4 (P3)**: depende de US1-US3 para cobrir erros no fluxo completo

### Within Each User Story

- Testes devem ser escritos antes da implementação principal
- Models antes de services
- Services antes de rotas/UI de integração
- Finalizar checkpoint da história antes de avançar

### Parallel Opportunities

- T003, T004, T005 podem rodar em paralelo na Phase 1
- T007, T008, T009, T010, T012, T013 podem rodar em paralelo na Phase 2
- Em cada US, tarefas marcadas com [P] podem ser executadas em paralelo

---

## Parallel Example: User Story 1

```bash
# Testes paralelos US1
T017 backend/tests/contract/auth-start.contract.test.ts
T018 backend/tests/contract/auth-callback.contract.test.ts
T019 backend/tests/integration/auth-callback.integration.test.ts
T020 DevPortfolio/src/pages/auth/LoginPage.test.tsx

# Implementação paralela inicial US1
T021 backend/src/services/github-oauth.service.ts
T024 DevPortfolio/src/pages/auth/LoginPage.tsx
T026 DevPortfolio/src/services/auth/authService.ts
```

## Parallel Example: User Story 2

```bash
# Models em paralelo
T030 backend/src/models/user.model.ts
T031 backend/src/models/session.model.ts
T032 backend/src/models/oauth-audit-event.model.ts
```

## Parallel Example: User Story 3

```bash
# Testes paralelos US3
T037 backend/tests/contract/auth-session.contract.test.ts
T038 backend/tests/contract/auth-logout.contract.test.ts
T039 backend/tests/integration/logout.integration.test.ts
T040 DevPortfolio/src/router/ProtectedRoute.test.tsx
```

## Parallel Example: User Story 4

```bash
# Testes paralelos US4
T046 backend/tests/unit/retry-policy.test.ts
T047 backend/tests/integration/github-retry.integration.test.ts
T048 DevPortfolio/src/pages/auth/LoginPage.error.test.tsx
```

---

## Implementation Strategy

### MVP First (US1)

1. Concluir Phase 1 e Phase 2.
2. Entregar Phase 3 (US1) completa.
3. Validar fluxo real de login GitHub na home.
4. Demonstrar MVP autenticado.

### Incremental Delivery

1. US1: login OAuth funcional.
2. US2: persistência MongoDB robusta.
3. US3: sessão e logout seguros.
4. US4: resiliência de erro e retry.
5. Polish: documentação, ADR e validação final.

### Parallel Team Strategy

1. Time completo em Setup + Foundational.
2. Após Foundation:
   - Dev A: backend auth core (US1/US2)
   - Dev B: frontend auth/route guard (US1/US3)
   - Dev C: testes e resiliência (US3/US4)

---

## Notes

- [P] indica tarefas sem conflito de arquivo e sem dependência direta incompleta.
- Labels [US1]-[US4] garantem rastreabilidade com a especificação.
- Cada user story possui critério de teste independente.
- Commits recomendados por grupo lógico de tarefas.
