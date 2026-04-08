# Research - Frontend-Only GitHub Users Login

## Decision 1: Login inicial via GitHub Users API
- Decision: Validar usuário com `GET https://api.github.com/users/{username}` diretamente no frontend.
- Rationale: Atende requisito imediato sem backend.

## Decision 2: Sessão local
- Decision: Persistir sessão em localStorage com dados mínimos do perfil.
- Rationale: Mantém usuário autenticado entre refreshes sem infraestrutura adicional.

## Decision 3: Tratamento de erro focado em UX
- Decision: Mensagens específicas para 404, rate-limit e falha de rede.
- Rationale: Reduz fricção no login e aumenta clareza.

## Decision 4: Rotas protegidas no frontend
- Decision: Proteger dashboard e páginas internas via `ProtectedRoute`.
- Rationale: Controla navegação no escopo SPA.

## Limites desta fase
- Sem backend.
- Sem persistência MongoDB.
- Sem OAuth server-side com segredo.
