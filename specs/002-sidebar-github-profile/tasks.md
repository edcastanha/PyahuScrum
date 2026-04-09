# Tasks: Exibição de Perfil Autenticado no Sidebar

**Input**: Design documents from `/specs/002-sidebar-github-profile/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/sidebar-profile-summary.md`, `quickstart.md`

**Tests**: Incluir tarefas de teste automatizado para preservar testabilidade da feature e cobrir cenários críticos de fallback, refresh e redirecionamento.

**Organization**: Tasks agrupadas por user story para permitir implementação e validação independente.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar base técnica e de testes da feature.

- [ ] T001 Validar baseline do módulo de autenticação e sidebar em `DevPortfolio/src/context/AuthContext.tsx`
- [ ] T002 [P] Preparar utilitário de projeção de perfil em `DevPortfolio/src/services/auth/profileSummary.ts`
- [ ] T003 [P] Definir contrato tipado da projeção em `DevPortfolio/src/services/auth/profileSummary.types.ts`
- [ ] T004 Alinhar contrato de saída e cenários obrigatórios em `specs/002-sidebar-github-profile/contracts/sidebar-profile-summary.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Consolidar infraestrutura compartilhada de sessão, refresh e acesso protegido.

**⚠️ CRITICAL**: Nenhuma user story deve iniciar antes da conclusão desta fase.

- [ ] T005 Atualizar tipo de sessão e perfil com campos necessários em `DevPortfolio/src/services/auth/authStorage.ts`
- [ ] T006 Atualizar cliente GitHub para campos de perfil necessários em `DevPortfolio/src/services/auth/githubAuthService.ts`
- [ ] T007 Implementar fluxo de hidratação e refresh controlado por pathname/reload em `DevPortfolio/src/context/AuthContext.tsx`
- [ ] T008 Implementar regra de falha de refresh com logout e redirecionamento em `DevPortfolio/src/context/AuthContext.tsx`
- [ ] T009 Reforçar guarda de rota para sessão inválida em `DevPortfolio/src/router/ProtectedRoute.tsx`
- [ ] T010 [P] Atualizar testes base de autenticação e rota protegida em `DevPortfolio/src/context/AuthContext.test.tsx`
- [ ] T011 [P] Atualizar testes base de autenticação e rota protegida em `DevPortfolio/src/router/ProtectedRoute.test.tsx`

**Checkpoint**: Fundação pronta para implementação independente das user stories.

---

## Phase 3: User Story 1 - Exibir Nome e Avatar Reais no Sidebar (Priority: P1) 🎯 MVP

**Goal**: Exibir nome e avatar reais com fallback de identidade confiável.

**Independent Test**: Com sessão autenticada, o sidebar exibe primeiro nome e avatar; sem `name`, usa `login`; sem ambos, usa "Usuário".

### Tests for User Story 1

- [ ] T012 [P] [US1] Criar testes unitários da regra de nome e iniciais em `DevPortfolio/src/services/auth/profileSummary.test.ts`
- [ ] T013 [P] [US1] Criar teste de renderização do bloco de perfil no sidebar em `DevPortfolio/src/components/sidebar/Sidebar.test.tsx`

### Implementation for User Story 1

- [ ] T014 [US1] Implementar derivação de `displayName` e `avatarFallback` em `DevPortfolio/src/services/auth/profileSummary.ts`
- [ ] T015 [US1] Integrar projeção de perfil autenticado no componente em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [ ] T016 [US1] Implementar renderização de avatar em modo imagem/iniciais em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [ ] T017 [US1] Ajustar estilos de avatar e identidade visual em `DevPortfolio/src/components/sidebar/Sidebar.module.css`

**Checkpoint**: US1 funcional e testável de forma independente.

---

## Phase 4: User Story 2 - Exibir Localização do Perfil (Priority: P2)

**Goal**: Exibir localização do perfil com fallback amigável.

**Independent Test**: Com `location`, exibe valor real; sem `location`, exibe "Localização não informada".

### Tests for User Story 2

- [ ] T018 [P] [US2] Adicionar casos de fallback de localização em `DevPortfolio/src/services/auth/profileSummary.test.ts`
- [ ] T019 [P] [US2] Adicionar teste de subtítulo do sidebar com e sem localização em `DevPortfolio/src/components/sidebar/Sidebar.test.tsx`

### Implementation for User Story 2

- [ ] T020 [US2] Implementar derivação de `displayLocation` em `DevPortfolio/src/services/auth/profileSummary.ts`
- [ ] T021 [US2] Exibir subtítulo com fallback de localização em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [ ] T022 [US2] Ajustar truncamento e responsividade do subtítulo em `DevPortfolio/src/components/sidebar/Sidebar.module.css`

**Checkpoint**: US2 funcional e testável sem depender de US3.

---

## Phase 5: User Story 3 - Robustez Visual em Falhas de Dados (Priority: P3)

**Goal**: Garantir robustez em dados incompletos e em falha de refresh com encerramento seguro de sessão.

**Independent Test**: Em ausência de avatar/nome/location, layout permanece estável; em falha de refresh, sessão é encerrada e usuário redirecionado para login.

### Tests for User Story 3

- [ ] T023 [P] [US3] Adicionar casos de falha de refresh com logout em `DevPortfolio/src/context/AuthContext.test.tsx`
- [ ] T024 [P] [US3] Adicionar teste de redirecionamento pós-falha de refresh em `DevPortfolio/src/router/ProtectedRoute.test.tsx`

### Implementation for User Story 3

- [ ] T025 [US3] Implementar tratamento de erro de refresh com limpeza de sessão em `DevPortfolio/src/context/AuthContext.tsx`
- [ ] T026 [US3] Garantir redirecionamento imediato para login após sessão inválida em `DevPortfolio/src/router/ProtectedRoute.tsx`
- [ ] T027 [US3] Ajustar fallback visual defensivo para falha de imagem em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [ ] T028 [US3] Ajustar estilos para manter integridade visual em estados degradados em `DevPortfolio/src/components/sidebar/Sidebar.module.css`

**Checkpoint**: US3 funcional e validável de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consolidação final, documentação e validação completa.

- [ ] T029 [P] Atualizar decisões finais e rastreabilidade em `specs/002-sidebar-github-profile/research.md`
- [ ] T030 [P] Atualizar transições finais de estado em `specs/002-sidebar-github-profile/data-model.md`
- [ ] T031 [P] Atualizar roteiro e evidências de validação em `specs/002-sidebar-github-profile/quickstart.md`
- [ ] T032 Executar suíte automatizada do frontend em `DevPortfolio/package.json`
- [ ] T033 Executar validação manual dos cenários críticos de aceitação em `specs/002-sidebar-github-profile/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: inicia imediatamente.
- **Phase 2 (Foundational)**: depende da Phase 1 e bloqueia todas as user stories.
- **Phase 3-5 (User Stories)**: dependem da conclusão da Phase 2.
- **Phase 6 (Polish)**: depende da conclusão das user stories selecionadas.

