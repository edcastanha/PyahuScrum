# 08: Reenfileiramento automático via cronjob/gatilho agendado

**What to build:** Pedidos que caíram na DLQ por motivo recuperável voltam sozinhos pra fila principal periodicamente, sem qualquer ação manual do cliente ou do time. Pedidos travados por falta de quota ficam de fora até a causa real ser resolvida.

**Blocked by:** 07 (Retry com classificação de falha + roteamento real pra DLQ)

**Status:** done

- [x] Um processo agendado, rodando em background dentro do próprio backend (mesmo padrão de thread de fundo já usado pelo consumidor), varre periodicamente os pedidos com status `FALHA_DLQ`
- [x] Só pedidos com `failure_reason` recuperável (erro transitório ou resposta inválida) são republicados na fila principal; `QUOTA_EXCEDIDA` nunca é reenfileirado automaticamente
- [x] Ao reenfileirar, o contador de tentativas é resetado e o status volta pra `TRIAGEM_INICIAL`
- [x] O intervalo de varredura é configurável (variável de ambiente), com um valor padrão razoável para a demo
- [x] O gatilho só roda no ambiente real (mesmo controle via variável de ambiente que já existe pro consumidor), não interfere nos testes automatizados
- [x] Teste de integração cobre o comportamento: pedido em `FALHA_DLQ` com motivo recuperável é reenfileirado pela varredura; pedido com `QUOTA_EXCEDIDA` não é

## Nota de execução — Fatia 2 completa

Último ticket da Fatia 2 (07, 08, 09 — todos concluídos). Ciclo completo verificado ao vivo: falha → classificação → DLQ real → varredura automática → reenfileiramento → reprocessamento. Bug real de ordering (update antes do publish, podendo perder pedido em caso de falha na publicação) encontrado pelo code review e corrigido antes do commit.
