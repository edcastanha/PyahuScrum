# Spec: Agent Orchestrator — Pipeline Assíncrono Ponta a Ponta (Fatia 1)

**Criado**: 2026-08-28
**Status**: Pronto para execução
**Label**: `ready-for-agent`
**Origem**: Sessão de grilling registrada na [ADR-005](../../docs/adr/005-stack-local-mvp-3-dias.md); arquitetura alvo na [ADR-004](../../docs/adr/004-arquitetura-orientada-a-eventos-google-cloud.md); padrão de qualidade dos artefatos na [ADR-003](../../docs/adr/003-framework-skills-matt-pocock-agentes-autonomos.md); glossário em [CONTEXT.md](../../CONTEXT.md).

## Problem Statement

O Portfólio Interativo hoje só grava projetos em `localStorage`, sem nenhum motor de IA por trás — é 100% mock (`frontend/src/services/project/projectService.ts` lê/escreve direto no storage do navegador). Não há como demonstrar a proposta central do Pyahu Scrum (traduzir uma ideia bruta em artefatos técnicos rigorosos, de forma assíncrona) porque o Agent Orchestrator ainda não existe: `backend/` está vazio.

## Solution

Construir o Agent Orchestrator (worker FastAPI, novo, em `backend/`) que recebe o pedido do Portfólio Interativo via uma chamada HTTP real, processa de forma assíncrona através de uma fila RabbitMQ, chama o Vertex AI SDK real (Gemini, contra o projeto GCP "Pyahu Scrum") para gerar os artefatos (README, ADR, tickets), e grava cada transição de status no emulador oficial do Firestore. O Portfólio Interativo passa a criar o pedido via API real (em vez de só `localStorage`) e observa o progresso em tempo real via `onSnapshot()`.

## User Stories

1. Como Gestor/Usuário do Portfólio Interativo, quero submeter a ideia bruta de um projeto, para que o Agent Orchestrator comece a gerar os artefatos técnicos automaticamente.
2. Como Gestor/Usuário, quero preencher um formulário simples com a ideia bruta em texto livre, para que o Agent Orchestrator tenha input suficiente para gerar os artefatos.
3. Como Gestor/Usuário, quero que a interface não fique travada enquanto os artefatos são gerados, para que eu continue usando o app normalmente durante o processamento.
4. Como Gestor/Usuário, quero ver o status do pedido mudar em tempo real (`TRIAGEM_INICIAL` → `TRIAGEM_EM_ANDAMENTO` → `GERANDO_ADR` → concluído), para que eu saiba que o sistema está processando e em que etapa está.
5. Como Gestor/Usuário, quero visualizar o README gerado pelo Agent Orchestrator ao final do processamento, para que eu tenha a visão executiva do projeto pronta sem escrever manualmente.
6. Como Gestor/Usuário, quero visualizar a(s) ADR(s) geradas pelo Agent Orchestrator, para que as decisões arquiteturais fiquem documentadas automaticamente.
7. Como Gestor/Usuário, quero visualizar os tickets de execução gerados a partir das ADRs, para que eu tenha o trabalho já quebrado em tarefas executáveis.
8. Como Gestor/Usuário, quero ser avisado visualmente quando um pedido falhar no processamento (status `FALHA_PROCESSAMENTO`), para que eu saiba que algo deu errado, mesmo sem um mecanismo de retentativa automática nesta fatia.
9. Como Agent Orchestrator, quero consumir mensagens da fila RabbitMQ de forma assíncrona, para que múltiplos pedidos sejam processados sem bloquear o Portfólio Interativo.
10. Como Agent Orchestrator, quero aplicar as diretrizes injetadas em `.agents/system-prompt.md` (skills do Matt Pocock) ao gerar os artefatos, para que eles sigam o rigor de tipagem forte e critérios de aceite testáveis definidos na ADR-003.
11. Como Agent Orchestrator, quero chamar o Vertex AI SDK real contra o projeto GCP "Pyahu Scrum", para que os artefatos sejam gerados por um LLM de verdade, não um mock.
12. Como Agent Orchestrator, quero gravar cada transição de status no Firestore emulado, para que o Portfólio Interativo reflita o progresso em tempo real via snapshot, sem polling.
13. Como Agent Orchestrator, quero persistir os artefatos gerados de forma estruturada (não como blob de texto único) no documento do Firestore, para que o frontend renderize cada artefato sem parsing frágil.
14. Como desenvolvedor mantendo o Agent Orchestrator, quero que todo o worker rode via Docker Compose local (RabbitMQ + emulador do Firestore + FastAPI), para não depender de infraestrutura GCP gerenciada no dia a dia — só a chamada ao Vertex AI é real.
15. Como desenvolvedor mantendo o Portfólio Interativo, quero que a criação de um pedido use uma chamada HTTP real ao backend, para que o fluxo passe a refletir o pipeline assíncrono de verdade, não mais só `localStorage`.
16. Como desenvolvedor mantendo o Portfólio Interativo, quero um wrapper isolado em volta do `onSnapshot()` do Firestore, para conseguir testar a lógica de observação de status sem precisar de um SDK real rodando nos testes.

