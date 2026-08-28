# Issue Tracker Configuration — Pyahu Scrum

## Type: GitHub

- **Remote:** Configurar via `git remote -v`
- **CLI:** `gh` (GitHub CLI)
- **Issues:** Publicados via `gh issue create`
- **PRs como surface:** Flag desativado (padrão)

## Triage Labels

- `needs-triage`: entrada sem classificação
- `needs-info`: mais informação necessária
- `ready-for-agent`: ticket pronto para execução autônoma
- `ready-for-human`: requer intervenção humana
- `wontfix`: decisão de não implementação

## Templates de Tickets

Os templates seguem o modelo definido pela skill `to-tickets`:

- Um ticket por arquivo sob `.scratch/<feature-slug>/issues/<NN>-<slug>.md` quando offline
- Via `gh issue create` com labels + dependências textuais para GitHub Issues
