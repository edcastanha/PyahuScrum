# Feature Specification: GitHub Users Login (Frontend-Only)

**Feature Branch**: `001-feature-login-github`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Integrar https://api.github.com/users/ com home como tela de login. Projeto frontend em DevPortfolio, sem backend nesta fase."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login Inicial por Usuário GitHub (Priority: P1)

O usuário abre a home, informa seu username do GitHub e entra no app após validação via `https://api.github.com/users/{username}`.

**Why this priority**: É o ponto de entrada obrigatório do produto nesta fase.

**Independent Test**: Inserir username válido e confirmar redirecionamento para dashboard com dados do perfil.

**Acceptance Scenarios**:

1. **Given** estou na home, **When** informo um username válido e envio, **Then** o sistema consulta a API do GitHub e autentica o usuário.
2. **Given** fui autenticado, **When** o perfil retorna com sucesso, **Then** sou redirecionado para o dashboard.
3. **Given** já tenho sessão local ativa, **When** abro a aplicação novamente, **Then** sou redirecionado direto ao dashboard.

---

### User Story 2 - Persistência de Sessão no Frontend (Priority: P1)

Após login, o app persiste sessão local e dados mínimos do usuário para manter experiência contínua.

**Why this priority**: Necessário para evitar novo login a cada reload.

**Independent Test**: Realizar login, recarregar página e validar sessão mantida.

**Acceptance Scenarios**:

1. **Given** login realizado, **When** a aplicação salva sessão local, **Then** dados mínimos do perfil ficam disponíveis após refresh.
2. **Given** sessão local existe, **When** o app inicia, **Then** o estado autenticado é restaurado.

---

### User Story 3 - Logout e Rotas Protegidas (Priority: P2)

Usuário pode sair da sessão e o app impede acesso a páginas privadas sem autenticação.

**Why this priority**: Garante controle de acesso no frontend.

**Independent Test**: Fazer logout e tentar acessar rota protegida por URL direta.

**Acceptance Scenarios**:

1. **Given** sessão ativa, **When** clico em logout, **Then** sessão local é removida e volto para login.
2. **Given** não estou autenticado, **When** tento abrir rota protegida, **Then** sou redirecionado para home/login.

---

### User Story 4 - Tratamento de Erros da API GitHub (Priority: P3)

A interface exibe mensagens claras para usuário inexistente, limite de requisição e falha de rede.

**Why this priority**: Melhora usabilidade e reduz abandono no login.

**Independent Test**: Testar username inválido e simular falha de rede.

**Acceptance Scenarios**:

1. **Given** username inexistente, **When** envio login, **Then** recebo mensagem "usuário não encontrado".
2. **Given** erro de rede/rate limit, **When** a consulta falha, **Then** recebo mensagem amigável e opção de tentar novamente.

---

### Edge Cases

- Username vazio ou com espaços inválidos.
- Username com caracteres especiais fora do padrão GitHub.
- API GitHub indisponível temporariamente.
- Rate limit excedido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST exibir a home como tela de login.
- **FR-002**: Sistema MUST autenticar usuário consultando `https://api.github.com/users/{username}`.
- **FR-003**: Sistema MUST considerar login válido apenas para resposta de perfil existente.
- **FR-004**: Sistema MUST armazenar sessão local e perfil mínimo no frontend.
- **FR-005**: Sistema MUST restaurar sessão local ao iniciar a aplicação.
- **FR-006**: Sistema MUST oferecer logout removendo sessão local.
- **FR-007**: Sistema MUST proteger rotas internas para usuários não autenticados.
- **FR-008**: Sistema MUST exibir feedback de erro para 404, rate limit e falhas de rede.

### Key Entities

- **GitHubProfile**: `login`, `id`, `avatar_url`, `name`, `bio`, `public_repos`, `followers`.
- **AuthSession**: `isAuthenticated`, `githubLogin`, `savedAt`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuário completa login em até 3 segundos em rede estável.
- **SC-002**: 95% dos logins com username válido concluem no primeiro envio.
- **SC-003**: Sessão local é restaurada corretamente após refresh em 100% dos casos válidos.
- **SC-004**: Logout remove sessão local em menos de 500ms.

## Assumptions

- Fase atual é frontend-only em `DevPortfolio`.
- Não haverá backend nem persistência MongoDB nesta entrega.
- Integração futura com backend/Mongo poderá substituir sessão local sem quebrar UX.
