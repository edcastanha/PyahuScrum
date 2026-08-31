# E3-T13 — Frontend: Cards de Elicitação no PipelineStatusModal
**Issue GitHub:** #30
**Spec:** specs/004-elicitacao-interativa/spec.md (US-2 a US-5, CA-2, CA-3, CA-6)
**Blocked by:** T11 (#28), T12 (#29)

## Escopo
- `PipelineStatusModal` detecta `ELICITANDO` via onSnapshot
- Novos componentes: `ElicitacaoRound`, `ElicitacaoCard`
- Single-select por opção + textarea opcional
- Botão "Enviar" desabilitado até todos os cards respondidos
- Botão "Gerar agora" a partir da rodada 2 ou `pronto: true`
- Botão "Baixar ZIP" no estado CONCLUIDO
