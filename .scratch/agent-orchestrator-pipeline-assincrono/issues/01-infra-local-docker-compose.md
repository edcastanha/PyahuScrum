# 01: Infra local pronta: Docker Compose com RabbitMQ, emulador do Firestore e scaffold do backend

**What to build:** Um ambiente de desenvolvimento local completo e reproduzível com um único comando (`docker-compose up`), incluindo o frontend (caminho corrigido após o rename `DevPortfolio → frontend`), um scaffold vazio do Agent Orchestrator respondendo health-check, RabbitMQ e o emulador oficial do Firestore — para que as fatias seguintes tenham onde rodar e ser verificadas.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `docker-compose up` sobe frontend, backend (scaffold), RabbitMQ e emulador do Firestore com um único comando, sem erros
- [ ] `infra/docker-compose.yml` não referencia mais o caminho antigo `DevPortfolio/`
- [ ] O backend expõe um endpoint de health-check que responde 200 quando os serviços dependentes (RabbitMQ, emulador do Firestore) estão acessíveis
- [ ] RabbitMQ está acessível localmente, com a fila principal e o dead-letter-exchange já declarados (mesmo que ainda não consumidos)
- [ ] O emulador do Firestore está acessível localmente e aceita leitura/escrita via SDK
