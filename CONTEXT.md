# Pyahu Scrum

Framework autônomo que traduz ideias brutas de negócio em especificações técnicas (ADRs) e tickets de execução, via agentes de IA rodando em segundo plano sobre o Google Cloud.

## Language

### Componentes do Sistema

**Portfólio Interativo**:
A camada de front-end (`frontend/`). Única interface humana do sistema: captura a intenção do usuário, publica no barramento de eventos, e escuta o Firestore em tempo real para refletir o andamento. Não processa IA.
_Avoid_: Frontend, DevPortfolio (nome antigo do diretório, renomeado em `2d2a741`), UI

**Agent Orchestrator**:
O worker (`backend/`) que consome eventos do barramento e conduz a geração de artefatos via GenAI SDK. É o "tech lead virtual": carrega as Skills, consulta o histórico via RAG, e produz README, ADRs e tickets.
_Avoid_: Worker, backend (nome do diretório, mas o termo de domínio é Agent Orchestrator), agente

**Skills**:
O conjunto de diretrizes de engenharia (padrão [mattpocock/skills](https://github.com/mattpocock/skills)) injetado em `.agents/`, que restringe o Agent Orchestrator a produzir artefatos com rigor de tipagem forte e critérios de aceite testáveis. Ver [ADR-003](./docs/adr/003-framework-skills-matt-pocock-agentes-autonomos.md).
_Avoid_: Prompt, instruções, regras

### Estados do Pipeline

Valores do campo de status de um projeto no Firestore, atualizados a cada etapa pelo Agent Orchestrator:

**TRIAGEM_INICIAL**: Estado inicial, gravado assim que o Portfólio Interativo recebe a ideia do usuário, antes do processamento assíncrono começar.

**TRIAGEM_EM_ANDAMENTO**: O Agent Orchestrator está ativamente processando a requisição.

**GERANDO_ADR**: Etapa específica de geração de Architecture Decision Records dentro do pipeline.

**AGUARDANDO_APROVACAO_ESCOPO**: A execução foi suspensa porque a Hierarquia de Bloqueio detectou uma mudança de escopo arriscada ou ambígua; aguarda decisão humana.
_Avoid_: Pausado, bloqueado

**FALHA_PROCESSAMENTO**: Uma tentativa de processamento falhou (timeout de API, JSON corrompido, queda do container), mas ainda dentro do limite de retentativas do Pub/Sub.

**FALHA_DLQ**: As retentativas se esgotaram e a mensagem foi roteada para a Dead Letter Queue; requer reenfileiramento manual pelo painel.

### Resiliência e Governança

**Dead Letter Queue (DLQ)**:
Fila do Cloud Pub/Sub para onde vão mensagens cujas tentativas de entrega se esgotaram, evitando perda silenciosa de trabalho. Ver [ADR-004](./docs/adr/004-arquitetura-orientada-a-eventos-google-cloud.md).
_Avoid_: Fila de erro, dead letter

**RAG (Recuperação de Histórico)**:
Consulta ao Firestore Vector Search (embeddings via Vertex AI) por similaridade de cosseno, feita antes de gerar novas ADRs, para evitar redundância e contradição com decisões e regras de negócio já registradas.
_Avoid_: Busca semântica, retrieval

**Hierarquia de Bloqueio (Human-in-the-Loop)**:
Mecanismo pelo qual o Agent Orchestrator suspende a própria execução (status `AGUARDANDO_APROVACAO_ESCOPO`) ao detectar uma mudança de escopo arriscada, em vez de assumir premissas. Só retoma após aprovação humana explícita no Portfólio Interativo.
_Avoid_: Aprovação, human review
