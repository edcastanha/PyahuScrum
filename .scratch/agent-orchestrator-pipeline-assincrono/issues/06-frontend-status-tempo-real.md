# 06: Frontend: status em tempo real via wrapper de snapshot do Firestore

**What to build:** Depois de submeter um pedido, o usuário acompanha o status mudar ao vivo na tela, e ao concluir, vê o README, a(s) ADR(s) e os tickets gerados renderizados.

**Blocked by:** 04 (Processamento assíncrono), 05 (Frontend: criação real de pedido via API)

**Status:** done

- [x] Existe um wrapper isolado em volta do `onSnapshot()` do Firestore (ex: `subscribeToProjectStatus`) que o resto do frontend consome sem conhecer o SDK diretamente
- [x] A tela reflete as mudanças de status (`TRIAGEM_INICIAL` → `TRIAGEM_EM_ANDAMENTO` → `GERANDO_ADR` → concluído, ou `FALHA_PROCESSAMENTO`) em tempo real, sem recarregar a página
- [x] Ao concluir, o README, a(s) ADR(s) e os tickets gerados aparecem renderizados na tela (markdown de verdade, via react-markdown)
- [x] Em caso de `FALHA_PROCESSAMENTO`, a UI comunica visualmente a falha ao usuário (também cobre `FALHA_DLQ`, mesmo fora do texto original do checkbox)
- [x] Um teste de frontend cobre o wrapper de snapshot com uma implementação fake do SDK do Firestore injetada (via `jest.mock`, mesmo padrão já usado no resto do repo), sem subir emulador

## Nota de execução — Fatia 1 completa

Último ticket da Fatia 1 (ADR-005). Todos os 6 tickets concluídos: 01 (infra), 02 (credenciais, feito pelo usuário), 03 (recepção), 04 (processamento), 05 (criação real), 06 (status em tempo real). Verificado ponta a ponta com a stack completa: pedido criado via UI real chega ao backend, processa (ou falha por falta de credencial real do Vertex AI, esperado), e o resultado aparece de volta no frontend via Firestore em tempo real. Produção (pyahuscrum.adbfn6.easypanel.host) permaneceu estável durante toda a implementação.
