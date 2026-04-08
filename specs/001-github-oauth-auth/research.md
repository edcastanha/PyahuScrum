# Research - GitHub OAuth Authentication with Login Home

## Decision 1: OAuth2 Authorization Code Flow no backend
- Decision: Implementar fluxo OAuth2 Authorization Code com troca de code por token no backend.
- Rationale: Evita exposição de client secret no frontend e permite controle de segurança, auditoria e retry centralizado.
- Alternatives considered:
  - Implicit Flow no frontend: rejeitado por riscos de segurança e limitação de controle.
  - GitHub App para autenticação básica: rejeitado para escopo atual por complexidade extra sem ganho imediato.

## Decision 2: Sessão com JWT curto + sessão persistida em MongoDB
- Decision: Emitir JWT de sessão curto (ex.: 24h) e persistir sessão ativa em coleção `sessions` para revogação e controle de logout.
- Rationale: Equilibra escalabilidade e controle de invalidação de sessão.
- Alternatives considered:
  - Sessão somente stateless JWT: rejeitado por dificultar revogação imediata.
  - Sessão server-side pura com store em memória: rejeitado por baixa resiliência horizontal.

## Decision 3: Armazenamento seguro de token GitHub
- Decision: Salvar access token do GitHub criptografado em repouso no MongoDB e nunca expor token cru ao frontend.
- Rationale: Reduz risco de vazamento e atende FR-012.
- Alternatives considered:
  - Salvar token em texto plano: rejeitado por não atender segurança mínima.
  - Não persistir token: rejeitado por quebrar chamadas autenticadas futuras e UX.

## Decision 4: Modelo de dados User upsert por githubId
- Decision: Upsert de usuário por `githubId` único, com atualização de dados de perfil e timestamps em cada login.
- Rationale: Evita duplicidade e simplifica re-login.
- Alternatives considered:
  - Chave por username: rejeitado por possibilidade de rename no GitHub.
  - Criar novo registro por login: rejeitado por inconsistência histórica.

## Decision 5: Estratégia de erro e rate limit
- Decision: Tratar falhas OAuth e API GitHub com mensagens amigáveis, logs estruturados e retry exponencial para falhas transitórias (não para 4xx permanentes).
- Rationale: Melhora confiabilidade sem mascarar erros de autorização.
- Alternatives considered:
  - Retry cego em todos os erros: rejeitado por piorar rate limit.
  - Sem retry: rejeitado por pior UX em falhas de rede temporárias.

## Decision 6: Home como login com rota protegida
- Decision: `/` será tela de login para não autenticado; rotas internas protegidas por `ProtectedRoute` e validação de sessão no backend.
- Rationale: Alinha com requisito do usuário e simplifica jornada inicial.
- Alternatives considered:
  - Home pública + login em rota separada: rejeitado por divergência de requisito.

## Decision 7: Contrato HTTP REST para autenticação
- Decision: Expor endpoints REST no backend (`/api/auth/github/start`, `/api/auth/github/callback`, `/api/auth/session`, `/api/auth/logout`).
- Rationale: Contratos claros, testáveis e compatíveis com frontend React atual.
- Alternatives considered:
  - GraphQL para auth: rejeitado por overhead desnecessário no escopo atual.

## Unknowns Resolution

Todos os itens de NEEDS CLARIFICATION foram resolvidos nesta pesquisa:
- Fluxo de autenticação: OAuth2 Authorization Code via backend.
- Persistência: MongoDB com coleções `users` e `sessions`.
- Sessão: JWT + estado persistido para revogação.
- Tratamento de erro/rate limit: retry seletivo + feedback de usuário.
- Escopo de home/login: home obrigatoriamente como login para não autenticado.
