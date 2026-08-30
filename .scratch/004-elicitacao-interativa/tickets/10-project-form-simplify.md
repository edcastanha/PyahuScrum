# E3-T10 — Simplificar ProjectForm: remover status e progresso
**Issue GitHub:** #27
**Spec:** specs/004-elicitacao-interativa/spec.md (CA-1)
**Blocked by:** Nenhum

## Escopo
- Remover `status` e `progress` da entidade `Project` e do `ProjectForm`
- `Project.id` muda para `string` (UUID)
- `projectService` gera UUID em vez de `Date.now()`
- Atualizar todos os consumidores da entidade
