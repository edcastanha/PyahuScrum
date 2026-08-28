# 01: Infra local pronta: Docker Compose com RabbitMQ, emulador do Firestore e scaffold do backend

**What to build:** Um ambiente de desenvolvimento local completo e reproduzível com um único comando (`docker-compose up`), incluindo o frontend (caminho corrigido após o rename `DevPortfolio → frontend`), um scaffold vazio do Agent Orchestrator respondendo health-check, RabbitMQ e o emulador oficial do Firestore — para que as fatias seguintes tenham onde rodar e ser verificadas.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `docker-compose up` sobe frontend, backend (scaffold), RabbitMQ e emulador do Firestore com um único comando, sem erros
- [x] `infra/docker-compose.yml` não referencia mais o caminho antigo `DevPortfolio/`
- [x] O backend expõe um endpoint de health-check que responde 200 quando os serviços dependentes (RabbitMQ, emulador do Firestore) estão acessíveis
- [x] RabbitMQ está acessível localmente, com a fila principal e o dead-letter-exchange já declarados (mesmo que ainda não consumidos)
- [x] O emulador do Firestore está acessível localmente e aceita leitura/escrita via SDK

## Nota de execução

Durante a implementação, `docker compose up` no arquivo de dev derrubou por alguns minutos o container de produção real (`pyahuscrum-frontend`, servindo `pyahuscrum.adbfn6.easypanel.host`), porque `infra/docker-compose.yml` e `infra/docker-compose.prod.yml` compartilhavam o mesmo project name padrão do Compose (`infra`, derivado do diretório). Produção restaurada e confirmada estável; ambos os arquivos agora têm `name:` explícito e distinto (`pyahu-scrum-dev` / `pyahu-scrum-prod`) para isolar os namespaces.