### User Story Dependencies

- **US1 (P1)**: inicia após Foundational; não depende de US2/US3.
- **US2 (P2)**: inicia após Foundational; usa a mesma base de projeção do US1, mas deve ser testável isoladamente.
- **US3 (P3)**: inicia após Foundational; depende apenas da base de sessão/refresh e deve ser testável isoladamente.

### Within Each User Story

- Testes primeiro, falhando antes da implementação.
- Regras de domínio/utilitário antes da integração no componente.
- Ajustes de estilo após comportamento funcional implementado.

### Parallel Opportunities

- T002 e T003 podem rodar em paralelo.
- T010 e T011 podem rodar em paralelo.
- Em US1, T012 e T013 podem rodar em paralelo.
- Em US2, T018 e T019 podem rodar em paralelo.
- Em US3, T023 e T024 podem rodar em paralelo.
- Em polish, T029, T030 e T031 podem rodar em paralelo.

---

## Parallel Example: User Story 1

```bash
Task: "T012 [US1] Criar testes unitários da regra de nome e iniciais em DevPortfolio/src/services/auth/profileSummary.test.ts"
Task: "T013 [US1] Criar teste de renderização do bloco de perfil no sidebar em DevPortfolio/src/components/sidebar/Sidebar.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T018 [US2] Adicionar casos de fallback de localização em DevPortfolio/src/services/auth/profileSummary.test.ts"
Task: "T019 [US2] Adicionar teste de subtítulo do sidebar com e sem localização em DevPortfolio/src/components/sidebar/Sidebar.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T023 [US3] Adicionar casos de falha de refresh com logout em DevPortfolio/src/context/AuthContext.test.tsx"
Task: "T024 [US3] Adicionar teste de redirecionamento pós-falha de refresh em DevPortfolio/src/router/ProtectedRoute.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1 e Phase 2.
2. Entregar Phase 3 (US1).
3. Validar US1 isoladamente antes de avançar.

### Incremental Delivery

1. Base compartilhada (Setup + Foundational).
2. Entregar US1 e validar.
3. Entregar US2 e validar.
4. Entregar US3 e validar.
5. Finalizar com polish e evidências.

### Parallel Team Strategy

1. Time fecha Setup + Foundational.
2. Após base pronta:
   - Dev A: US1
   - Dev B: US2
   - Dev C: US3
3. Consolidar em Phase 6 com validação automatizada e manual.

---

## Notes

- Todas as tarefas seguem formato checklist obrigatório: `- [ ] Txxx [P?] [US?] Descrição com caminho`.
- Labels `[US1]`, `[US2]`, `[US3]` aparecem apenas nas fases de user story.
- Cada user story possui critério de teste independente.