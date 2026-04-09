# Tasks: Exibição de Perfil Autenticado no Sidebar

**Input**: Design documents from `/specs/002-sidebar-github-profile/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/sidebar-profile-summary.md`, `quickstart.md`

**Tests**: Não há criação de novos testes como requisito explícito da spec. A validação automatizada existente será executada na fase de polish.

**Organization**: Tasks agrupadas por user story para permitir implementação e validação independente.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar baseline da feature e utilitários de domínio para o resumo de perfil.

- [x] T001 Revisar e alinhar comentários de escopo da feature em `specs/002-sidebar-github-profile/spec.md`
- [x] T002 Criar utilitário de derivação do resumo de perfil em `DevPortfolio/src/services/auth/profileSummary.ts`
- [x] T003 [P] Definir tipagens do resumo de perfil em `DevPortfolio/src/services/auth/profileSummary.types.ts`
- [x] T004 [P] Documentar regras de mapeamento (name/location/avatar fallback) em `specs/002-sidebar-github-profile/contracts/sidebar-profile-summary.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Consolidar infraestrutura de sessão/autenticação que bloqueia todas as user stories.

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [x] T005 Ajustar contrato de perfil autenticado para suportar refresh por mudança de pathname/reload em `DevPortfolio/src/services/auth/authStorage.ts`
- [x] T006 Implementar serviço de refresh do perfil autenticado em `DevPortfolio/src/services/auth/githubAuthService.ts`
- [x] T007 Atualizar fluxo de hidratação e refresh por pathname/reload em `DevPortfolio/src/context/AuthContext.tsx`
- [x] T008 Garantir redirecionamento para login sem sessão/autenticação em `DevPortfolio/src/router/ProtectedRoute.tsx`
- [x] T009 [P] Atualizar documentação de fluxo de acesso e refresh (sem disparo em re-render interno) em `specs/002-sidebar-github-profile/quickstart.md`

**Checkpoint**: Base pronta para implementar US1, US2 e US3.

---

## Phase 3: User Story 1 - Exibir Nome e Avatar Reais no Sidebar (Priority: P1) 🎯 MVP

**Goal**: Exibir nome e avatar do usuário autenticado com fallback correto de identidade.

**Independent Test**: Com sessão autenticada, o sidebar exibe primeiro nome + avatar; sem `name`, exibe `login`; sem ambos, exibe "Usuário".

### Implementation for User Story 1

- [x] T010 [P] [US1] Integrar leitura de resumo de perfil no componente em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [x] T011 [US1] Aplicar regra de nome (primeiro nome -> login -> "Usuário") em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [x] T012 [US1] Aplicar regra de avatar (imagem ou iniciais) em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [x] T013 [US1] Ajustar estilos do avatar para modo imagem/iniciais em `DevPortfolio/src/components/sidebar/Sidebar.module.css`

**Checkpoint**: US1 funcional e validável isoladamente.

---

## Phase 4: User Story 2 - Exibir Localização do Perfil (Priority: P2)

**Goal**: Exibir localização real do perfil e fallback "Localização não informada".

**Independent Test**: Com `location`, sidebar exibe valor do perfil; sem `location`, mostra fallback definido.

### Implementation for User Story 2

- [x] T014 [P] [US2] Propagar `location` no modelo de perfil em `DevPortfolio/src/services/auth/authStorage.ts`
- [x] T015 [P] [US2] Propagar `location` na resposta de serviço em `DevPortfolio/src/services/auth/githubAuthService.ts`
- [x] T016 [US2] Exibir `location` com fallback fixo no sidebar em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [x] T017 [US2] Ajustar texto de subtítulo para variação de localização em `DevPortfolio/src/components/sidebar/Sidebar.module.css`

**Checkpoint**: US2 funcional e validável sem dependência de US3.

---

## Phase 5: User Story 3 - Robustez Visual em Falhas de Dados e Acesso (Priority: P3)

**Goal**: Manter robustez visual em dados parciais e garantir acesso seguro por sessão/autenticação.

**Independent Test**: Em dados incompletos, sidebar mantém layout íntegro; sem sessão válida, app redireciona para login antes de exibir rotas internas; re-render interno sem troca de rota não dispara refresh.

### Implementation for User Story 3

- [x] T018 [US3] Aplicar normalização defensiva para nome e iniciais em `DevPortfolio/src/components/sidebar/Sidebar.tsx`
- [x] T019 [US3] Ajustar fallback visual para avatar indisponível sem quebrar layout em `DevPortfolio/src/components/sidebar/Sidebar.module.css`
- [x] T020 [US3] Reforçar redirecionamento em sessão inválida no acesso interno em `DevPortfolio/src/router/ProtectedRoute.tsx`
- [x] T021 [US3] Garantir refresh do perfil em mudança de pathname protegido e reload, sem refresh em re-render interno, em `DevPortfolio/src/context/AuthContext.tsx`

**Checkpoint**: US3 funcional e validável isoladamente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validação final, documentação e consistência geral da feature.

- [x] T022 [P] Atualizar decisões e rastreabilidade da feature em `specs/002-sidebar-github-profile/research.md`
- [x] T023 [P] Atualizar modelo de dados final em `specs/002-sidebar-github-profile/data-model.md`
- [x] T024 Executar validação automatizada do frontend via Docker Compose conforme `specs/002-sidebar-github-profile/quickstart.md`
- [x] T025 Executar validação manual dos cenários de aceitação e registrar evidências em `specs/002-sidebar-github-profile/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): inicia imediatamente.
- Foundational (Phase 2): depende da conclusão do Setup e bloqueia user stories.
- User Stories (Phase 3 a 5): dependem da conclusão da fase Foundational.
- Polish (Phase 6): depende da conclusão das user stories desejadas.

