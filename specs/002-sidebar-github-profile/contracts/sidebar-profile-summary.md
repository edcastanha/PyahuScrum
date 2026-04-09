# Contract - Sidebar Profile Summary

## Purpose

Definir contrato de apresentação do resumo de perfil no sidebar para garantir consistência entre contexto de autenticação, componente visual e testes.

## Input Contract

Fonte: sessão autenticada hidratada no frontend.

Campos esperados:
- `isAuthenticated: boolean`
- `profile.login: string`
- `profile.name: string | null`
- `profile.avatar_url: string | null`
- `profile.location: string | null`

## Output Contract (UI)

O bloco de perfil do sidebar deve sempre produzir:
- `nameText: string`
  - regra: primeiro nome de `name` -> `login` -> "Usuário"
- `locationText: string`
  - regra: `location` -> "Localização não informada"
- `avatarMode: "image" | "initials"`
  - `image` quando `avatar_url` válido
  - `initials` quando avatar indisponível
- `avatarInitials: string`
  - até 2 caracteres derivados de `nameText`

## Access Contract

- Se `isAuthenticated=false` ou sessão inválida: redirecionar para login antes de renderizar conteúdo interno.

## Refresh Contract

- A cada novo acesso em rota interna autenticada, executar refresh dos dados de perfil para atualização do resumo.

## Test Contract

Casos obrigatórios:
1. Perfil completo renderiza nome/avatar/location corretos.
2. Sem `name` renderiza `login`; sem ambos renderiza "Usuário".
3. Sem `location` renderiza "Localização não informada".
4. Sem `avatar_url` renderiza iniciais.
5. Sem sessão/autenticação redireciona para login.