# 04: Processamento assíncrono: geração de artefatos via Vertex AI e status até concluído (ou FALHA_PROCESSAMENTO)

**What to build:** A mensagem enfileirada é processada em segundo plano: o Agent Orchestrator gera os artefatos (README, ADR, tickets) via Vertex AI seguindo as diretrizes de `.agents/system-prompt.md`, atualiza o status a cada etapa, e grava o resultado final (ou a falha) no Firestore.

**Blocked by:** 03 (Recepção do pedido). O ticket 02 (credenciais Vertex AI) só é necessário para a verificação manual com Gemini real — os testes automatizados sempre usam um fake.

**Status:** ready-for-agent

- [ ] O consumidor da fila atualiza o status para `TRIAGEM_EM_ANDAMENTO` ao iniciar o processamento
- [ ] O status `GERANDO_ADR` é gravado durante a geração das ADRs
- [ ] Ao concluir com sucesso, os artefatos (README, ADR(s), tickets) ficam gravados de forma estruturada no documento do Firestore, e o status muda para concluído
- [ ] Se qualquer etapa falhar (erro do Gemini, exceção não tratada), o status muda para `FALHA_PROCESSAMENTO`, sem mover a mensagem para a DLQ (isso é escopo de uma fatia futura)
- [ ] O cliente Vertex AI é injetado por dependência, permitindo substituição por um fake nos testes
- [ ] Testes de integração cobrem o cenário de sucesso e o de falha, com o Vertex AI sempre substituído por um fake — nenhum teste chama o Gemini de verdade
- [ ] Os artefatos gerados seguem as diretrizes de `.agents/system-prompt.md` (critérios de aceite testáveis, tipagem forte nos tickets)