### User Story Dependencies

- US1 (P1): começa após Foundational.
- US2 (P2): começa após Foundational; usa base de dados/tipos da fase foundational.
- US3 (P3): começa após Foundational; integra comportamento de US1/US2 mantendo testabilidade independente.

### Within Each User Story

- Ajustes de modelo/contrato antes de renderização final.
- Regras de fallback antes de ajustes de estilo fino.
- Validação de fluxo de acesso após integração de contexto/roteamento.

### Parallel Opportunities

- T003 e T004 podem rodar em paralelo.
- T009 pode rodar em paralelo com T005-T008.
- Em US1, T010 pode iniciar em paralelo e convergir em T011/T012.
- Em US2, T014 e T015 podem rodar em paralelo.
- Em Polish, T022 e T023 podem rodar em paralelo.

---

## Parallel Example: User Story 1

```bash
# Paralelizar preparação da US1
Task: "T010 [US1] Integrar leitura de resumo de perfil no componente em DevPortfolio/src/components/sidebar/Sidebar.tsx"
Task: "T013 [US1] Ajustar estilos do avatar para modo imagem/iniciais em DevPortfolio/src/components/sidebar/Sidebar.module.css"
```

## Parallel Example: User Story 2

```bash
# Paralelizar propagação de location
Task: "T014 [US2] Propagar location no modelo de perfil em DevPortfolio/src/services/auth/authStorage.ts"
Task: "T015 [US2] Propagar location na resposta de serviço em DevPortfolio/src/services/auth/githubAuthService.ts"
```

## Parallel Example: User Story 3

```bash
# Paralelizar robustez visual e acesso
Task: "T018 [US3] Aplicar normalização defensiva para nome e iniciais em DevPortfolio/src/components/sidebar/Sidebar.tsx"
Task: "T020 [US3] Reforçar redirecionamento em sessão inválida no acesso interno em DevPortfolio/src/router/ProtectedRoute.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Finalizar Setup + Foundational.
2. Entregar US1 (nome/avatar com fallback).
3. Validar US1 isoladamente como incremento de valor principal.

### Incremental Delivery

1. Entregar US1 (identidade visual principal no sidebar).
2. Entregar US2 (localização + fallback explícito).
3. Entregar US3 (robustez em falhas + controle de acesso por sessão).
4. Fechar com Polish e validação final.

### Parallel Team Strategy

1. Time fecha Setup e Foundational em conjunto.
2. Após base pronta:
   - Dev A: US1
   - Dev B: US2
   - Dev C: US3
3. Consolidar em Phase 6 com validação automatizada e manual.

---

## Notes

- Formato de tarefa segue padrão obrigatório: `- [ ] Txxx [P?] [US?] Descrição com caminho`.
- Tasks de Setup, Foundational e Polish não usam label de story.
- Cada user story mantém checkpoint de teste independente.
- Não há criação de novos testes como requisito explícito; validação usa suíte existente e cenários de aceitação.