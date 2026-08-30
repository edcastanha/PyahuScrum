# E3-T11 — Backend: endpoint POST /projects/{id}/respostas + Rodada de Elicitação
**Issue GitHub:** #28
**Spec:** specs/004-elicitacao-interativa/spec.md (US-7, US-8, US-9)
**Blocked by:** T10 (#27)

## Escopo
- Novo endpoint `POST /projects/{id}/respostas`
- Salva rodada no Firestore subcoleção `elicitacao/{rodada}`
- Monta prompt com system-prompt + histórico + chama Gemini
- Novo status `ELICITANDO` no enum `ProjectStatus`
- Fluxo inicial (`POST /projects`) dispara Rodada 1