## Implementation Decisions

- **Novo serviço `backend/`** (Python, FastAPI) hospeda o Agent Orchestrator. Roda via Docker Compose junto com RabbitMQ (dead-letter-exchange já configurado na infra, mesmo que o consumo do DLQ em si seja da Fatia 2) e o emulador oficial do Firestore.
- **Endpoint HTTP de criação**: recebe a ideia bruta (texto), grava o documento inicial no Firestore emulado com status `TRIAGEM_INICIAL`, publica a mensagem na fila RabbitMQ, e responde imediatamente ao frontend (não espera o processamento terminar).
- **Consumidor RabbitMQ**: processa a mensagem publicada — atualiza o status para `TRIAGEM_EM_ANDAMENTO`, chama o Vertex AI SDK para gerar os artefatos (status `GERANDO_ADR` durante a geração das ADRs), e ao final grava os artefatos e marca o status como concluído. Se qualquer etapa falhar (erro do Gemini, exceção não tratada), o documento é marcado `FALHA_PROCESSAMENTO` — sem mover para DLQ nem oferecer reenfileiramento nesta fatia.
- **Cliente Vertex AI injetado por dependência** (dependency injection do FastAPI ou equivalente), para ser substituído por um fake nos testes.
- **`Project` (frontend)**: a entidade existente (`frontend/src/entities/Project.ts`) precisa incorporar os novos valores de status do pipeline assíncrono (do `CONTEXT.md`) e os artefatos gerados quando concluído — o formato exato (estender `Project` vs. entidade nova dedicada ao pedido) fica para o momento da implementação, mas o contrato mínimo é: id, ideia bruta, status, artefatos (quando concluído).
- **`projectService.ts` (ou serviço novo dedicado)** ganha um método de criação que faz um `fetch` real ao endpoint do backend, em vez de gravar direto em `localStorage`.
- **Novo wrapper de snapshot** (nome sugerido: `subscribeToProjectStatus`) encapsula o `onSnapshot()` do Firestore, expondo uma interface simples (callback) que o resto do frontend consome sem conhecer o SDK do Firestore diretamente.
- **Pré-requisito bloqueante, fora deste spec**: credenciais do Vertex AI provisionadas via skill `wizard` (projeto GCP "Pyahu Scrum" já tem billing configurado).

## Testing Decisions

- **Backend**: um teste de integração por cenário relevante (sucesso ponta a ponta; falha do Gemini), batendo no endpoint HTTP real, com RabbitMQ e o emulador do Firestore reais (via Docker Compose no ambiente de teste), e o cliente Vertex AI substituído por um fake. Testar o comportamento externo observável — o documento final no Firestore — não a mecânica interna do consumo da fila.
- **Frontend**: reaproveitar o padrão já usado em `frontend/src/services/auth/githubAuthService.test.ts` — mockar `fetch` global para testar a chamada de criação. Para o novo wrapper de snapshot, testar com uma implementação fake do SDK do Firestore injetada, sem subir emulador nos testes de frontend.
- Nenhum teste, em nenhuma camada, deve depender de uma chamada real ao Vertex AI/Gemini (custo, latência, não-determinismo) — sempre via fake.

## Out of Scope

- DLQ funcional (redrive manual, UI de reenfileiramento) — Fatia 2.
- RAG (Vertex AI Text Embeddings + busca por similaridade de cosseno) — Fatia 3, stretch.
- Hierarquia de Bloqueio / Human-in-the-Loop (status `AGUARDANDO_APROVACAO_ESCOPO`, modal de aprovação) — Fatia 4, stretch.
- Qualquer autenticação ou persistência de usuário no backend (Django, Admin) — fora de escopo pela ADR-002.
- Deploy público do backend — só local via Docker Compose, conforme ADR-005.
- Migração ou tratamento especial dos projetos mock já existentes em `localStorage`.

## Further Notes

- Este spec cobre exclusivamente a Fatia 1 da ADR-005. Fatias 2, 3 e 4 recebem specs próprios quando forem atacadas.
- `docs/agents/issue-tracker.md` aponta para GitHub Issues via `gh`, mas o ambiente atual não tem `gh auth` configurado — este spec foi salvo localmente seguindo a convenção de `specs/NNN-slug/` já usada por `specs/001-github-oauth-auth` e `specs/002-sidebar-github-profile`, com o label `ready-for-agent` registrado no cabeçalho do próprio arquivo em vez de aplicado via GitHub.
