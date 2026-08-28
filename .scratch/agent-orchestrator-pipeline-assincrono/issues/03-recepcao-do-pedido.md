# 03: Recepção do pedido: endpoint grava TRIAGEM_INICIAL e publica na fila

**What to build:** O Portfólio Interativo consegue submeter a ideia bruta de um projeto e receber confirmação imediata de que o pedido foi aceito, enquanto o Agent Orchestrator já registra o estado inicial e enfileira o processamento em segundo plano.

**Blocked by:** 01 (Infra local pronta)

**Status:** ready-for-agent

- [ ] Existe um endpoint HTTP que aceita a ideia bruta (texto) e responde imediatamente, sem esperar o processamento
- [ ] Ao receber o pedido, um documento é criado no Firestore emulado com status `TRIAGEM_INICIAL`
- [ ] Uma mensagem correspondente ao pedido é publicada na fila RabbitMQ
- [ ] Um teste de integração cobre o cenário: `POST` no endpoint → documento com `TRIAGEM_INICIAL` no Firestore emulado → mensagem presente na fila
- [ ] Nenhuma chamada ao Vertex AI acontece nesta etapa
