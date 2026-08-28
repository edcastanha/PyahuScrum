# Agent Orchestrator (backend)

Worker FastAPI do Pyahu Scrum. Ver [ADR-004](../docs/adr/004-arquitetura-orientada-a-eventos-google-cloud.md) e [ADR-005](../docs/adr/005-stack-local-mvp-3-dias.md) para o desenho da arquitetura, e [CONTEXT.md](../CONTEXT.md) para o glossário de domínio.

## Rodando localmente

```bash
cd infra
docker compose up -d
```

Sobe frontend, backend, RabbitMQ e o emulador do Firestore. O backend expõe `/health` (porta `8001` no host) e `/projects` (`POST`).

## Rodando os testes

```bash
cd infra
docker compose stop backend   # importante: ver nota abaixo
docker compose run --rm --no-deps backend pytest -q
```

**Nota:** os testes de integração falam diretamente com o RabbitMQ real (`basic_get` na fila principal). Se o serviço `backend` completo estiver rodando via `docker compose up` (que liga o consumidor de fundo, `START_CONSUMER=true`), ele compete com os testes pelas mesmas mensagens e os testes ficam flaky. Pare o `backend` (os outros três serviços podem continuar de pé) antes de rodar a suíte.
