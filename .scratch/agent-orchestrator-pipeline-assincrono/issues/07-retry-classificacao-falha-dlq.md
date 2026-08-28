# 07: Retry com classificação de falha + roteamento real pra DLQ

**What to build:** Ao falhar o processamento, o Agent Orchestrator classifica o motivo (quota do Gemini, erro transitório, resposta inválida) e decide se vale tentar de novo. Erros de quota vão direto pra fila de erro (DLQ); erros recuperáveis tentam até um limite antes de também irem pra lá — sem nunca fingir sucesso nem perder a mensagem.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Falhas do Gemini são classificadas em pelo menos 3 categorias: quota/crédito excedido, erro transitório de serviço, resposta inválida/malformada
- [ ] O motivo da classificação é gravado no documento do Firestore (campo `failure_reason`), não só o status
- [ ] Falha por quota excedida vai direto pra DLQ, sem tentar de novo
- [ ] Falha transitória ou resposta inválida tenta novamente até um limite de 3 tentativas antes de ir pra DLQ
- [ ] Entre tentativas (ainda dentro do limite), o status gravado é `FALHA_PROCESSAMENTO`
- [ ] Esgotado o limite (ou quota excedida), a mensagem é rejeitada sem requeue (`nack`), o dead-letter-exchange já configurado (ticket 01) move pra `pyahu.pipeline.dlq` de verdade, e o status final é `FALHA_DLQ`
- [ ] Testes de integração cobrem os três tipos de classificação e os dois caminhos (retry até sucesso, retry até esgotar e cair na DLQ), sempre com o Vertex AI substituído por um fake
