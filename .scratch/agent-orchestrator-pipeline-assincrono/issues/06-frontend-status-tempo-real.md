# 06: Frontend: status em tempo real via wrapper de snapshot do Firestore

**What to build:** Depois de submeter um pedido, o usuário acompanha o status mudar ao vivo na tela, e ao concluir, vê o README, a(s) ADR(s) e os tickets gerados renderizados.

**Blocked by:** 04 (Processamento assíncrono), 05 (Frontend: criação real de pedido via API)

**Status:** ready-for-agent

- [ ] Existe um wrapper isolado em volta do `onSnapshot()` do Firestore (ex: `subscribeToProjectStatus`) que o resto do frontend consome sem conhecer o SDK diretamente
- [ ] A tela reflete as mudanças de status (`TRIAGEM_INICIAL` → `TRIAGEM_EM_ANDAMENTO` → `GERANDO_ADR` → concluído, ou `FALHA_PROCESSAMENTO`) em tempo real, sem recarregar a página
- [ ] Ao concluir, o README, a(s) ADR(s) e os tickets gerados aparecem renderizados na tela
- [ ] Em caso de `FALHA_PROCESSAMENTO`, a UI comunica visualmente a falha ao usuário
- [ ] Um teste de frontend cobre o wrapper de snapshot com uma implementação fake do SDK do Firestore injetada, sem subir emulador
