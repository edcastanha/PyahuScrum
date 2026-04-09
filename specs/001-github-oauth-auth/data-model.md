# Data Model - Frontend-Only Login

## Entity: GitHubProfile

- login: string
- id: number
- avatar_url: string
- name: string | null
- bio: string | null
- public_repos: number
- followers: number

## Entity: AuthSession

- isAuthenticated: boolean
- githubLogin: string
- savedAt: string (ISO date)

## Storage Model

- Key: `devportfolio.auth.session`
- Value: JSON serializado de `AuthSession` + `GitHubProfile` mínimo

## Validation Rules

- `githubLogin` obrigatório para sessão autenticada.
- Sessão inválida deve ser descartada no boot.
