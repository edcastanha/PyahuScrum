# E3-T12 — Backend: generate_artifacts() + GET /projects/{id}/download (ZIP)
**Issue GitHub:** #29
**Spec:** specs/004-elicitacao-interativa/spec.md (US-10, CA-5)
**Blocked by:** T11 (#28)

## Escopo
- `generate_artifacts()` recebe histórico completo da Sessão de Elicitação
- Prompt gera spec.md, prd.md, adrs[], tickets[]
- Novo endpoint `GET /projects/{id}/download` — retorna ZIP com estrutura canônica
- Slug derivado do nome do projeto
