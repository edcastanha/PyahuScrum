## Agent skills

### Issue tracker

Issues live as GitHub Issues in `edcastanha/PyahuScrum`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

---

## Branch strategy

Only two long-lived branches exist: **`main`** (production) and **`develop`** (homolog).

**No feature branches.** All implementation work uses **git worktrees**:

```bash
# Criar worktree para um ticket
git worktree add .worktrees/<slug> -b wt/<slug> origin/develop

# Trabalhar no worktree
cd .worktrees/<slug>
# ... implementar, commitar ...

# PR: sempre base develop
gh pr create --base develop --head wt/<slug>

# Após merge: remover worktree
git worktree remove .worktrees/<slug>
git branch -D wt/<slug>
```

**Regras:**
1. `main` só recebe merge de `develop` (nunca direto).
2. Toda branch `wt/*` é criada a partir de `origin/develop` e removida após merge.
3. Subagentes **não fecham PR nem movem ticket para Done** — aprovação humana obrigatória.
4. Após merge na develop, fazer rebuild do homolog:
   ```bash
   git checkout develop && git pull origin develop
   docker stop pyahuscrum-frontend-homolog && docker rm pyahuscrum-frontend-homolog
   docker compose -f infra/docker-compose.homolog.yml up -d --build
   ```

### Deploy

| Branch | Ambiente | URL | Compose |
|--------|----------|-----|---------|
| `main` | Produção | https://pyahuscrum.adbfn6.easypanel.host | `infra/docker-compose.prod.yml` |
| `develop` | Homolog | https://homolog.pyahuscrum.adbfn6.easypanel.host | `infra/docker-compose.homolog.yml` |

Ver `infra/DEPLOY.md` para instruções completas.
