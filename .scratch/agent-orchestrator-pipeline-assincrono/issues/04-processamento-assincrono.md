# 04: Processamento assíncrono: geração de artefatos via Vertex AI e status até concluído (ou FALHA_PROCESSAMENTO)

**What to build:** A mensagem enfileirada é processada em segundo plano: o Agent Orchestrator gera os artefatos (README, ADR, tickets) via Vertex AI seguindo as diretrizes de `.agents/system-prompt.md`, atualiza o status a cada etapa, e grava o resultado final (ou a falha) no Firestore.

**Blocked by:** 03 (Recepção do pedido). O ticket 02 (credenciais Vertex AI) só é necessário para a verificação manual com Gemini real — os testes automatizados sempre usam um fake.

**Status:** done

- [x] O consumidor da fila atualiza o status para `TRIAGEM_EM_ANDAMENTO` ao iniciar o processamento
- [x] O status `GERANDO_ADR` é gravado durante a geração das ADRs
- [x] Ao concluir com sucesso, os artefatos (README, ADR(s), tickets) ficam gravados de forma estruturada no documento do Firestore, e o status muda para concluído
- [x] Se qualquer etapa falhar (erro do Gemini, exceção não tratada), o status muda para `FALHA_PROCESSAMENTO`, sem mover a mensagem para a DLQ (isso é escopo de uma fatia futura)
- [x] O cliente Vertex AI é injetado por dependência, permitindo substituição por um fake nos testes
- [x] Testes de integração cobrem o cenário de sucesso e o de falha, com o Vertex AI sempre substituído por um fake — nenhum teste chama o Gemini de verdade
- [x] Os artefatos gerados seguem as diretrizes de `.agents/system-prompt.md` (critérios de aceite testáveis, tipagem forte nos tickets)

## Nota de execução

Verificado com fake nos testes automatizados (ponta a ponta via HTTP + Firestore emulado + fila real) e, adicionalmente, com um smoke-test manual da stack completa contra o Vertex AI real — que falhou por falta de credencial (esperado, ticket 02 pendente) e confirmou o caminho de falha (`FALHA_PROCESSAMENTO`, ack sem DLQ) funcionando de ponta a ponta no processo real, não só no teste.
