# ADR-004: Arquitetura Orientada a Eventos no Google Cloud

**Data:** 27 de Agosto de 2026
**Status:** Aceito

## Contexto

O Pyahu Scrum concorre na categoria *Taskmaster* do Google Agent Hackathon: um framework autônomo que traduz ideias brutas de negócio em ADRs e tickets de execução (ver [ADR-003](./003-framework-skills-matt-pocock-agentes-autonomos.md) para a decisão sobre o padrão de qualidade exigido dos artefatos gerados). O fluxo original processava a ideia do usuário de forma síncrona, bloqueando a interface enquanto o LLM trabalhava e sem nenhum mecanismo de retomada em caso de falha.

## Decisão

Adotamos um pipeline assíncrono desacoplado do front-end (**Portfólio Interativo**), rodando inteiramente no Google Cloud:

- O front-end grava o pedido no **Firestore** com status `TRIAGEM_INICIAL` e publica um evento no **Cloud Pub/Sub**, liberando a UI imediatamente.
- Um worker Python no **Cloud Run** (`Agent Orchestrator`) consome a mensagem, instancia o **Google GenAI SDK** e conduz a geração dos artefatos (README, `agent.md`, ADRs, tickets).
- Antes de gerar novas ADRs, o worker consulta o **Firestore Vector Search** (embeddings via **Vertex AI Text Embeddings**) para recuperar decisões e regras de negócio históricas por similaridade de cosseno, evitando redundância e contradição com o histórico do projeto.
- Falhas esgotadas de entrega no Pub/Sub são roteadas para uma **Dead Letter Queue (DLQ)**; o Firestore é marcado com `FALHA_PROCESSAMENTO`/`FALHA_DLQ`, permitindo reprocessamento manual pelo painel.
- Mudanças de escopo arquiteturalmente arriscadas ou ambíguas suspendem a execução (**Human-in-the-Loop**): o status muda para `AGUARDANDO_APROVACAO_ESCOPO`, o Portfólio Interativo exibe o alerta, e o fluxo só é retomado (via novo evento no Pub/Sub) após aprovação humana explícita.

```mermaid
config:
  theme: mc
  fontFamily: '''Source Code Pro Variable'', monospace'
---
C4Container
    title Diagrama de Containers - Arquitetura Pyahu Scrum

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")

    Person(user, "Gestor / Usuário", "Envia ideias e aprova o escopo")
    System_Ext(vertex, "Vertex AI", "Gemini 3.5 Flash", "LLM e embeddings")

    System_Boundary(pyahu_scrum, "Sistema Pyahu Scrum") {
        Container(portfolio, "Portfólio Interativo", "Web", "Gestão e aprovações")
        Container(worker, "Agent Orchestrator", "Cloud Run", "Coordena agentes e IA")
        ContainerDb(firestore, "Memória da Aplicação", "Firestore", "Estado, histórico e embeddings")
        ContainerQueue(pubsub, "Barramento de Eventos", "Pub/Sub + DLQ", "Processamento assíncrono")
       }

    Rel_D(user, portfolio, "Acessa", "HTTPS")
    Rel_D(portfolio, pubsub, "Publica requisição", "REST")
    Rel_D(worker, firestore, "Lê e grava dados", "SDK")
    Rel_L(firestore, portfolio, "Atualiza interface", "Tempo real")
    Rel_R(pubsub, worker, "Dispara pipeline", "Push")
    Rel_L(worker, pubsub, "Envia falhas", "DLQ")
    Rel_D(worker, vertex, "Consulta IA", "gRPC")

    UpdateRelStyle(firestore, portfolio, $offsetX="-95", $offsetY="0")
    UpdateRelStyle(portfolio, pubsub, $offsetX="-145" $offsetY="0")
    UpdateRelStyle(worker, firestore, $offsetX="-50", $offsetY="-25")
    UpdateRelStyle(worker, pubsub, $offsetX="-70", $offsetY="0")
    UpdateRelStyle(pubsub, worker, $offsetX="10", $offsetY="5")
    UpdateRelStyle(worker, vertex, $offsetX="10", $offsetY="15")
```

## Consequências

**Positivas**

- A UI nunca fica bloqueada durante o processamento; o usuário acompanha o progresso em tempo real via *snapshots* do Firestore.
- Nenhuma requisição é perdida em caso de falha do worker ou do modelo — a DLQ garante reprocessamento.
- Mudanças de escopo sensíveis não são aplicadas sem validação humana.

**Negativas / Riscos**

- Aumento significativo de complexidade operacional: passa a existir um worker Python, filas, DLQ e um banco vetorial onde antes havia apenas um front-end estático.
- **Esta arquitetura ainda não está implementada no código do repositório.** `DevPortfolio/` continua sendo um CRA + TypeScript com MongoDB via `infra/docker-compose.yml`; não existe worker Python, integração com Pub/Sub, Firestore ou Vertex AI no código atual. Este ADR registra a decisão e o desenho alvo — a implementação é trabalho subsequente.

**Mitigação**

- A implementação deve ser rastreada em tickets próprios, referenciando esta ADR, antes de ser considerada concluída.
