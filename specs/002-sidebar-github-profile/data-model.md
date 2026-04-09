# Data Model - Exibição de Perfil Autenticado no Sidebar

## Entity: AuthenticatedProfile

Descrição: representação dos dados do usuário autenticado usados para compor o resumo visual no sidebar.

Campos principais:
- `login` (string, obrigatório): identificador público da conta.
- `name` (string | null): nome do perfil para derivar primeiro nome.
- `avatar_url` (string | null): URL da imagem do avatar.
- `location` (string | null): localização textual do perfil.

Regras de validação:
- `login` deve existir para sessão válida.
- `name` e `location` aceitam `null` e exigem fallback na apresentação.
- `avatar_url` ausente ou inválido deve disparar fallback por iniciais.

## Entity: AuthSession

Descrição: estado persistido localmente para hidratação e controle de acesso.

Campos principais:
- `isAuthenticated` (boolean, obrigatório)
- `githubLogin` (string, obrigatório quando autenticado)
- `savedAt` (ISO datetime string, obrigatório)
- `profile` (AuthenticatedProfile, opcional)

Regras de transição de estado:
1. `Unauthenticated` -> `Authenticated`:
   - login bem-sucedido com perfil válido.
   - sessão persistida com `isAuthenticated=true`.
2. `Authenticated` -> `Authenticated(Refreshed)`:
   - novo acesso autenticado aciona refresh de perfil.
   - dados de perfil da sessão são atualizados.
3. `Authenticated` -> `Unauthenticated`:
   - logout explícito, sessão removida.
   - ausência/invalidade de sessão em rota protegida redireciona para login.

## Entity: SidebarProfileSummary

Descrição: projeção derivada para renderização no componente de sidebar.

Campos derivados:
- `displayName` (string): primeiro nome de `name`, ou `login`, ou "Usuário".
- `displayLocation` (string): `location` ou "Localização não informada".
- `avatarSource` (string | null): `avatar_url` quando disponível.
- `avatarFallback` (string): até 2 iniciais de `displayName`.

Relações:
- Derivado de `AuthSession.profile`.
- Usado pelo componente visual do sidebar e pelos testes de UI.